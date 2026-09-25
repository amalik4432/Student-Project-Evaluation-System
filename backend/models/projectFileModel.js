import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: { type: String, required: true, maxlength: 255 },
    type: { type: String, required: true, maxlength: 120 },
    size: { type: Number, required: true, max: 10000000 },
    data: { type: String, required: true },
    category: {
      type: String,
      enum: ["proposal", "deliverable", "report", "other"],
      default: "other",
    },
    uploadedById: { type: String, required: true },
    uploadedByName: { type: String, required: true, maxlength: 255 },
    uploadedByRole: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ProjectFile", projectFileSchema);
