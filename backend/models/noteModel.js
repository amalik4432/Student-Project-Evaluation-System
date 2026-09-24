import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Note", notesSchema);
