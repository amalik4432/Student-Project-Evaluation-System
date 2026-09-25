import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

import { hashPassword } from "../../utils/password.js";
import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import Project from "../../models/projectModel.js";
import NoticeBoard from "../../models/noticeBoardModel.js";

const publicTeacher = (teacher) => {
  const obj = teacher.toObject({ getters: true });
  delete obj.password;
  delete obj.salt;
  return obj;
};

const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().select("-password -salt -notes");
    res.json({
      teachers: teachers.map((t) => t.toObject({ getters: true })),
    });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, couldn't find teachers", 500),
    );
  }
};

const getTeacherById = async (req, res, next) => {
  const { teacherId } = req.params;
  try {
    const teacher = await Teacher.findById(teacherId).select("-password -salt");
    if (!teacher) return next(new HttpError("Couldn't find the teacher", 404));

    const assignedForSupervision = [];
    const assignedForExamination = [];

    for (const classId of teacher.assignedClassesForSupervision) {
      const myClass = await Class.findById(classId);
      if (myClass) {
        assignedForSupervision.push({ classId, className: myClass.name });
      }
    }
    for (const classId of teacher.assignedClassesForExamination) {
      const myClass = await Class.findById(classId);
      if (myClass) {
        assignedForExamination.push({ classId, className: myClass.name });
      }
    }

    const notices = await NoticeBoard.find({ receiverId: teacherId }).limit(25);
    const projects = await Project.find({ supervisorId: teacherId });

    res.json({
      teacher: publicTeacher(teacher),
      assignedForSupervision,
      assignedForExamination,
      notices: notices.map((n) => n.toObject({ getters: true })),
      projects: projects.map((p) => p.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Issue in getting teacher", 500));
  }
};

const createTeacher = async (req, res, next) => {
  const { name, empId, password, designation, projectsLimit } = req.body;
  if (!name?.trim() || !empId?.trim() || !password) {
    return next(
      new HttpError("Name, employee ID, and password are required", 400),
    );
  }
  if (password.length < 8) {
    return next(new HttpError("Password should be at least 8 characters", 400));
  }
  try {
    const exists = await Teacher.findOne({ empId: empId.trim() });
    if (exists) return next(new HttpError("Employee ID already exists", 409));
    const hashed = await hashPassword(password);
    const teacher = await Teacher.create({
      ...hashed,
      name: name.trim(),
      empId: empId.trim(),
      designation: designation || "Lecturer",
      projectsLimit: projectsLimit || 10,
    });
    res
      .status(201)
      .json({ teacher: publicTeacher(teacher), message: "Teacher created" });
  } catch (err) {
    return next(new HttpError("Couldn't create teacher", 500));
  }
};

const updateTeacher = async (req, res, next) => {
  const { name, empId, designation, projectsLimit, password } = req.body;
  try {
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!teacher) return next(new HttpError("Teacher not found", 404));
    if (empId && empId !== teacher.empId) {
      const exists = await Teacher.findOne({ empId });
      if (exists) return next(new HttpError("Employee ID already exists", 409));
      teacher.empId = empId;
    }
    if (name) teacher.name = name.trim();
    if (designation) teacher.designation = designation;
    if (projectsLimit) teacher.projectsLimit = projectsLimit;
    if (password) {
      if (password.length < 8) {
        return next(
          new HttpError("Password should be at least 8 characters", 400),
        );
      }
      const hashed = await hashPassword(password);
      teacher.password = hashed.password;
      teacher.salt = hashed.salt;
    }
    await teacher.save();
    res.json({ teacher: publicTeacher(teacher), message: "Teacher updated" });
  } catch (err) {
    return next(new HttpError("Couldn't update teacher", 500));
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!teacher) return next(new HttpError("Teacher not found", 404));
    const projects = await Project.countDocuments({
      supervisorId: teacher._id,
    });
    if (projects > 0) {
      return next(
        new HttpError("Reassign this teacher's projects before deleting", 400),
      );
    }
    await teacher.deleteOne();
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    return next(new HttpError("Couldn't delete teacher", 500));
  }
};

const unAssignSupervisorToClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { teacherId } = req.params;
  const { classId } = req.body;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Class not found", 404));
    }
    const foundTeacher = await Teacher.findById(teacherId);
    if (!foundTeacher) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Teacher not found", 404));
    }
    if (!foundTeacher.assignedClassesForSupervision.includes(classId)) {
      await sess.abortTransaction();
      sess.endSession();
      return next(
        new HttpError("Class already not assigned for supervision", 400),
      );
    }
    const projects = await Project.find({ classId, supervisorId: teacherId });
    if (projects.length > 0) {
      await sess.abortTransaction();
      sess.endSession();
      return next(
        new HttpError("Supervisor is assigned to projects of the class", 400),
      );
    }
    foundTeacher.assignedClassesForSupervision.pull(classId);
    await foundTeacher.save({ session: sess });
    foundClass.assignedSupervisors = Math.max(
      0,
      foundClass.assignedSupervisors - 1,
    );
    await foundClass.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
    res.json({ message: "Class un-assigned to a supervisor" });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Internal server error", 500));
  }
};

const unAssignExaminerToClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { teacherId } = req.params;
  const { classId } = req.body;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Class not found", 404));
    }
    const foundTeacher = await Teacher.findById(teacherId);
    if (!foundTeacher) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Teacher not found", 404));
    }
    if (!foundTeacher.assignedClassesForExamination.includes(classId)) {
      await sess.abortTransaction();
      sess.endSession();
      return next(
        new HttpError("Class already not assigned for examination", 400),
      );
    }
    foundTeacher.assignedClassesForExamination.pull(classId);
    await foundTeacher.save({ session: sess });
    foundClass.assignedExaminers = Math.max(
      0,
      foundClass.assignedExaminers - 1,
    );
    await foundClass.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
    res.json({ message: "Class un-assigned to an examiner" });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Internal server error", 500));
  }
};

export default {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  unAssignSupervisorToClass,
  unAssignExaminerToClass,
};
