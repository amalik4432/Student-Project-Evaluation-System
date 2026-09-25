import { hashPassword } from "../../utils/password.js";
import HttpError from "../../models/HttpError.js";
import Student from "../../models/studentModel.js";
import Class from "../../models/classModel.js";
import Project from "../../models/projectModel.js";

const publicStudent = (student) => {
  const obj = student.toObject({ getters: true });
  delete obj.password;
  delete obj.salt;
  return obj;
};

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .select("-password -salt")
      .populate("classId", "name program session")
      .sort({ name: 1 });
    res.json({ students });
  } catch (err) {
    return next(new HttpError("Couldn't load students", 500));
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .select("-password -salt")
      .populate("classId", "name");
    if (!student) return next(new HttpError("Student not found", 404));
    const project = await Project.findOne({
      memberNames: { $elemMatch: { id: student._id } },
    });
    res.json({ student, project });
  } catch (err) {
    return next(new HttpError("Couldn't load student", 500));
  }
};

const createStudent = async (req, res, next) => {
  const { name, rollNo, password, classId, cgpa, image } = req.body;
  if (!name?.trim() || !rollNo?.trim() || !password || !classId) {
    return next(new HttpError("Name, roll number, password, and class are required", 400));
  }
  if (password.length < 8) {
    return next(new HttpError("Password should be at least 8 characters", 400));
  }
  try {
    const klass = await Class.findById(classId);
    if (!klass) return next(new HttpError("Class not found", 404));
    const exists = await Student.findOne({ rollNo: rollNo.trim() });
    if (exists) return next(new HttpError("Roll number already exists", 409));

    const hashed = await hashPassword(password);
    const student = await Student.create({
      ...hashed,
      name: name.trim(),
      rollNo: rollNo.trim(),
      classId,
      cgpa: cgpa || 0,
      image: image || "",
    });
    klass.totalStudents += 1;
    await klass.save();
    res.status(201).json({
      student: publicStudent(student),
      message: "Student created",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't create student", 500));
  }
};

const updateStudent = async (req, res, next) => {
  const { name, rollNo, classId, cgpa, status, hasTopped, password } = req.body;
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return next(new HttpError("Student not found", 404));

    if (rollNo && rollNo !== student.rollNo) {
      const exists = await Student.findOne({ rollNo });
      if (exists) return next(new HttpError("Roll number already exists", 409));
      student.rollNo = rollNo;
    }
    if (name) student.name = name.trim();
    if (typeof cgpa === "number") student.cgpa = cgpa;
    if (status) student.status = status;
    if (typeof hasTopped === "boolean") student.hasTopped = hasTopped;
    if (password) {
      if (password.length < 8) {
        return next(new HttpError("Password should be at least 8 characters", 400));
      }
      const hashed = await hashPassword(password);
      student.password = hashed.password;
      student.salt = hashed.salt;
    }
    if (classId && String(classId) !== String(student.classId)) {
      const [oldClass, newClass] = await Promise.all([
        Class.findById(student.classId),
        Class.findById(classId),
      ]);
      if (!newClass) return next(new HttpError("Class not found", 404));
      if (oldClass && oldClass.totalStudents > 0) oldClass.totalStudents -= 1;
      newClass.totalStudents += 1;
      student.classId = classId;
      await Promise.all([oldClass?.save(), newClass.save()]);
    }
    await student.save();
    res.json({ student: publicStudent(student), message: "Student updated" });
  } catch (err) {
    return next(new HttpError("Couldn't update student", 500));
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return next(new HttpError("Student not found", 404));
    if (student.assignedProjectId) {
      return next(
        new HttpError("Unassign the student from their project first", 400),
      );
    }
    const klass = await Class.findById(student.classId);
    if (klass && klass.totalStudents > 0) {
      klass.totalStudents -= 1;
      await klass.save();
    }
    await student.deleteOne();
    res.json({ message: "Student deleted" });
  } catch (err) {
    return next(new HttpError("Couldn't delete student", 500));
  }
};

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
