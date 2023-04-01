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
import { useIntl } from "react-intl";
import { DESCRIPTION, HEADLINE } from "../../utils/constants";
import ChevronLeft from "@spectrum-icons/workflow/ChevronLeft";
import ChevronRight from "@spectrum-icons/workflow/ChevronRight";
import styles from "./ALMCategoryBrowser.module.css";
import { PrimeCategoryData, PrimeHeadingConfig } from "../../models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";

const ALMCategoryBrowser = (props: any) => {
  const navigate = useNavigate();
  const { formatMessage, locale } = useIntl();

  const CATEGORY_LIST_ID = "category-id";
  let carouselWidth = document.getElementById("carousel")?.offsetWidth || 0;
  const ELEMENTS_IN_VIEW =
    carouselWidth < 500 ? 1 : carouselWidth < 900 ? 2 : 3;

  const SCROLL_ELEMENT_COUNT = 1;
  const CATEGORY_MARGIN_RIGHT = 15;
  const categoryBrowsers = props.categoryBrowsers;
  const [categoryLeftIndex, setCategoryLeftIndex] = useState(0);
  const [categoryRightIndex, setCategoryRightIndex] = useState(0);
  const [disableLeftScroll, setDisableLeftScroll] = useState(true);
  const [disableRightScroll, setDisableRightScroll] = useState(true);

  type categoryBrowserData = {
    title: string;
    description: string;
    contentUrl?: string;
    catalogFilters?: string[];
    skillFilters?: string[];
    tagFilters?: string[];
  };

  const [categoryBrowsersInitialized, setCategoryBrowsersInitialized] =
    useState(false);
  const [categoryBrowserHeading, setCategoryBrowserHeading] =
    useState<PrimeHeadingConfig>();
  const [categoryBrowsersArray, setCategoryBrowsersArray] = useState<
    categoryBrowserData[]
  >([]);

  const initCategoryIndex = (categories: any) => {
    if (categories.length > ELEMENTS_IN_VIEW) {
      setDisableRightScroll(false);
      setCategoryRightIndex(ELEMENTS_IN_VIEW - 1);
    } else {
      setDisableRightScroll(true);
      setCategoryRightIndex(categories.length - 1);
    }
  };

  const setCategoryBrowsers = () => {
    let categoriesArray = categoryBrowsers.categories;
    const categories: categoryBrowserData[] = [];
    categoriesArray.forEach((category: PrimeCategoryData) => {
      let currentCategory = {} as categoryBrowserData;
      let currentCategoryDetails = {} as PrimeHeadingConfig;
      currentCategory.contentUrl = category?.contentUrl;
      currentCategory.catalogFilters = category.catalogFilters;
      currentCategory.skillFilters = category.skillFilters;
      currentCategory.tagFilters = category.tagFilters;
      currentCategoryDetails = getPreferredLocalizedMetadata(
        category.localizedMetadata,
        locale
      ) as PrimeHeadingConfig;
      currentCategory.title = currentCategoryDetails.title;
      currentCategory.description = currentCategoryDetails.description;
      categories.push(currentCategory);
    });
    setCategoryBrowsersArray(categories);
    setCategoryBrowsersInitialized(true);
    initCategoryIndex(categories);
  };

  useEffect(() => {
    if (!categoryBrowsersInitialized && categoryBrowsers) {
      setCategoryBrowsersHeading();
      setCategoryBrowsers();
    }
  }, [categoryBrowsers]);

  useEffect(() => {
    initCategoryIndex(categoryBrowsersArray);
  }, [ELEMENTS_IN_VIEW, categoryBrowsersInitialized]);

  const setCategoryBrowsersHeading = () => {
    setCategoryBrowserHeading(
      getPreferredLocalizedMetadata(
        categoryBrowsers.heading,
        locale
      ) as PrimeHeadingConfig
    );
  };

  const getHeadingElement = (element: string) => {
    return (
      <div
        className={
          element === HEADLINE
            ? styles.primeCategoriesHeadline
            : styles.primeCategoriesDescription
        }
      >
        {element === HEADLINE
          ? categoryBrowserHeading?.title
          : categoryBrowserHeading?.description}
      </div>
    );
  };

  const getFormatedData = (data: any) => {
    let formattedData = "";
    for (let i = 0; i < data.length; i++) {
      formattedData += data[i];
      if (i !== data.length - 1) {
        formattedData += ",";
      }
    }
    return formattedData;
  };

  const navigateToCatalog = (category: categoryBrowserData) => {
    const catalogFilter = getFormatedData(category.catalogFilters);
    const skillFilter = getFormatedData(category.skillFilters);
    const tagFilter = getFormatedData(category.tagFilters);
    let searchParams = "?";
    if (catalogFilter !== "") {
      searchParams += "catalogs=" + catalogFilter;
    }
    if (skillFilter !== "") {
      searchParams += searchParams !== "" ? "&" : "";
      searchParams += "skillName=" + skillFilter;
    }
    if (tagFilter !== "") {
      searchParams += searchParams !== "" ? "&" : "";
      searchParams += "tagName=" + tagFilter;
    }
    navigate({
      pathname: props.catalogRoute,
      search: searchParams,
    });
  };

  const getCategoryLi = (category: categoryBrowserData) => {
    return (
      <li key={category.title} className={styles.categoryList}>
        <img
          className={styles.categoryImage}
          src={category.contentUrl}
          alt={category.description}
          onClick={() => navigateToCatalog(category)}
        />
        <span className={styles.categoryHeading}>{category.title}</span>
        <span className={styles.categoryDescription}>
          {category.description}
        </span>
        <button
          className={styles.exploreCategory}
          onClick={() => navigateToCatalog(category)}
        >
          {formatMessage({ id: "alm.text.explore" })}
        </button>
      </li>
    );
  };

  const getElement = (elementId: string) => {
    return document.getElementById(elementId);
  };

  const getScrollOffset = () => {
    let offset = 0;
    var li = document.querySelectorAll<HTMLElement>(
      "#" + CATEGORY_LIST_ID + " li:nth-child(-n+" + SCROLL_ELEMENT_COUNT + ")"
    );
    li.forEach((x) => {
      offset += x.offsetWidth + CATEGORY_MARGIN_RIGHT;
    });
    return offset;
  };

  const scroll = (direction: number) => {
    if (
      (direction === -1 && disableLeftScroll) ||
      (direction === 1 && disableRightScroll)
    ) {
      return;
    }
    const categoryList = getElement(CATEGORY_LIST_ID);
    if (categoryList) {
      if (direction === 1) {
        categoryList.scrollLeft += getScrollOffset();
        if (categoryRightIndex + 1 <= categoryBrowsersArray.length - 1) {
          if (categoryRightIndex + 1 === categoryBrowsersArray.length - 1) {
            setDisableRightScroll(true);
          }
          setCategoryRightIndex(categoryRightIndex + 1);
          setCategoryLeftIndex(categoryLeftIndex + 1);
          setDisableLeftScroll(false);
        }
      } else {
        categoryList.scrollLeft -= getScrollOffset();
        if (categoryLeftIndex - 1 >= 0) {
          if (categoryLeftIndex - 1 === 0) {
            setDisableLeftScroll(true);
          }
          setCategoryLeftIndex(categoryLeftIndex - 1);
          setCategoryRightIndex(categoryRightIndex - 1);
          setDisableRightScroll(false);
        }
      }
    }
  };

  return (
    <section className={styles.categoryBrowserSection}>
      <div className={styles.categoryHeadingSection}>
        {getHeadingElement(HEADLINE)}
        {getHeadingElement(DESCRIPTION)}
      </div>
      <div id="carousel" className={styles.carousel}>
        <div className={styles.categoriesLeft}>
          <button
            className={
              disableLeftScroll
                ? styles.disabledButton
                : styles.categoriesLeftIcon
            }
            onClick={() => scroll(-1)}
          >
            {<ChevronLeft />}
          </button>
        </div>
        <ul id={CATEGORY_LIST_ID} className={styles.categoriesWrapper}>
          {categoryBrowsersArray.map((category) => {
            return getCategoryLi(category);
          })}
        </ul>
        <div className={styles.categoriesRight}>
          <button
            className={
              disableRightScroll
                ? styles.disabledButton
                : styles.categoriesRightIcon
            }
            onClick={() => scroll(1)}
          >
            {<ChevronRight />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ALMCategoryBrowser;
