import React from "react";
import { useCatalog } from "../../hooks/catalog/useCatalog";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";
import { useIntl } from "react-intl";

import styles from "./PrimeCatalogContainer.module.css";
import { CLOSE_SVG } from "../../utils/inline_svg";

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

  const showingSearchHtml = query ? (
    <div className={styles.primeCatalogSearchAppliedContainer}>
      <div className={styles.primeCatalogSearchAppliedLabel}>
        Showing results for
        <div className={styles.primeCatalogSearchTextContainer}>
          <span className={styles.primeCatalogSearchText}>{query}</span>
          <span
            className={styles.primeCatalogSearchReset}
            onClick={resetSearch}
          >
            {CLOSE_SVG()}
          </span>
        </div>
      </div>
    </div>
  ) : (
    ""
  );

  return (
    <div className={styles.primeCss}>
      <div className={styles.primeCatalogHeaderContainer}>
        <div className={styles.primeCatalogHeader}>
          <h1 className={styles.primateCatalogLabel}>
            {formatMessage({
              id: "prime.catalog.header",
              defaultMessage: "Collection of Courses, Certificates and More",
            })}
          </h1>
          <div style={{ width: "265px" }}>
            <PrimeCatalogSearch query={query} handleSearch={handleSearch} />
          </div>
        </div>
        {showingSearchHtml}
      </div>
      <div className={styles.primeCatalogFiltersContainer}>
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
