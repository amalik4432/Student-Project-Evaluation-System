import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import requireRole from "../middlewares/requireRole.js";

import dashboardControllers from "../controllers/teacher/dashboardControllers.js";
import proposalControllers from "../controllers/teacher/proposalControllers.js";
import supervisorRequestControllers from "../controllers/teacher/supervisorRequestControllers.js";
import notesControllers from "../controllers/teacher/notesControllers.js";
import notificationsControllers from "../controllers/teacher/notificationsControllers.js";
import filesControllers from "../controllers/filesControllers.js";
import feedbackControllers from "../controllers/feedbackControllers.js";
import classControllers from "../controllers/teacher/classControllers.js";
import { projectFileUpload } from "../middlewares/upload.js";

const router = express.Router();
const guard = [verifyToken, requireRole("Teacher")];

router.get("/dashboard", ...guard, dashboardControllers.getDashboard);
router.get("/classes", ...guard, classControllers.getClasses);
router.post("/classes/new-class", ...guard, classControllers.createClass);
router.get("/classes/:classId", ...guard, classControllers.getClassById);
router.patch(
  "/dashboard/projects-limit",
  ...guard,
  dashboardControllers.updateLimit,
);
router.get(
  "/supervision-projects",
  ...guard,
  dashboardControllers.getSupervisionProjects,
);
router.get("/students", ...guard, dashboardControllers.getAssignedStudents);
router.get(
  "/projects/:projectId",
  ...guard,
  dashboardControllers.getProjectDetail,
);
router.get(
  "/examination-projects",
  ...guard,
  dashboardControllers.getExaminationProjects,
);
router.get("/proposal-queue", ...guard, proposalControllers.getProposalQueue);
router.patch(
  "/proposal/:projectId/review",
  ...guard,
  proposalControllers.reviewProposal,
);
router.get(
  "/supervisor-requests",
  ...guard,
  supervisorRequestControllers.getRequests,
);
router.patch(
  "/supervisor-requests/:requestId",
  ...guard,
  supervisorRequestControllers.updateRequest,
);
router.get("/personal-notes", ...guard, notesControllers.getNotes);
router.post("/personal-notes/new-note", ...guard, notesControllers.createNote);
router.delete(
  "/personal-notes/:noteId/delete",
  ...guard,
  notesControllers.deleteNote,
);
router.get(
  "/notifications",
  ...guard,
  notificationsControllers.getNotifications,
);
router.post(
  "/notifications/new-notification",
  ...guard,
  notificationsControllers.createNotification,
);
router.delete(
  "/notifications/:notificationId/delete",
  ...guard,
  notificationsControllers.deleteNotification,
);
router.get("/files", ...guard, filesControllers.listFiles);
router.post(
  "/files",
  ...guard,
  projectFileUpload.single("file"),
  filesControllers.uploadFile,
);
router.get("/files/:fileId", ...guard, filesControllers.getFile);
router.delete("/files/:fileId", ...guard, filesControllers.deleteFile);
router.get("/feedback", ...guard, feedbackControllers.listFeedback);
router.post("/feedback", ...guard, feedbackControllers.createFeedback);

export default router;
