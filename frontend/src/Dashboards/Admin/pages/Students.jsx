import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../api/client";
import classes from "./Students.module.css";

const emptyForm = {
  name: "",
  rollNo: "",
  password: "",
  classId: "",
  cgpa: "",
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resetStudent, setResetStudent] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const loadPage = async () => {
    setLoading(true);
    const [studentResult, classResult] = await Promise.all([
      api("/admin/students"),
      api("/admin/classes"),
    ]);
    if (!studentResult.ok) setError(studentResult.message);
    setStudents(studentResult.data?.students || []);
    setClassOptions(classResult.data?.classes || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPage();
  }, []);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students;
    return students.filter((student) =>
      [student.name, student.rollNo, student.classId?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, students]);

  const changeHandler = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      cgpa: form.cgpa ? Number(form.cgpa) : 0,
    };
    if (
      !payload.name ||
      !payload.rollNo ||
      !payload.classId ||
      (!editingId && !payload.password)
    ) {
      toast.error("Name, roll number, class, and password are required.");
      setSaving(false);
      return;
    }
    const result = editingId
      ? await api(`/admin/students/${editingId}`, {
          method: "put",
          data: payload,
        })
      : await api("/admin/students", { method: "post", data: payload });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.data?.message || "Student saved");
    resetForm();
    loadPage();
  };

  const editHandler = (student) => {
    setEditingId(student.id || student._id);
    setForm({
      name: student.name || "",
      rollNo: student.rollNo || "",
      password: "",
      classId:
        student.classId?.id || student.classId?._id || student.classId || "",
      cgpa: student.cgpa || "",
    });
  };

  const deleteHandler = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;
    const id = student.id || student._id;
    const result = await api(`/admin/students/${id}`, { method: "delete" });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.data?.message || "Student deleted");
    loadPage();
  };

  const resetPasswordHandler = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setResetting(true);
    const result = await api(
      `/admin/students/${resetStudent.id || resetStudent._id}`,
      {
        method: "put",
        data: {
          name: resetStudent.name,
          rollNo: resetStudent.rollNo,
          classId: resetStudent.classId?._id || resetStudent.classId,
          password: newPassword,
        },
      },
    );
    setResetting(false);
    if (!result.ok) return toast.error(result.message);
    toast.success(`Password reset for ${resetStudent.name}`);
    setResetStudent(null);
    setNewPassword("");
  };

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <div>
          <p className={classes.kicker}>People directory</p>
          <h1>Students</h1>
          <p>Manage student access, classes, and academic records.</p>
        </div>
        <div className={classes.count}>{students.length} total</div>
      </header>

      <section className={classes.panel}>
        <div className={classes.panelHeader}>
          <div>
            <p className={classes.kicker}>Directory</p>
            <h2>{editingId ? "Edit student" : "Add a student"}</h2>
          </div>
          {editingId && (
            <button
              className={classes.secondary}
              type="button"
              onClick={resetForm}
            >
              Cancel edit
            </button>
          )}
        </div>
        <form className={classes.form} onSubmit={submitHandler}>
          <input
            name="name"
            value={form.name}
            onChange={changeHandler}
            placeholder="Full name"
            aria-label="Full name"
          />
          <input
            name="rollNo"
            value={form.rollNo}
            onChange={changeHandler}
            placeholder="Roll number"
            aria-label="Roll number"
          />
          <select
            name="classId"
            value={form.classId}
            onChange={changeHandler}
            aria-label="Class"
          >
            <option value="">Choose class</option>
            {classOptions.map((item) => (
              <option key={item.id || item._id} value={item.id || item._id}>
                {item.name || `${item.program} ${item.session}`}
              </option>
            ))}
          </select>
          <input
            name="cgpa"
            value={form.cgpa}
            onChange={changeHandler}
            placeholder="CGPA"
            type="number"
            min="0"
            max="4"
            step="0.01"
            aria-label="CGPA"
          />
          <input
            name="password"
            value={form.password}
            onChange={changeHandler}
            placeholder={
              editingId ? "New password (optional)" : "Temporary password"
            }
            type="password"
            aria-label="Password"
          />
          <button className={classes.primary} type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update student"
                : "Create student"}
          </button>
        </form>
      </section>
      {resetStudent && (
        <section className={classes.panel}>
          <div className={classes.panelHeader}>
            <div>
              <p className={classes.kicker}>Admin password reset</p>
              <h2>Reset {resetStudent.name}</h2>
            </div>
            <button
              className={classes.secondary}
              type="button"
              onClick={() => setResetStudent(null)}
            >
              Cancel
            </button>
          </div>
          <form className={classes.resetForm} onSubmit={resetPasswordHandler}>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              aria-label="New student password"
            />
            <button
              className={classes.primary}
              type="submit"
              disabled={resetting}
            >
              {resetting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </section>
      )}

      <section className={classes.panel}>
        <div className={classes.panelHeader}>
          <div>
            <p className={classes.kicker}>All records</p>
            <h2>Student directory</h2>
          </div>
          <input
            className={classes.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students"
            aria-label="Search students"
          />
        </div>
        {loading && <p className={classes.state}>Loading students...</p>}
        {!loading && error && <p className={classes.error}>{error}</p>}
        {!loading && !error && !filteredStudents.length && (
          <p className={classes.state}>No students match this view.</p>
        )}
        {!loading && !error && filteredStudents.length > 0 && (
          <div className={classes.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll number</th>
                  <th>Class</th>
                  <th>CGPA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id || student._id}>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>{student.rollNo}</td>
                    <td>{student.classId?.name || "Unassigned"}</td>
                    <td>{student.cgpa ?? "-"}</td>
                    <td className={classes.actions}>
                      <button
                        type="button"
                        onClick={() => editHandler(student)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHandler(student)}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetStudent(student)}
                      >
                        Reset password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Students;
