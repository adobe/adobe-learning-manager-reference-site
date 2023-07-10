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
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import { PrimeInstanceItem } from "../PrimeInstanceItem";
import styles from "./PrimeInstancePage.module.css";
import { ALMLoader } from "../../Common/ALMLoader";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMBackButton } from "../../Common/ALMBackButton";
import { useTrainingPage } from "../../../hooks";
import { COURSE, ENGLISH_LOCALE } from "../../../utils/constants";
import {
  getEnrollment,
  getLoId,
  getLoName,
  getParentPathStack,
} from "../../../utils/hooks";
import React from "react";
//TO-DO move training id str to common
const TRAINING_ID_STR = "trainingId";
const CLASSROOM = "Classroom";
const VIRTUAL_CLASSROOM = "Virtual Classroom";
const BLENDED = "Blended"

const PrimeInstancePage = () => {
  const [trainingId] = useState(() => {
    let { instancePath } = getALMConfig();
    let pathParams = getPathParams(instancePath, [TRAINING_ID_STR]);
    return pathParams[TRAINING_ID_STR];
  });

  const { formatMessage } = useIntl();
  const [list, setList] = useState([] as any[]);
  const [isAscendingOrder, setIsAscendingOrder] = useState(true);
  const locale = getALMObject().getALMConfig().locale || ENGLISH_LOCALE;
  const {
    isLoading,
    training,
    name,
    color,
    bannerUrl,
    cardBgStyle,
    activeInstances,
    selectInstanceHandler,
    getSummary,
  } = useInstancePage(trainingId);
  // const { updateBookMark } = useTrainingPage(trainingId);

  const areCrVcrModulesOnly = (loResources: PrimeLearningObjectResource[]): boolean => {
    return loResources?.every((loResource) => isClassroomOrVC(loResource));
  };

  const showLocationAndInstructor = training.loType === COURSE && 
    (training.loFormat === CLASSROOM || training.loFormat === VIRTUAL_CLASSROOM || 
    (activeInstances[0] && areCrVcrModulesOnly(activeInstances[0].loResources)) || 
    training.loFormat === BLENDED);


  useEffect(() => {
    if (activeInstances && activeInstances.length) {
      Promise.all(
        activeInstances.map(async (instance) => {
          let item: any = {};
          item.id = instance.id;
          item.name = getPreferredLocalizedMetadata(
            instance.localizedMetadata,
            locale
          )?.name;
          item.format = training.loFormat;
          item.enrollment = getEnrollment(training, instance);
          item.enrollByDate = instance.enrollmentDeadline;
          
          if (showLocationAndInstructor) {
            let [location, instructorsName] =
              getInstanceLocationAndInstructorsName(
                instance.loResources,
                locale
              );
            item.instructorsName = instructorsName;
            item.location = location;
            item.startDate = getStartDateforInstance(
              instance.loResources,
              locale
            );

            for (const loResource of instance.loResources) {
              if (isClassroomOrVC(loResource)) {
                const instanceSummary = await getSummary(instance);
                const enrollmentCount = instanceSummary?.enrollmentCount;
                item.seatLimit = instanceSummary?.seatLimit;
                item.seatsAvailable =
                  item.seatLimit !== undefined
                    ? item.seatLimit - (enrollmentCount || 0)
                    : -1;
                break;
              }
            }
          } else {
            // for Activity/SP Delivery Types
            item.completionDate = instance.completionDeadline;
          }

          return item;
        })
      ).then((list) => setList(list));
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

  const headerLabelId = () => {
    if (training.instanceSwitchEnabled) {
      return `alm.instance.switch.header.${training.loType}.label`;
    } else if (training.multienrollmentEnabled && training.enrollment) {
      return `alm.instance.header.${training.loType}.multienroll.label`;
    } else {
      return `alm.instance.header.${training.loType}.label`;
    }
  };

  const showParentBreadCrumbs = () => {

    const loDetailsArray = getParentPathStack();

    if(loDetailsArray.length===0){
      return;
    }
    return (
      <div className={styles.breadcrumbParent}>
        {loDetailsArray.map((loDetails: string, index: number) => {
          const loName = decodeURI(getLoName(loDetails));
          const loId = getLoId(loDetails);
          return (
            <React.Fragment key={`breadcrumb-${index}`}>
              <a
                className={styles.breadcrumbLink}
                onClick={() => getALMObject().navigateToTrainingOverviewPage(loId)}
                title={loName}
              >
                {loName}
              </a>
              {index <= loDetailsArray.length - 1 && (
                <b className={styles.breadcrumbArrow}>&nbsp; &gt; &nbsp;</b>
              )}
            </React.Fragment>
          );
        })}
        <b>{GetTranslation("alm.breadcrumb.all.instances", true)}</b>
      </div>
    );
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.backgroundPage}>
          {!getALMConfig().hideBackButton && <ALMBackButton />}
          <section className={styles.pageContainer}>
            <div className={styles.breadcrumbMobile}>
              {showParentBreadCrumbs()}
            </div>

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

            <h2 className={styles.courseInfoHeader}>
              {GetTranslationsReplaced(
                headerLabelId(),
                {
                  x: name,
                },
                true
              )}
            </h2>

            {list!?.length > 0 && (
              <>
                <div className={styles.instancesContainer}>
                  <div className={styles.instancesHeaderSection}>

                    {/* Instance Name Column */}
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

                    {showLocationAndInstructor ? (
                      <>
                      {/* Starting date for CR/VCR Course */}
                        <div
                          className={`${styles.dateWrapper} ${styles.commonHeader} `}
                        >
                          {formatMessage({
                            id: "alm.instance.start.date",
                            defaultMessage: "Starts On",
                          })}

                          <span
                            onClick={() => applySort("startDate")}
                            className={styles.sortIcon}
                          >
                            {SORT_ORDER_SVG()}
                          </span>
                        </div>

                        {/* List of CR/VCR locations */}
                        <div
                          className={`${styles.locationWrapper} ${styles.commonHeader}`}
                        >
                          {formatMessage({
                            id: "alm.instance.location",
                            defaultMessage: "Location(s)",
                          })}

                          <span
                            onClick={() => applySort("location")}
                            className={styles.sortIcon}
                          >
                            {SORT_ORDER_SVG()}
                          </span>
                        </div>
                      </>
                    ) : (

                      // Completion Deadline
                      <div
                        className={`${styles.completionDateWrapper} ${styles.commonHeader}`}
                      >
                        {formatMessage({
                          id: "alm.instance.completeBy.label",
                          defaultMessage: "Complete By",
                        })}

                        <span
                          onClick={() => applySort("completionDate")}
                          className={styles.sortIcon}
                        >
                          {SORT_ORDER_SVG()}
                        </span>
                      </div>
                    )}

                    {/* Training Price */}
                    {training.price && (
                      <div
                        className={`${styles.priceWrapper} ${styles.commonHeader}`}
                      >
                        {formatMessage({
                          id: "alm.instance.price",
                          defaultMessage: "Price",
                        })}
                      </div>
                    )}

                    {/* View instance button */}
                    <div
                      className={`${styles.actionWrapper} ${styles.commonHeader}`}
                      style={{ alignItems: "center" }}
                    >
                      {formatMessage({
                        id: "alm.instance.actions",
                        defaultMessage: "Actions",
                      })}
                    </div>
                  </div>
                </div>

                {/* Instances list */}
                {showLocationAndInstructor ? (
                  <ul className={styles.instanceList}>
                    {list!.map((item: any) => (
                      <PrimeInstanceItem
                        key={item.id}
                        showLocationAndInstructor={true}
                        name={item.name}
                        format={item.format}
                        startDate={item.startDate}
                        enrollByDate={item.enrollByDate}
                        location={item.location}
                        instructorsName={item.instructorsName}
                        id={item.id}
                        selectInstanceHandler={selectInstanceHandler}
                        locale={locale}
                        price={training.price}
                        enrollment={item.enrollment}
                        showProgressBar={item.enrollment}
                        seatLimit={item.seatLimit}
                        seatsAvailable={item.seatsAvailable}
                      />
                    ))}
                  </ul>
                ) : (
                  <ul className={styles.instanceList}>
                    {list!.map((item: any) => (
                      <PrimeInstanceItem
                        key={item.id}
                        name={item.name}
                        showLocationAndInstructor={false}
                        format={item.format}
                        completionDate={item.completionDate}
                        enrollByDate={item.enrollByDate}
                        id={item.id}
                        price={training.price}
                        selectInstanceHandler={selectInstanceHandler}
                        locale={locale}
                        enrollment={item.enrollment}
                        showProgressBar={item.enrollment}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
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

const isClassroomOrVC = (loResource: any) => {
  return (
    loResource.resourceType === CLASSROOM ||
    loResource.resourceType === VIRTUAL_CLASSROOM
  );
};

const getInstanceLocationAndInstructorsName = (
  loResources: PrimeLearningObjectResource[],
  locale: string
) => {
  let location = new Set();
  let instructorNames = new Set();
  loResources?.forEach((loResource) => {
    if (!isClassroomOrVC(loResource)) {
      return "";
    }
    const resource = getResourceBasedOnLocale(loResource, locale);

    if (resource.room?.city) {
      location.add(resource.room.city);
    } else if (resource.room?.roomName) {
      location.add(resource.room.roomName);
    }
    else if(resource.roomLocation){
      location.add(resource.roomLocation);
    }
    else if (resource.location) {
      location.add(resource.location);
    }

    if (resource.instructorNames?.length) {
      resource.instructorNames.forEach(function(name) {
        instructorNames.add(name);
      });
    }
  });
  return [Array.from(location), Array.from(instructorNames)];
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

  if (sortParam === "completionDate" || sortParam ==="startDate") {
    return sortOrder
      ? listCopy.sort((a, b) => {
        const dateA = new Date(a[sortParam]);
        const dateB = new Date(b[sortParam]);
        return dateA.getTime() - dateB.getTime();
      })
      : listCopy.sort((a, b) => {
        const dateA = new Date(a[sortParam]);
        const dateB = new Date(b[sortParam]);
        return dateB.getTime() - dateA.getTime();
      })
  }

};
