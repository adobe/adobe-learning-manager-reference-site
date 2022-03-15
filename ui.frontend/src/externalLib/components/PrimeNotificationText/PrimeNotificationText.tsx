import { modifyTime } from "../../utils/dateTime";
import { getALMConfig } from "../../utils/global";
import styles from "./PrimeNotificationText.module.css";

const feedbackChannels: Array<string> = [
  "course::l1FeedbackPrompt",
  "learningProgram::l1Feedback",
];

const name1Var3Brace: String = "{{{name1}}}";
const name1Var2Brace: String = "{{name1}}";

const name0Var3Brace: String = "{{{name0}}}";
const name0Var2Brace: String = "{{name0}}";


const dateTimeStr : any = ["date", "time"];


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
  let msg = "";


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
    loStr1 = notif.modelNames[0]; 
    str1Type =  notif.modelTypes[0] ;
    subStrPart2 = message.substring(endname0, name1 > 0 ? name1 : message.length);
    loStr2 = notif.modelNames[1]; 
    str2Type = notif.modelTypes[1];
    subStrPart3 = name1 !== -1 ? message.substring(endname1, message.length) : "";
  } else {
    subStrPart1 = name1 > 0 ? message.substring(0, name1) : "";
    loStr1 = notif.modelNames[1];
    str1Type = notif.modelTypes[1]
    subStrPart2 = message.substring(endname1, name0 > 0 ? name0 : message.length);
    loStr2 = notif.modelNames[0];
    str2Type = notif.modelTypes[0] 
    subStrPart3 = name0 !== -1 ? message.substring(endname0, message.length) : "";
  }


  return (
    <div>
      {subStrPart1}
      {dateTimeStr.includes(str1Type) ? (
        modifyTime(loStr1, config.locale)
      ) : (
        <span
          className={styles.loLink}
          onClick={() => {
            redirectOverviewPage(notif);
          }}
        >
          {loStr1}
        </span>
      )}
      {subStrPart2}
      {name1 > 0 ? (
        dateTimeStr.includes(str2Type) ? (
          modifyTime(loStr2, config.locale)
        ) : (
          <span
            className={styles.loLink}
            onClick={() => {
              redirectOverviewPage(notif);
            }}
          >
            {loStr2}
          </span>
        )
      ) : null}
      {subStrPart3}
    </div>
  );


  
};

export default PrimeNotificationText;
