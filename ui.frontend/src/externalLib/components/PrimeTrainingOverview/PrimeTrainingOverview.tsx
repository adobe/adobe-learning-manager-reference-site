import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeLearningObject } from "../../models/PrimeModels";

const PrimeTrainingPage = (props: any) => {
 
  const {
    description,
    overview,
    richTextOverview,
    skills,
    training,
    trainingInstance,
    instanceBadge,
  } = props;


  return (
    <>
    {/* <div style={{ display: "flex" }}>
          {instanceBadge.badgeName},
     </div> */}
     <div>
         Enrollment :
         {training.enrollment ? training.enrollment.id : "NOT_enrolled"}
     </div>
     <div>Authors: {training.authorNames.join(",")}</div>
     <div>Skills : {skills.map((skill: { name: any; }) => skill.name).join(",")}</div>
     <div>Duration is ::{convertSecondsToTimeText(training.duration)}</div>
     <PrimeModuleList
         loResources={trainingInstance.loResources}
     ></PrimeModuleList>
      </>
     
  );

};

export default PrimeTrainingPage;

 
