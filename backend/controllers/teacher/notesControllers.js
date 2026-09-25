import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";

const getNotes = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.userId);
    if (!teacher) return next(new HttpError("Teacher not found", 404));
    res.json({
      notes: teacher.notes.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Couldn't find notes", 500));
  }
};

const createNote = async (req, res, next) => {
  const { note } = req.body;
  if (!note?.trim()) return next(new HttpError("Note cannot be empty", 400));
  try {
    const teacher = await Teacher.findById(req.userId);
    teacher.notes.push({ note: note.trim() });
    await teacher.save();
    res.json({ message: "Saved Successfully" });
  } catch (error) {
    return next(new HttpError("Couldn't save the note", 500));
  }
};

const deleteNote = async (req, res, next) => {
  try {
    await Teacher.updateOne(
      { _id: req.userId },
      { $pull: { notes: { _id: req.params.noteId } } },
    );
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    return next(new HttpError("Couldn't delete the note", 500));
  }
};

export default { getNotes, createNote, deleteNote };
