import "dotenv/config";
import connectDB from "../config/db.js";
import { hashPassword } from "../utils/password.js";
import Class from "../models/classModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

const seed = async () => {
  await connectDB();
  const className = "BSCS-Mor-2022";
  let klass = await Class.findOne({ name: className });
  if (!klass) {
    klass = await Class.create({
      name: className,
      program: "BSCS",
      session: "2022",
      shift: "Mor",
      minAllowed: 1,
      maxAllowed: 4,
      totalStudents: 0,
    });
  }

  if (!(await Teacher.findOne({ empId: "T-1001" }))) {
    const hashed = await hashPassword("teacher123");
    await Teacher.create({
      ...hashed,
      name: "Dr. Ayesha Khan",
      empId: "T-1001",
      designation: "Assistant Professor",
    });
  }

  if (!(await Student.findOne({ rollNo: "2020-CS-01" }))) {
    const hashed = await hashPassword("student123");
    await Student.create({
      ...hashed,
      name: "Ahmad Raza",
      rollNo: "2020-CS-01",
      classId: klass._id,
      cgpa: 3.6,
      hasTopped: true,
    });
    klass.totalStudents += 1;
    await klass.save();
  }

  console.log("Seed complete.");
  console.log("Admin: ADMIN_ID / ADMIN_PASSWORD from .env");
  console.log("Teacher: T-1001 / teacher123");
  console.log("Student: 2020-CS-01 / student123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
