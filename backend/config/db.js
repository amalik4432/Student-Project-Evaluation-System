import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  mongoose.connection.on("error", (error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    await mongoose.connection.db.admin().ping();
    console.log("MongoDB connected.");
  } catch (error) {
    await mongoose.disconnect();
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;
