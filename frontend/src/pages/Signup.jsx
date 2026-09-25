import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api/client";
import classes from "./Signup.module.css";

const initialForm = {
  name: "",
  rollNo: "",
  registrationNo: "",
  email: "",
  password: "",
  confirmPassword: "",
  batchYear: "",
  classId: "",
};

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/public/classes").then((result) => {
      if (result.ok) setBatches(result.data.classes || []);
      else setError(result.message);
      setLoadingBatches(false);
    });
  }, []);

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "classId") {
      const selected = batches.find(
        (batch) => (batch._id || batch.id) === value,
      );
      setForm((current) => ({
        ...current,
        classId: value,
        batchYear: selected?.session || current.batchYear,
      }));
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (!form.classId) return setError("Choose your batch or class.");
    setSaving(true);
    setError("");
    const { confirmPassword, ...payload } = form;
    const result = await api("/signup/student", {
      method: "post",
      data: payload,
    });
    setSaving(false);
    if (!result.ok) return setError(result.message);
    toast.success(result.data.message);
    navigate("/login");
  };

  return (
    <main className={classes.page}>
      <section className={classes.intro}>
        <img src="/images/logo.png" alt="University of Education" />
        <p>FYP Portal / Student registration</p>
        <h1>Start your project journey with the right foundation.</h1>
        <span>
          Register once, then keep every milestone, document, and conversation
          in one place.
        </span>
      </section>
      <section className={classes.panel}>
        <div className={classes.heading}>
          <span>Student account</span>
          <h2>Create your account</h2>
          <p>
            Use your official university details to join your project workspace.
          </p>
        </div>
        {error && (
          <p className={classes.error} role="alert">
            {error}
          </p>
        )}
        <form className={classes.form} onSubmit={submitHandler}>
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={changeHandler}
              required
              placeholder="Your full name"
            />
          </label>
          <label>
            Roll number
            <input
              name="rollNo"
              value={form.rollNo}
              onChange={changeHandler}
              required
              placeholder="e.g. 2022-CS-01"
            />
          </label>
          <label>
            Registration number
            <input
              name="registrationNo"
              value={form.registrationNo}
              onChange={changeHandler}
              required
              placeholder="University registration number"
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={changeHandler}
              required
              placeholder="you@university.edu"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={changeHandler}
              required
              placeholder="At least 8 characters"
            />
          </label>
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={changeHandler}
              required
              placeholder="Repeat your password"
            />
          </label>
          <label className={classes.wide}>
            Batch / class
            <select
              name="classId"
              value={form.classId}
              onChange={changeHandler}
              required
              disabled={loadingBatches}
            >
              <option value="">
                {loadingBatches
                  ? "Loading available batches..."
                  : "Choose your batch"}
              </option>
              {batches.map((batch) => (
                <option
                  key={batch._id || batch.id}
                  value={batch._id || batch.id}
                >
                  {batch.name} · {batch.session}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Creating account..." : "Create student account"}
          </button>
        </form>
        <p className={classes.login}>
          Already registered? <Link to="/login">Sign in here</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;
