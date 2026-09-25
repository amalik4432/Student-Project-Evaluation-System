import mongoose from "mongoose";

const Schema = mongoose.Schema;

const noticeBoardSchema = new Schema({
  headline: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
  },
  receiverEntity: {
    type: String,
    enum: ["class", "teacher"],
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
    maxlength: 255,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: function () {
      return this.receiverEntity === "teacher" ? "Teacher" : "Class";
    },
  },
});

// noticeBoardSchema.set("toObject", { getters: true });

export default mongoose.model("NoticeBoard", noticeBoardSchema);
