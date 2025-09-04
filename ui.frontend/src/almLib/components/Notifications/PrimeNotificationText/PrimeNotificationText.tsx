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
import { getALMObject } from "../../../utils/global";



const feedbackChannels: Array<string> = [
  "course::l1FeedbackPrompt",
  "learningProgram::l1Feedback",
];

const socialChannels: Array<string> = [
  "social::postLive",
  "social::commentedOnPost",
  "social::commentedOnComment",
  "social::userTaggedOnPostCommentReply"
];

const loReminderChannels: Array<string> = [
  "course::sessionReminder",
  "course::completionReminder",
  "certification::completionReminder",
  "learningProgram::completionReminder"
]

const dateTimeStr: any = ["date", "time"];
const learningObjType: any = "learningObject";

const PrimeNotificationText : React.FC<{
  notification: PrimeUserNotification
  redirectOverviewPage : Function;
  setAnnouncementOpen: Function;
  setShowNotifications: Function;
  setAnnouncementData: Function;

}> = (props: any) => {
  const { locale } = useIntl();
  const notif = props.notification;
  const setAnnouncementOpen=props?.setAnnouncementOpen
  const setShowNotifications = props?.setShowNotifications
  const setAnnouncementData= props?.setAnnouncementData;
  let clickHandler = props.redirectOverviewPage;
  
    let message = notif.message
    .replace("course", ReplaceLoTypeWithAccountTerminology("course"))
    .replace("program", ReplaceLoTypeWithAccountTerminology("learningProgram"))
    .replace(
      "certification",
      ReplaceLoTypeWithAccountTerminology("certification")
    );

  // Handle feedback channels
  if (feedbackChannels.includes(notif.channel)) {
    message = message.replace("\n{{{name1}}}", "").replace("\n{{name1}}", "");
  }

  // Prepare name values based on channel type
  const name0Value = notif.modelNames[0] || "";
  let name1Value: string = "";
  let name2Value: string = "";
  // Handle custom channels - use modelNames instead of modelIds
  if (notif.channel && socialChannels.includes(notif.channel)) {
    name1Value = notif.modelNames[1] || "";
    name2Value = notif.modelNames[2] || "";
  } else {
    name1Value = notif.modelIds[1] || "";
  }

  // Split message using regex to find placeholders
  const parts = message.split(/\{\{\{name[012]\}\}\}|\{\{name[012]\}\}/);
  const placeholders: string[] = [];
  let match;
  const regex = /\{\{\{name([012])\}\}\}|\{\{name([012])\}\}/g;

  while ((match = regex.exec(message)) !== null) {
    const index = match[1] || match[2]; // match[1] for triple brace, match[2] for double
    placeholders.push(index);
  }

  const getLearningObjClass = (value: string) => {
    let className = styles.loLink;
    return value === learningObjType || value ==="board" || value === "post" ? className : "";
  };
  if(notif.announcement){
    
      clickHandler = () =>{
        setAnnouncementData(notif);
        setAnnouncementOpen(true);
        setShowNotifications(false);
      }

  }

  // Handle social::userTaggedOnPostCommentReply navigation
  if(notif.channel && socialChannels.includes(notif.channel)){
    clickHandler = () =>{
      // Navigate to the board where the post exists
      // From the data structure: modelIds[1] is boardId, modelIds[2] is postId
      const boardId = notif.modelIds[1];
      if(boardId){
        getALMObject().navigateToBoardDetailsPage(boardId);
        setShowNotifications(false);
      }
    }
  }

  const formattedNotificationText = (strType: string, loStr: string, placeholderIndex: string) => {
    // Date Time formatting for session reminder channels
    if((dateTimeStr.includes(strType) && loReminderChannels.includes(notif.channel))){
      return modifyTimeForSessionReminderNotif(notif.modelIds[1], locale);
    }
    
    if (dateTimeStr.includes(strType) && !loReminderChannels.includes(notif.channel)) {
      return modifyTimeDDMMYY(loStr, locale);
    }

    // Handle specific click behavior for social::userTaggedOnPostCommentReply
    let specificClickHandler = clickHandler;
    if (notif.channel && socialChannels.includes(notif.channel)) {
      if (strType === "board" && placeholderIndex === "1") {
        // Click on board name should navigate to board
        specificClickHandler = () => {
          const boardId = notif.modelIds[1];
          if (boardId) {
            getALMObject().navigateToBoardDetailsPage(boardId);
            setShowNotifications(false);
          }
        };
      } else if (strType === "post" && placeholderIndex === "2") {
        // Click on post should also navigate to board (since posts are viewed in board context)
        specificClickHandler = () => {
          const boardId = notif.modelIds[1];
          if (boardId) {
            getALMObject().navigateToBoardDetailsPage(boardId);
            setShowNotifications(false);
          }
        };
      }
    }

    return (
      <span
        role="link"
        className={getLearningObjClass(strType)}
        onClick={() => {
          specificClickHandler(notif);
        }}
      >
        {loStr}
      </span>
    );
  };

  // Build the result using the parsed parts and placeholders
  const renderNotificationContent = () => {
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      result.push(<span key={`part-${i}`}>{parts[i]}</span>);
      if (i < placeholders.length) {
        const placeholderIndex = placeholders[i];
        if (placeholderIndex === '0') {
          result.push(<span key={`name0-${i}`}>{formattedNotificationText(notif.modelTypes[0], name0Value + " ", placeholderIndex)}</span>);
        } else if (placeholderIndex === '1') {
          result.push(<span key={`name1-${i}`}>{formattedNotificationText(notif.modelTypes[1], name1Value + " ", placeholderIndex)}</span>);
        } else if (placeholderIndex === '2') {
          result.push(<span key={`name2-${i}`}>{formattedNotificationText(notif.modelTypes[2], name2Value + " ", placeholderIndex)}</span>);
        }
      }
    }
    return result;
  };

  return (
    <div>
      {renderNotificationContent()}
    </div>
  );
};

export default PrimeNotificationText;


