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
import { modifyTimeDDMMYY, modifyTimeForSessionReminderNotif } from "../../../utils/dateTime";
import { ReplaceLoTypeWithAccountTerminology } from "../../../utils/translationService";
import styles from "./PrimeNotificationText.module.css";
import { PrimeUserNotification } from "../../../models";

const feedbackChannels: Array<string> = ["course::l1FeedbackPrompt", "learningProgram::l1Feedback"];

const loReminderChannels: Array<string> = [
  "course::sessionReminder",
  "course::completionReminder",
  "certification::completionReminder",
  "learningProgram::completionReminder",
];

const name1Var3Brace: String = "{{{name1}}}";
const name1Var2Brace: String = "{{name1}}";

const name0Var3Brace: String = "{{{name0}}}";
const name0Var2Brace: String = "{{name0}}";

const dateTimeStr: any = ["date", "time"];
const learningObjType: any = "learningObject";

const PrimeNotificationText: React.FC<{
  notification: PrimeUserNotification;
  redirectOverviewPage: Function;
  setAnnouncementOpen: Function;
  setShowNotifications: Function;
  setAnnouncementData: Function;
}> = (props: any) => {
  const { locale } = useIntl();
  const notif = props.notification;
  const setAnnouncementOpen = props?.setAnnouncementOpen;
  const setShowNotifications = props?.setShowNotifications;
  const setAnnouncementData = props?.setAnnouncementData;
  let clickHandler = props.redirectOverviewPage;

  let message = notif.message
    .replace("course", ReplaceLoTypeWithAccountTerminology("course"))
    .replace("program", ReplaceLoTypeWithAccountTerminology("learningProgram"))
    .replace("certification", ReplaceLoTypeWithAccountTerminology("certification"));
  let name1 = -1,
    name0 = -1,
    endname0 = -1,
    endname1 = -1;
  /*
  Find indexs of name0 and name1 strings. 
  */
  if (message.includes(name1Var3Brace) || message.includes(name1Var2Brace)) {
    if (feedbackChannels.includes(notif.channel)) {
      message = message.replace("\n{{{name1}}}", "");
      message = message.replace("\n{{name1}}", "");
    } else {
      name1 = message.indexOf(name1Var3Brace);
      endname1 = name1 + name1Var3Brace.length;
      if (name1 < 0) {
        name1 = message.indexOf(name1Var2Brace);
        endname1 = name1 + name1Var2Brace.length;
      }
    }
  }
  if (message.includes(name0Var3Brace) || message.includes(name0Var2Brace)) {
    name0 = message.indexOf(name0Var3Brace);
    endname0 = name0 + name0Var3Brace.length;
    if (name0 < 0) {
      name0 = message.indexOf(name0Var2Brace);
      endname0 = name0 + name0Var2Brace.length;
    }
  }
  let subStrPart1;
  let loStr1;
  let str1Type;
  let subStrPart2;
  let loStr2;
  let str2Type;
  let subStrPart3;

  /*
  Find 3 substrings from start to name0 , name0 to name1, name1 to end. 
  Find modeltypes of names0 and name1. to check if they contain the dates/times that needs to be formated. 

  */

  if (name1 > name0 || name1 === -1) {
    subStrPart1 = name0 > 0 ? message.substring(0, name0) : null;
    loStr1 = notif.modelNames[0] + " ";
    str1Type = notif.modelTypes[0];
    subStrPart2 = message.substring(endname0, name1 > 0 ? name1 : message.length);
    loStr2 = notif.modelNames[1] + " ";
    str2Type = notif.modelTypes[1];
    subStrPart3 = name1 !== -1 ? message.substring(endname1, message.length) : "";
  } else {
    subStrPart1 = name1 > 0 ? message.substring(0, name1) : "";
    loStr1 = notif.modelNames[1] + " ";
    str1Type = notif.modelTypes[1];
    subStrPart2 = message.substring(endname1, name0 > 0 ? name0 : message.length);
    loStr2 = notif.modelNames[0] + " ";
    str2Type = notif.modelTypes[0];
    subStrPart3 = name0 !== -1 ? message.substring(endname0, message.length) : "";
  }

  const getLearningObjClass = (value: string) => {
    let className = styles.loLink;
    return value === learningObjType ? className : "";
  };
  if (notif.announcement) {
    clickHandler = () => {
      setAnnouncementData(notif);
      setAnnouncementOpen(true);
      setShowNotifications(false);
    };
  }

  const formattedNotificationText = (strType: string, loStr: string) => {
    // Date Time formatting for session reminder channels
    if (dateTimeStr.includes(strType) && loReminderChannels.includes(notif.channel)) {
      return modifyTimeForSessionReminderNotif(notif.modelIds[1], locale);
    }
    return dateTimeStr.includes(strType) && !loReminderChannels.includes(notif.channel) ? (
      modifyTimeDDMMYY(loStr, locale)
    ) : (
      <span
        role="link"
        className={getLearningObjClass(strType)}
        onClick={() => {
          clickHandler(notif);
        }}
      >
        {loStr}
      </span>
    );
  };

  return (
    <div>
      {subStrPart1}
      {formattedNotificationText(str1Type, loStr1)}
      {subStrPart2}
      {name1 > 0 ? formattedNotificationText(str2Type, loStr2) : null}
      {subStrPart3}
    </div>
  );
};

export default PrimeNotificationText;
