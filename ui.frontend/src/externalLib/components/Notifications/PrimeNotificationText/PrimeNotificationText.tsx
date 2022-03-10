import { modifyTime } from "../../../utils/dateTime";
import { getALMConfig } from "../../../utils/global";
import styles from "./PrimeNotificationText.module.css";

const feedbackChannels: Array<string> = [
  "course::l1FeedbackPrompt",
  "learningProgram::l1Feedback",
];

const PrimeNotificationText = (props: any) => {
  const config = getALMConfig();

  const notif = props.notification;
  const redirectOverviewPage = props.redirectOverviewPage;
  let message = notif.message;
  let modelIds = notif.modelIds;
  let trainingId;
  if (modelIds && modelIds.length > 0) {
    trainingId = modelIds[0];
  }
  let name1 = -1,
    name0 = -1,
    endname0 = -1,
    endname1 = -1;
  // let msg = "";
  let x;
  let y;
  let z;
  if (message.includes("{{{name1}}}") || message.includes("{{name1}}")) {
    if (feedbackChannels.includes(notif.channel)) {
      message = message.replace("\n{{{name1}}}", "");
      message = message.replace("\n{{name1}}", "");
    } else {
      name1 = message.indexOf("{{{name1}}}");
      endname1 = name1 + 11;
      if (name1 < 0) {
        name1 = message.indexOf("{{name1}}");
        endname1 = name1 + 9;
      }
    }
  }
  if (message.includes("{{{name0}}}") || message.includes("{{name0}}")) {
    name0 = message.indexOf("{{{name0}}}");
    endname0 = name0 + 11;
    if (name0 < 0) {
      name0 = message.indexOf("{{name0}}");
      endname0 = name0 + 9;
    }
  }
  if (name1 > name0 || name1 === -1) {
    x = name0 > 0 ? message.substring(0, name0) : null;
    y = message.substring(endname0, name1 > 0 ? name1 : message.length);
    z = name1 !== -1 ? message.substring(endname1, message.length) : "";
    return (
      <div>
        {x}
        {["date", "time"].includes(notif.modelTypes[0]) ? (
          modifyTime(notif.modelNames[0], config.locale)
        ) : (
          <span
            className={styles.loLink}
            onClick={() => {
              redirectOverviewPage(notif);
            }}
          >
            {notif.modelNames[0]}
          </span>
        )}
        {y}
        {name1 > 0 ? (
          ["date", "time"].includes(notif.modelTypes[1]) ? (
            modifyTime(notif.modelNames[1], config.locale)
          ) : (
            <span
              className={styles.loLink}
              onClick={() => {
                redirectOverviewPage(notif);
              }}
            >
              {notif.modelNames[1]}
            </span>
          )
        ) : null}
        {z}
      </div>
    );
  } else {
    x = name1 > 0 ? message.substring(0, name1) : "";
    y = message.substring(endname1, name0 > 0 ? name0 : message.length);
    z = name0 !== -1 ? message.substring(endname0, message.length) : "";
    return (
      <div>
        {x}

        {["date", "time"].includes(notif.modelTypes[1]) ? (
          modifyTime(notif.modelNames[1], config.locale)
        ) : (
          <span
            className={styles.loLink}
            onClick={() => {
              redirectOverviewPage(notif);
            }}
          >
            {notif.modelNames[1]}
          </span>
        )}
        {y}
        {name1 > 0 ? (
          ["date", "time"].includes(notif.modelTypes[0]) ? (
            modifyTime(notif.modelNames[0], config.locale)
          ) : (
            <span
              className={styles.loLink}
              onClick={() => {
                redirectOverviewPage(notif);
              }}
            >
              {" "}
              {notif.modelNames[0]}{" "}
            </span>
          )
        ) : null}
        {z}
      </div>
    );
  }
};

export default PrimeNotificationText;
