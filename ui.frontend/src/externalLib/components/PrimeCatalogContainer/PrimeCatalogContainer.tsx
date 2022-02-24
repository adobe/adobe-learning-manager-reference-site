import React from "react";
import { useCatalog } from "../../hooks/catalog/useCatalog";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";
import { useIntl } from "react-intl";
import { Provider, lightTheme } from "@adobe/react-spectrum";

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
    catalogAttributes,
  } = useCatalog();
  const { formatMessage } = useIntl();

  const showingSearchHtml = query && (
    <div className={styles.searchAppliedContainer}>
      <div className={styles.searchAppliedLabel}>
        Showing results for
        <div className={styles.searchTextContainer}>
          <span className={styles.searchText}>{query}</span>
          <span className={styles.searchReset} onClick={resetSearch}>
            {CLOSE_SVG()}
          </span>
        </div>
      </div>
    </div>
  );

  const listContainerCss = `${styles.listContainer} ${
    catalogAttributes?.showFilters === "false" && styles.full
  } `;

  const filtesHtml = catalogAttributes?.showFilters === "false" || (
    <div className={styles.filtersContainer}>
      <PrimeCatalogFilters
        filterState={filterState}
        updateFilters={updateFilters}
        catalogAttributes={catalogAttributes}
      ></PrimeCatalogFilters>
    </div>
  );

  const searchHtml = catalogAttributes?.showSearch === "false" || (
    <div className={styles.searchContainer}>
      <PrimeCatalogSearch query={query} handleSearch={handleSearch} />
    </div>
  );

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <div className={styles.pageContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1 className={styles.label}>
              {formatMessage({
                id: "prime.catalog.header",
                defaultMessage: "Collection of Courses, Certificates and More",
              })}
            </h1>
            {searchHtml}
          </div>
          {catalogAttributes?.showSearch === "false" || showingSearchHtml}
        </div>
        <div className={styles.filtersAndListConatiner}>
          {filtesHtml}
          <div className={listContainerCss}>
            <PrimeTrainingsContainer
              trainings={trainings}
              loadMoreTraining={loadMoreTraining}
            ></PrimeTrainingsContainer>
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default PrimeCatalogContainer;
