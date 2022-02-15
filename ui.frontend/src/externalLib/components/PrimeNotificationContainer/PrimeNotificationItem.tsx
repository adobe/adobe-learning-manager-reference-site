import styles from "./PrimeNotificationItem.module.css";

import {
    NOTIFICATION_ICON_SVG
  } from "../../utils/inline_svg"

import {modifyTimeDDMMYY} from "../../utils/notificationFormatter";
import {modifyTimeElapsed} from "../../utils/notificationFormatter";


const PrimeNotificationItem = (props: any) => {
    const message = props.message; 
    const messageTime = props.messageTime; 
    return (
        <li className={styles.notificationItem}>
            <div className={styles.notificationIcon}>
                {NOTIFICATION_ICON_SVG()}
            </div>
            <div className={styles.notificationText}>
                <div>
                    {message}
                </div>
                <div className={styles.notificationTime}>
                    {
                    /* {modifyTimeDDMMYY(messageTime, "en-US")} */
                    }
                    {modifyTimeElapsed(messageTime)}

                </div>
            </div>
           
        </li>
        
    );
};
export { PrimeNotificationItem}