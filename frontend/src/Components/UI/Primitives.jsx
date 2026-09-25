import { STATUS_LABELS, STATUS_TONES } from "../../constants/status";

export const PageHeader = ({ eyebrow, title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
);

export const StatCard = ({ label, value, hint, tone = "default" }) => (
  <article className={`stat-card tone-${tone}`}>
    <span>{label}</span>
    <strong>{value ?? "—"}</strong>
    {hint && <small>{hint}</small>}
  </article>
);

export const StatusBadge = ({ status }) => {
  const tone = STATUS_TONES[status] || "muted";
  return (
    <span className={`status-badge tone-${tone}`}>
      {STATUS_LABELS[status] || status || "Unknown"}
    </span>
  );
};

export const LoadingState = ({ label = "Loading workspace…" }) => (
  <div className="state-box">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="state-box empty">
    <h3>{title}</h3>
    <p>{text}</p>
    {action}
  </div>
);

export const ErrorAlert = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div className="alert-banner error">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="text-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export const DataTable = ({ columns, rows, empty = "No records found." }) => {
  if (!rows?.length) {
    return <EmptyState title="Nothing here yet" text={empty} />;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row._id || JSON.stringify(row)}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Card = ({ title, actions, children, className = "" }) => (
  <section className={`panel ${className}`}>
    {(title || actions) && (
      <div className="panel-head">
        {title && <h2>{title}</h2>}
        {actions}
      </div>
    )}
    {children}
  </section>
);
