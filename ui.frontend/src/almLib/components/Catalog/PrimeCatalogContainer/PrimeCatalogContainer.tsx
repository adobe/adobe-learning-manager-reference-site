/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import Close from "@spectrum-icons/workflow/Close";
import Filter from "@spectrum-icons/workflow/Filter";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useCatalog } from "../../../hooks/catalog/useCatalog";
import { getALMConfig } from "../../../utils/global";
import { CLOSE_SVG } from "../../../utils/inline_svg";
import {
  GetTranslation,
  isTranslated,
} from "../../../utils/translationService";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";
import styles from "./PrimeCatalogContainer.module.css";

const PrimeCatalogContainer = (props: any) => {
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
    updatePriceFilter,
  } = useCatalog();
  const { formatMessage } = useIntl();
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const isTeamsApp = getALMConfig().isTeamsApp;
  const defaultCatalogHeading = isTranslated(
    GetTranslation("alm.catalog.header", true)
  )
    ? GetTranslation("alm.catalog.header", true)
    : "";

  const showingSearchHtml = query && (
    <div className={styles.searchAppliedContainer}>
      <div className={styles.searchAppliedLabel}>
        {GetTranslation("alm.text.searchResults")}
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
  } ${isTeamsApp ? styles.teamsExtraTopMargin : ""}`;

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
          onPress={toggleFiltersonMobile}>
          <Close aria-label="Close" />
        </Button>
        <PrimeCatalogFilters
          filterState={filterState}
          updateFilters={updateFilters}
          catalogAttributes={catalogAttributes}
          updatePriceFilter={updatePriceFilter}></PrimeCatalogFilters>
      </div>
    ) : (
      ""
    );

  const filtersButtonForMobileHTML =
    catalogAttributes?.showFilters === "true" ? (
      <Button
        variant="primary"
        UNSAFE_className={styles.button}
        onPress={toggleFiltersonMobile}>
        {formatMessage({
          id: "alm.catalog.filter",
          defaultMessage: "Filters",
        })}
        <Filter />
      </Button>
    ) : (
      ""
    );
  const searchHtml =
    catalogAttributes?.showSearch === "true" ? (
      <PrimeCatalogSearch query={query} handleSearch={handleSearch} />
    ) : (
      ""
    );

  const searchContainerHTML = (
    <div className={styles.searchContainer}>{searchHtml}</div>
  );
  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.pageContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.header}>
              <h1 className={styles.label}>
                {props.heading ? props.heading : defaultCatalogHeading}
              </h1>
              {filtersButtonForMobileHTML}
              {!isTeamsApp && searchContainerHTML}
            </div>
            {props.description && (
              <div className={styles.catalogDescription}>
                {props.description}
              </div>
            )}
            {catalogAttributes?.showSearch === "true" && showingSearchHtml}
          </div>
          <div className={styles.filtersAndListConatiner}>
            {filtersHtml}
            <div
              className={listContainerCss}
              aria-hidden={showFiltersOnMobile ? "true" : "false"}>
              {isLoading ? (
                <ALMLoader classes={styles.loader} />
              ) : (
                <PrimeTrainingsContainer
                  trainings={trainings}
                  loadMoreTraining={loadMoreTraining}
                  hasMoreItems={hasMoreItems}
                  guest={props.guest}
                  signUpURL={props.signUpURL}
                  almDomain={props.almDomain}></PrimeTrainingsContainer>
              )}
            </div>
          </div>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeCatalogContainer;
