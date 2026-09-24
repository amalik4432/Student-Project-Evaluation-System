import HttpError from "../../models/HttpError.js";
import Class from "../../models/classModel.js";
import Student from "../../models/studentModel.js";
import Teacher from "../../models/teacherModel.js";
import Project from "../../models/projectModel.js";
import NoticeBoard from "../../models/noticeBoardModel.js";

const getProjectFormData = async (req, res, next) => {
  const { classId, all } = req.query;
  let students, myClass, supervisors;
  try {
    if (all) {
      students = await Student.find({ classId: classId }, "name");
    } else {
      students = await Student.find(
        { classId: classId, assignedProjectId: null },
        "name",
      );
    }
    myClass = await Class.findById(classId, "name maxAllowed minAllowed");
    supervisors = await Teacher.find(
      { assignedClassesForSupervision: myClass._id },
      "name",
    );
    res.json({
      class: myClass.toObject({ getters: true }),
      students: students.map((s) => s.toObject({ getters: true })),
      supervisors: supervisors.map((s) => s.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your data", 500));
  }
};

const loadAddSupervisorData = async (req, res, next) => {
  const { classId } = req.query;
  let supervisors, teachers;
  try {
    teachers = await Teacher.find(
      { assignedClassesForSupervision: { $ne: classId } },
      "name",
    );
    // supervisors = await Teacher.find(
    //   { assignedClassesForSupervision: classId },
    //   "name"
    // );
    res.json({
      teachers: teachers.map((s) => s.toObject({ getters: true })),
      // supervisors: supervisors.map((s) => s.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your data", 500));
  }
};

const loadAddExaminerData = async (req, res, next) => {
  const { classId } = req.query;
  let examiners, teachers;
  try {
    teachers = await Teacher.find(
      { assignedClassesForExamination: { $ne: classId } },
      "name",
    );
    // supervisors = await Teacher.find(
    //   { assignedClassesForSupervision: classId },
    //   "name"
    // );
    res.json({
      teachers: teachers.map((s) => s.toObject({ getters: true })),
      // supervisors: supervisors.map((s) => s.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your data", 500));
  }
};

const loadNewNoticeFormData = async (req, res, next) => {
  const { receiverEntity } = req.query;
  let data;
  try {
    if (receiverEntity === "class") {
      data = await Class.find({}, "name");
    } else if (receiverEntity === "teacher") {
      data = await Teacher.find({}, "name");
    }

    res.json({ data: data.map((s) => s.toObject({ getters: true })) });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your data", 500));
  }
};

export default {
  getProjectFormData,
  loadAddSupervisorData,
  loadNewNoticeFormData,
  loadAddExaminerData,
};
