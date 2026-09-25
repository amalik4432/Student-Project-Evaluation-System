import Feedback from "../models/feedbackModel.js";
import Project from "../models/projectModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import HttpError from "../models/HttpError.js";
import { notify } from "../utils/notify.js";

const getProjectForActor = async (req, projectId) => {
  if (req.role === "Admin") return Project.findById(projectId);
  if (req.role === "Teacher") {
    return Project.findOne({ _id: projectId, supervisorId: req.userId });
  }
  return Project.findOne({
    _id: projectId,
    memberNames: { $elemMatch: { id: req.userId } },
  });
};

const listFeedback = async (req, res, next) => {
  try {
    let projectIds = [];
    if (req.query.projectId) {
      const project = await getProjectForActor(req, req.query.projectId);
      if (!project) return next(new HttpError("Project not found", 404));
      projectIds = [project._id];
    } else if (req.role === "Student") {
      const project = await Project.findOne({
        memberNames: { $elemMatch: { id: req.userId } },
      });
      projectIds = project ? [project._id] : [];
    } else if (req.role === "Teacher") {
      const projects = await Project.find({ supervisorId: req.userId }).select(
        "_id",
      );
      projectIds = projects.map((p) => p._id);
    } else {
      const projects = await Project.find().select("_id");
      projectIds = projects.map((p) => p._id);
    }

    const feedback = await Feedback.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (error) {
    return next(new HttpError("Couldn't load feedback", 500));
  }
};

const createFeedback = async (req, res, next) => {
  const { projectId, message } = req.body;
  if (!projectId || !message?.trim()) {
    return next(new HttpError("Project and feedback message are required", 400));
  }
  if (!["Teacher", "Admin"].includes(req.role)) {
    return next(new HttpError("Only supervisors and admins can give feedback", 403));
  }

  try {
    const project = await getProjectForActor(req, projectId);
    if (!project) return next(new HttpError("Project not found", 404));

    let authorName = "Administrator";
    if (req.role === "Teacher") {
      const teacher = await Teacher.findById(req.userId).select("name");
      authorName = teacher?.name || "Supervisor";
    }

    const item = await Feedback.create({
      projectId,
      message: message.trim(),
      authorId: String(req.userId),
      authorName,
      role: req.role,
    });

    await Promise.all(
      project.memberNames.map((member) =>
        notify({
          recipientId: member.id,
          recipientRole: "Student",
          title: "New feedback on your project",
          body: `${authorName}: ${message.trim().slice(0, 120)}`,
          type: "feedback",
          link: "/feedback",
        }),
      ),
    );

    res.status(201).json({ feedback: item, message: "Feedback saved" });
  } catch (error) {
    return next(new HttpError("Couldn't save feedback", 500));
  }
};

export default { listFeedback, createFeedback };
