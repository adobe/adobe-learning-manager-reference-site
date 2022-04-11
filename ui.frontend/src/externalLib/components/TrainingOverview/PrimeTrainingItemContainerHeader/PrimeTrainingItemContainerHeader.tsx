/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useIntl } from "react-intl";
import { CardBgStyle } from "../../../models/custom";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import { getALMObject } from "../../../utils/global";
import { useCardBackgroundStyle, useCardIcon } from "../../../utils/hooks";
import { GetTranslation } from "../../../utils/translationService";
import styles from "./PrimeTrainingItemContainerHeader.module.css";

const PrimeTrainingItemContainerHeader: React.FC<{
  name: string;
  description: string;
  overview: string;
  richTextOverview: string;
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance ;
  launchPlayerHandler?: Function;
  isPartOfLP?: boolean;
  showMandatoryLabel?: boolean;
  isprerequisiteLOs?:boolean
}> = (props) => {
  const {
    name,
    description,
    overview,
    training,
    trainingInstance,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
    isprerequisiteLOs = false,
  } = props;
  const { formatMessage } = useIntl();
  const authorNames = training.authorNames?.length
    ? training.authorNames.join(", ")
    : "";

  const { cardIconUrl, color } = useCardIcon(training);         
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);
  let loType = training.loType;

  const onClickHandler = (event: any) => {
    //NOTE: Don't open player in case training name is clicked

    // For prerequisiteLOs never open the Launch Player.
    if (event.target?.tagName !== "A" && !isprerequisiteLOs) {
      if (training.enrollment && launchPlayerHandler!=undefined) {
        launchPlayerHandler({ id: training.id });
      }
    } else {
      getALMObject().navigateToTrainingOverviewPage(
        training.id,
        trainingInstance.id
      );
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
    <div
      className={`${styles.headerContainer} ${
        isPartOfLP ? styles.isPartOfLP : ""
      }`}
      onClick={onClickHandler}
    >
      {/* <h2 className={styles.courseInfoHeader}>{name} </h2> */}
      <div className={styles.metadata}>
        <div className={styles.metadataContents}>
          <div>{GetTranslation(`prime.catalog.card.${loType}`, true)}</div>
          {isprerequisiteLOs ? <div className={styles.metadata__separator}></div>: authorNames.length ? (
            <>
              <div className={styles.metadata__separator}></div>
              <div className={styles.authorNames}>{authorNames}</div>
            </>
          ) : (
            ""
          )}
          {isprerequisiteLOs? "" : training.duration ? (
            <>
              <div className={styles.metadata__separator}></div>
              <div>{convertSecondsToTimeText(training.duration)}</div>
            </>
          ) : (
            ""
          )}
          {showMandatoryLabel && (
            <>
              <span className={styles.mandatory}>
                {formatMessage({
                  id: "alm.overview.section.mandatory",
                  defaultMessage: "Mandatory",
                })}
              </span>
            </>
          )}
        </div>
        {statusText && <div className={styles.status}>{statusText}</div>}
      </div>
      <div className={styles.trainingDetailsContainer}>
        <div className={styles.card} style={{ ...cardBgStyle }}></div>
        <div className={styles.trainingDetials}>
          {/* Change it to button and role="link" */}
          <a
            aria-label={name}
            className={styles.title}
            href={"javascript:void(0)"}
          >
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
