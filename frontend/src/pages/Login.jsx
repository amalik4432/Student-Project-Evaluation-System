import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../api/client";
import { authActions } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";
import classes from "./Login.module.css";

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    userID: "",
    password: "",
    loginAs: "Student",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.userID.trim()) next.userID = "Enter your user ID";
    if (!form.password || form.password.length < 8)
      next.password = "Password must be at least 8 characters";
    if (!form.loginAs) next.loginAs = "Select a role";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await api("/login", { method: "post", data: form });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      dispatch(
        authActions.login({
          token: result.data.token,
          userId: result.data.userId,
          role: result.data.role || form.loginAs,
          userName: result.data.userName,
          userID: form.userID,
        }),
      );
      toast.success(result.data.message);
    } catch (error) {
      toast.error(error.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={classes.page}>
      <section className={classes.story} aria-label="FYP Portal introduction">
        <header className={classes.storyTop}>
          <img
            className={classes.logo}
            src="/images/logo.png"
            alt="University of Education"
          />
          <span>FYP Portal</span>
        </header>
        <div className={classes.storyCopy}>
          <p className={classes.eyebrow}>One workspace. Every milestone.</p>
          <h1>
            Move your <em>final year</em> project forward.
          </h1>
          <p className={classes.description}>
            Keep proposals, supervisors, tasks, files, and feedback connected
            from first idea to final submission.
          </p>
          <div className={classes.highlights}>
            <span>Project clarity</span>
            <span>Shared progress</span>
            <span>Fewer loose ends</span>
          </div>
        </div>
        <footer className={classes.storyFooter}>
          <span className={classes.statusDot} />
          <span>University of Education</span>
          <span className={classes.footerRule} />
          <span>Truth, the ultimate virtue</span>
        </footer>
      </section>

      <section className={classes.formPanel}>
        <form className={classes.form} onSubmit={onSubmit} noValidate>
          <div className={classes.formHeader}>
            <p className={classes.formKicker}>Welcome back</p>
            <h2>Sign in to your portal</h2>
            <p>Access your project workspace securely.</p>
          </div>
          <div className={classes.fields}>
            <label className={classes.field}>
              <span>User ID</span>
              <input
                name="userID"
                value={form.userID}
                onChange={onChange}
                placeholder="Roll number, registration number, or email"
                autoComplete="username"
                aria-invalid={Boolean(errors.userID)}
              />
              {errors.userID && (
                <span className={classes.fieldError}>{errors.userID}</span>
              )}
            </label>
            <label className={classes.field}>
              <span>Password</span>
              <span className={classes.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  className={classes.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
              {errors.password && (
                <span className={classes.fieldError}>{errors.password}</span>
              )}
            </label>
            <label className={classes.field}>
              <span>Continue as</span>
              <select name="loginAs" value={form.loginAs} onChange={onChange}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher / Supervisor</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
          </div>
          <label className={classes.remember}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={onChange}
            />
            <span>Keep me signed in on this device</span>
          </label>
          <button className={classes.submit} type="submit" disabled={loading}>
            <span>{loading ? "Signing in" : "Sign in"}</span>
            <span className={classes.arrow} aria-hidden="true">
              -&gt;
            </span>
          </button>
          <p className={classes.securityNote}>
            Your account is protected by secure university authentication.
          </p>
          <p className={classes.securityNote}>
            New student? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;
