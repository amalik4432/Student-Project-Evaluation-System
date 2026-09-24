import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { ApiCall } from "../../../api/apiCall";
import styles from "./ProposalOverview.module.css";

const labels = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  under_review: "Under review",
  needs_revision: "Needs revision",
  approved: "Approved",
  rejected: "Rejected",
};

const ProposalOverview = () => {
  const { token } = useSelector((state) => state.login.input);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const approve = async (projectId) => {
    const response = await ApiCall({
      params: {},
      route: `admin/proposal/${projectId}/approve`,
      verb: "patch",
      token,
      baseurl: true,
    });
    if (response.status === 200)
      setData((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project._id === projectId
            ? {
                ...project,
                proposalStatus: "approved",
                proposalReviewedAt: new Date().toISOString(),
              }
            : project,
        ),
      }));
  };
  useEffect(() => {
    ApiCall({
      params: {},
      route: "admin/proposal-overview",
      verb: "get",
      token,
      baseurl: true,
    }).then((response) =>
      response.status === 200
        ? setData(response.response)
        : setError(response.response?.message || "Could not load overview"),
    );
  }, [token]);
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <Spinner animation="border" />;
  return (
    <div className={styles.page}>
      <span className={styles.eyebrow}>Department overview</span>
      <h1>Proposal pulse</h1>
      <p className={styles.intro}>
        A current view of proposal work across classes, semesters, and
        supervisors.
      </p>
      <div className={styles.metrics}>
        {Object.entries(data.summary).map(([key, value]) => (
          <div className={styles.metric} key={key}>
            <span>{labels[key]}</span>
            <strong>{value.toString().padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Semester</th>
              <th>Supervisor</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Last activity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.projects.map((project) => (
              <tr key={project._id}>
                <td>
                  <strong>{project.title}</strong>
                  <small>{project.className}</small>
                </td>
                <td>{project.semester || "-"}</td>
                <td>{project.supervisorName}</td>
                <td>
                  <span
                    className={`${styles.pill} ${styles[project.proposalStatus]}`}
                  >
                    {labels[project.proposalStatus]}
                  </span>
                </td>
                <td>{project.proposalAttachments?.length || 0}</td>
                <td>
                  {project.proposalReviewedAt
                    ? new Date(project.proposalReviewedAt).toLocaleDateString()
                    : project.proposalSubmittedAt
                      ? new Date(
                          project.proposalSubmittedAt,
                        ).toLocaleDateString()
                      : "-"}
                </td>
                <td>
                  {["submitted", "under_review", "needs_revision"].includes(
                    project.proposalStatus,
                  ) && (
                    <Button onClick={() => approve(project._id)}>
                      Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProposalOverview;
