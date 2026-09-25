import { useEffect, useState } from "react";
import { api } from "../api/client";
import FileManager from "../Components/files/FileManager";
import { useAuth } from "../hooks/useAuth";
import styles from "./ProjectFiles.module.css";

const ProjectFiles = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const route =
      role === "Student"
        ? "/student/project"
        : role === "Teacher"
          ? "/teacher/supervision-projects"
          : "/admin/projects";
    api(route).then((result) => {
      if (result.ok) {
        const available =
          role === "Student"
            ? result.data.project
              ? [result.data.project]
              : []
            : result.data.projects || [];
        setProjects(available);
        setProjectId(available[0]?._id || available[0]?.id || "");
      }
      setLoading(false);
    });
  }, [role]);

  const base =
    role === "Student"
      ? "/student/files"
      : role === "Teacher"
        ? "/teacher/files"
        : "/admin/files";

  return (
    <div className={styles.page}>
      <header>
        <span>Document workspace</span>
        <h1>Project files</h1>
        <p>Upload, review, and download project documents securely.</p>
      </header>
      {loading ? (
        <p>Loading projects...</p>
      ) : !projects.length ? (
        <p className={styles.empty}>
          No project is available for file management yet.
        </p>
      ) : (
        <>
          {projects.length > 1 && (
            <select
              className={styles.select}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              aria-label="Choose project"
            >
              {projects.map((project) => (
                <option
                  key={project._id || project.id}
                  value={project._id || project.id}
                >
                  {project.title}
                </option>
              ))}
            </select>
          )}
          <section className={styles.panel}>
            <FileManager
              listRoute={base}
              uploadRoute={base}
              downloadPrefix={base}
              projectId={projectId}
              canUpload={role !== "Admin"}
              uploaderName={role}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ProjectFiles;
