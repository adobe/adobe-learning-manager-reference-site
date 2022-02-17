import styles from "./PrimeNotificationItem.module.css";

import {
    NOTIFICATION_ICON_SVG
  } from "../../utils/inline_svg"

import {timeSince} from "../../utils/dateTime"
import { PrimeNotificationText } from "../PrimeNotificationText";


const PrimeNotificationItem = (props: any) => {
    const notification = props.notification; 
    const messageTime = notification.dateCreated;
    
    return (
        <li className={styles.notificationItem}>
            <div className={styles.notificationIcon}>
                {NOTIFICATION_ICON_SVG()}
            </div>
            <div className={styles.notificationText}>
                <div>
                    <PrimeNotificationText notification={notification}>
                    
                    </PrimeNotificationText>
                </div>
                <div className={styles.notificationTime}>
                    {
                    /* {modifyTimeDDMMYY(messageTime, "en-US")} */
                    }
                    {timeSince(messageTime)} ago
                </div>
            </div>
        </li>
        
    );
};
export default PrimeNotificationItem