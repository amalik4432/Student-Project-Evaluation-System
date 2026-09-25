import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";
import Class from "../../models/classModel.js";
import NoticeBoard from "../../models/noticeBoardModel.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";
import ProjectFile from "../../models/projectFileModel.js";
import HttpError from "../../models/HttpError.js";

const getDashboard = async (req, res, next) => {
  try {
    const [
      classes,
      projects,
      teachers,
      students,
      notices,
      pendingProposals,
      pendingRequests,
      files,
    ] = await Promise.all([
      Class.countDocuments(),
      Project.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments(),
      NoticeBoard.find().sort({ _id: -1 }).limit(8),
      Project.countDocuments({
        proposalStatus: { $in: ["submitted", "under_review"] },
      }),
      SupervisorRequest.countDocuments({ status: "pending" }),
      ProjectFile.countDocuments(),
    ]);

    const recentProjects = await Project.find()
      .select("title supervisorName proposalStatus status className createdAt")
      .sort({ createdAt: -1 })
      .limit(8);

    const proposalSummary = await Project.aggregate([
      { $group: { _id: "$proposalStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      classes,
      projects,
      teachers,
      supervisors: teachers,
      students,
      pendingProposals,
      pendingRequests,
      files,
      notices: notices.map((n) => n.toObject({ getters: true })),
      recentProjects,
      proposalSummary,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your dashboard", 500));
  }
};

export default { getDashboard };
