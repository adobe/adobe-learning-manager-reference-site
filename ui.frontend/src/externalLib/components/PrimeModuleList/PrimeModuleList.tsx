import React from "react";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList = (props: any) => {
  const loResources: PrimeLearningObjectResource[] = props.loResources || [];

  return (
    <ul className={styles.moduleListContainer} role="list">
      {loResources.map((loResource) => (
        <PrimeModuleItem
          loResource={loResource}
          key={loResource.id}
        ></PrimeModuleItem>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
