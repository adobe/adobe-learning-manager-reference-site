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

import Alert from "@spectrum-icons/workflow/Alert";
import AlertCircleFilled from "@spectrum-icons/workflow/AlertCircleFilled";
import EditCircle from "@spectrum-icons/workflow/EditCircle";
import Star from "@spectrum-icons/workflow/Star";

import Ansvg from "../../../assets/images/announce.svg";
import { ANNOUNCEMENT, CERTIFICATION, COURSE } from "../../../utils/constants";

import { Grid, View } from "@adobe/react-spectrum";
import { PrimeAnnouncement, PrimeUserNotification } from "../../../models";

const PrimeNotificationItem: React.FC<{
  notification: PrimeUserNotification;
  redirectOverviewPage: Function;
  setAnnouncementOpen: Function;
  setShowNotifications: Function;
  setAnnouncementData: Function;
}> = props => {
  const notification = props.notification as PrimeUserNotification;
  const notiType = notification.channel.split("::");
  const redirectOverviewPage = props.redirectOverviewPage;
  const messageTime = notification.dateCreated;
  const { locale } = useIntl();
  const addPointer = notification.announcement ? styles.pointer : styles.cursorDefault;
  const ann = notification.announcement as PrimeAnnouncement;
  const thumbnailUrl = ann ? ann.thumbnailUrl : "";
  const contentType = ann ? ann.contentType : undefined;
  const handleImgClick = () => {
    props?.setAnnouncementOpen(true);
    props?.setShowNotifications(false);
    props?.setAnnouncementData(notification);
  };
  let IconHtml = () => {
    switch (true) {
      case notiType[0] === "announcement":
        return <img src={Ansvg} alt="AnnouncementIcon" />;
      case notiType[0] === CERTIFICATION && notiType[1] === "completionReminder":
        return <Alert />;
      case notiType[0] === COURSE && notiType[1] === "completed":
        return <Star />;
      case notiType[0] === COURSE && notiType[1] === "sessionReminder":
        return <AlertCircleFilled />;
      case notiType[0] === COURSE && notiType[1] === "l1FeedbackPrompt":
        return <EditCircle />;
      default:
        return <AlertCircleFilled />;
    }
  };

  return (
    <li className={`${styles.notificationItem}`}>
      <div>
        <div>
          <Grid
            areas={["header  header", "sidebar content", "sidebar image", "footer  footer"]}
            justifyContent="center"
          >
            <View gridArea="sidebar">
              <div className={`${styles.icon}`}>
                <IconHtml />
              </div>
            </View>
            <View gridArea="content" UNSAFE_className={`${addPointer}`}>
              <PrimeNotificationText
                notification={notification}
                redirectOverviewPage={redirectOverviewPage}
                setAnnouncementOpen={props?.setAnnouncementOpen}
                setShowNotifications={props?.setShowNotifications}
                setAnnouncementData={props?.setAnnouncementData}
              />
              <View gridArea="image">
                {contentType !== "TEXT" && notiType[0] === ANNOUNCEMENT && (
                  <img
                    src={thumbnailUrl}
                    className={styles.thumbnail}
                    alt="thumbnail"
                    onClick={handleImgClick}
                  />
                )}
              </View>
              <div className={styles.notificationTime}>{modifyTime(messageTime, locale)}</div>
            </View>
          </Grid>
        </div>
      </div>
    </li>
  );
};
export default PrimeNotificationItem;
