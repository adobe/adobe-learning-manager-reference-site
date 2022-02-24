import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingOverview } from "../PrimeTrainingOverview";

import { PrimeTrainingInstances } from "../PrimeTrainingInstances";

import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeLearningObject, PrimeLearningObjectResource } from "../../models/PrimeModels";
import { config } from "process";
import { Provider, lightTheme } from "@adobe/react-spectrum";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const CERTIFICATION = "certification";
const TRAINING_ID_STR="trainingId";
const TRAINING_INSTANCE_ID_STR="trainingInstanceId";
const PrimeTrainingPage = (props: any) => {
  //const trainingInstance: PrimeLearningObjectInstance = props.training;
  // const trainingId = "course:1926880"; //TO-DO get training id "course:1943266"; //
  // const instanceId = "course:1926880_2174497"; // TO-DO get instance id "course:1943266_2191842" //
  //1926880/instance/2174497/preview
  const location = (window as any).location;
  const queryParams = new URLSearchParams(decodeURI(location.search));
  const trainingId = "learningProgram:79030" || queryParams.get(TRAINING_ID_STR) || "";
  const trainingInstanceId = "learningProgram:79030_83137" || queryParams.get(TRAINING_INSTANCE_ID_STR) || "";
 
  const {
    name,
    description,
    overview,
    richTextOverview,
    cardIconUrl,
    color,
    bannerUrl,
    skills,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
  } = useTrainingPage(trainingId, trainingInstanceId);
  if (isLoading || !training) {
    return <div>Loading....</div>;
  }

  const loType = training.loType;
  

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
        bannerUrl={bannerUrl}
      />
      {loType == COURSE && <PrimeCourseOverview
        name={name}
        description={description}
        overview={overview}
        richTextOverview={richTextOverview}
        skills={skills}
        training={training}
        trainingInstance={trainingInstance}
        instanceBadge={instanceBadge}
      />}
       {loType == CERTIFICATION && <PrimeTrainingOverview
        name={name}
        description={description}
        overview={overview}
        richTextOverview={richTextOverview}
        skills={skills}
        training={training}
        trainingInstance={trainingInstance}
        instanceBadge={instanceBadge}
      />}
    </Provider>
  );
};

export default PrimeTrainingPage;
