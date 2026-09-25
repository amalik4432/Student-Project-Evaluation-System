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
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [scope, setScope] = useState("");
  const [methodology, setMethodology] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requests, setRequests] = useState([]);

  const loadProposal = useCallback(
    async (selectedSubject = "") => {
      const response = await ApiCall({
        params: { studentId: userId, subject: selectedSubject },
        route: "student/proposal",
        verb: "get",
        token,
        baseurl: true,
      });
      if (response.status === 200) {
        setProposal(response.response.proposal);
        const loaded = response.response.proposal;
        setTitle(loaded.title || "");
        setSemester(loaded.semester || "");
        if (!selectedSubject) setSubject(loaded.subject || "");
        if (!selectedSubject) setTeacherId(loaded.supervisorId || "");
        setProposalText(loaded.text || "");
        setDescription(loaded.description || "");
        setObjectives(loaded.objectives || "");
        setScope(loaded.scope || "");
        setMethodology(loaded.methodology || "");
        setTechnologies(loaded.technologies || "");
        setExpectedOutcome(loaded.expectedOutcome || "");
      } else {
        setMessage(
          response.response?.message || "Could not load your proposal",
        );
      }
      setIsLoading(false);
    },
    [token, userId],
  );

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
    ApiCall({
      params: { studentId: userId },
      route: "student/supervisor-requests",
      verb: "get",
      token,
      baseurl: true,
    }).then((response) => {
      if (response.status === 200)
        setRequests(response.response.requests || []);
    });
  }, [loadProposal, token, userId]);

  const readFiles = (event) => {
    const files = Array.from(event.target.files || []);
    const invalid = files.find((file) => file.type !== "application/pdf");
    const oversized = files.find((file) => file.size > 10 * 1024 * 1024);
    if (invalid) {
      setMessage("Only PDF documents can be attached.");
      setAttachments([]);
      return;
    }
    if (oversized) {
      setMessage("Each PDF must be smaller than 10MB.");
      setAttachments([]);
      return;
    }
    setMessage("");
    setAttachments(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    const payload = new FormData();
    payload.append("studentId", userId);
    payload.append("title", title);
    payload.append("semester", semester);
    payload.append("subject", subject);
    payload.append("teacherId", teacherId);
    payload.append("proposalText", proposalText);
    payload.append("description", description);
    payload.append("objectives", objectives);
    payload.append("scope", scope);
    payload.append("methodology", methodology);
    payload.append("technologies", technologies);
    payload.append("expectedOutcome", expectedOutcome);
    attachments.forEach((file) => payload.append("attachments", file));
    const response = await ApiCall({
      params: payload,
      route: "student/proposal/submit",
      verb: "post",
      token,
      baseurl: true,
    });
    setMessage(response.response?.message || "");
    if (response.status === 200) await loadProposal(subject);
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
      setRequests((current) => [response.response.request, ...current]);
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
      {proposal?.status === "rejected" && (
        <Alert variant="danger" className={styles.rejectionNotice}>
          <strong>Proposal rejected</strong>
          <p>
            Your supervisor rejected this proposal. Review the feedback below,
            update the form, and submit it again.
          </p>
        </Alert>
      )}
      {proposal && proposal.status !== "rejected" && (
        <section className={styles.statusPanel}>
          <span className={styles.eyebrow}>Proposal status</span>
          <strong>{statusLabels[proposal.status]}</strong>
          <span>
            {proposal.status === "approved"
              ? "Your supervisor approved this proposal."
              : proposal.status === "submitted" ||
                  proposal.status === "under_review"
                ? "Your proposal is with your selected supervisor for review."
                : "Complete the form and submit your proposal to your supervisor."}
          </span>
        </section>
      )}
      {isLoading ? (
        <Spinner animation="border" />
      ) : (
        proposal && (
          <div className={styles.layout}>
            <Form className={styles.form} onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Software Engineering"
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Supervising teacher</Form.Label>
                <Form.Select
                  value={teacherId}
                  onChange={(event) => setTeacherId(event.target.value)}
                  required
                >
                  <option value="">Choose a teacher</option>
                  {teachers.map((teacher) => (
                    <option
                      key={teacher._id || teacher.id}
                      value={teacher._id || teacher.id}
                    >
                      {teacher.name}
                      {teacher.designation ? ` · ${teacher.designation}` : ""}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Project title</Form.Label>
                <Form.Control
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Name your project"
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Semester</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="8"
                  step="1"
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                  placeholder="1 to 8"
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description / Problem Statement</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What problem does this project solve?"
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Objectives</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={objectives}
                  onChange={(event) => setObjectives(event.target.value)}
                  placeholder="List measurable objectives."
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Scope</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={scope}
                  onChange={(event) => setScope(event.target.value)}
                  placeholder="Define what is included and excluded."
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Methodology</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={methodology}
                  onChange={(event) => setMethodology(event.target.value)}
                  placeholder="Explain how the project will be developed."
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Technologies / Tools</Form.Label>
                <Form.Control
                  value={technologies}
                  onChange={(event) => setTechnologies(event.target.value)}
                  placeholder="e.g. React, Node.js, MongoDB"
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Expected Outcome</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={expectedOutcome}
                  onChange={(event) => setExpectedOutcome(event.target.value)}
                  placeholder="Describe the expected result."
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Supporting documents</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={readFiles}
                  accept="application/pdf,.pdf"
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
            <Button
              type="submit"
              disabled={requests.some(
                (request) => request.status === "pending",
              )}
            >
              {requests.some((request) => request.status === "pending")
                ? "Request pending"
                : "Send request"}
            </Button>
          </Form>
          <div className={styles.requestHistory}>
            <h3>Request history</h3>
            {!requests.length && <p>No supervisor requests yet.</p>}
            {requests.map((request) => (
              <div
                className={styles.requestItem}
                key={request._id || request.id}
              >
                <strong>{request.teacherName}</strong>
                <span className={`${styles.status} ${styles[request.status]}`}>
                  {request.status}
                </span>
                <small>
                  {new Date(request.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Submissions;
