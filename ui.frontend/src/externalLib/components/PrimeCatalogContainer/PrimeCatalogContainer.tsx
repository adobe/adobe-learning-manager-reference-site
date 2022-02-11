import React from "react";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";

import styles from "./PrimeCatalogContainer.module.css";

const PrimeCatalogContainer = () => {
  return (
    <div className={styles.primeCss}>
      <PrimeCatalogFilters></PrimeCatalogFilters>
      <PrimeTrainingsContainer></PrimeTrainingsContainer>
    </div>
  );
};

export default PrimeCatalogContainer;
