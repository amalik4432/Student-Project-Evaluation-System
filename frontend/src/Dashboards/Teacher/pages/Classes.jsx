import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../../api/client";
import styles from "./Classes.module.css";

const initialForm = {
  program: "BSCS",
  session: "",
  shift: "Mor",
  minAllowed: 1,
  maxAllowed: 4,
};

const Classes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadClasses = async () => {
    const result = await api("/teacher/classes");
    if (result.ok) setClasses(result.data.classes || []);
    else toast.error(result.message);
    setLoading(false);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const submitHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    const result = await api("/teacher/classes/new-class", {
      method: "post",
      data: form,
    });
    setSaving(false);
    if (!result.ok) return toast.error(result.message);
    toast.success(result.data.message);
    setForm(initialForm);
    loadClasses();
  };

  return (
    <div className={styles.page}>
      <header>
        <span>Teaching workspace</span>
        <h1>Classes & batches</h1>
        <p>Create a cohort and see its current student capacity.</p>
      </header>
      <section className={styles.panel}>
        <h2>Create a batch</h2>
        <form onSubmit={submitHandler}>
          <select
            value={form.program}
            onChange={(event) =>
              setForm({ ...form, program: event.target.value })
            }
          >
            <option>BSCS</option>
            <option>BSIT</option>
            <option>MSc.IT</option>
          </select>
          <input
            value={form.session}
            onChange={(event) =>
              setForm({ ...form, session: event.target.value })
            }
            placeholder="e.g. 2022-2026"
            required
          />
          <select
            value={form.shift}
            onChange={(event) =>
              setForm({ ...form, shift: event.target.value })
            }
          >
            <option value="Mor">Morning</option>
            <option value="Eve">Evening</option>
          </select>
          <input
            type="number"
            min="1"
            max="10"
            value={form.minAllowed}
            onChange={(event) =>
              setForm({ ...form, minAllowed: event.target.value })
            }
            aria-label="Minimum group size"
          />
          <input
            type="number"
            min="1"
            max="10"
            value={form.maxAllowed}
            onChange={(event) =>
              setForm({ ...form, maxAllowed: event.target.value })
            }
            aria-label="Maximum group size"
          />
          <button disabled={saving}>
            {saving ? "Creating..." : "Create class"}
          </button>
        </form>
      </section>
      <section className={styles.grid}>
        {loading && <p>Loading classes...</p>}
        {!loading && !classes.length && (
          <p>No classes have been created yet.</p>
        )}
        {classes.map((item) => (
          <button
            type="button"
            key={item._id || item.id}
            className={styles.card}
            onClick={() => navigate(`/classes/${item._id || item.id}`)}
          >
            <span>
              {item.program} · {item.shift}
            </span>
            <h2>{item.name}</h2>
            <p>{item.session}</p>
            <strong>{item.totalStudents || 0} students</strong>
            <small>{item.totalProjects || 0} projects</small>
          </button>
        ))}
      </section>
    </div>
  );
};

export default Classes;
