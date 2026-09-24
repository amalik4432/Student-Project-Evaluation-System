import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

import authControllers from "../controllers/authControllers.js";

const {
  login,
  updateStudentPassword,
  updateTeacherPassword,
  updateAdminPassword,
} = authControllers;

const router = express.Router();

router.post("/login", login);
router.put("/student/update-password", verifyToken, updateStudentPassword);
router.put("/teacher/update-password", verifyToken, updateTeacherPassword);
router.put("/admin/update-password", verifyToken, updateAdminPassword);

export default router;
