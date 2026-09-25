import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { corsOptions } from "./config/cors.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

process.on("uncaughtException", (error) => {
  if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
    console.error(`MongoDB DNS error: ${error.message}`);
    return;
  }

  console.error("Uncaught exception:", error);
  process.exit(1);
});

const app = express();

app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("server working");
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  }
};

startServer();
