import { CardBgStyle } from "../../models/common";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { getALMKeyValue } from "../../utils/global";
import styles from "./PrimeTrainingItemContainerHeader.module.css";

const PrimeTrainingItemContainerHeader: React.FC<{
  name: string;
  description: string;
  overview: string;
  richTextOverview: string;
  cardBgStyle: CardBgStyle;
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
}> = (props) => {
  const {
    name,
    description,
    overview,
    cardBgStyle,
    training,
    trainingInstance,
    launchPlayerHandler,
  } = props;
  //const { formatMessage } = useIntl();

  let { pagePaths } = getALMKeyValue("config");
  const trainingLink = `${pagePaths.trainingOverview}?trainingId=${training.id}&trainingInstanceId=${trainingInstance.id}`;
  const authorNames = training.authorNames?.length
    ? training.authorNames.join(", ")
    : "";

  let loType = training.loType;

  const onClickHandler = (event: any) => {
    //NOTE: Don't open player in case training name is clicked
    if (event.target?.tagName !== "A") {
      launchPlayerHandler({ id: training.id });
    }
  };

  let statusText = "";
  if (training.enrollment?.state) {
    const { state } = training.enrollment;
    if (state === "STARTED") {
      statusText = "In Progress";
    } else if (state === "COMPLETED") {
      statusText = "Completed";
    }
  }
  return (
    <div className={styles.headerContainer} onClick={onClickHandler}>
      {/* <h2 className={styles.courseInfoHeader}>{name} </h2> */}
      <div className={styles.metadata}>
        <div className={styles.metadataContents}>
          <div>{loType}</div>
          {authorNames && (
            <>
              <div className={styles.metadata__separator}></div>
              <div className={styles.authorNames}>{authorNames}</div>
            </>
          )}
          {training.duration && (
            <>
              <div className={styles.metadata__separator}></div>
              <div>{convertSecondsToTimeText(training.duration)}</div>
            </>
          )}
        </div>
        {statusText && <div className={styles.status}>{statusText}</div>}
      </div>
      <div className={styles.trainingDetailsContainer}>
        <div className={styles.card} style={{ ...cardBgStyle }}></div>
        <div className={styles.trainingDetials}>
          <a aria-label={name} className={styles.title} href={trainingLink}>
            {name}
          </a>
          {/* <p
            dangerouslySetInnerHTML={{
              __html: richTextOverview || overview || description,
            }}
          ></p> */}
          <p className={styles.description}>{overview || description}</p>
        </div>
      </div>
    </div>
  );
};

export default PrimeTrainingItemContainerHeader;
