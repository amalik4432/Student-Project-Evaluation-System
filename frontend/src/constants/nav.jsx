import {
  MdDashboard,
  MdOutlineSettingsSuggest,
  MdOutlineEventNote,
  MdOutlineAssessment,
  MdPeople,
  MdFolder,
  MdFeedback,
  MdNotifications,
  MdAssignment,
} from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { AiOutlineSchedule } from "react-icons/ai";
import { BsPersonSquare, BsPersonBadge } from "react-icons/bs";
import { GiSpaceShuttle } from "react-icons/gi";
import { HiOutlineDocumentText } from "react-icons/hi";

export const ADMIN_NAV = [
  { path: "/", name: "Dashboard", icon: <MdDashboard /> },
  { path: "/students", name: "Students", icon: <MdPeople /> },
  { path: "/teachers", name: "Teachers", icon: <BsPersonSquare /> },
  { path: "/classes", name: "Classes", icon: <SiGoogleclassroom /> },
  { path: "/projects", name: "Projects", icon: <GiSpaceShuttle /> },
  {
    path: "/proposal-overview",
    name: "Proposals",
    icon: <MdOutlineAssessment />,
  },
  { path: "/notice-board", name: "Notices", icon: <MdOutlineEventNote /> },
  { path: "/settings", name: "Settings", icon: <MdOutlineSettingsSuggest /> },
];

export const TEACHER_NAV = [
  { path: "/", name: "Dashboard", icon: <MdDashboard /> },
  { path: "/classes", name: "Classes & Batches", icon: <SiGoogleclassroom /> },
  { path: "/supervision-projects", name: "My Students", icon: <MdPeople /> },
  {
    path: "/proposal-queue",
    name: "Proposal Queue",
    icon: <HiOutlineDocumentText />,
  },
  { path: "/files", name: "Project Files", icon: <MdFolder /> },
  { path: "/notifications", name: "Notifications", icon: <MdNotifications /> },
  { path: "/settings", name: "Settings", icon: <MdOutlineSettingsSuggest /> },
];

export const STUDENT_NAV = [
  { path: "/", name: "Dashboard", icon: <MdDashboard /> },
  { path: "/my-project", name: "My Project", icon: <GiSpaceShuttle /> },
  {
    path: "/project-management",
    name: "Project Management",
    icon: <AiOutlineSchedule />,
  },
  { path: "/submissions", name: "Submissions", icon: <MdAssignment /> },
  { path: "/files", name: "Project Files", icon: <MdFolder /> },
  { path: "/settings", name: "Settings", icon: <MdOutlineSettingsSuggest /> },
];
