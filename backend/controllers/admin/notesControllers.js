import mongoose from "mongoose";

import HttpError from "../../models/HttpError.js";
import Teacher from "../../models/teacherModel.js";
import Student from "../../models/studentModel.js";
import Note from "../../models/noteModel.js";

const getNotes = async (req, res, next) => {
  const { role, userId } = req.query;
  let notes;
  try {
    if (role === "Admin") {
      notes = await Note.find().sort({ createdAt: -1 });
    } else {
      new HttpError("Something went wrong, role is not defined", 500);
    }
    res.json({ notes: notes.map((n) => n.toObject({ getters: true })) });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't find notes", 500),
    );
  }
};

// CREATING A NOte
const createNote = async (req, res, next) => {
  const { note, role } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (role === "Admin") {
      const createdNote = new Note({
        note,
      });
      await createdNote.save({ session });
    } else {
      new HttpError("Something went wrong, role is not defined", 500);
    }

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Saved Successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500),
    );
  }
};

//  delete A NOte
const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Note.findByIdAndDelete(noteId, { session });
    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Deleted note Successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500),
    );
  }
};

export default {
  getNotes,
  createNote,
  deleteNote,
};
