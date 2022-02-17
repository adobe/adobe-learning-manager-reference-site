import {  useRef} from "react";
import { PrimeNotificationItem } from "../PrimeNotificationItem";
import { useLoadMore } from "../../hooks/loadMore";

import styles from "./PrimeNotificationList.module.css";

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

  export default PrimeNotificationsList;