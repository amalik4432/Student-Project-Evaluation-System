import HttpError from "../../models/HttpError.js";
import Note from "../../models/noteModel.js";

const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ _id: -1 });
    res.json({ notes: notes.map((n) => n.toObject({ getters: true })) });
  } catch (err) {
    return next(new HttpError("Couldn't find notes", 500));
  }
};

const createNote = async (req, res, next) => {
  const { note } = req.body;
  if (!note?.trim()) return next(new HttpError("Note cannot be empty", 400));
  try {
    await Note.create({ note: note.trim() });
    res.json({ message: "Saved Successfully" });
  } catch (error) {
    return next(new HttpError("Couldn't save the note", 500));
  }
};

const deleteNote = async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.noteId);
    res.json({ message: "Deleted note Successfully" });
  } catch (error) {
    return next(new HttpError("Couldn't delete the note", 500));
  }
};

export default { getNotes, createNote, deleteNote };
