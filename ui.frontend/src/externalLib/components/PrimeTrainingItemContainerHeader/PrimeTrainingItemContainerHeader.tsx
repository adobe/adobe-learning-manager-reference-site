import styles from "./PrimeTrainingItemContainerHeader.module.css";
import { getALMKeyValue } from "../../utils/global";
import { convertSecondsToTimeText } from "../../utils/dateTime";

const PrimeTrainingItemContainerHeader = (props: any) => {
  const {
    name,
    format,
    date,
    description,
    overview,
    cardBgStyle,
    training,
  } = props;
  //const { formatMessage } = useIntl();

  // const selectHandler = () => {
  //   selectInstanceHandler(id);
  // };
  const desc = overview || description;
  // const desc;

  let { pagePaths } = getALMKeyValue("config");
  const trainingLink = `${pagePaths.trainingOverview}/trainingId=${training.id}`;
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
