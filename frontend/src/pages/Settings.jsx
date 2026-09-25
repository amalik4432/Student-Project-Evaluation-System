import { useState } from "react";
import { toast } from "react-toastify";
import { PageHeader, Card } from "../components/ui/Primitives";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

const Settings = () => {
  const { role, userName, userID } = useAuth();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const route =
    role === "Student"
      ? "/student/update-password"
      : role === "Teacher"
        ? "/teacher/update-password"
        : "/admin/update-password";

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.newPassword.length < 8)
      next.newPassword = "Use at least 8 characters";
    if (form.newPassword !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match";
    if (!form.oldPassword) next.oldPassword = "Enter current password";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    const result = await api(route, { method: "put", data: form });
    setLoading(false);
    if (result.ok) {
      toast.success(result.data.message);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else toast.error(result.message);
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your password and profile details."
      />
      <Card title="Profile">
        <p>
          <strong>{userName}</strong>
        </p>
        <p className="muted">
          Role: {role}
          {userID ? ` · ID: ${userID}` : ""}
        </p>
      </Card>
      <Card title="Change password">
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Current password
            <input
              type="password"
              value={form.oldPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, oldPassword: e.target.value }))
              }
            />
            {errors.oldPassword && (
              <span className="field-error">{errors.oldPassword}</span>
            )}
          </label>
          <label>
            New password
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, newPassword: e.target.value }))
              }
            />
            {errors.newPassword && (
              <span className="field-error">{errors.newPassword}</span>
            )}
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </label>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </Card>
    </>
  );
};

export default Settings;
