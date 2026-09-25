import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    message: { type: String, required: true, maxlength: 4000 },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true, maxlength: 255 },
    role: {
      type: String,
      enum: ["Teacher", "Admin"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Feedback", feedbackSchema);
