import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";
import NoticeBoard from "../../models/noticeBoardModel.js";
import Notification from "../../models/notificationModel.js";

const getDashboard = async (req, res, next) => {
  let projects, supervisors, students, notices, classes, notifications;
  try {
    classes = await Class.countDocuments();
    projects = await Project.countDocuments();
    supervisors = await Teacher.find({
      assignedClassesForSupervision: { $ne: [] },
    }).countDocuments();
    students = await Student.countDocuments();
    notices = await NoticeBoard.find();
    notifications = await Notification.find();

    res.json({
      classes,
      projects,
      supervisors,
      students,
      notices: notices.map((n) => n.toObject({ getters: true })),
      notifications: notifications.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your dashboard", 500));
  }
};

export default {
  getDashboard,
};
