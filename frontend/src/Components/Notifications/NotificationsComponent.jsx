import { useEffect, useState } from "react";
import { api } from "../../api/client";
import NotificationItem from "./NotificationItem";
import CustomCard from "../UI/CustomCard";

import classes from "./NotificationsComponent.module.css";

const NotificationsComponent = (props) => {
  const [limit, setLimit] = useState(3);
  const [inboxNotifications, setInboxNotifications] = useState([]);
  useEffect(() => {
    if (Array.isArray(props.notifications)) return;
    api("/inbox").then((result) => {
      if (result.ok) setInboxNotifications(result.data.notifications || []);
    });
  }, [props.notifications]);

  const notifications = Array.isArray(props.notifications)
    ? props.notifications
    : inboxNotifications;
  const notificationItems = notifications
    .slice(0, limit)
    .map((item) => <NotificationItem key={item._id || item.id} item={item} />);

  return (
    <CustomCard>
      <div className={classes["notification-container"]}>
        <p className={classes.head}>Notifications</p>
        {!notificationItems.length && <p>There are no notifications to show</p>}
        {notificationItems}
        {limit < notifications.length && (
          <p
            className={classes.load}
            onClick={() => setLimit((value) => value + 3)}
          >
            Load More
          </p>
        )}
      </div>
    </CustomCard>
  );
};

export default NotificationsComponent;
