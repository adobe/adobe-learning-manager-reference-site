import React from "react";
import { useCatalog } from "../../hooks/catalog/useCatalog";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";

import styles from "./PrimeCatalogContainer.module.css";

const PrimeCatalogContainer = () => {
  const {
    trainings,
    loadMoreTraining,
    query,
    handleSearch,
    resetSearch,
    filterState,
    updateFilters,
  } = useCatalog();

  return (
    <div className={styles.primeCss}>
      <PrimeCatalogSearch
        query={query}
        handleSearch={handleSearch}
        resetSearch={resetSearch}
      />
      <PrimeCatalogFilters
        filterState={filterState}
        updateFilters={updateFilters}
      ></PrimeCatalogFilters>

      <PrimeTrainingsContainer
        trainings={trainings}
        loadMoreTraining={loadMoreTraining}
      ></PrimeTrainingsContainer>
    </div>
  );
};

export default PrimeCatalogContainer;
