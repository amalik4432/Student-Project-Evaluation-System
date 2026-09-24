import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { body } from "express-validator";

import dashboardController from "../controllers/admin/dashboardController.js";
import formControllers from "../controllers/admin/formControllers.js";
import classesControllers from "../controllers/admin/classesControllers.js";
import notificationsControllers from "../controllers/admin/notificationsControllers.js";
import noticeBoardControllers from "../controllers/admin/noticeBoardControllers.js";
import teachersControllers from "../controllers/admin/teachersControllers.js";
import projectsControllers from "../controllers/admin/projectsControllers.js";
import notesControllers from "../controllers/admin/notesControllers.js";
import proposalControllers from "../controllers/admin/proposalControllers.js";

const { getDashboard } = dashboardController;
const {
  getProjectFormData,
  loadAddSupervisorData,
  loadNewNoticeFormData,
  loadAddExaminerData,
} = formControllers;
// CLASSES
const {
  getClasses,
  createClass,
  getClassById,
  editTimeTable,
  assignSupervisorToClass,
  assignExaminerToClass,
  deleteClass,
} = classesControllers;

// NOTIFICATIONS
const { getNotifications, createNotification, deleteNotification } =
  notificationsControllers;

// NOTICES
const { createNotice, getNoticeBoard, deleteNotice } = noticeBoardControllers;

// TEACHERS
const {
  getTeachers,
  getTeacherById,
  unAssignSupervisorToClass,
  unAssignExaminerToClass,
} = teachersControllers;

// PROJECTS
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = projectsControllers;

// PERSONAL NOTES
const { getNotes, createNote, deleteNote } = notesControllers;
const { getProposalOverview, approveProposal } = proposalControllers;

// ///////////////////////////////////////////////////////////////////////////////////
const router = express.Router();

router.get("/", getDashboard);
router.get("/proposal-overview", verifyToken, getProposalOverview);
router.patch("/proposal/:projectId/approve", verifyToken, approveProposal);

// Notice Board Routes
router.get("/notice-board", verifyToken, getNoticeBoard);
router.post(
  "/notice-board/new-notice",
  verifyToken,
  [
    body("headline").notEmpty().withMessage("Write Headline"),
    body("description").notEmpty().withMessage("Write description"),
    body("receiverEntity")
      .isIn(["class", "teacher"])
      .withMessage("Invalid reciever entity"),
    body("receiverId")
      .notEmpty()
      .exists({ checkFalsy: true })
      .withMessage("Invalid reciever id"),
  ],
  createNotice,
);
router.delete("/notice-board/:noticeId/delete", verifyToken, deleteNotice);

// Notification Routes
router.get("/notifications", verifyToken, getNotifications);
router.post("/notifications/new-notification", verifyToken, createNotification);
router.delete(
  "/notifications/:notificationId/delete",
  verifyToken,
  deleteNotification,
);

// Classes Routes
router.get("/classes", verifyToken, getClasses);
router.post(
  "/classes/new-class",
  verifyToken,
  [
    body("program").notEmpty().withMessage("Write program"),
    body("session").notEmpty().withMessage("choose session"),
    body("shift").notEmpty().withMessage("choose shift"),
    body("minAllowed").notEmpty().withMessage("choose minAllowed"),
    body("maxAllowed").notEmpty().withMessage("choose maxAllowed"),
  ],
  createClass,
);
router.delete("/classes/:classId/delete", verifyToken, deleteClass);
router.get("/classes/:classId", verifyToken, getClassById);
router.patch(
  "/classes/:classId/edit-timetable",
  verifyToken,
  [
    body("titleSubmission").notEmpty().isDate().withMessage("choose date"),
    body("proposalSubmission").notEmpty().isDate().withMessage("choose date"),
    body("proposalDefense").notEmpty().isDate().withMessage("choose date"),
    body("deliverable1").notEmpty().isDate().withMessage("choose date"),
    body("deliverable1Evalutaion")
      .notEmpty()
      .isDate()
      .withMessage("choose date"),
    body("deliverable2").notEmpty().isDate().withMessage("choose date"),
    body("deliverable2Evalutaion")
      .notEmpty()
      .isDate()
      .withMessage("choose date"),
  ],
  editTimeTable,
);
router.patch(
  "/classes/:classId/assign-supervisor",
  verifyToken,
  assignSupervisorToClass,
);
router.patch(
  "/classes/:classId/assign-examiner",
  verifyToken,
  assignExaminerToClass,
);

// PROJECTS ROUTES
router.get("/projects", verifyToken, getAllProjects);
router.post(
  "/projects/new-project",
  verifyToken,
  [
    body("title").notEmpty().withMessage("Write title"),
    body("memberNames").notEmpty().isArray().withMessage("choose memberNames"),
    body("supervisorName").notEmpty().withMessage("choose supervisor"),
    body("supervisorId").notEmpty().withMessage("choose supervisor id"),
    body("classId").notEmpty().withMessage("choose class id"),
    body("className").notEmpty().withMessage("choose class id"),
  ],
  createProject,
);
router.get("/projects/:projectId", verifyToken, getProjectById);
router.delete("/projects/:projectId/delete", verifyToken, deleteProject);
router.patch("/projects/:projectId/edit", verifyToken, updateProject);

// TEACHERS ROUTES
router.get("/teachers", verifyToken, getTeachers);
router.get("/teachers/:teacherId", verifyToken, getTeacherById);
router.patch(
  "/teachers/:teacherId/unassign-supervisor",
  verifyToken,
  [body("classId").notEmpty().withMessage("choose class Id")],
  unAssignSupervisorToClass,
);
router.patch(
  "/teachers/:teacherId/unassign-examiner",
  verifyToken,
  [body("classId").notEmpty().withMessage("choose class Id")],
  unAssignExaminerToClass,
);

// NOTES ROUTES
router.get("/personal-notes", verifyToken, getNotes);
router.post("/personal-notes/new-note", verifyToken, createNote);
router.delete("/personal-notes/:noteId/delete", verifyToken, deleteNote);

// FORM ROUTES
router.get("/forms/new-project/data", verifyToken, getProjectFormData);
router.get("/forms/add-supervisor/data", verifyToken, loadAddSupervisorData);
router.get("/forms/add-examiner/data", verifyToken, loadAddExaminerData);
router.get("/forms/new-notice/data", verifyToken, loadNewNoticeFormData);

export default router;
