import mongoose from "mongoose";

const projectMemberRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    requesterName: { type: String, required: true },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model(
  "ProjectMemberRequest",
  projectMemberRequestSchema,
);
