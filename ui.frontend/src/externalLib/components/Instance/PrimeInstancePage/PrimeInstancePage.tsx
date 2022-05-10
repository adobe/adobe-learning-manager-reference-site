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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { lightTheme, Provider } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useInstancePage } from "../../../hooks/instance/useInstancePage";
import { PrimeLearningObjectResource } from "../../../models/PrimeModels";
import {
  getALMConfig,
  getALMObject,
  getPathParams,
} from "../../../utils/global";
import { SORT_ORDER_SVG } from "../../../utils/inline_svg";
import { getResourceBasedOnLocale } from "../../../utils/instance";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
} from "../../../utils/translationService";
import { PrimeInstanceItem } from "../PrimeInstanceItem";
import { PrimeTrainingOverviewHeader } from "../../TrainingOverview/PrimeTrainingOverviewHeader";
import styles from "./PrimeInstancePage.module.css";
import { ALMLoader } from "../../Common/ALMLoader";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMBackButton } from "../../Common/ALMBackButton";
//TO-DO move training id str to common
const TRAINING_ID_STR = "trainingId";
const PrimeInstancePage = () => {
  const [trainingId] = useState(() => {
    let { instancePath } = getALMConfig();
    let pathParams = getPathParams(instancePath, [TRAINING_ID_STR]);
    return pathParams[TRAINING_ID_STR];
  });

  const { formatMessage } = useIntl();
  const [list, setList] = useState([] as any[]);
  const [isAscendingOrder, setIsAscendingOrder] = useState(true);
  const locale = getALMObject().getALMConfig().locale;
  const {
    isLoading,
    training,
    name,
    color,
    bannerUrl,
    cardBgStyle,
    activeInstances,
    selectInstanceHandler,
  } = useInstancePage(trainingId);

  useEffect(() => {
    if (activeInstances && activeInstances.length) {
      let list: any = [];
      activeInstances.forEach((instance) => {
        let item: any = {};
        item.id = instance.id;
        item.name = getPreferredLocalizedMetadata(
          instance.localizedMetadata,
          locale
        )?.name;
        item.format = training.loFormat;

        let [location, instructorsName] = getInstanceLocationAndInstructorsName(
          instance.loResources,
          locale
        );
        item.location = location;
        item.instructorsName = instructorsName;
        item.date = getStartDateforInstance(instance.loResources, locale);
        list.push(item);
      });
      setList(list);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInstances.length, locale, training.loFormat]);

  const applySort = (sortParam: string) => {
    const sortedList = sortList(list, sortParam, isAscendingOrder);
    setList(sortedList as any[]);
    setIsAscendingOrder((prevState) => !prevState);
  };

  if (isLoading) {
    return <ALMLoader classes={styles.loader} />;
  }

  const headerLabel = formatMessage(
    {
      id: "alm.instance.header.label",
    },
    {
      0: name,
    }
  );

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <ALMBackButton />
        <PrimeTrainingOverviewHeader
          format={training.loType}
          color={color}
          title={name}
          bannerUrl={bannerUrl}
        />
        <section className={styles.pageContainer}>
          <h2 className={styles.courseInfoHeader}>{headerLabel}</h2>
          {/* Hidden in mobile */}
          <div className={styles.courseDetailsContainer}>
            <div className={styles.card} style={{ ...cardBgStyle }}>
              <div className={styles.band}></div>
            </div>
            <div className={styles.courseDetials}>
              <h3 className={styles.title}>{name}</h3>
              <p className={styles.type}>
                {GetTranslation(`alm.catalog.card.${training.loType}`, true)}
              </p>
            </div>
          </div>

          {/* Shown only in Mobile */}
          <div className={styles.selectInstanceContainer}>
            <h3 className={styles.selectInstance}>
              {formatMessage({
                id: "alm.instance.select.instance",
                defaultMessage: "Select An Instance",
              })}
            </h3>
          </div>

          {list!?.length > 0 && (
            <>
              <div className={styles.instancesContainer}>
                <div className={styles.instancesHeaderSection}>
                  <div
                    className={`${styles.instanceNameWrapper} ${styles.commonHeader}`}
                  >
                    {formatMessage({
                      id: "alm.instance.name",
                      defaultMessage: "Instance Name",
                    })}
                    <span
                      onClick={() => applySort("name")}
                      className={styles.sortIcon}
                    >
                      {SORT_ORDER_SVG()}
                    </span>
                  </div>
                  <div
                    className={`${styles.dateWrapper} ${styles.commonHeader} `}
                  >
                    {formatMessage({
                      id: "alm.instance.start.date",
                      defaultMessage: "Start Date",
                    })}

                    <span
                      onClick={() => applySort("date")}
                      className={styles.sortIcon}
                    >
                      {SORT_ORDER_SVG()}
                    </span>
                  </div>
                  <div
                    className={`${styles.locationWrapper} ${styles.commonHeader}`}
                  >
                    {formatMessage({
                      id: "alm.instance.location",
                      defaultMessage: "Location",
                    })}

                    <span
                      onClick={() => applySort("location")}
                      className={styles.sortIcon}
                    >
                      {SORT_ORDER_SVG()}
                    </span>
                  </div>
                  <div
                    className={`${styles.action} ${styles.commonHeader}`}
                  ></div>
                </div>
              </div>
              <ul className={styles.instanceList}>
                {list!.map((item: any) => (
                  <PrimeInstanceItem
                    key={item.id}
                    name={item.name}
                    format={item.format}
                    date={item.date}
                    location={item.location}
                    instructorsName={item.instructorsName}
                    id={item.id}
                    selectInstanceHandler={selectInstanceHandler}
                    locale={locale}
                  />
                ))}
              </ul>
            </>
          )}
        </section>
      </Provider>
    </ALMErrorBoundary>
  );
};
export default PrimeInstancePage;

const getStartDateforInstance = (
  loResources: PrimeLearningObjectResource[],
  locale: string
): Date => {
  let dateArray: any[] = [];
  loResources?.forEach((loResource) => {
    const resource = getResourceBasedOnLocale(loResource, locale);
    if (resource.dateStart) dateArray.push(new Date(resource.dateStart));
  });
  return dateArray.sort((a, b) => a - b)[0];
};

const getInstanceLocationAndInstructorsName = (
  loResources: PrimeLearningObjectResource[],
  locale: string
): string[] => {
  let location: string[] = [];
  let instructorNames: string[] = [];
  loResources?.forEach((loResource) => {
    const resource = getResourceBasedOnLocale(loResource, locale);

    if (resource.location) location.push(resource.location);
    if (resource.instructorNames?.length)
      instructorNames.push(resource.instructorNames.join(", "));
  });
  return [location.join(", "), instructorNames.join(", ")];
};

const sortList = (list: any[], sortParam: string, sortOrder: any) => {
  let listCopy = [...list];
  if (sortParam === "name" || sortParam === "location") {
    return sortOrder
      ? listCopy.sort((a: any, b: any) =>
          b[sortParam].localeCompare(a[sortParam])
        )
      : listCopy.sort((a: any, b: any) =>
          a[sortParam].localeCompare(b[sortParam])
        );
  }

  if (sortParam === "date") {
    return sortOrder
      ? listCopy.sort((a: any, b: any) => a.date - b.date)
      : listCopy.sort((a: any, b: any) => b.date - a.date);
  }
};
