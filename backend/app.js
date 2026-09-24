require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

process.on("uncaughtException", (error) => {
  if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
    console.error(`MongoDB DNS error: ${error.message}`);
    return;
  }

  console.error("Uncaught exception:", error);
  process.exit(1);
});

const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET,PUT,PATCH,POST,DELETE",
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));

app.get("/", (req, res) => {
  res.send("server working");
});

app.use((req, res, next) => {
  const HttpError = require("./models/HttpError");
  throw new HttpError("Could not find this route.", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error occurred!",
  });
});

const PORT = process.env.PORT || 8000;

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
