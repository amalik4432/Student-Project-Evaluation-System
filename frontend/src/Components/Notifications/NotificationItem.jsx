import classes from "./NotificationItem.module.css";

const NotificationItem = (props) => {
  const title = props.item.title || props.item.headline || "Notification";
  const body = props.item.body || props.item.description || "";
  const sender = props.item.senderName || props.item.type || "FYP Portal";

  return (
    <div className={classes.text}>
      <p className={classes.headline}>{title}</p>
      <p className={classes.description}>{body}</p>
      <p className={classes.sender}>
        Source: <span>{sender}</span>
      </p>
      <hr />
    </div>
  );
};

export default NotificationItem;
