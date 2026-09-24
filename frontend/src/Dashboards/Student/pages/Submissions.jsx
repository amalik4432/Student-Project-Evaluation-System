import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { ApiCall } from "../../../api/apiCall";
import { useSelector } from "react-redux";

import styles from "./Submissions.module.css";

const statusLabels = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  under_review: "Under review",
  needs_revision: "Needs revision",
  approved: "Approved",
  rejected: "Rejected",
};

const Submissions = ({ userId }) => {
  const { token } = useSelector((state) => state.login.input);
  const [proposal, setProposal] = useState(null);
  const [semester, setSemester] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const loadProposal = useCallback(async () => {
    const response = await ApiCall({
      params: { studentId: userId },
      route: "student/proposal",
      verb: "get",
      token,
      baseurl: true,
    });
    if (response.status === 200) {
      setProposal(response.response.proposal);
      setSemester(response.response.proposal.semester || "");
      setProposalText(response.response.proposal.text || "");
    } else {
      setMessage(response.response?.message || "Could not load your proposal");
    }
    setIsLoading(false);
  }, [token, userId]);

  useEffect(() => {
    loadProposal();
    ApiCall({
      params: {},
      route: "student/supervisors",
      verb: "get",
      token,
      baseurl: true,
    }).then((response) => {
      if (response.status === 200)
        setTeachers(response.response.teachers || []);
    });
  }, [loadProposal, token]);

  const readFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    const encoded = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result,
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setAttachments(encoded);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    const response = await ApiCall({
      params: { studentId: userId, semester, proposalText, attachments },
      route: "student/proposal/submit",
      verb: "post",
      token,
      baseurl: true,
    });
    setMessage(response.response?.message || "");
    if (response.status === 200) await loadProposal();
    setIsSaving(false);
  };

  const sendSupervisorRequest = async (event) => {
    event.preventDefault();
    const response = await ApiCall({
      params: { studentId: userId, teacherId, message: requestMessage },
      route: "student/supervisor-requests",
      verb: "post",
      token,
      baseurl: true,
    });
    setMessage(response.response?.message || "");
    if (response.status === 201) {
      setTeacherId("");
      setRequestMessage("");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Proposal desk</span>
          <h1>Submit for review</h1>
          <p>One clear place for your proposal, feedback, and next step.</p>
        </div>
        {proposal && (
          <span className={`${styles.status} ${styles[proposal.status]}`}>
            {statusLabels[proposal.status]}
          </span>
        )}
      </div>
      {message && <Alert variant="info">{message}</Alert>}
      {isLoading ? (
        <Spinner animation="border" />
      ) : (
        proposal && (
          <div className={styles.layout}>
            <Form className={styles.form} onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Project title</Form.Label>
                <Form.Control value={proposal.title} disabled />
              </Form.Group>
              <Form.Group>
                <Form.Label>Semester</Form.Label>
                <Form.Control
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                  placeholder="e.g. Fall 2026"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Proposal summary</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={11}
                  value={proposalText}
                  onChange={(event) => setProposalText(event.target.value)}
                  placeholder="Describe the problem, objectives, and expected outcome."
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Supporting documents</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={readFiles}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                <small className={styles.fileHint}>
                  {attachments.length
                    ? `${attachments.length} document(s) ready`
                    : `${proposal.attachments?.length || 0} document(s) stored`}
                </small>
              </Form.Group>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : proposal.status === "needs_revision" ||
                      proposal.status === "rejected"
                    ? "Resubmit proposal"
                    : "Submit proposal"}
              </Button>
            </Form>
            <aside className={styles.feedback}>
              <h2>Review history</h2>
              {!proposal.feedback?.length && (
                <p>
                  No feedback yet. Your supervisor will leave notes here after
                  reviewing.
                </p>
              )}
              {proposal.feedback?.map((item) => (
                <div className={styles.feedbackItem} key={item._id}>
                  <strong>{item.authorName}</strong>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <p>{item.message}</p>
                </div>
              ))}
              {proposal.aiFeedback?.overall && (
                <div className={styles.aiBox}>
                  <span className={styles.eyebrow}>Early feedback</span>
                  <p>{proposal.aiFeedback.overall}</p>
                  <ul>
                    {proposal.aiFeedback.missingPoints?.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        )
      )}
      {!isLoading && (
        <section className={styles.supervisorBox}>
          <div>
            <span className={styles.eyebrow}>Find a supervisor</span>
            <h2>Request guidance</h2>
            <p>Send a focused request to an available teacher.</p>
          </div>
          <Form onSubmit={sendSupervisorRequest} className={styles.requestForm}>
            <Form.Select
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              required
            >
              <option value="">Choose a teacher</option>
              {teachers.map((teacher) => (
                <option
                  value={teacher._id || teacher.id}
                  key={teacher._id || teacher.id}
                >
                  {teacher.name}
                  {teacher.designation ? ` · ${teacher.designation}` : ""}
                </option>
              ))}
            </Form.Select>
            <Form.Control
              value={requestMessage}
              onChange={(event) => setRequestMessage(event.target.value)}
              placeholder="Add a short message (optional)"
            />
            <Button type="submit">Send request</Button>
          </Form>
        </section>
      )}
    </div>
  );
};

export default Submissions;
