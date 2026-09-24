import express from "express";
import { body } from "express-validator";

import dashboardControllers from "../controllers/teacher/dashboardControllers.js";
import proposalControllers from "../controllers/teacher/proposalControllers.js";
import supervisorRequestControllers from "../controllers/teacher/supervisorRequestControllers.js";
import notesControllers from "../controllers/teacher/notesControllers.js";
import notificationsControllers from "../controllers/teacher/notificationsControllers.js";

const {
  getDashboard,
  updateLimit,
  getSupervisionProjects,
  getExaminationProjects,
} = dashboardControllers;
const { getProposalQueue, reviewProposal } = proposalControllers;
const { getRequests, updateRequest } = supervisorRequestControllers;

const { getNotes, createNote, deleteNote } = notesControllers;

const { getNotifications, createNotification, deleteNotification } =
  notificationsControllers;

const router = express.Router();

// Routes assigned here.

// DASHBOARD ROUTE
router.get("/dashboard", getDashboard);
router.patch("/dashboard/projects-limit", updateLimit);

router.get("/supervision-projects", getSupervisionProjects);
router.get("/examination-projects", getExaminationProjects);
router.get("/proposal-queue", getProposalQueue);
router.patch("/proposal/:projectId/review", reviewProposal);
router.get("/supervisor-requests", getRequests);
router.patch("/supervisor-requests/:requestId", updateRequest);

// MY PROJECT ROUTES
// router.get("/projects", getProjectPage);
// router.patch("/project/:projectId/edit", editProjectDescription);

// NOTES ROUTES
router.get("/personal-notes", getNotes);
router.post("/personal-notes/new-note", createNote);
router.delete("/personal-notes/:noteId/delete", deleteNote);

// NOTIFICATIONS ROUTES
router.get("/notifications", getNotifications);
router.post("/notifications/new-notification", createNotification);
router.delete("/notifications/:notificationId/delete", deleteNotification);

export default router;
