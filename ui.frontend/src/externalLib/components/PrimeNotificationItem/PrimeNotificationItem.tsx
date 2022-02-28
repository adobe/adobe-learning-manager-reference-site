import styles from "./PrimeNotificationItem.module.css";

import {
    NOTIFICATION_ICON_SVG
  } from "../../utils/inline_svg"

import {timeSince, modifyTime} from "../../utils/dateTime"
import { PrimeNotificationText } from "../PrimeNotificationText";


const PrimeNotificationItem = (props: any) => {
    const notification = props.notification; 
    const messageTime = notification.dateCreated;
    if (notification && notification.read) {
    return (
        <li className={styles.notificationItem}>
            <div>
                <div>
                    <PrimeNotificationText notification={notification}>    
                    </PrimeNotificationText>
                </div>
                <div className={styles.notificationTime}>
                    {modifyTime(messageTime, "en-US")}
                </div>
            </div>
        </li>
    );
    } else {
        return (
        <li className={styles.notificationItemUnread}>
            <div>
                <div>
                    <PrimeNotificationText notification={notification}>    
                    </PrimeNotificationText>
                </div>
                <div className={styles.notificationTime}>
                    {modifyTime(messageTime, "en-US")}
                </div>
            </div>
        </li>
        )
    }
};
export default PrimeNotificationItem