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
}> = (props) => {
  const {
    name,
    description,
    overview,
    cardBgStyle,
    training,
    trainingInstance,
  } = props;
  //const { formatMessage } = useIntl();

  let { pagePaths } = getALMKeyValue("config");
  const trainingLink = `${pagePaths.trainingOverview}?trainingId=${training.id}&trainingInstanceId=${trainingInstance.id}`;
  const authorNames = training.authorNames?.length
    ? training.authorNames.join(", ")
    : "";

  let loType = training.loType;

  return (
    <section className={styles.headerContainer}>
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
        <div className={styles.status}>{training.enrollment?.state}</div>
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
    </section>
  );
};

export default PrimeTrainingItemContainerHeader;
