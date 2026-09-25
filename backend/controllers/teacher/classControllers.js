import HttpError from "../../models/HttpError.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";

const getClasses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.userId).select(
      "assignedClassesForSupervision",
    );
    if (!teacher) return next(new HttpError("Teacher not found", 404));
    const classes = await Class.find(
      { _id: { $in: teacher.assignedClassesForSupervision } },
      "name program session shift totalStudents totalProjects",
    ).sort({ session: -1 });
    res.json({ classes });
  } catch (error) {
    return next(new HttpError("Couldn't load classes", 500));
  }
};

const createClass = async (req, res, next) => {
  const { program, session, shift, minAllowed, maxAllowed } = req.body;
  if (!program || !session || !shift || !minAllowed || !maxAllowed) {
    return next(new HttpError("Complete all class fields", 400));
  }
  try {
    const name = `${program}-${shift}-${session}`;
    const existing = await Class.findOne({ name });
    if (existing) return next(new HttpError("Class already exists", 409));
    const created = await Class.create({
      name,
      program,
      session,
      shift,
      minAllowed,
      maxAllowed,
    });
    await Teacher.findByIdAndUpdate(req.userId, {
      $addToSet: { assignedClassesForSupervision: created._id },
    });
    res
      .status(201)
      .json({ createdClass: created, message: "Class created successfully" });
  } catch (error) {
    return next(new HttpError("Couldn't create class", 500));
  }
};

const getClassById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.userId,
      assignedClassesForSupervision: req.params.classId,
    });
    if (!teacher)
      return next(new HttpError("Class is not assigned to you", 403));
    const classRecord = await Class.findById(req.params.classId);
    if (!classRecord) return next(new HttpError("Class not found", 404));
    const students = await Student.find({ classId: classRecord._id })
      .select("name rollNo registrationNo email assignedProjectId status")
      .sort({ name: 1 });
    const projects = await Project.find({ classId: classRecord._id }).select(
      "title memberNames supervisorName supervisorId status proposalStatus proposalText proposalDescription proposalObjectives proposalScope proposalMethodology proposalTechnologies proposalExpectedOutcome proposalAttachments proposalFeedback proposalSubmittedAt",
    );
    const projectByStudent = new Map();
    projects.forEach((project) =>
      project.memberNames.forEach((member) =>
        projectByStudent.set(String(member.id), project),
      ),
    );
    const studentRows = students.map((student) => {
      const project = projectByStudent.get(String(student._id));
      return {
        ...student.toObject({ getters: true }),
        project: project
          ? {
              ...project.toObject({ getters: true }),
              proposalAttachments: project.proposalAttachments.map(
                ({ data, ...file }) => file,
              ),
            }
          : null,
        supervisorStatus: project?.supervisorId ? "Assigned" : "Not assigned",
      };
    });
    res.json({
      class: classRecord,
      students: studentRows,
      totalStudents: studentRows.length,
    });
  } catch (error) {
    return next(new HttpError("Couldn't load class students", 500));
  }
};

const getStudentDetail = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.userId,
      assignedClassesForSupervision: req.params.classId,
    });
    if (!teacher)
      return next(new HttpError("Class is not assigned to you", 403));
    const student = await Student.findOne({
      _id: req.params.studentId,
      classId: req.params.classId,
    }).select("-password -salt");
    if (!student)
      return next(new HttpError("Student not found in this class", 404));
    const project = await Project.findOne({
      classId: req.params.classId,
      memberNames: { $elemMatch: { id: student._id } },
    });
    res.json({ student, project });
  } catch (error) {
    return next(new HttpError("Couldn't load student detail", 500));
  }
};

export default { getClasses, createClass, getClassById, getStudentDetail };
