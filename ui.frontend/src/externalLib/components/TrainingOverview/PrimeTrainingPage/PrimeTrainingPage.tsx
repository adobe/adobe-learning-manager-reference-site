import { lightTheme, Provider } from "@adobe/react-spectrum";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useTrainingPage } from "../../../hooks/catalog/useTrainingPage";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import {
  getALMConfig,
  getConfigurableAttributes,
  getPathParams,
  PrimeConfig,
  setALMAttribute,
} from "../../../utils/global";
import { useCardBackgroundStyle, useCardIcon } from "../../../utils/hooks";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
import { ALMBackButton } from "../../Common/ALMBackButton";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import { PrimeTrainingOverview } from "../PrimeTrainingOverview";
import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { PrimeTrainingPageMetadata } from "../PrimeTrainingPageMetadata";
import styles from "./PrimeTrainingPage.module.css";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const CERTIFICATION = "certification";
const TRAINING_ID_STR = "trainingId";
const TRAINING_INSTANCE_ID_STR = "trainingInstanceId";

const getTrainingOverviewAttributes = (config: PrimeConfig) => {
  let cssSelector = config.mountingPoints.trainingOverviewPage;
  let trainingOverviewAttributes = getConfigurableAttributes(cssSelector) || {};
  setALMAttribute("trainingOverviewAttributes", trainingOverviewAttributes);
  return trainingOverviewAttributes;
};

const PrimeTrainingPage = () => {
  const config = getALMConfig();
  let trainingOverviewPath = config.trainingOverviewPath;

  let pathParams = getPathParams(trainingOverviewPath, [
    TRAINING_ID_STR,
    TRAINING_INSTANCE_ID_STR,
  ]);
  let trainingId = pathParams[TRAINING_ID_STR];
  let trainingInstanceId = pathParams[TRAINING_INSTANCE_ID_STR];

  const {
    name,
    description,
    overview,
    richTextOverview,
    color,
    bannerUrl,
    skills,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
    instanceSummary,
    enrollmentHandler,
    launchPlayerHandler,
    unEnrollmentHandler,
    jobAidClickHandler,
    cardBgStyle,
  } = useTrainingPage(trainingId, trainingInstanceId);
  const locale = config.locale;
  const { formatMessage } = useIntl();
  const [
    { showAuthorInfo, showDescription, showEnrollDeadline },
  ] = useState(() => getTrainingOverviewAttributes(config));

  if (isLoading || !training) {
    return <ALMLoader classes={styles.loader} />;
  }
  const loType = training.loType;
  const sections = training.sections;
  const prerequisiteLOs = training.prerequisiteLOs;
  const prequisiteConstraints = training.prequisiteConstraints;

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <ALMBackButton />
        <PrimeTrainingOverviewHeader
          format={training.loType}
          color={color}
          title={name}
          bannerUrl={bannerUrl}
          showProgressBar={true}
          enrollment={training.enrollment}
        />
        <div className={styles.pageContainer}>
          <div className={styles.left}>
            {showDescription === "true" && (
              <div
              dangerouslySetInnerHTML={{
                __html: richTextOverview || overview || description,
              }}
              className={styles.overview}
            ></div>
            )}
            <span className={styles.duration}>
              {formatMessage(
                { id: "alm.overview.total.duration" },
                { 0: convertSecondsToTimeText(training.duration) }
              )}
            </span>
            {prerequisiteLOs ? (
              <div className={styles.trainingPrequisiteLabel}>
                {formatMessage({
                  id: "alm.training.overviewPrequisite.label",
                })}
              </div>
            ) : (
              ""
            )}
            {prerequisiteLOs?.map((prerequisiteLO) => {
              const { name, description, overview, richTextOverview } =
                getPreferredLocalizedMetadata(
                  prerequisiteLO.localizedMetadata,
                  locale
                );

              let showMandatoryLabel = false;
              let instance = prerequisiteLO.instances[0];
              prequisiteConstraints?.filter((prequisiteConstraints) => {
                if (
                  prequisiteConstraints.prerequisiteLOId === prerequisiteLO.id
                ) {
                  showMandatoryLabel = prequisiteConstraints.mandatory;
                  return;
                }
              });
              return (
                <section className={styles.trainingOverviewPrequisite}>
                  <PrimeTrainingItemContainerHeader
                    name={name}
                    description={description}
                    training={prerequisiteLO}
                    trainingInstance={instance}
                    overview={overview}
                    richTextOverview={richTextOverview}
                    isPartOfLP={prerequisiteLO.loType === LEARNING_PROGRAM}
                    showMandatoryLabel={showMandatoryLabel}
                    isprerequisiteLO={true}
                  />
                </section>
              );
            })}

            {loType === COURSE && (
              <PrimeCourseOverview
                training={training}
                launchPlayerHandler={launchPlayerHandler}
                trainingInstance={trainingInstance}
              />
            )}
            {loType === CERTIFICATION && (
              <PrimeTrainingOverview
                trainings={training.subLOs}
                launchPlayerHandler={launchPlayerHandler}
              />
            )}
            {loType === LEARNING_PROGRAM &&
              sections.map((section, index) => {
                const trainingIds = section.loIds;
                const { name } = getPreferredLocalizedMetadata(
                  section.localizedMetadata,
                  locale
                );
                const subLOs = training.subLOs.filter(
                  (subLO) => trainingIds.indexOf(subLO.id) !== -1
                );
                subLOs.sort(
                  (trainingId1, trainingId2) =>
                    trainingIds.indexOf(trainingId1.id) -
                    trainingIds.indexOf(trainingId2.id)
                );

                return (
                  <section
                    className={styles.trainingOverviewContainer}
                    key={index}
                  >
                    <h3 className={styles.sectionName}>{name}</h3>
                    {!section.mandatory ? (
                      <div>
                        <span className={styles.sectionOptional}>
                          {formatMessage({
                            id: "alm.overview.section.optional",
                            defaultMessage: "Optional",
                          })}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                    {section.mandatory &&
                    section.mandatoryLOCount !== section.loIds?.length ? (
                      <div>
                        <span className={styles.sectionOptional}>
                          {formatMessage(
                            { id: "alm.overview.section.xOutOfy" },
                            {
                              0: section.mandatoryLOCount,
                              1: section.loIds?.length,
                            }
                          )}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}

                    <PrimeTrainingOverview
                      trainings={subLOs}
                      launchPlayerHandler={launchPlayerHandler}
                      isPartOfLP={loType === LEARNING_PROGRAM}
                      showMandatoryLabel={
                        section.mandatory &&
                        section.mandatoryLOCount === section.loIds?.length
                      }
                    />
                  </section>
                );
              })}
          </div>
          <div className={styles.right}>
            <PrimeTrainingPageMetadata  
              skills={skills}
              training={training}
              trainingInstance={trainingInstance}
              badge={instanceBadge}
              instanceSummary={instanceSummary}
              showAuthorInfo={showAuthorInfo}
              showEnrollDeadline={showEnrollDeadline}
              enrollmentHandler={enrollmentHandler}
              launchPlayerHandler={launchPlayerHandler}
              unEnrollmentHandler={unEnrollmentHandler}
              jobAidClickHandler={jobAidClickHandler}
            />
          </div>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeTrainingPage;
