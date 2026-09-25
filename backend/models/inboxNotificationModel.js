import mongoose from "mongoose";

const inboxNotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true },
    recipientRole: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 255 },
    body: { type: String, required: true, maxlength: 2000 },
    type: {
      type: String,
      enum: [
        "proposal",
        "supervisor",
        "feedback",
        "file",
        "progress",
        "system",
      ],
      default: "system",
    },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("InboxNotification", inboxNotificationSchema);
