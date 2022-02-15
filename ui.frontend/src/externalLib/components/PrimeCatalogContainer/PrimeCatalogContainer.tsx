import React from "react";
import { useCatalog } from "../../hooks/catalog/useCatalog";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";
import { useIntl } from "react-intl";

import styles from "./PrimeCatalogContainer.module.scss";

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
  const { formatMessage } = useIntl();

  return (
    <div className={styles.primeCss}>
      <div className={styles.primeCatalogHeader}>
        <h1 className={styles.primateCatalogLabel}>
          {formatMessage({
            id: "prime.catalog.header",
            defaultMessage: "Collection of Courses, Certificates and More",
          })}
        </h1>
        <PrimeCatalogSearch
          query={query}
          handleSearch={handleSearch}
          resetSearch={resetSearch}
        />
      </div>
      <div className={styles.primeFiltersCatalogContainer}>
        <PrimeCatalogFilters
          filterState={filterState}
          updateFilters={updateFilters}
        ></PrimeCatalogFilters>

        <PrimeTrainingsContainer
          trainings={trainings}
          loadMoreTraining={loadMoreTraining}
        ></PrimeTrainingsContainer>
      </div>
    </div>
  );
};

export default PrimeCatalogContainer;
