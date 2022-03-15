import { modifyTime } from "../../../utils/dateTime";
import { getALMConfig } from "../../../utils/global";
import { PrimeNotificationText } from "../PrimeNotificationText";
import styles from "./PrimeNotificationItem.module.css";

const PrimeNotificationItem = (props: any) => {
  const notification = props.notification;
  const redirectOverviewPage = props.redirectOverviewPage;
  const messageTime = notification.dateCreated;
  const config = getALMConfig();

  return (
    <li className={styles.notificationItem}>
      <div>
        <div>
          <PrimeNotificationText
            notification={notification}
            redirectOverviewPage={redirectOverviewPage}
          ></PrimeNotificationText>
        </div>
        <div className={styles.notificationTime}>
          {modifyTime(messageTime, config.locale)}
        </div>
      </div>
    </li>
  );
};
export default PrimeNotificationItem;
