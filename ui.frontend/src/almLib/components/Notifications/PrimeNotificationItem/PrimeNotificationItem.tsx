/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useIntl } from "react-intl";
import { modifyTime } from "../../../utils/dateTime";
import { PrimeNotificationText } from "../PrimeNotificationText";
import styles from "./PrimeNotificationItem.module.css";

const PrimeNotificationItem = (props: any) => {
  const notification = props.notification;
  const redirectOverviewPage = props.redirectOverviewPage;
  const messageTime = notification.dateCreated;
  const { locale } = useIntl();
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
          {modifyTime(messageTime, locale)}
        </div>
      </div>
    </li>
  );
};
export default PrimeNotificationItem;
