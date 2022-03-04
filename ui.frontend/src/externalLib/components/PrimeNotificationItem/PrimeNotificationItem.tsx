import { useConfigContext } from "../../contextProviders";
import { modifyTime } from "../../utils/dateTime";
import { PrimeNotificationText } from "../PrimeNotificationText";
import styles from "./PrimeNotificationItem.module.css";
import { getALMKeyValue } from "../../utils/global";

const PrimeNotificationItem = (props: any) => {
  const notification = props.notification;
  const messageTime = notification.dateCreated;
  const config = getALMKeyValue("config");
  
  return (
    <li className={styles.notificationItem}>
      <div>
        <div>
          <PrimeNotificationText
            notification={notification}
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
