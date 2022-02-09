import React from "react";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { PrimeModuleItem } from "../PrimeModuleItem";

const PrimeModuleList = (props: any) => {
  
  const loResources: PrimeLearningObjectResource[] = props.loResources || [];
  
  return (
    <React.Fragment>
      {loResources.map((loResource) => (
        <PrimeModuleItem loResource={loResource}></PrimeModuleItem>
      ))}
    </React.Fragment>
  );
};

export default PrimeModuleList;
