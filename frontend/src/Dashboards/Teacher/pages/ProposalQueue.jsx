import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { ApiCall } from "../../../api/apiCall";
import styles from "./ProposalQueue.module.css";

const labels = {
  submitted: "Submitted",
  under_review: "Under review",
  needs_revision: "Needs revision",
  approved: "Approved",
  rejected: "Rejected",
};

const ProposalQueue = ({ userId, userName }) => {
  const { token } = useSelector((state) => state.login.input);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("under_review");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);

  const loadQueue = useCallback(async () => {
    const response = await ApiCall({
      params: { userId },
      route: "teacher/proposal-queue",
      verb: "get",
      token,
      baseurl: true,
    });
    if (response.status === 200) setProjects(response.response.projects);
    else
      setMessage(response.response?.message || "Could not load proposal queue");
    setIsLoading(false);
  }, [token, userId]);

  const loadRequests = useCallback(async () => {
    const response = await ApiCall({
      params: { teacherId: userId },
      route: "teacher/supervisor-requests",
      verb: "get",
      token,
      baseurl: true,
    });
    if (response.status === 200) setRequests(response.response.requests || []);
  }, [token, userId]);

  useEffect(() => {
    loadQueue();
    loadRequests();
  }, [loadQueue, loadRequests]);

  const decideRequest = async (requestId, requestStatus) => {
    const response = await ApiCall({
      params: { teacherId: userId, status: requestStatus },
      route: `teacher/supervisor-requests/${requestId}`,
      verb: "patch",
      token,
      baseurl: true,
    });
    setMessage(response.response?.message || "");
    if (response.status === 200) loadRequests();
  };

  const saveReview = async (event) => {
    event.preventDefault();
    const response = await ApiCall({
      params: { status, feedback, teacherId: userId, teacherName: userName },
      route: `teacher/proposal/${selected._id}/review`,
      verb: "patch",
      token,
      baseurl: true,
    });
    setMessage(response.response?.message || "");
    if (response.status === 200) {
      setSelected(null);
      setFeedback("");
      await loadQueue();
    }
  };

  if (isLoading) return <Spinner animation="border" />;
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Supervisor workspace</span>
          <h1>Proposal queue</h1>
          <p>
            Review proposals as focused work items, without losing the thread.
          </p>
        </div>
        <span className={styles.count}>{projects.length} assigned</span>
      </div>
      {message && <Alert variant="info">{message}</Alert>}
      <div className={styles.grid}>
        <section className={styles.list}>
          {projects.length === 0 && (
            <div className={styles.empty}>
              No proposals are assigned to you yet.
            </div>
          )}
          {projects.map((project) => (
            <button
              className={`${styles.item} ${selected?._id === project._id ? styles.selected : ""}`}
              key={project._id}
              onClick={() => {
                setSelected(project);
                setStatus(
                  project.proposalStatus === "submitted"
                    ? "under_review"
                    : project.proposalStatus,
                );
              }}
            >
              <span className={styles.itemStatus}>
                {labels[project.proposalStatus] || project.proposalStatus}
              </span>
              <strong>{project.title}</strong>
              <span>
                {project.className} · {project.semester || "Semester not set"}
              </span>
              <small>
                {project.proposalSubmittedAt
                  ? `Submitted ${new Date(project.proposalSubmittedAt).toLocaleDateString()}`
                  : "Not submitted"}
              </small>
            </button>
          ))}
        </section>
        <section className={styles.review}>
          {!selected ? (
            <div className={styles.empty}>
              Select a proposal to read the summary and leave structured
              feedback.
            </div>
          ) : (
            <>
              <span className={styles.eyebrow}>Reviewing proposal</span>
              <h2>{selected.title}</h2>
              <p className={styles.meta}>
                {selected.className} · {selected.semester || "Semester not set"}
              </p>
              <div className={styles.proposalText}>
                {selected.proposalText || "No proposal text submitted."}
              </div>
              <Form onSubmit={saveReview} className={styles.reviewForm}>
                <Form.Group>
                  <Form.Label>Decision</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    {Object.entries(labels)
                      .filter(([key]) => key !== "submitted")
                      .map(([key, value]) => (
                        <option value={key} key={key}>
                          {value}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Feedback for the student</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Give clear, actionable next steps."
                    required
                  />
                </Form.Group>
                <Button type="submit">Save review</Button>
              </Form>
            </>
          )}
        </section>
      </div>
      <section className={styles.requests}>
        <div>
          <span className={styles.eyebrow}>Supervision requests</span>
          <h2>Students asking for guidance</h2>
        </div>
        {requests.length === 0 ? (
          <p className={styles.empty}>No pending requests.</p>
        ) : (
          requests.map((request) => (
            <div className={styles.request} key={request._id}>
              <div>
                <strong>{request.studentName}</strong>
                <span>
                  {request.message ||
                    "Would like you to supervise this project."}
                </span>
              </div>
              <div className={styles.requestActions}>
                <Button
                  onClick={() => decideRequest(request._id, "accepted")}
                  disabled={request.status !== "pending"}
                >
                  Accept
                </Button>
                <Button
                  onClick={() => decideRequest(request._id, "rejected")}
                  disabled={request.status !== "pending"}
                >
                  Decline
                </Button>
              </div>
              <small>{request.status}</small>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default ProposalQueue;
