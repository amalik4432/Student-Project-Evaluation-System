import HttpError from "../../models/HttpError.js";
import Notification from "../../models/notificationModel.js";
import Teacher from "../../models/teacherModel.js";
import { notify } from "../../utils/notify.js";

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ senderId: req.userId });
    res.json({
      notifications: notifications.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Couldn't find notifications", 500));
  }
};

const createNotification = async (req, res, next) => {
  const { headline, description } = req.body;
  try {
    const teacher = await Teacher.findById(req.userId);
    if (!teacher) return next(new HttpError("This teacher doesn't exist", 404));
    if (!headline || !description) {
      return next(new HttpError("Please provide headline and description", 400));
    }
    const createdNotification = await Notification.create({
      headline,
      description,
      senderId: req.userId,
      senderName: teacher.name,
    });
    await notify({
      recipientId: process.env.ADMIN_ID,
      recipientRole: "Admin",
      title: headline,
      body: `${teacher.name}: ${description}`,
      type: "system",
      link: "/",
    });
    res.json({
      notification: createdNotification,
      message: "Notification sent to administration",
    });
  } catch (error) {
    return next(new HttpError("Couldn't save the notification", 500));
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    return next(new HttpError("Couldn't delete the notification", 500));
  }
};

export default {
  getNotifications,
  createNotification,
  deleteNotification,
};
