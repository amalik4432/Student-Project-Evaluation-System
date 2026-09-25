import HttpError from "../../models/HttpError.js";
import NoticeBoard from "../../models/noticeBoardModel.js";
import Project from "../../models/projectModel.js";
import SupervisorRequest from "../../models/supervisorRequestModel.js";
import Student from "../../models/studentModel.js";
import InboxNotification from "../../models/inboxNotificationModel.js";

const progressFromTasks = (tasks = []) => {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.endDate || t.status === "Completed").length;
  return Math.round((done / tasks.length) * 100);
};

const getDashboard = async (req, res, next) => {
  const studentId = req.userId;
  try {
    const student = await Student.findById(studentId).select("-password -salt");
    if (!student) return next(new HttpError("Student not found", 404));

    const project = await Project.findOne({
      memberNames: { $elemMatch: { id: studentId } },
    });

    const notices = project
      ? await NoticeBoard.find({
          receiverEntity: "class",
          receiverId: project.classId,
        }).sort({ _id: -1 })
      : [];

    const myTodoList = project
      ? project.tasks.filter(
          (task) => task.assignedToId.equals(studentId) && !task.endDate,
        )
      : [];

    const latestRequest = await SupervisorRequest.findOne({
      studentId,
    }).sort({ createdAt: -1 });

    const unreadCount = await InboxNotification.countDocuments({
      recipientId: String(studentId),
      recipientRole: "Student",
      read: false,
    });

    res.json({
      student,
      project,
      progress: progressFromTasks(project?.tasks),
      proposalStatus: project?.proposalStatus || "not_submitted",
      supervisorRequest: latestRequest,
      myTodoList: myTodoList.map((t) => t.toObject({ getters: true })),
      notices: notices.map((n) => n.toObject({ getters: true })),
      unreadCount,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve dashboard data", 500));
  }
};

export default {
  getDashboard,
};
