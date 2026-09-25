import mongoose from "mongoose";
import { validationResult } from "express-validator";

import HttpError from "../../models/HttpError.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";
import NoticeBoard from "../../models/noticeBoardModel.js";

const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find(
      {},
      "name program session shift totalStudents totalProjects assignedSupervisors assignedExaminers minAllowed maxAllowed",
    );
    res.json({ classes: classes.map((n) => n.toObject({ getters: true })) });
  } catch (err) {
    return next(new HttpError("Sorry, couldn't load your classes", 500));
  }
};

const createClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { program, session, shift, minAllowed, maxAllowed } = req.body;
  const classname = `${program}-${shift}-${session}`;

  try {
    const existingClass = await Class.findOne({ name: classname });
    if (existingClass) {
      return next(new HttpError("Class already exists.", 422));
    }

    const createdClass = await Class.create({
      name: classname,
      program,
      session,
      shift,
      minAllowed,
      maxAllowed,
    });

    res.status(201).json({
      createdClass,
      message: "Class created successfully",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Error occurred while creating class.", 500));
  }
};

const deleteClass = async (req, res, next) => {
  const { classId } = req.params;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    const myClass = await Class.findOneAndDelete(
      { _id: classId },
      { session: sess },
    );
    if (!myClass) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Class not found", 404));
    }

    await Teacher.updateMany(
      { assignedClassesForSupervision: myClass._id },
      { $pull: { assignedClassesForSupervision: myClass._id } },
      { session: sess },
    );
    await Teacher.updateMany(
      { assignedClassesForExamination: myClass._id },
      { $pull: { assignedClassesForExamination: myClass._id } },
      { session: sess },
    );

    const projectsToDelete = await Project.find({ classId: myClass._id });
    for (const project of projectsToDelete) {
      if (project.supervisorId) {
        await Teacher.updateOne(
          { _id: project.supervisorId },
          {
            $inc: { assignedProjectsCount: -1 },
            $pull: { assignedProjects: project._id },
          },
          { session: sess },
        );
      }
    }

    await Project.deleteMany({ classId: myClass._id }, { session: sess });
    await NoticeBoard.deleteMany(
      { receiverEntity: "class", receiverId: myClass._id },
      { session: sess },
    );
    await Student.deleteMany({ classId: myClass._id }, { session: sess });
    await sess.commitTransaction();
    sess.endSession();
    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Couldn't delete the class", 422));
  }
};

const getClassById = async (req, res, next) => {
  const { classId } = req.params;
  const myClass = await Class.findById(classId);
  if (!myClass)
    return next(new HttpError("Your chosen class doesn't exist", 404));

  try {
    const projects = await Project.find(
      { classId },
      "title supervisorName supervisorId members status proposalStatus",
    );
    const supervisors = await Teacher.find(
      { assignedClassesForSupervision: classId },
      "name empId assignedProjectsCount projectsLimit",
    );
    const examiners = await Teacher.find(
      { assignedClassesForExamination: classId },
      "name empId designation",
    );
    const students = await Student.find(
      { classId },
      "name rollNo marks status hasTopped",
    );
    const notices = await NoticeBoard.find({
      receiverEntity: "class",
      receiverId: classId,
    });

    res.json({
      myClass: myClass.toObject({ getters: true }),
      projects: projects.map((p) => p.toObject({ getters: true })),
      supervisors: supervisors.map((s) => s.toObject({ getters: true })),
      examiners: examiners.map((e) => e.toObject({ getters: true })),
      students: students.map((s) => s.toObject({ getters: true })),
      notices: notices.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Couldn't load class", 500));
  }
};

const editTimeTable = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { classId } = req.params;
  const {
    titleSubmission,
    proposalSubmission,
    proposalDefense,
    deliverable1,
    deliverable1Evalutaion,
    deliverable2,
    deliverable2Evalutaion,
  } = req.body;

  try {
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        timetable: {
          titleSubmission,
          proposalSubmission,
          proposalDefense,
          deliverable1,
          deliverable1Evalutaion,
          deliverable2,
          deliverable2Evalutaion,
        },
      },
      { runValidators: true, new: true },
    );
    res.json({ updatedClass, message: "timetable has been updated" });
  } catch (err) {
    return next(new HttpError("Couldn't update timetable", 500));
  }
};

const assignSupervisorToClass = async (req, res, next) => {
  const { classId } = req.params;
  const { supervisors } = req.body;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Class not found", 404));
    }
    for (const supervisor of supervisors || []) {
      const foundTeacher = await Teacher.findById(supervisor.id);
      if (!foundTeacher) {
        await sess.abortTransaction();
        sess.endSession();
        return next(new HttpError("Teacher not found", 404));
      }
      if (foundTeacher.assignedClassesForSupervision.includes(classId))
        continue;
      foundTeacher.assignedClassesForSupervision.push(classId);
      await foundTeacher.save({ session: sess });
      foundClass.assignedSupervisors += 1;
      await foundClass.save({ session: sess });
    }
    await sess.commitTransaction();
    sess.endSession();
    const updatedSupervisors = await Teacher.find({
      assignedClassesForSupervision: classId,
    });
    res.json({
      updatedSupervisors: updatedSupervisors.map((s) =>
        s.toObject({ getters: true }),
      ),
      message: "Class assigned to a supervisor",
    });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Internal server error", 500));
  }
};

const assignExaminerToClass = async (req, res, next) => {
  const { classId } = req.params;
  const { examiners } = req.body;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      await sess.abortTransaction();
      sess.endSession();
      return next(new HttpError("Class not found", 404));
    }
    for (const examiner of examiners || []) {
      const foundTeacher = await Teacher.findById(examiner.id);
      if (!foundTeacher) {
        await sess.abortTransaction();
        sess.endSession();
        return next(new HttpError("Teacher not found", 404));
      }
      if (foundTeacher.assignedClassesForExamination.includes(classId))
        continue;
      foundTeacher.assignedClassesForExamination.push(classId);
      await foundTeacher.save({ session: sess });
      foundClass.assignedExaminers += 1;
      await foundClass.save({ session: sess });
    }
    await sess.commitTransaction();
    sess.endSession();
    const updatedExaminers = await Teacher.find({
      assignedClassesForExamination: classId,
    });
    res.json({
      updatedExaminers: updatedExaminers.map((e) =>
        e.toObject({ getters: true }),
      ),
      message: "Class assigned to an examiner",
    });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(new HttpError("Internal server error", 500));
  }
};

export default {
  getClasses,
  createClass,
  deleteClass,
  getClassById,
  editTimeTable,
  assignSupervisorToClass,
  assignExaminerToClass,
};
