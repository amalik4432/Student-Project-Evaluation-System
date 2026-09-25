import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { api } from "../api/client";
import { formatDateTime } from "../constants/status";
import {
  PageHeader,
  LoadingState,
  EmptyState,
  ErrorAlert,
} from "../components/ui/Primitives";

const NotificationsPage = () => {
  const { role } = useAuth();
  const { data, loading, error, reload } = useApi("/inbox");

  const mark = async (id) => {
    await api(`/inbox/${id}/read`, { method: "patch" });
    reload();
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        eyebrow={role}
        title="Notifications"
        subtitle="Stay up to date with proposals, requests, files, and feedback."
        actions={
          <button
            className="ghost-btn"
            onClick={() => api("/inbox/read-all", { method: "patch" }).then(reload)}
          >
            Mark all read
          </button>
        }
      />
      <ErrorAlert message={error} onRetry={reload} />
      {!data?.notifications?.length ? (
        <EmptyState
          title="You're all caught up"
          text="New activity from your FYP workspace will show here."
        />
      ) : (
        <ul className="feed-list">
          {data.notifications.map((item) => (
            <li key={item._id} className={item.read ? "" : "unread"}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>
                  {item.type} · {formatDateTime(item.createdAt)}
                </small>
              </div>
              {!item.read && (
                <button type="button" onClick={() => mark(item._id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default NotificationsPage;
