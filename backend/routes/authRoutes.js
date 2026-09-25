import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import requireRole from "../middlewares/requireRole.js";
import authControllers from "../controllers/authControllers.js";
import inboxControllers from "../controllers/inboxControllers.js";

const router = express.Router();

router.post("/login", authControllers.login);
router.post("/logout", authControllers.logout);
router.post("/signup/student", authControllers.signupStudent);
router.get("/public/classes", authControllers.getPublicClasses);
router.get("/me", verifyToken, authControllers.me);
router.get("/inbox", verifyToken, inboxControllers.getInbox);
router.patch("/inbox/read-all", verifyToken, inboxControllers.markAllRead);
router.patch(
  "/inbox/:notificationId/read",
  verifyToken,
  inboxControllers.markRead,
);
router.put(
  "/student/update-password",
  verifyToken,
  requireRole("Student"),
  authControllers.updateStudentPassword,
);
router.put(
  "/teacher/update-password",
  verifyToken,
  requireRole("Teacher"),
  authControllers.updateTeacherPassword,
);
router.put(
  "/admin/update-password",
  verifyToken,
  requireRole("Admin"),
  authControllers.updateAdminPassword,
);

export default router;
