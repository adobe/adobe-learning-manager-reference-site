import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeLearningObject } from "../../models/PrimeModels";

const PrimeTrainingOverview = (props: any) => {
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
    skills,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
    hasSingleActiveInstance
  } = useTrainingPage(trainingId, instanceId);
  if (isLoading || !training) {
    return <div>Loading details. Please wiat....</div>;
  }

  return (
    <>
        <PrimeTrainingOverviewHeader
            format={training.loFormat}
            color={color}
            title={name}
        />

        {/* {hasSingleActiveInstance && overviewTemplate(training,trainingInstance,skills,instanceBadge)} */}
        
   </>
  );
};

export default PrimeTrainingOverview;

// const overviewTemplate = (training: PrimeLearningObject, trainingInstance,skills,instanceBadge) => {

//     return  <><div style={{ display: "flex" }}>
//     {training.id} , {name}, {instanceBadge.badgeName},
// </div>
// <div>
//     Enrollment :
//     {training.enrollment ? training.enrollment.id : "NOT_enrolled"}
// </div>
// <div>Authors: {training.authorNames.join(",")}</div>
// <div>Skills : {skills.map((skill) => skill.name).join(",")}</div>
// {/* <div>Overview : {overview}</div> */}

// <div>Duration is ::{convertSecondsToTimeText(training.duration)}</div>
// <PrimeModuleList
//     loResources={trainingInstance.loResources}
// ></PrimeModuleList>
//  </>
// }