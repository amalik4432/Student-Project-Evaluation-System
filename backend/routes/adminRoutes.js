import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import requireRole from "../middlewares/requireRole.js";
import { body } from "express-validator";

import dashboardController from "../controllers/admin/dashboardController.js";
import formControllers from "../controllers/admin/formControllers.js";
import classesControllers from "../controllers/admin/classesControllers.js";
import notificationsControllers from "../controllers/admin/notificationsControllers.js";
import noticeBoardControllers from "../controllers/admin/noticeBoardControllers.js";
import teachersControllers from "../controllers/admin/teachersControllers.js";
import studentsControllers from "../controllers/admin/studentsControllers.js";
import projectsControllers from "../controllers/admin/projectsControllers.js";
import notesControllers from "../controllers/admin/notesControllers.js";
import proposalControllers from "../controllers/admin/proposalControllers.js";
import filesControllers from "../controllers/filesControllers.js";
import feedbackControllers from "../controllers/feedbackControllers.js";
import { projectFileUpload } from "../middlewares/upload.js";

const router = express.Router();
const guard = [verifyToken, requireRole("Admin")];

router.get("/", ...guard, dashboardController.getDashboard);
router.get(
  "/proposal-overview",
  ...guard,
  proposalControllers.getProposalOverview,
);
router.patch(
  "/proposal/:projectId/approve",
  ...guard,
  proposalControllers.approveProposal,
);
router.patch(
  "/proposal/:projectId/decide",
  ...guard,
  proposalControllers.decideProposal,
);

router.get("/notice-board", ...guard, noticeBoardControllers.getNoticeBoard);
router.post(
  "/notice-board/new-notice",
  ...guard,
  [
    body("headline").notEmpty().withMessage("Write Headline"),
    body("description").notEmpty().withMessage("Write description"),
    body("receiverEntity")
      .isIn(["class", "teacher"])
      .withMessage("Invalid reciever entity"),
    body("receiverId").notEmpty().withMessage("Invalid reciever id"),
  ],
  noticeBoardControllers.createNotice,
);
router.delete(
  "/notice-board/:noticeId/delete",
  ...guard,
  noticeBoardControllers.deleteNotice,
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

router.get("/classes", ...guard, classesControllers.getClasses);
router.post(
  "/classes/new-class",
  ...guard,
  [
    body("program").notEmpty().withMessage("Write program"),
    body("session").notEmpty().withMessage("choose session"),
    body("shift").notEmpty().withMessage("choose shift"),
    body("minAllowed").notEmpty().withMessage("choose minAllowed"),
    body("maxAllowed").notEmpty().withMessage("choose maxAllowed"),
  ],
  classesControllers.createClass,
);
router.delete(
  "/classes/:classId/delete",
  ...guard,
  classesControllers.deleteClass,
);
router.get("/classes/:classId", ...guard, classesControllers.getClassById);
router.patch(
  "/classes/:classId/edit-timetable",
  ...guard,
  classesControllers.editTimeTable,
);
router.patch(
  "/classes/:classId/assign-supervisor",
  ...guard,
  classesControllers.assignSupervisorToClass,
);
router.patch(
  "/classes/:classId/assign-examiner",
  ...guard,
  classesControllers.assignExaminerToClass,
);

router.get("/projects", ...guard, projectsControllers.getAllProjects);
router.post(
  "/projects/new-project",
  ...guard,
  [
    body("title").notEmpty().withMessage("Write title"),
    body("memberNames").notEmpty().isArray().withMessage("choose memberNames"),
    body("classId").notEmpty().withMessage("choose class id"),
    body("className").notEmpty().withMessage("choose class name"),
  ],
  projectsControllers.createProject,
);
router.get(
  "/projects/:projectId",
  ...guard,
  projectsControllers.getProjectById,
);
router.delete(
  "/projects/:projectId/delete",
  ...guard,
  projectsControllers.deleteProject,
);
router.patch(
  "/projects/:projectId/edit",
  ...guard,
  projectsControllers.updateProject,
);

router.get("/teachers", ...guard, teachersControllers.getTeachers);
router.post("/teachers", ...guard, teachersControllers.createTeacher);
router.get(
  "/teachers/:teacherId",
  ...guard,
  teachersControllers.getTeacherById,
);
router.put("/teachers/:teacherId", ...guard, teachersControllers.updateTeacher);
router.delete(
  "/teachers/:teacherId",
  ...guard,
  teachersControllers.deleteTeacher,
);
router.patch(
  "/teachers/:teacherId/unassign-supervisor",
  ...guard,
  [body("classId").notEmpty().withMessage("choose class Id")],
  teachersControllers.unAssignSupervisorToClass,
);
router.patch(
  "/teachers/:teacherId/unassign-examiner",
  ...guard,
  [body("classId").notEmpty().withMessage("choose class Id")],
  teachersControllers.unAssignExaminerToClass,
);

router.get("/students", ...guard, studentsControllers.getStudents);
router.post("/students", ...guard, studentsControllers.createStudent);
router.get(
  "/students/:studentId",
  ...guard,
  studentsControllers.getStudentById,
);
router.put("/students/:studentId", ...guard, studentsControllers.updateStudent);
router.delete(
  "/students/:studentId",
  ...guard,
  studentsControllers.deleteStudent,
);

router.get("/personal-notes", ...guard, notesControllers.getNotes);
router.post("/personal-notes/new-note", ...guard, notesControllers.createNote);
router.delete(
  "/personal-notes/:noteId/delete",
  ...guard,
  notesControllers.deleteNote,
);

router.get(
  "/forms/new-project/data",
  ...guard,
  formControllers.getProjectFormData,
);
router.get(
  "/forms/add-supervisor/data",
  ...guard,
  formControllers.loadAddSupervisorData,
);
router.get(
  "/forms/add-examiner/data",
  ...guard,
  formControllers.loadAddExaminerData,
);
router.get(
  "/forms/new-notice/data",
  ...guard,
  formControllers.loadNewNoticeFormData,
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
