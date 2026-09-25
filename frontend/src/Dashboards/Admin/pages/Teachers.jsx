import { useState, useEffect } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import TeacherComponent from "../../../Components/Teachers/TeacherComponent";
import Button from "../../../Components/UI/Button";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import classes from "./Teachers.module.css";

const Teachers = () => {
  const { token } = useSelector((state) => state.login.input);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    empId: "",
    designation: "",
    password: "",
    projectsLimit: 10,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [resetTeacher, setResetTeacher] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: {},
        route: `admin/teachers`,
        verb: "get",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setTeachers(response.response.teachers);
        setIsLoading(false);
      } else {
        console.log(response);
        setIsLoading(false);
      }
    };
    loadPage();
  }, [token]);

  const searchHandler = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  const onSubmitSearchHandler = (e) => {
    e.preventDefault();
  };

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const createTeacherHandler = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.empId.trim() || form.password.length < 8) {
      toast.error(
        "Name, employee ID, and a password of at least 8 characters are required.",
      );
      return;
    }

    setIsSaving(true);
    const response = await ApiCall({
      params: {
        ...form,
        name: form.name.trim(),
        empId: form.empId.trim(),
        projectsLimit: Number(form.projectsLimit),
      },
      route: "admin/teachers",
      verb: "post",
      token,
      baseurl: true,
    });
    setIsSaving(false);

    if (response.status !== 201) {
      toast.error(response.response?.message || "Could not create teacher");
      return;
    }

    toast.success(response.response.message || "Teacher created");
    setForm({
      name: "",
      empId: "",
      designation: "",
      password: "",
      projectsLimit: 10,
    });
    setIsLoading(true);
    const refreshed = await ApiCall({
      params: {},
      route: "admin/teachers",
      verb: "get",
      token,
      baseurl: true,
    });
    setTeachers(refreshed.response?.teachers || []);
    setIsLoading(false);
  };

  const resetTeacherPassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsResetting(true);
    const response = await ApiCall({
      params: { password: newPassword },
      route: `admin/teachers/${resetTeacher.id || resetTeacher._id}`,
      verb: "put",
      token,
      baseurl: true,
    });
    setIsResetting(false);
    if (response.status === 200) {
      toast.success(`Password reset for ${resetTeacher.name}`);
      setResetTeacher(null);
      setNewPassword("");
    } else {
      toast.error(response.response?.message || "Could not reset password");
    }
  };

  let teachersProfiles;

  if (!isLoading) {
    const filteredTeachers =
      teachers?.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.empId.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || [];

    teachersProfiles =
      filteredTeachers.length > 0 ? (
        filteredTeachers.map((teacher) => {
          return <TeacherComponent key={teacher.id} teacher={teacher} />;
        })
      ) : (
        <p>No teachers to show</p>
      );
  }

  return (
    <div>
      {!isLoading && (
        <div className={classes.container}>
          <section className={classes.createPanel}>
            <div>
              <p className={classes.kicker}>Account management</p>
              <h3>Add a teacher</h3>
              <p>
                Create a supervisor account for the teacher to use on the login
                screen.
              </p>
            </div>
            <Form
              className={classes.createForm}
              onSubmit={createTeacherHandler}
            >
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Full name"
                aria-label="Teacher full name"
              />
              <Form.Control
                name="empId"
                value={form.empId}
                onChange={handleFormChange}
                placeholder="Employee ID"
                aria-label="Employee ID"
              />
              <Form.Control
                name="designation"
                value={form.designation}
                onChange={handleFormChange}
                placeholder="Designation"
                aria-label="Designation"
              />
              <Form.Control
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                placeholder="Temporary password"
                aria-label="Teacher password"
              />
              <Form.Control
                name="projectsLimit"
                type="number"
                min="1"
                max="50"
                value={form.projectsLimit}
                onChange={handleFormChange}
                placeholder="Project limit"
                aria-label="Project limit"
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create teacher"}
              </Button>
            </Form>
          </section>
          {resetTeacher && (
            <section className={classes.resetPanel}>
              <div>
                <p className={classes.kicker}>Admin password reset</p>
                <h3>Reset {resetTeacher.name}</h3>
                <p>The teacher can use this new password immediately.</p>
              </div>
              <Form
                className={classes.resetForm}
                onSubmit={resetTeacherPassword}
              >
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                  aria-label="New teacher password"
                />
                <Button type="submit" disabled={isResetting}>
                  {isResetting ? "Resetting..." : "Reset password"}
                </Button>
                <Button type="button" onClick={() => setResetTeacher(null)}>
                  Cancel
                </Button>
              </Form>
            </section>
          )}
          <div className={classes.top}>
            <h4>All Teachers</h4>
            <Form className="d-flex" onSubmit={onSubmitSearchHandler}>
              <Form.Control
                className={`${classes.search} mr-2`}
                type="search"
                placeholder="Search ID or Name"
                onChange={searchHandler}
              />
              <Button type="submit">
                <BiSearchAlt />
              </Button>
            </Form>
          </div>
          <div className={classes.teachers}>
            {filteredTeachers.map((teacher) => (
              <div
                className={classes.teacherEntry}
                key={teacher.id || teacher._id}
              >
                <TeacherComponent teacher={teacher} />
                <Button type="button" onClick={() => setResetTeacher(teacher)}>
                  Reset password
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default Teachers;
