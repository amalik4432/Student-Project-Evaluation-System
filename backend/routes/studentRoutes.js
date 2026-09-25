import express from "express";
import { body } from "express-validator";
import verifyToken from "../middlewares/verifyToken.js";
import requireRole from "../middlewares/requireRole.js";

import dashboardControllers from "../controllers/student/dashboardControllers.js";
import projectControllers from "../controllers/student/projectControllers.js";
import proposalControllers from "../controllers/student/proposalControllers.js";
import taskControllers from "../controllers/student/taskControllers.js";
import notesControllers from "../controllers/student/notesControllers.js";
import filesControllers from "../controllers/filesControllers.js";
import feedbackControllers from "../controllers/feedbackControllers.js";
import profileControllers from "../controllers/student/profileControllers.js";
import { projectFileUpload, proposalUpload } from "../middlewares/upload.js";

const router = express.Router();
const guard = [verifyToken, requireRole("Student")];

router.get("/dashboard", ...guard, dashboardControllers.getDashboard);
router.get("/profile", ...guard, profileControllers.getProfile);
router.patch("/profile", ...guard, profileControllers.updateProfile);
router.get("/project", ...guard, projectControllers.getProjectPage);
router.post("/project", ...guard, projectControllers.createOrGetProject);
router.post(
  "/project/:projectId/member-requests",
  ...guard,
  projectControllers.createMemberRequest,
);
router.get(
  "/project/member-requests",
  ...guard,
  projectControllers.getMemberRequests,
);
router.patch(
  "/project/member-requests/:requestId",
  ...guard,
  projectControllers.decideMemberRequest,
);
router.patch(
  "/project/:projectId/edit",
  ...guard,
  projectControllers.editProjectDescription,
);
router.get("/proposal", ...guard, proposalControllers.getProposal);
router.post(
  "/proposal/submit",
  ...guard,
  proposalUpload.array("attachments", 5),
  proposalControllers.submitProposal,
);
router.get(
  "/supervisors",
  ...guard,
  proposalControllers.getAvailableSupervisors,
);
router.get(
  "/supervisor-requests",
  ...guard,
  proposalControllers.getMySupervisorRequests,
);
router.post(
  "/supervisor-requests",
  ...guard,
  proposalControllers.requestSupervisor,
);
router.get("/tasks", ...guard, taskControllers.getTasks);
router.patch("/tasks/new-task", ...guard, taskControllers.createTask);
router.get("/tasks/form-data", ...guard, taskControllers.getTaskFormData);
router.patch("/tasks/:taskId/complete", ...guard, taskControllers.completeTask);
router.delete("/tasks/:taskId/delete", ...guard, taskControllers.deleteTask);
router.get("/personal-notes", ...guard, notesControllers.getNotes);
router.post("/personal-notes/new-note", ...guard, notesControllers.createNote);
router.delete(
  "/personal-notes/:noteId/delete",
  ...guard,
  notesControllers.deleteNote,
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

export default router;
