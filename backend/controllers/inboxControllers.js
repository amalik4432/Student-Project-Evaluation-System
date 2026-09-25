import InboxNotification from "../models/inboxNotificationModel.js";
import HttpError from "../models/HttpError.js";

const getInbox = async (req, res, next) => {
  try {
    const notifications = await InboxNotification.find({
      recipientId: String(req.userId),
      recipientRole: req.role,
    })
      .sort({ createdAt: -1 })
      .limit(80);
    const unreadCount = await InboxNotification.countDocuments({
      recipientId: String(req.userId),
      recipientRole: req.role,
      read: false,
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    return next(new HttpError("Couldn't load notifications", 500));
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await InboxNotification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipientId: String(req.userId),
      },
      { read: true },
      { new: true },
    );
    if (!notification) return next(new HttpError("Notification not found", 404));
    res.json({ notification, message: "Marked as read" });
  } catch (error) {
    return next(new HttpError("Couldn't update notification", 500));
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await InboxNotification.updateMany(
      { recipientId: String(req.userId), recipientRole: req.role },
      { read: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    return next(new HttpError("Couldn't update notifications", 500));
  }
};

export default { getInbox, markRead, markAllRead };
