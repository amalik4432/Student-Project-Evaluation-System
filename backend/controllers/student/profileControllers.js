import HttpError from "../../models/HttpError.js";
import Student from "../../models/studentModel.js";

const safeStudent = (student) => {
  const value = student.toObject({ getters: true });
  delete value.password;
  delete value.salt;
  return value;
};

const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.userId).populate(
      "classId",
      "name session program",
    );
    if (!student) return next(new HttpError("Student not found", 404));
    res.json({ student: safeStudent(student) });
  } catch (error) {
    return next(new HttpError("Couldn't load profile", 500));
  }
};

const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim())
    return next(new HttpError("Name and email are required", 400));
  try {
    const duplicate = await Student.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.userId },
    });
    if (duplicate) return next(new HttpError("Email is already in use", 409));
    const student = await Student.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), email: email.trim().toLowerCase() },
      { new: true, runValidators: true },
    ).populate("classId", "name session program");
    if (!student) return next(new HttpError("Student not found", 404));
    res.json({ student: safeStudent(student), message: "Profile updated" });
  } catch (error) {
    return next(new HttpError("Couldn't update profile", 500));
  }
};

export default { getProfile, updateProfile };
