import HttpError from "../../models/HttpError.js";
import Student from "../../models/studentModel.js";

const getNotes = async (req, res, next) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) return next(new HttpError("Student not found", 404));
    res.json({
      notes: student.notes.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, couldn't find notes", 500),
    );
  }
};

const createNote = async (req, res, next) => {
  const { note } = req.body;
  if (!note?.trim()) return next(new HttpError("Note cannot be empty", 400));
  try {
    const student = await Student.findById(req.userId);
    if (!student) return next(new HttpError("This student doesn't exist", 404));
    student.notes.push({ note: note.trim() });
    await student.save();
    res.json({ message: "Saved Successfully" });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500),
    );
  }
};

const deleteNote = async (req, res, next) => {
  try {
    await Student.updateOne(
      { _id: req.userId },
      { $pull: { notes: { _id: req.params.noteId } } },
    );
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldn't delete the note", 500),
    );
  }
};

export default { getNotes, createNote, deleteNote };
