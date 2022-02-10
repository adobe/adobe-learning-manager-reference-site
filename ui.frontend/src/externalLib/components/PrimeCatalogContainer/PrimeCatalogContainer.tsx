import React from "react";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";
import styles from "./PrimeCatalogContainer.module.css";
//import styles from './Button.module.css'

const PrimeCatalogContainer  = () => {
  return (
    <div className={styles.prime}>
      <PrimeCatalogFilters></PrimeCatalogFilters>
      <PrimeTrainingsContainer></PrimeTrainingsContainer>
    </div>
  );
};

export default PrimeCatalogContainer ;
