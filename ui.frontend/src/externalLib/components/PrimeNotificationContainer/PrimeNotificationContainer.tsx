import { useNotifications } from "../../hooks";
import { PrimeNotificationItem } from "./PrimeNotificationItem";


import styles from "./PrimeNotificationContainer.module.css";

const PrimeNotificationContainer = () => {
    const { notifications, isLoading } = useNotifications();
    
    if (isLoading)
    return (
      <>
        <span>laoding notifications...</span>
      </>
    );

  return (
    
      <div className={styles.notificationtable}>
        <div className={styles.notificationlist}>
          <ul>
            {notifications?.map((entry) => (
              <PrimeNotificationItem
              message={entry.message}
              key={entry.id}
              >
              </PrimeNotificationItem>
            ))}
          </ul>
        </div>
      </div>
    
  );
};

export default PrimeNotificationContainer;
