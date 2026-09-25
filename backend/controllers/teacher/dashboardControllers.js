import HttpError from "../../models/HttpError.js";
import NoticeBoard from "../../models/noticeBoardModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";
import InboxNotification from "../../models/inboxNotificationModel.js";

const getDashboard = async (req, res, next) => {
  const userId = req.userId;
  try {
    const teacher = await Teacher.findById(userId).select("-password -salt");
    if (!teacher) return next(new HttpError("Couldn't find teacher", 401));

    const assignedProjects = await Project.find({ supervisorId: userId });
    const pendingRequests = await SupervisorRequest.countDocuments({
      teacherId: userId,
      status: "pending",
    });
    const pendingProposals = assignedProjects.filter((p) =>
      ["submitted", "under_review"].includes(p.proposalStatus),
    ).length;
    const notices = await NoticeBoard.find({
      receiverEntity: "teacher",
      receiverId: userId,
    });
    const unreadCount = await InboxNotification.countDocuments({
      recipientId: String(userId),
      recipientRole: "Teacher",
      read: false,
    });

    res.json({
      teacher,
      notices: notices.map((n) => n.toObject({ getters: true })),
      classesExamination: teacher.assignedClassesForExamination.length,
      classesSupervision: teacher.assignedClassesForSupervision.length,
      projectsSupervision: assignedProjects.length,
      projectsSupervisionLimit: teacher.projectsLimit,
      pendingRequests,
      pendingProposals,
      unreadCount,
      recentProjects: assignedProjects.slice(0, 6),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve dashboard data", 500));
  }
};

const updateLimit = async (req, res, next) => {
  const { limit } = req.body;
  try {
    const teacher = await Teacher.findById(req.userId);
    if (!teacher) return next(new HttpError("Couldn't find teacher", 401));
    if (teacher.assignedProjectsCount > limit) {
      return next(
        new HttpError(
          "Can't assign new limit when projects assigned already more",
          400,
        ),
      );
    }
    teacher.projectsLimit = limit;
    await teacher.save();
    res.json({ message: "Projects Limit Updated" });
  } catch (err) {
    return next(new HttpError("Couldn't update limit", 500));
  }
};

const getSupervisionProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ supervisorId: req.userId }).sort({
      updatedAt: -1,
    });
    res.json({ projects, allProjects: [{ className: "Assigned", classProjects: projects }] });
  } catch (err) {
    return next(new HttpError("Couldn't retrieve projects data", 500));
  }
};

const getAssignedStudents = async (req, res, next) => {
  try {
    const projects = await Project.find({ supervisorId: req.userId });
    const students = projects.flatMap((project) =>
      project.memberNames.map((member) => ({
        id: member.id,
        name: member.name,
        projectId: project._id,
        projectTitle: project.title,
        proposalStatus: project.proposalStatus,
        status: project.status,
      })),
    );
    res.json({ students, projects });
  } catch (err) {
    return next(new HttpError("Couldn't load assigned students", 500));
  }
};

const getProjectDetail = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      supervisorId: req.userId,
    });
    if (!project) return next(new HttpError("Project not found", 404));
    res.json({ project });
  } catch (err) {
    return next(new HttpError("Couldn't load project", 500));
  }
};

const getExaminationProjects = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.userId);
    if (!teacher) return next(new HttpError("Couldn't find teacher", 400));
    const classes = teacher.assignedClassesForExamination;
    const allProjects = [];
    for (const myClass of classes) {
      const projects = await Project.find({ classId: myClass });
      allProjects.push(...projects);
    }
    res.json({ projects: allProjects });
  } catch (err) {
    return next(new HttpError("Couldn't retrieve projects data", 500));
  }
};

export default {
  getDashboard,
  updateLimit,
  getSupervisionProjects,
  getExaminationProjects,
  getAssignedStudents,
  getProjectDetail,
};
