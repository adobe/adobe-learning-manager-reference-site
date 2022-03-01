import styles from "./PrimeNotificationItem.module.css";

import {
    NOTIFICATION_ICON_SVG
  } from "../../utils/inline_svg"

import {timeSince, modifyTime} from "../../utils/dateTime"
import { PrimeNotificationText } from "../PrimeNotificationText";
import { useConfigContext } from "../../contextProviders";

const PrimeNotificationItem = (props: any) => {
    const notification = props.notification; 
    const messageTime = notification.dateCreated;
    const config = useConfigContext();
    return (
        <li className={styles.notificationItem}>
            <div>
                <div>
                    <PrimeNotificationText notification={notification}>    
                    </PrimeNotificationText>
                </div>
                <div className={styles.notificationTime}>
                    {modifyTime(messageTime, config.locale)}
                </div>
            </div>
        </li>
    );
};
export default PrimeNotificationItem