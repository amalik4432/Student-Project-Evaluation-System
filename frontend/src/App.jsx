import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ADMIN_ROUTES, STUDENT_ROUTES, TEACHER_ROUTES } from "./Routes";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Page404 from "./pages/Page404";
import AdminDashboard from "./Dashboards/Admin/AdminDashboard";
import StudentDashboard from "./Dashboards/Student/StudentDashboard";
import TeacherDashboard from "./Dashboards/Teacher/TeacherDashboard";

import "./App.css";

function App() {
  const { isAuthenticated, role } = useAuth();

  const dashboardByRole = {
    Admin: <AdminDashboard links={ADMIN_ROUTES} />,
    Teacher: <TeacherDashboard links={TEACHER_ROUTES} />,
    Student: <StudentDashboard links={STUDENT_ROUTES} />,
  };
  const dashboard = dashboardByRole[role];

  return (
    <div>
      <Routes>
        <Route
          path="/*"
          element={
            isAuthenticated && dashboard ? (
              dashboard
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />

        <Route path="/404" element={<Page404 />} />
        <Route path="*" element={<h1>Page Not Found!</h1>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={5000} theme="light" />
    </div>
  );
}

export default App;
