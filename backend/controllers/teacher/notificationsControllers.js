import mongoose from "mongoose";

import HttpError from "../../models/HttpError.js";
import Notification from "../../models/notificationModel.js";
import Teacher from "../../models/teacherModel.js";

const getNotifications = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const notifications = await Notification.find({ senderId: userId });
    res.json({
      notifications: notifications.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't find notifications", 500),
    );
  }
};

// CREATING A NOte
const createNotification = async (req, res, next) => {
  const { headline, description, userId, userName } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return next(new HttpError("This teacher doesn't exist", 404));
    }

    if (!headline || !description || !userId || !userName) {
      return next(new HttpError("Please provide all the credentials", 401));
    }

    const createdNotification = new Notification({
      headline,
      description,
      senderId: userId,
      senderName: userName,
    });
    createdNotification.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Saved Successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500),
    );
  }
};

//  delete A Notification
const deleteNotification = async (req, res, next) => {
  const { notificationId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Notification.findByIdAndDelete(notificationId, { session });

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500),
    );
  }
};

export default {
  getNotifications,
  createNotification,
  deleteNotification,
};
