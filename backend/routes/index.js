import express from "express";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import studentRoutes from "./studentRoutes.js";
import teacherRoutes from "./teacherRoutes.js";

const router = express.Router();

router.use("/", authRoutes);
router.use("/admin", adminRoutes);
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);

export default router;
