const mongoose = require("mongoose");

const supervisorRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: { type: String, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    teacherName: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    message: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SupervisorRequest", supervisorRequestSchema);
