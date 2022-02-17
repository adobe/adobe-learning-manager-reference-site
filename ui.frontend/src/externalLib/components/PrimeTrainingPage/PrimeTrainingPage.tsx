import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { PrimeTrainingOverview } from "../PrimeTrainingOverview";
import { PrimeTrainingInstances } from "../PrimeTrainingInstances";

import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeLearningObject } from "../../models/PrimeModels";

const PrimeTrainingPage = (props: any) => {
  //const trainingInstance: PrimeLearningObjectInstance = props.training;
  const trainingId = "course:1926880"; //TO-DO get training id "course:1943266"; //
  const instanceId = "course:1926880_2174497"; // TO-DO get instance id "course:1943266_2191842" //
  //1926880/instance/2174497/preview

  //course/1943266/instance/2191842/preview
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
  } = useTrainingPage(trainingId, instanceId);
  if (isLoading) {
    return <div>Loading details. Please wait....</div>;
  }

  return (
    <>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
        bannerUrl={bannerUrl}
      />
      <PrimeTrainingOverview
        description={description}
        overview={overview}
        richTextOverview={richTextOverview}
        skills={skills}
        training={training}
        trainingInstance={trainingInstance}
        instanceBadge={instanceBadge}
      />
    </>
  );
};

export default PrimeTrainingPage;
