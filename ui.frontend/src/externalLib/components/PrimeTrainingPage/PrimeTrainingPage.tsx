import { lightTheme, Provider } from "@adobe/react-spectrum";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { convertSecondsToTimeText } from "../../utils/dateTime";
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
const PrimeTrainingPage = (props: any) => {
  // const location = (window as any).location;
  // const queryParams = new URLSearchParams(decodeURI(location.search));
  // const trainingId = queryParams.get(TRAINING_ID_STR) || "";
  // const trainingInstanceId = queryParams.get(TRAINING_INSTANCE_ID_STR) || "";

  const location = (window as any).location;
  const queryParams = new URLSearchParams(decodeURI(location.search));
  const trainingId =
    "learningProgram:79030" || queryParams.get(TRAINING_ID_STR) || "";
  const trainingInstanceId =
    "learningProgram:79030_83137" ||
    queryParams.get(TRAINING_INSTANCE_ID_STR) ||
    "";
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
  } = useTrainingPage(trainingId, trainingInstanceId);
  if (isLoading || !training) {
    return <div>Loading....</div>;
  }

  // const [{ name : skillName,
  //   levelName,
  //   level,
  //   credits,
  //   maxCredits,
  //   type,
  //   badgeName,
  //   badgeUrl,
  //   badgeState}] = skills;
  const loType = training.loType;
  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
        bannerUrl={bannerUrl}
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
              name={name}
              description={description}
              overview={overview}
              richTextOverview={richTextOverview}
              skills={skills}
              training={training}
              trainingInstance={trainingInstance}
              instanceBadge={instanceBadge}
            />
          )}
          {(loType === CERTIFICATION || loType === LEARNING_PROGRAM) && (
            <PrimeTrainingOverview
              name={name}
              description={description}
              overview={overview}
              richTextOverview={richTextOverview}
              skills={skills}
              training={training}
              trainingInstance={trainingInstance}
              instanceBadge={instanceBadge}
            />
          )}
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
          />
          {/* {skills.map((skill) => {
            return (
              <>
                {skill.name} {skill.levelName}
              </>
            );
          })}
          {training.authors?.map((author) => {
            return (
              <div>
                <img src={author.avatarUrl} />
                {author.name}
                {author.bio}
              </div>
            );
          })} */}
        </div>
      </div>
    </Provider>
  );
};

export default PrimeTrainingPage;
