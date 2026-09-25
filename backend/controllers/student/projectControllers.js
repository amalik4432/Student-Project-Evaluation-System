import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Project from "../../models/projectModel.js";
import Feedback from "../../models/feedbackModel.js";
import ProjectFile from "../../models/projectFileModel.js";

const getProjectPage = async (req, res, next) => {
  const studentId = req.userId;
  try {
    const project = await Project.findOne({
      memberNames: { $elemMatch: { id: studentId } },
    });

    if (!project) {
      return res.json({
        project: null,
        supervisor: null,
        projectMembers: [],
        feedback: [],
        files: [],
      });
    }

    const projectMembers = [];
    for (const member of project.memberNames) {
      const student = await Student.findById(
        member.id,
        "name rollNo image hasTopped",
      );
      if (student) projectMembers.push(student);
    }

    const supervisor = project.supervisorId
      ? await Teacher.findById(project.supervisorId).select("-password -salt")
      : null;
    const feedback = await Feedback.find({ projectId: project._id }).sort({
      createdAt: -1,
    });
    const files = await ProjectFile.find({ projectId: project._id })
      .select("-data")
      .sort({ createdAt: -1 });

    res.json({
      project: project.toObject({ getters: true }),
      supervisor: supervisor ? supervisor.toObject({ getters: true }) : null,
      projectMembers: projectMembers.map((m) => m.toObject({ getters: true })),
      feedback,
      files,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve Project", 500));
  }
};

const editProjectDescription = async (req, res, next) => {
  const { projectId } = req.params;
  const { description, title } = req.body;

  try {
    const project = await Project.findOne({
      _id: projectId,
      memberNames: { $elemMatch: { id: req.userId } },
    });
    if (!project) return next(new HttpError("Project not found", 404));
    if (description !== undefined) project.description = description;
    if (title?.trim()) project.title = title.trim();
    await project.save();
    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't update project", 500));
  }
};

const createOrGetProject = async (req, res, next) => {
  const { title, description, semester } = req.body;
  try {
    const student = await Student.findById(req.userId);
    if (!student) return next(new HttpError("Student not found", 404));

    let project = await Project.findOne({
      memberNames: { $elemMatch: { id: student._id } },
    });
    if (project) {
      return res.json({ project, message: "Project already exists" });
    }

    const klass = await Class.findById(student.classId);
    if (!klass) return next(new HttpError("Student class not found", 404));

    project = await Project.create({
      title: title?.trim() || `${student.name}'s Final Year Project`,
      description: description || "",
      semester: semester || "",
      memberNames: [{ name: student.name, id: student._id }],
      supervisorName: "Unassigned",
      classId: klass._id,
      className: klass.name,
    });

    student.assignedProjectId = project._id;
    await student.save();
    klass.totalProjects += 1;
    await klass.save();

    res.status(201).json({ project, message: "Project created" });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't create project", 500));
  }
};

export default {
  getProjectPage,
  editProjectDescription,
  createOrGetProject,
};
