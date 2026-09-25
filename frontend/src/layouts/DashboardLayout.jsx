import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { formatDateTime } from "../constants/status";
import { ADMIN_NAV, STUDENT_NAV, TEACHER_NAV } from "../constants/nav";
import "./DashboardLayout.css";

const navForRole = {
  Admin: ADMIN_NAV,
  Teacher: TEACHER_NAV,
  Student: STUDENT_NAV,
};

const DashboardLayout = ({ children }) => {
  const { userName, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState({ notifications: [], unreadCount: 0 });

  const loadInbox = async () => {
    const result = await api("/inbox");
    if (result.ok) setInbox(result.data);
  };

  useEffect(() => {
    loadInbox();
    const timer = setInterval(loadInbox, 15000);
    return () => clearInterval(timer);
  }, []);

  const markAll = async () => {
    await api("/inbox/read-all", { method: "patch" });
    loadInbox();
  };

  const openNotification = async (item) => {
    await api(`/inbox/${item._id}/read`, { method: "patch" });
    loadInbox();
    if (item.link) navigate(item.link);
  };

  const links = navForRole[role] || [];

  return (
    <div className={`app-shell ${open ? "nav-open" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>FYP Portal</strong>
            <span>{role} workspace</span>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              onClick={() => setOpen(false)}
            >
              <span className="icon">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="menu-btn"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <HiOutlineMenuAlt2 />
          </button>
          <div className="topbar-copy">
            <p>Final Year Project Management</p>
            <strong>Welcome back, {userName || role}</strong>
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle className="bell-btn">
              Notifications
              {inbox.unreadCount > 0 && (
                <span className="badge-dot">{inbox.unreadCount}</span>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="inbox-menu">
              <div className="inbox-head">
                <strong>Inbox</strong>
                <button type="button" onClick={markAll}>
                  Mark all read
                </button>
              </div>
              {!inbox.notifications?.length && (
                <div className="inbox-empty">No notifications yet.</div>
              )}
              {inbox.notifications?.slice(0, 8).map((item) => (
                <button
                  type="button"
                  className={`inbox-item ${item.read ? "" : "unread"}`}
                  key={item._id}
                  onClick={() => openNotification(item)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                  <small>{formatDateTime(item.createdAt)}</small>
                </button>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <button className="ghost-btn" type="button" onClick={logout}>
            Sign out
          </button>
        </header>
        <main className="content">{children}</main>
      </div>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
    </div>
  );
};

export default DashboardLayout;
