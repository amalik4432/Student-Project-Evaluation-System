import { Route, Routes } from "react-router-dom";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Projects from "./pages/Projects";
import NoticeBoard from "./pages/NoticeBoard";
import GenerateLists from "./pages/GenerateLists";
import PersonalNotes from "./pages/PersonalNotes";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Class from "./pages/Class";
import CreateClass from "./pages/CreateClass";
import Teacher from "./pages/Teacher";
import CreateProject from "./pages/CreateProject";
import Project from "./pages/Project";
import EditProject from "./pages/EditProject";
import ProposalOverview from "./pages/ProposalOverview";
import DashboardLayout from "../../layouts/DashboardLayout";
import ProjectFiles from "../../pages/ProjectFiles";

const AdminDashboard = (props) => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/classes/" element={<Classes />} />
        <Route path="/classes/new-class" element={<CreateClass />} />
        <Route path="/classes/:classId" element={<Class />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers/" element={<Teachers />} />
        <Route path="/teachers/:teacherId" element={<Teacher />} />
        <Route path="/projects/" element={<Projects />} />
        <Route path="/projects/new-project" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<Project />} />
        <Route path="/projects/:projectId/edit" element={<EditProject />} />
        <Route path="/notice-board" element={<NoticeBoard />} />
        <Route path="/generate-list" element={<GenerateLists />} />
        <Route path="/personal-notes" element={<PersonalNotes />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/proposal-overview" element={<ProposalOverview />} />
        <Route path="/files" element={<ProjectFiles />} />
        <Route path="*" element={<h1>Page Not Found!</h1>} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
