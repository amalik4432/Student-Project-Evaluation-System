import mongoose from "mongoose";
import { validationResult } from "express-validator";

import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Project from "../../models/projectModel.js";

// Create a new project
const createProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const sess = await mongoose.startSession();
  sess.startTransaction();

  const {
    title,
    memberNames,
    supervisorName,
    supervisorId,
    classId,
    className,
    description,
  } = req.body;

  try {
    const supervisor = supervisorId
      ? await Teacher.findById(supervisorId)
      : null;
    const myClass = await Class.findById(classId);

    if (!myClass) {
      await sess.abortTransaction();
      sess.endSession();
      return next(
        new HttpError("Can't register Project, Class doesn't exists", 404),
      );
    }

    if (
      supervisor &&
      supervisor.assignedClassesForSupervision.length &&
      !supervisor.assignedClassesForSupervision
        .map(String)
        .includes(String(classId))
    ) {
      await sess.abortTransaction();
      sess.endSession();
      return next(
        new HttpError(
          "Can't register Project, supervisor not assigned to class",
          400,
        ),
      );
    }

    // Check if all students in memberNames are present in the database
    const studentIds = memberNames.map(({ id }) => id);
    const allStudents = await Student.find({ _id: { $in: studentIds } });
    const allStudentsExist = allStudents.length === memberNames.length;

    if (!allStudentsExist) {
      await sess.abortTransaction();
      sess.endSession();
      return res
        .status(400)
        .json({ message: "One or more students do not exist" });
    }

    // Check if any student in memberNames is already a member of an existing project
    const isStudentAlreadyAssigned = await Project.findOne({
      memberNames: { $elemMatch: { id: { $in: studentIds } } },
    });

    if (isStudentAlreadyAssigned) {
      await sess.abortTransaction();
      sess.endSession();
      return res.status(400).json({
        message: "One or more students are already assigned to a project",
      });
    }

    // creating project
    const project = new Project({
      title,
      memberNames,
      supervisorName: supervisor?.name || supervisorName || "Unassigned",
      supervisorId: supervisor?._id || null,
      classId,
      className,
      description,
    });

    await project.save({ session: sess });

    if (supervisor) {
      supervisor.assignedProjectsCount += 1;
      supervisor.assignedProjects.push(project._id);
      await supervisor.save({ session: sess });
    }

    for (const student of allStudents) {
      await student.updateOne(
        { assignedProjectId: project._id },
        { session: sess },
      );
    }

    myClass.totalProjects += 1;
    await myClass.save({ session: sess });

    await sess.commitTransaction();
    sess.endSession();
    res.status(200).json({
      project: project.toObject({ getters: true }),
      message: "Your project has been registered succesfully.",
    });
  } catch (error) {
    await sess.abortTransaction();
    sess.endSession();
    console.error(error);
    return next(
      new HttpError("Can't register Project, internal server error", 500),
    );
  }
};

// Get all projects
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find();

    res.json({ projects: projects.map((p) => p.toObject({ getters: true })) });
  } catch (error) {
    console.error(error);
    return next(new HttpError("internal server error", 500));
  }
};

// Get a project by ID
const getProjectById = async (req, res, next) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project: project.toObject({ getters: true }) });
  } catch (error) {
    console.error(error);
    return next(
      new HttpError("Can't register Project, internal server error", 500),
    );
  }
};

// Update a project by ID
const updateProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const projectId = req.params.projectId;

  const { description, title, supervisorName, supervisorId } = req.body;

  const sess = await mongoose.startSession();
  sess.startTransaction();

  try {
    const project = await Project.findById(projectId).session(sess);

    if (!project) {
      await sess.abortTransaction();
      sess.endSession();
      return res.status(404).json({ error: "Project not found" });
    }

    const supervisorChanged =
      supervisorId !== undefined &&
      String(project.supervisorId || "") !== String(supervisorId || "");

    if (supervisorChanged) {
      const oldSupervisor = project.supervisorId
        ? await Teacher.findById(project.supervisorId).session(sess)
        : null;
      const newSupervisor = supervisorId
        ? await Teacher.findById(supervisorId).session(sess)
        : null;

      if (supervisorId && !newSupervisor) {
        await sess.abortTransaction();
        sess.endSession();
        return next(new HttpError("Your chosen supervisor doesn't exist", 404));
      }

      if (oldSupervisor) {
        oldSupervisor.assignedProjectsCount = Math.max(
          0,
          oldSupervisor.assignedProjectsCount - 1,
        );
        oldSupervisor.assignedProjects.pull(project._id);
        await oldSupervisor.save({ session: sess });
      }

      if (newSupervisor) {
        newSupervisor.assignedProjectsCount += 1;
        newSupervisor.assignedProjects.push(project._id);
        await newSupervisor.save({ session: sess });
      }

      project.supervisorId = newSupervisor?._id || null;
      project.supervisorName =
        newSupervisor?.name || supervisorName || "Unassigned";
    }

    if (description !== undefined) project.description = description;
    if (title !== undefined) project.title = title;
    if (!supervisorChanged && supervisorName !== undefined) {
      project.supervisorName = supervisorName;
    }
    await project.save({ session: sess });

    await sess.commitTransaction();
    sess.endSession();
    res.json({
      project: project.toObject({ getters: true }),
      message: "Your project has been updated.",
    });
  } catch (error) {
    await sess.abortTransaction();
    sess.endSession();
    console.error(error);
    return next(
      new HttpError("Can't update Project, internal server error", 500),
    );
  }
};

// Delete a project by ID
const deleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  const sess = await mongoose.startSession();
  sess.startTransaction();

  try {
    const project = await Project.findByIdAndDelete(projectId, {
      session: sess,
    });

    if (!project) {
      await sess.abortTransaction();
      sess.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    const supervisor = project.supervisorId
      ? await Teacher.findById(project.supervisorId)
      : null;
    const myClass = await Class.findById(project.classId);
    const students = await Student.find({ assignedProjectId: project._id });

    if (supervisor) {
      supervisor.assignedProjectsCount = Math.max(
        0,
        supervisor.assignedProjectsCount - 1,
      );
      supervisor.assignedProjects.pull(project._id);
      await supervisor.save({ session: sess });
    }

    for (const student of students) {
      await student.updateOne({ assignedProjectId: null }, { session: sess });
    }

    if (myClass) {
      myClass.totalProjects = Math.max(0, myClass.totalProjects - 1);
      await myClass.save({ session: sess });
    }

    await sess.commitTransaction();
    sess.endSession();
    return res.json({
      project: project.toObject({ getters: true }),
      message: "Project deleted successfully",
    });
  } catch (error) {
    await sess.abortTransaction();
    sess.endSession();
    console.error(error);
    return next(
      new HttpError("Can't register Project, internal server error", 500),
    );
  }
};

export default {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
