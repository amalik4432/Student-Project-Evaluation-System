import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/client";
import { formatDateTime } from "../../constants/status";

const LoadingState = ({ label }) => <p>{label}</p>;
const EmptyState = ({ title, text }) => (
  <div>
    <strong>{title}</strong>
    <p>{text}</p>
  </div>
);
const ErrorAlert = ({ message, onRetry }) =>
  message ? (
    <div role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ) : null;
const ConfirmDialog = ({
  show,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}) =>
  show ? (
    <div role="dialog" aria-modal="true">
      <h3>{title}</h3>
      <p>{body}</p>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  ) : null;

const FileManager = ({
  listRoute,
  uploadRoute,
  downloadPrefix,
  projectId,
  canUpload = true,
  uploaderName,
  reloadKey,
}) => {
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("other");

  const load = async () => {
    setLoading(true);
    const result = await api(listRoute, {
      params: projectId ? { projectId } : undefined,
    });
    if (result.ok) setFiles(result.data.files || []);
    else setError(result.message);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [listRoute, projectId, reloadKey]);

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!projectId) {
      toast.error("A project is required before uploading files.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please keep files under 10MB.");
      return;
    }
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Use a PDF, Word, PowerPoint, or text document.");
      return;
    }
    setBusy(true);
    const data = new FormData();
    data.append("file", file);
    data.append("projectId", projectId);
    data.append("category", category);
    if (uploaderName) data.append("uploaderName", uploaderName);
    const result = await api(uploadRoute, {
      method: "post",
      data,
    });
    setBusy(false);
    if (result.ok) {
      toast.success("File uploaded");
      load();
    } else toast.error(result.message);
  };

  const download = async (file) => {
    const result = await api(`${downloadPrefix}/${file._id}`);
    if (!result.ok) return toast.error(result.message);
    const link = document.createElement("a");
    link.href = result.data.file.data;
    link.download = result.data.file.name;
    link.click();
  };

  const view = async (file) => {
    const result = await api(`${downloadPrefix}/${file._id}`);
    if (!result.ok) return toast.error(result.message);
    window.open(result.data.file.data, "_blank", "noopener,noreferrer");
  };

  const remove = async () => {
    const result = await api(`${downloadPrefix}/${pendingDelete._id}`, {
      method: "delete",
    });
    if (result.ok) {
      toast.success("File deleted");
      setPendingDelete(null);
      load();
    } else toast.error(result.message);
  };

  if (loading) return <LoadingState label="Loading files…" />;

  return (
    <div>
      <ErrorAlert message={error} onRetry={load} />
      {canUpload && (
        <div className="file-toolbar">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="proposal">Proposal</option>
            <option value="deliverable">Deliverable</option>
            <option value="report">Report</option>
            <option value="other">Other</option>
          </select>
          <label className="upload-btn">
            {busy ? "Uploading…" : "Upload file"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              hidden
              onChange={onUpload}
              disabled={busy}
            />
          </label>
        </div>
      )}
      {!files.length ? (
        <EmptyState
          title="No files yet"
          text="Project documents will appear here once uploaded."
        />
      ) : (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file._id}>
              <div>
                <strong>{file.name}</strong>
                <small>
                  {file.category} · {file.uploadedByName} ·{" "}
                  {formatDateTime(file.createdAt)}
                </small>
              </div>
              <div className="row-actions">
                {file.type === "application/pdf" && (
                  <button type="button" onClick={() => view(file)}>
                    View
                  </button>
                )}
                <button type="button" onClick={() => download(file)}>
                  Download
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => setPendingDelete(file)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        show={Boolean(pendingDelete)}
        title="Delete file"
        body={`Delete ${pendingDelete?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default FileManager;
