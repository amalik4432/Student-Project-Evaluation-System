import InboxNotification from "../models/inboxNotificationModel.js";

export const notify = async ({
  recipientId,
  recipientRole,
  title,
  body,
  type = "system",
  link = "",
}) => {
  if (!recipientId || !recipientRole) return null;
  return InboxNotification.create({
    recipientId: String(recipientId),
    recipientRole,
    title,
    body,
    type,
    link,
  });
};
