import { useState } from "react";
import NotificationItem from "./NotificationItem";
import CustomCard from "../UI/CustomCard";

import classes from "./NotificationsComponent.module.css";

const NotificationsComponent = (props) => {
  const [limit, setLimit] = useState(3);
  const notifications = Array.isArray(props.notifications)
    ? props.notifications
    : [];

  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 3);
  };

  const notificationItems = notifications.slice(0, limit).map((item) => {
    return <NotificationItem key={item.id} item={item} />;
  });

  return (
    <CustomCard>
      <div className={classes["notification-container"]}>
        <p className={classes.head}>Notifications</p>
        {!notificationItems.length && <p>There are no notifications to show</p>}
        {notificationItems}
        {limit < notifications.length && (
          <p className={classes.load} onClick={loadMoreHandler}>
            Load More
          </p>
        )}
      </div>
    </CustomCard>
  );
};

export default NotificationsComponent;
