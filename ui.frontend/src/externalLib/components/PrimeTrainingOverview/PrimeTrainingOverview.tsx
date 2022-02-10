import React from "react";
import { PrimeLearningObjectInstance } from "../../models/PrimeModels";
import { PrimeModuleList } from "../PrimeModuleList";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";

const PrimeTrainingOverview = (props: any) => {
  
  //const trainingInstance: PrimeLearningObjectInstance = props.training;
  const trainingId = "course:1926880" ; //TO-DO get training id 
  const instanceId = "course:1926880_2174497" ; // TO-DO get instance id

  const training =  useTrainingPage(trainingId, instanceId);
  console.log(training);
  return (
    <>
      {/* <div style={{ display: "flex" }}>{trainingInstance.learningObject.id}</div>
      <PrimeModuleList loResources={trainingInstance.loResources}></PrimeModuleList> */}
    </>
  );
};

export default PrimeTrainingOverview;
