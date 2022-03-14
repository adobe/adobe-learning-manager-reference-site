import { lightTheme, Provider } from "@adobe/react-spectrum";
import { useTrainingPage } from "../../../hooks/catalog/useTrainingPage";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import { getALMConfig, getPathParams } from "../../../utils/global";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingOverview } from "../PrimeTrainingOverview";
import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { PrimeTrainingPageExtraDetails } from "../PrimeTrainingPageExtraDetails";
import styles from "./PrimeTrainingPage.module.css";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const CERTIFICATION = "certification";
const TRAINING_ID_STR = "trainingId";
const TRAINING_INSTANCE_ID_STR = "trainingInstanceId";
const PrimeTrainingPage = () => {
  let { trainingOverviewPath } = getALMConfig();
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
    supplementaryLOsJobAidClickHandler,
  } = useTrainingPage(trainingId, trainingInstanceId);
  const config = getALMConfig();
  const locale = config.locale;

  if (isLoading || !training) {
    return <div>Loading....</div>;
  }
  const loType = training.loType;
  const sections = training.sections;

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
        bannerUrl={bannerUrl}
        showProgressBar={true}
        enrollment={training.enrollment}
      />
      <div className={styles.contentContainer}>
        <div className={styles.left}>
          <p
            dangerouslySetInnerHTML={{
              __html: richTextOverview || overview || description,
            }}
          ></p>
          Duration : {convertSecondsToTimeText(training.duration)}
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
              //const name = section.localizedMetadata;
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
                  <PrimeTrainingOverview
                    trainings={subLOs}
                    launchPlayerHandler={launchPlayerHandler}
                    isPartOfLP={loType === LEARNING_PROGRAM}
                  />
                </section>
              );
            })}
        </div>
        <div className={styles.right}>
          <PrimeTrainingPageExtraDetails
            skills={skills}
            training={training}
            trainingInstance={trainingInstance}
            badge={instanceBadge}
            instanceSummary={instanceSummary}
            enrollmentHandler={enrollmentHandler}
            launchPlayerHandler={launchPlayerHandler}
            unEnrollmentHandler={unEnrollmentHandler}
            supplementaryLOsJobAidClickHandler={
              supplementaryLOsJobAidClickHandler
            }
          />
        </div>
      </div>
    </Provider>
  );
};

export default PrimeTrainingPage;
