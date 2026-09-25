import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import styles from "./ClassDetails.module.css";

const ClassDetails = () => {
  const { classId } = useParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/teacher/classes/${classId}`).then((result) => {
      if (result.ok) setData(result.data);
      else setError(result.message);
    });
  }, [classId]);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading class students...</p>;

  return (
    <div className={styles.page}>
      <header>
        <span>Teacher workspace</span>
        <h1>{data.class.name}</h1>
        <p>
          {data.class.program} · {data.class.session} · {data.totalStudents}{" "}
          students
        </p>
      </header>
      <section className={styles.panel}>
        {!data.students.length ? (
          <p className={styles.empty}>No students belong to this batch yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll number</th>
                  <th>Registration</th>
                  <th>Email</th>
                  <th>Project</th>
                  <th>Supervisor</th>
                  <th>Proposal</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr
                    key={student._id}
                    onClick={() => setSelected(student)}
                    className={
                      selected?._id === student._id ? styles.active : ""
                    }
                  >
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>{student.rollNo}</td>
                    <td>{student.registrationNo || "-"}</td>
                    <td>{student.email || "-"}</td>
                    <td>{student.project?.title || "Not started"}</td>
                    <td>{student.supervisorStatus}</td>
                    <td>
                      {student.project?.proposalStatus || "Not submitted"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && (
        <section className={styles.detail}>
          <div>
            <span>Student profile</span>
            <h2>{selected.name}</h2>
            <p>
              {selected.email || "No email provided"} · {selected.rollNo}
            </p>
          </div>
          <div className={styles.detailGrid}>
            <div>
              <b>Registration number</b>
              <p>{selected.registrationNo || "-"}</p>
            </div>
            <div>
              <b>Project status</b>
              <p>{selected.project?.status || "Not started"}</p>
            </div>
            <div>
              <b>Proposal status</b>
              <p>{selected.project?.proposalStatus || "Not submitted"}</p>
            </div>
            <div>
              <b>Supervisor</b>
              <p>{selected.project?.supervisorName || "Not assigned"}</p>
            </div>
          </div>
          {selected.project && (
            <div className={styles.proposal}>
              <h3>{selected.project.title}</h3>
              <p>
                <b>Problem:</b>{" "}
                {selected.project.proposalDescription || "Not submitted"}
              </p>
              <p>
                <b>Objectives:</b>{" "}
                {selected.project.proposalObjectives || "Not submitted"}
              </p>
              <p>
                <b>Scope:</b>{" "}
                {selected.project.proposalScope || "Not submitted"}
              </p>
              <p>
                <b>Methodology:</b>{" "}
                {selected.project.proposalMethodology || "Not submitted"}
              </p>
              <p>
                <b>Technologies:</b>{" "}
                {selected.project.proposalTechnologies || "Not submitted"}
              </p>
              <p>
                <b>Expected outcome:</b>{" "}
                {selected.project.proposalExpectedOutcome || "Not submitted"}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ClassDetails;
