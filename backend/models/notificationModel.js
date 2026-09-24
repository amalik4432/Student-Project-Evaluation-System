import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  headline: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
    maxlength: 255,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Teacher",
  },
});

// notificationSchema.set("toObject", { getters: true });

export default mongoose.model("Notification", notificationSchema);
