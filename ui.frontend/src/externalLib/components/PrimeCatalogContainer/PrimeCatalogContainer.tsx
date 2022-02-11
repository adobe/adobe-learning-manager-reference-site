import React from "react";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";

import styles from "./PrimeCatalogContainer.module.css";

const PrimeCatalogContainer = () => {
  return (
    <div className={styles.primeCss}>
      <PrimeCatalogSearch />
      <PrimeCatalogFilters></PrimeCatalogFilters>
      <PrimeTrainingsContainer></PrimeTrainingsContainer>
    </div>
  );
};

export default PrimeCatalogContainer;
