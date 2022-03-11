import React from "react";
import { PrimeLearningObjectResource } from "../../../models/PrimeModels";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList = (props: any) => {
  const loResources: PrimeLearningObjectResource[] = props.loResources || [];
  const launchPlayerHandler = props.launchPlayerHandler;
  const trainingId = props.trainingId;
  const isPartOfLP = props.isPartOfLP;

  return (
    <ul
      className={`${styles.moduleListContainer} ${
        isPartOfLP ? styles.isPartOfLP : ""
      }`}
    >
      {loResources.map((loResource) => (
        <PrimeModuleItem
          loResource={loResource}
          key={loResource.id}
          launchPlayerHandler={launchPlayerHandler}
          trainingId={trainingId}
          isPartOfLP={isPartOfLP}
        ></PrimeModuleItem>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
