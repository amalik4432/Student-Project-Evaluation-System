import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 255,
    },
    empId: {
      type: String,
      unique: true,
      required: true,
    },
    designation: {
      type: String,
      maxlength: 255,
      default: "Lecturer",
    },
    image: {
      type: String,
      default: "",
    },
    assignedProjectsCount: {
      type: Number,
      default: 0,
      max: 50,
    },
    projectsLimit: {
      type: Number,
      default: 10,
      max: 50,
    },
    assignedProjects: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
      ],
      default: [],
    },
    assignedClassesForSupervision: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
      ],
      default: [],
    },
    assignedClassesForExamination: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
      ],
      default: [],
    },
    notes: {
      type: [
        {
          note: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Teacher", teacherSchema);
