import { useNotifications } from "../../hooks";
import { PrimeNotificationItem } from "./PrimeNotificationItem";

import  {useState} from "react";
import { useIntl } from "react-intl";

import styles from "./PrimeNotificationContainer.module.css";

import {
  GEN_NOTIFICATION_SVG
} from "../../utils/inline_svg"

const PrimeNotificationContainer = () => {

    const { formatMessage } = useIntl();
    const { notifications, isLoading } = useNotifications();
    
    const [showNotifications, setShowNotifications] = useState(false);

    if (isLoading)
    return (
      <>
        <span>laoding notifications...</span>
      </>
    );

    const toggleShowNotifications = () => {
      setShowNotifications((prevState) => !prevState)
    }
  return (
    <>
      <li className={styles.notificationDropdown}>
      <button 
      type="button"
      className={styles.notificationBellIcon} 
      title = {formatMessage({
        id: "prime.notifications.icon",
        defaultMessage: "User Notifications",
      })}
      id="userNotificationIcon"
      onClick={toggleShowNotifications}>
        {GEN_NOTIFICATION_SVG()}
      </button>
      {showNotifications &&
        <div className={styles.notificationContainer}>
          <ul className={styles.notificationList}>
            {notifications?.map((entry) => (
              <PrimeNotificationItem
              message={entry.message}
              messageTime={entry.dateCreated}
              key={entry.id}
              >
              </PrimeNotificationItem>
            ))}
          </ul>
        </div>   
      } 
    </li>
    </>
  );
};

export default PrimeNotificationContainer;
