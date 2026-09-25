import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  deadline: { type: Date, required: true },
  assignedToName: { type: String, required: true, maxlength: 255 },
  assignedToId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, maxlength: 255 },
  phase: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "In Progress",
  },
});

const proposalFeedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, maxlength: 2000 },
    authorId: { type: mongoose.Schema.Types.ObjectId },
    authorName: { type: String, required: true, maxlength: 255 },
    role: { type: String, enum: ["Teacher", "Admin"], required: true },
  },
  { timestamps: true },
);

const proposalAttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 255 },
    type: { type: String, required: true, maxlength: 120 },
    size: { type: Number, required: true, max: 10000000 },
    data: { type: String, required: true },
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    memberNames: [
      {
        name: {
          type: String,
          required: true,
          maxlength: 255,
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
      },
    ],
    members: {
      type: Number,
      min: 1,
    },
    supervisorName: {
      type: String,
      default: "Unassigned",
      maxlength: 255,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    className: {
      type: String,
      required: true,
      maxlength: 255,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "passed", "failed"],
      default: "in_progress",
    },
    submissions: [
      {
        type: String,
        maxlength: 255,
      },
    ],
    description: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
      maxlength: 100,
    },
    proposalText: {
      type: String,
      default: "",
      maxlength: 10000,
    },
    proposalDescription: { type: String, default: "", maxlength: 5000 },
    proposalObjectives: { type: String, default: "", maxlength: 5000 },
    proposalScope: { type: String, default: "", maxlength: 5000 },
    proposalMethodology: { type: String, default: "", maxlength: 5000 },
    proposalTechnologies: { type: String, default: "", maxlength: 2000 },
    proposalExpectedOutcome: { type: String, default: "", maxlength: 5000 },
    proposalStatus: {
      type: String,
      enum: [
        "not_submitted",
        "submitted",
        "under_review",
        "needs_revision",
        "approved",
        "rejected",
      ],
      default: "not_submitted",
    },
    proposalSubmittedAt: { type: Date },
    proposalReviewedAt: { type: Date },
    proposalVersion: { type: Number, default: 0 },
    proposalFeedback: { type: [proposalFeedbackSchema], default: [] },
    proposalAttachments: { type: [proposalAttachmentSchema], default: [] },
    aiFeedback: {
      problemStatement: { type: String, default: "" },
      objectives: { type: String, default: "" },
      methodology: { type: String, default: "" },
      scope: { type: String, default: "" },
      missingPoints: { type: [String], default: [] },
      overall: { type: String, default: "" },
      generatedAt: { type: Date },
    },
    tasks: [taskSchema],
  },
  { timestamps: true },
);

projectSchema.path("memberNames").set(function (memberNames) {
  this.members = memberNames.length;
  return memberNames;
});

taskSchema.pre("save", function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (this.endDate) {
    this.status = "Completed";
  } else if (new Date(this.deadline) < today) {
    this.status = "Late";
  } else if (new Date(this.startDate) > today) {
    this.status = "Not Started";
  } else if (
    new Date(this.startDate) <= today &&
    today < new Date(this.deadline)
  ) {
    this.status = "In Progress";
  }
  next();
});

export default mongoose.model("Project", projectSchema);
