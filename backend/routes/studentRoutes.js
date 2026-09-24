import express from "express";
import { body } from "express-validator";

import dashboardControllers from "../controllers/student/dashboardControllers.js";
import projectControllers from "../controllers/student/projectControllers.js";
import proposalControllers from "../controllers/student/proposalControllers.js";
import taskControllers from "../controllers/student/taskControllers.js";
import notesControllers from "../controllers/student/notesControllers.js";

const { getDashboard } = dashboardControllers;

const { getProjectPage, editProjectDescription } = projectControllers;
const {
  getProposal,
  submitProposal,
  getAvailableSupervisors,
  requestSupervisor,
} = proposalControllers;

const { getTasks, createTask, completeTask, deleteTask, getTaskFormData } =
  taskControllers;

const { getNotes, createNote, deleteNote } = notesControllers;

const router = express.Router();

// Routes assigned here.

// DASHBOARD ROUTE
router.get("/dashboard", getDashboard);

// MY PROJECT ROUTES
router.get("/project", getProjectPage);
router.patch("/project/:projectId/edit", editProjectDescription);
router.get("/proposal", getProposal);
router.post("/proposal/submit", submitProposal);
router.get("/supervisors", getAvailableSupervisors);
router.post("/supervisor-requests", requestSupervisor);

// PROJECT MANAGEMENT ROUTES
router.get("/tasks", getTasks);
router.patch("/tasks/new-task", createTask);
router.get("/tasks/form-data", getTaskFormData);
router.patch("/tasks/:taskId/complete", completeTask);
router.delete("/tasks/:taskId/delete", deleteTask);

// NOTES ROUTES
router.get("/personal-notes", getNotes);
router.post("/personal-notes/new-note", createNote);
router.delete("/personal-notes/:noteId/delete", deleteNote);

export default router;
