import { useNotifications } from "../../hooks";
import { PrimeNotificationItem } from "./PrimeNotificationItem";
import { useLoadMore } from "../../hooks/loadMore";

import { useState, useRef, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";

import styles from "./PrimeNotificationContainer.module.css";

import { GEN_NOTIFICATION_SVG } from "../../utils/inline_svg";

const PrimeNotificationContainer = () => {
  const { formatMessage } = useIntl();
  const { notifications, isLoading, loadMoreNotifications } =
    useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);

  if (isLoading)
    return (
      <>
        <span>loading notifications...</span>
      </>
    );

  const toggleShowNotifications = () => {
    setShowNotifications((prevState) => !prevState);
  };
  return (
    <>
      <li className={styles.notificationDropdown}>
        <button
          type="button"
          className={styles.notificationBellIcon}
          title={formatMessage({
            id: "prime.notifications.icon",
            defaultMessage: "User Notifications",
          })}
          id="userNotificationIcon"
          onClick={toggleShowNotifications}
        >
          {GEN_NOTIFICATION_SVG()}
        </button>
        {showNotifications && (
          <PrimeNotificationsList
            notifications={notifications}
            loadMoreNotifications={loadMoreNotifications}
          />
        )}
      </li>
    </>
  );
};

export default PrimeNotificationContainer;

const PrimeNotificationsList = (props: any) => {
  const { notifications, loadMoreNotifications } = props;
  const elementRef = useRef(null);
  useLoadMore({
    items: notifications,
    callback: loadMoreNotifications,
    containerId: "notifications",
    elementRef,
  });
  return (
    <div className={styles.notificationContainer} id="notifications">
      <ul className={styles.notificationList}>
        {notifications?.map((entry: any) => (
          <PrimeNotificationItem
            notification={entry}
            key={entry.id}
          ></PrimeNotificationItem>
        ))}
      </ul>
      <div ref={elementRef}>TO DO add Loading more..</div>
    </div>
  );
};
