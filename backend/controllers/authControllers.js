import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import HttpError from "../models/HttpError.js";
import { hashPassword } from "../utils/password.js";

import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import Class from "../models/classModel.js";

const signToken = (id, role) =>
  jwt.sign({ _id: id, role }, process.env.JWT_SECRET, { expiresIn: "12h" });

const setAuthCookie = (res, token) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
};

const login = async (req, res, next) => {
  const { userID, loginAs, password } = req.body;
  const normalizedUserID = userID?.trim();

  if (!loginAs || !password || !normalizedUserID) {
    return next(new HttpError("Please provide a username and password", 400));
  }

  try {
    if (loginAs === "Admin") {
      const user = process.env.ADMIN_ID?.trim() === normalizedUserID;
      if (!user) {
        return next(new HttpError("Invalid username or password", 401));
      }

      const isValidPassword = process.env.ADMIN_PASSWORD === password;
      if (!isValidPassword) {
        return next(new HttpError("Invalid username or password", 401));
      }

      const token = signToken(normalizedUserID, "Admin");
      setAuthCookie(res, token);
      return res.status(200).json({
        userId: normalizedUserID,
        role: "Admin",
        message: "Logged in successfully",
        userName: "Administrator",
      });
    }

    const Model = loginAs === "Student" ? Student : Teacher;

    if (!["Student", "Teacher"].includes(loginAs)) {
      return next(new HttpError("Invalid role selected", 400));
    }

    const user =
      loginAs === "Student"
        ? await Student.findOne({
            $or: [
              { rollNo: normalizedUserID },
              { registrationNo: normalizedUserID },
              { email: normalizedUserID.toLowerCase() },
            ],
          })
        : await Model.findOne({ empId: normalizedUserID });
    if (!user) {
      return next(new HttpError("Invalid username or password", 401));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return next(new HttpError("Invalid username or password", 401));
    }

    const token = signToken(user._id, loginAs);
    setAuthCookie(res, token);
    return res.status(200).json({
      userId: user._id,
      role: loginAs,
      userName: user.name,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Can't login due to server error", 500));
  }
};

const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
};

const signupStudent = async (req, res, next) => {
  const { name, rollNo, registrationNo, email, password, batchYear, classId } =
    req.body;
  if (
    !name?.trim() ||
    !rollNo?.trim() ||
    !registrationNo?.trim() ||
    !email?.trim() ||
    !password ||
    !batchYear?.trim() ||
    !classId
  ) {
    return next(new HttpError("Complete all student registration fields", 400));
  }
  if (password.length < 8)
    return next(new HttpError("Password should be at least 8 characters", 400));
  try {
    const [klass, duplicateRoll, duplicateRegistration, duplicateEmail] =
      await Promise.all([
        Class.findById(classId),
        Student.findOne({ rollNo: rollNo.trim() }),
        Student.findOne({ registrationNo: registrationNo.trim() }),
        Student.findOne({ email: email.trim().toLowerCase() }),
      ]);
    if (!klass)
      return next(new HttpError("Selected batch does not exist", 404));
    if (duplicateRoll || duplicateRegistration || duplicateEmail)
      return next(
        new HttpError("A student with these credentials already exists", 409),
      );
    const hashed = await hashPassword(password);
    const student = await Student.create({
      ...hashed,
      name: name.trim(),
      rollNo: rollNo.trim(),
      registrationNo: registrationNo.trim(),
      email: email.trim().toLowerCase(),
      batchYear: batchYear.trim(),
      classId,
    });
    klass.totalStudents += 1;
    await klass.save();
    res
      .status(201)
      .json({ message: "Student account created. You can now sign in." });
  } catch (error) {
    return next(new HttpError("Couldn't create student account", 500));
  }
};

const getPublicClasses = async (req, res, next) => {
  try {
    const classes = await Class.find(
      {},
      "_id name program session shift totalStudents",
    ).sort({ session: -1, name: 1 });
    res.json({ classes });
  } catch (error) {
    return next(new HttpError("Couldn't load available batches", 500));
  }
};

const updatePassword = async (req, res, next, Model) => {
  const { newPassword, oldPassword, confirmPassword } = req.body;
  const userId = req.userId;

  try {
    if (!newPassword || !oldPassword || !confirmPassword) {
      return next(new HttpError("Complete all inputs", 400));
    }

    if (newPassword.length < 8) {
      return next(
        new HttpError("Password should be at least 8 characters", 400),
      );
    }

    if (newPassword !== confirmPassword) {
      return next(new HttpError("Passwords not the same", 400));
    }

    const userFound = await Model.findById(userId);
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(
      oldPassword,
      userFound.password,
    );
    if (!isValidPassword) {
      return next(new HttpError("Invalid old password", 400));
    }

    const hashed = await hashPassword(newPassword);
    await Model.findByIdAndUpdate(userId, hashed, { new: true });

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdminPassword = async (req, res, next) => {
  return next(
    new HttpError(
      "Admin password is managed by environment configuration and cannot be changed from the app.",
      400,
    ),
  );
};

const me = async (req, res, next) => {
  try {
    if (req.role === "Admin") {
      return res.json({
        user: {
          id: req.userId,
          name: "Administrator",
          role: "Admin",
        },
      });
    }
    if (req.role === "Student") {
      const user = await Student.findById(req.userId).select("-password -salt");
      if (!user) return next(new HttpError("User not found", 404));
      return res.json({ user: { ...user.toObject(), role: "Student" } });
    }
    const user = await Teacher.findById(req.userId).select("-password -salt");
    if (!user) return next(new HttpError("User not found", 404));
    return res.json({ user: { ...user.toObject(), role: "Teacher" } });
  } catch (error) {
    return next(new HttpError("Couldn't load profile", 500));
  }
};

export default {
  login,
  signupStudent,
  getPublicClasses,
  logout,
  me,
  updateStudentPassword: (req, res, next) =>
    updatePassword(req, res, next, Student),
  updateTeacherPassword: (req, res, next) =>
    updatePassword(req, res, next, Teacher),
  updateAdminPassword,
};
