export const STATUS_LABELS = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  under_review: "Under review",
  needs_revision: "Needs revision",
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  passed: "Passed",
  failed: "Failed",
  "In Progress": "In progress",
  Completed: "Completed",
  Late: "Late",
  "Not Started": "Not started",
};

export const STATUS_TONES = {
  not_submitted: "muted",
  submitted: "info",
  under_review: "info",
  needs_revision: "warning",
  approved: "success",
  accepted: "success",
  rejected: "danger",
  pending: "warning",
  in_progress: "info",
  completed: "success",
  passed: "success",
  failed: "danger",
  "In Progress": "info",
  Completed: "success",
  Late: "danger",
  "Not Started": "muted",
};

export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
