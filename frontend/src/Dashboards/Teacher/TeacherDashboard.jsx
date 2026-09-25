import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Dashboard from "./pages/Dashboard";

import DashboardLayout from "../../layouts/DashboardLayout";
import SupervisionProjects from "./pages/SupervisionProjects";
import ExaminationProjects from "./pages/ExaminationProjects";
import PersonalNotes from "./pages/PersonalNotes";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import ProposalQueue from "./pages/ProposalQueue";
import Classes from "./pages/Classes";
import ClassDetails from "./pages/ClassDetails";
import ProjectFiles from "../../pages/ProjectFiles";

const TeacherDashboard = (props) => {
  const { input } = useSelector((state) => state.login);
  const user = {
    name: input.userName,
    id: input.user_id,
  };

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={<Dashboard userId={user.id} userName={user.name} />}
        />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:classId" element={<ClassDetails />} />
        <Route path="/files" element={<ProjectFiles />} />
        <Route
          path="/supervision-projects"
          element={
            <SupervisionProjects userId={user.id} userName={user.name} />
          }
        />
        <Route
          path="/proposal-queue"
          element={<ProposalQueue userId={user.id} userName={user.name} />}
        />
        <Route
          path="/examination-projects"
          element={
            <ExaminationProjects userId={user.id} userName={user.name} />
          }
        />
        <Route
          path="/notifications"
          element={<Notifications userId={user.id} userName={user.name} />}
        />
        <Route
          path="/personal-notes"
          element={<PersonalNotes userId={user.id} userName={user.name} />}
        />
        <Route
          path="/settings"
          element={<Settings userId={user.id} />}
          userName={user.name}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
