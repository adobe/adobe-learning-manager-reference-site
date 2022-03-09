import { useNotifications } from "../../hooks";
import { PrimeNotificationList } from "../PrimeNotificationList";

import { useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";

import styles from "./PrimeNotificationContainer.module.css";

import Bell from "@spectrum-icons/workflow/Bell";

const PrimeNotificationContainer = () => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  const { formatMessage } = useIntl();
  const {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    loadMoreNotifications,
    markReadNotification, 
    redirectOverviewPage,
    pollUnreadNotificationCount 
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleShowNotifications = () => {
    setShowNotifications((prevState) => !prevState);
  };
  
  useEffect(() => {
    
    let timer: any ;
    document.addEventListener("click", handleClickOutside, false);

    if (showNotifications) {
      fetchNotifications();  
    } else {
      markReadNotification(); 
      timer = setInterval(pollUnreadNotificationCount, 10*1000);
    }
    return () => {
      timer && clearInterval(timer);
      document.removeEventListener("click", handleClickOutside, false);
    }
    
  },[fetchNotifications, showNotifications]);

  if (isLoading) {
    return <span>loading notifications...</span>;
  }

  const handleClickOutside = (event: any) => {
    let t = wrapperRef.current; 
    if (t && !t.contains(event.target)) {
      setShowNotifications(false);
    }
  };


  return (
    <div className={styles.notificationDropdown}>
      <div ref={wrapperRef}>
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
        {<Bell />}
            {unreadCount > 0 && 
            <div className={styles.notificationCountStyle}>
              {unreadCount}
            </div>
            } 
      </button>
      {showNotifications && (
        <PrimeNotificationList
          notifications={notifications}
          unreadCount={unreadCount}
          loadMoreNotifications={loadMoreNotifications}
          redirectOverviewPage={redirectOverviewPage}
        />
      )}
      </div>
    </div>
  );
};

export default PrimeNotificationContainer;
