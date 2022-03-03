import React from "react";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList = (props: any) => {
  const loResources: PrimeLearningObjectResource[] = props.loResources || [];
  const launchPlayerHandler = props.launchPlayerHandler;
  const trainingId = props.trainingId;

  return (
    <ul className={styles.moduleListContainer}>
      {loResources.map((loResource) => (
        <PrimeModuleItem
          loResource={loResource}
          key={loResource.id}
          launchPlayerHandler={launchPlayerHandler}
          trainingId={trainingId}
        ></PrimeModuleItem>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
