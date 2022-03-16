import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import Close from "@spectrum-icons/workflow/Close";
import Filter from "@spectrum-icons/workflow/Filter";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useCatalog } from "../../../hooks/catalog/useCatalog";
import { CLOSE_SVG } from "../../../utils/inline_svg";
import { GetTranslation } from "../../../utils/translationService";
import { ALMLoader } from "../../Common/ALMLoader";
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
    catalogAttributes,
    isLoading,
    hasMoreItems,
  } = useCatalog();
  const { formatMessage } = useIntl();
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);

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
    catalogAttributes?.showFilters !== "true" && styles.full
  } `;

  const filtersCss = `${styles.filtersContainer} ${
    showFiltersOnMobile ? styles.onMobile : ""
  }`;

  const toggleFiltersonMobile = () => {
    setShowFiltersOnMobile((prevState) => !prevState);
  };

  const filtersHtml =
    catalogAttributes?.showFilters === "true" ? (
      <div className={filtersCss}>
        <Button
          UNSAFE_className={styles.closeIcon}
          variant="primary"
          isQuiet
          onPress={toggleFiltersonMobile}
        >
          <Close aria-label="Close" />
        </Button>
        <PrimeCatalogFilters
          filterState={filterState}
          updateFilters={updateFilters}
          catalogAttributes={catalogAttributes}
        ></PrimeCatalogFilters>
      </div>
    ) : (
      ""
    );

  const searchHtml =
    catalogAttributes?.showSearch === "true" ? (
      <div className={styles.searchContainer}>
        <Button
          variant="primary"
          UNSAFE_className={styles.button}
          onPress={toggleFiltersonMobile}
        >
          {formatMessage({
            id: "prime.catalog.filter",
            defaultMessage: "Filters",
          })}
          <Filter />
        </Button>
        <PrimeCatalogSearch query={query} handleSearch={handleSearch} />
      </div>
    ) : (
      ""
    );

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <div className={styles.pageContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1 className={styles.label}>
              {GetTranslation("prime.catalog.header", true)}
            </h1>

            {searchHtml}
          </div>
          {catalogAttributes?.showSearch === "true" && showingSearchHtml}
        </div>
        <div className={styles.filtersAndListConatiner}>
          {filtersHtml}
          <div
            className={listContainerCss}
            aria-hidden={showFiltersOnMobile ? "true" : "false"}
          >
            {isLoading ? (
              <ALMLoader />
            ) : (
              <PrimeTrainingsContainer
                trainings={trainings}
                loadMoreTraining={loadMoreTraining}
                hasMoreItems={hasMoreItems}
              ></PrimeTrainingsContainer>
            )}
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default PrimeCatalogContainer;
