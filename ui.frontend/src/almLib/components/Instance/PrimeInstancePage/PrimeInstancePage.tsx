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
import {
  PrimeExtension,
  PrimeLearningObjectResource,
} from "../../../models/PrimeModels";
import {
  getALMAccount,
  getALMConfig,
  getALMObject,
  getALMUser,
  getPathParams,
  isExtensionAllowed,
} from "../../../utils/global";
import { SORT_ORDER_SVG } from "../../../utils/inline_svg";
import { getResourceBasedOnLocale } from "../../../utils/instance";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import { PrimeInstanceItem } from "../PrimeInstanceItem";
import { PrimeInstanceCard } from "../PrimeInstanceCard";
import styles from "./PrimeInstancePage.module.css";
import { ALMLoader } from "../../Common/ALMLoader";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMBackButton } from "../../Common/ALMBackButton";
import {
  COURSE,
  ENGLISH_LOCALE,
  LIST_VIEW,
  TILE_VIEW,
} from "../../../utils/constants";
import {
  getEnrollment,
  getLoId,
  getLoName,
  getParentPathStack,
} from "../../../utils/hooks";
import React from "react";
import {
  EXTENSION_LAUNCH_TYPE,
  getExtension,
  getExtensionAppUrl,
  InvocationType,
  openExtensionInNewTab,
} from "../../../utils/native-extensibility";
import { ALMExtensionIframeDialog } from "../../Common/ALMExtensionIframeDialog";
import { useTrainingCard } from "../../../hooks/catalog/useTrainingCard";
import ViewList from "@spectrum-icons/workflow/ViewList";
import ClassicGridView from "@spectrum-icons/workflow/ClassicGridView";

//TO-DO move training id str to common
const TRAINING_ID_STR = "trainingId";
const CLASSROOM = "Classroom";
const VIRTUAL_CLASSROOM = "Virtual Classroom";
const BLENDED = "Blended";

const PrimeInstancePage = () => {

  const [trainingId] = useState(() => {
    
    let { instancePath } = getALMConfig();
    
    let pathParams = getPathParams(instancePath, [TRAINING_ID_STR]);
    return pathParams[TRAINING_ID_STR];
  });

  const [viewType, setviewType] = useState(LIST_VIEW);

  const isListView = () => {
    return viewType === LIST_VIEW;
  };

  function viewListHandler() {
    setviewType(LIST_VIEW);
  }
  function viewTileHandler() {
    sortingInstanceList(list);
    setviewType(TILE_VIEW);
  }

  const { formatMessage } = useIntl();
  const [list, setList] = useState([] as any[]);
  const [isAscendingOrder, setIsAscendingOrder] = useState(true);
  const [loInstanceExtension, setLoInstanceExtension] =
    useState<PrimeExtension | null>(null);

  const [extensionAppIframeUrl, setExtensionAppIframeUrl] =
    useState<string>("");
  const locale = getALMObject().getALMConfig().locale || ENGLISH_LOCALE;
  const {
    isLoading,
    training,
    name,
    cardBgStyle,
    activeInstances,
    selectInstanceHandler,
    getSummary,
  } = useInstancePage(trainingId);
  // const { updateBookMark } = useTrainingPage(trainingId);
  const { skillNames, type } = useTrainingCard(training);

  const areCrVcrModulesOnly = (
    loResources: PrimeLearningObjectResource[]
  ): boolean => {
    return loResources?.every((loResource) => isClassroomOrVC(loResource));
  };

  const showLocationAndInstructor =
    training.loType === COURSE &&
    (training.loFormat === CLASSROOM ||
      training.loFormat === VIRTUAL_CLASSROOM ||
      (activeInstances[0] &&
        areCrVcrModulesOnly(activeInstances[0].loResources)) ||
      training.loFormat === BLENDED);

  const isCrVcCourse =
    training.loFormat === CLASSROOM ||
    training.loFormat === VIRTUAL_CLASSROOM ||
    (training.loType === COURSE &&
      activeInstances[0] &&
      areCrVcrModulesOnly(activeInstances[0].loResources));

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

          item.completionDate = instance.completionDeadline;
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
          }
          return item;
        })
      ).then((listArray) => sortingInstanceList(listArray));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInstances.length, locale, training.loFormat]);
  useEffect(() => {
    const getLoInstanceExtension = async () => {
      const account = await getALMAccount();
      if (account) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_INSTANCE_ROW
        );

        extension &&
          isExtensionAllowed(extension) &&
          setLoInstanceExtension(extension);
      }
    };

    training && training.id && getLoInstanceExtension();
  }, [training]);

  const comparatorByProgressPercent = (
    a: { enrollment: { progressPercent: number } },
    b: { enrollment: { progressPercent: number } }
  ) => {
    return b.enrollment.progressPercent - a.enrollment.progressPercent;
  };

  const sortingInstanceList = (listArray: any[]) => {
    let instanceList = [];
    instanceList = listArray.filter((item: any) => {
      if (item.enrollment) {
        return item;
      }
    });
    instanceList.sort(comparatorByProgressPercent);
    for (let i = 0; i < listArray.length; i++) {
      if (!listArray[i].enrollment) {
        instanceList.push(listArray[i]);
      }
    }
    setList(instanceList);
  };

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

    if (loDetailsArray.length === 0) {
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
                onClick={() =>
                  getALMObject().navigateToTrainingOverviewPage(loId)
                }
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

  const extensionClickHandler = async (loInstanceId: string, event: Event) => {
    event && event.stopPropagation();
    if (!loInstanceExtension) {
      return;
    }
    const userResponse = await getALMUser();
    const userId = userResponse?.user?.id;
    let requestObj: any = {
      userId,
      loId: training?.id,
      loInstanceId,
      authToken: getALMObject().getAccessToken(),
      locale,
      invokePoint: loInstanceExtension.invocationType,
    };
    const launchType = loInstanceExtension.launchType;
    if (launchType === EXTENSION_LAUNCH_TYPE.IN_APP) {
      const url = getExtensionAppUrl(loInstanceExtension.url, requestObj);
      setExtensionAppIframeUrl(url.href);
    } else if (launchType === EXTENSION_LAUNCH_TYPE.NEW_TAB) {
      openExtensionInNewTab(loInstanceExtension.url, requestObj);
    }
  };
  const iframeCloseHandler = () => {
    setExtensionAppIframeUrl("");
  };
  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.backgroundPage}>
          {!getALMConfig().hideBackButton && <ALMBackButton />}
          <section className={styles.pageContainerBackground}>
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
                    {GetTranslation(
                      `alm.catalog.card.${training.loType}`,
                      true
                    )}
                  </p>
                </div>
              </div>

              {/* Shown only in Mobile */}

              <h2 className={styles.instancePageHeading}>
                {training.localizedMetadata[0].name}
              </h2>

              <h2 className={styles.courseInfoHeader}>
                <div className={styles.courseInfoHeaderBlock}>
                  {GetTranslationsReplaced(
                    headerLabelId(),
                    {
                      x: name,
                    },
                    true
                  )}
                </div>
              </h2>
              <div className={styles.viewButtonBox}>
                <button
                  className={
                    viewType === LIST_VIEW
                      ? styles.viewButtonShaded
                      : styles.viewButton
                  }
                  onClick={viewListHandler}
                  tabIndex={0}
                  aria-label={GetTranslation("alm.instance.listView", true)}
                >
                  <ViewList />
                </button>
                <button
                  className={
                    viewType === TILE_VIEW
                      ? styles.viewButtonShaded
                      : styles.viewButton
                  }
                  onClick={viewTileHandler}
                  tabIndex={0}
                  aria-label={GetTranslation("alm.instance.gridView", true)}
                >
                  <ClassicGridView />
                </button>
              </div>

              {/* Shown only in Mobile */}
              <div className={styles.selectInstanceContainer}>
                <h3 className={styles.selectInstance}>
                  {GetTranslation("alm.instance.select.instance", true)}
                </h3>
              </div>

              {isListView() ? (
                <>
                  {list!?.length > 0 && (
                    <>
                      <div className={styles.instancesContainer}>
                        <div className={styles.instancesHeaderSection}>
                          {/* Instance Name Column */}
                          <div
                            className={`${styles.instanceNameWrapper} ${styles.commonHeader}`}
                          >
                            {GetTranslation("alm.instance.name", true)}
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
                              extensionClickHandler={extensionClickHandler}
                              extension={loInstanceExtension}
                              instanceId={item.id}
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
                              extensionClickHandler={extensionClickHandler}
                              extension={loInstanceExtension}
                              instanceId={item.id}
                            />
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div>
                  {/* <section className={styles.pageContainer}> */}
                  <ul className={styles.primeTrainingsCards}>
                    {list!.map((item: any) => (
                      <li className={styles.listItem}>
                        {showLocationAndInstructor ? (
                          <PrimeInstanceCard
                            key={item.id}
                            name={item.name}
                            skill={skillNames}
                            type={type}
                            isCrVcCourse={isCrVcCourse}
                            format={item.format}
                            completionDate={item.completionDate}
                            enrollByDate={item.enrollByDate}
                            id={item.id}
                            price={training.price}
                            selectInstanceHandler={selectInstanceHandler}
                            locale={locale}
                            enrollment={item.enrollment}
                            showProgressBar={item.enrollment}
                            seatLimit={item.seatLimit}
                            seatsAvailable={item.seatsAvailable}
                            cardBgStyle={cardBgStyle}
                            extensionClickHandler={extensionClickHandler}
                            extension={loInstanceExtension}
                            instanceId={item.id}
                          />
                        ) : (
                          <PrimeInstanceCard
                            key={item.id}
                            name={item.name}
                            skill={skillNames}
                            type={type}
                            isCrVcCourse={isCrVcCourse}
                            format={item.format}
                            completionDate={item.completionDate}
                            enrollByDate={item.enrollByDate}
                            id={item.id}
                            price={training.price}
                            selectInstanceHandler={selectInstanceHandler}
                            locale={locale}
                            enrollment={item.enrollment}
                            showProgressBar={item.enrollment}
                            cardBgStyle={cardBgStyle}
                            extensionClickHandler={extensionClickHandler}
                            extension={loInstanceExtension}
                            instanceId={item.id}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </section>
        </div>
        {loInstanceExtension && extensionAppIframeUrl?.length ? (
          <ALMExtensionIframeDialog
            href={extensionAppIframeUrl}
            classes="extensionDialog"
            onClose={iframeCloseHandler}
            onProceed={iframeCloseHandler}
            action={InvocationType.LEARNER_ENROLL}
            width={`${loInstanceExtension.width}`}
            height={`${loInstanceExtension.height}`}
            extension={loInstanceExtension}
          ></ALMExtensionIframeDialog>
        ) : (
          ""
        )}
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
    } else if (resource.roomLocation) {
      location.add(resource.roomLocation);
    } else if (resource.location) {
      location.add(resource.location);
    }

    if (resource.instructorNames?.length) {
      resource.instructorNames.forEach(function (name) {
        instructorNames.add(name);
      });
    }
  });
  return [Array.from(location), Array.from(instructorNames)];
};

const sortList = (list: any[], sortParam: string, sortOrder: any) => {
  let listCopy = [...list];
  if (sortParam === "name") {
    return sortOrder
      ? listCopy.sort((a: any, b: any) =>
          b[sortParam].localeCompare(a[sortParam])
        )
      : listCopy.sort((a: any, b: any) =>
          a[sortParam].localeCompare(b[sortParam])
        );
  }

  if (sortParam === "location") {
    return sortOrder
      ? listCopy.sort((a: any, b: any) =>
          b[sortParam][0].localeCompare(a[sortParam][0])
        )
      : listCopy.sort((a: any, b: any) =>
          a[sortParam][0].localeCompare(b[sortParam][0])
        );
  }

  if (sortParam === "completionDate" || sortParam === "startDate") {
    return sortOrder
      ? listCopy.sort((a, b) => {
          const dateA = a[sortParam] ? new Date(a[sortParam]) : null;
          const dateB = b[sortParam] ? new Date(b[sortParam]) : null;
  
          if (dateA === null && dateB === null) {
            return 0;
          } else if (dateA === null) {
            return 1; 
          } else if (dateB === null) {
            return -1; 
          }
          return dateA.getTime() - dateB.getTime();
        })
      : listCopy.sort((a, b) => {
          const dateA = a[sortParam] ? new Date(a[sortParam]) : null;
          const dateB = b[sortParam] ? new Date(b[sortParam]) : null;
  
          if (dateA === null && dateB === null) {
            return 0;
          } else if (dateA === null) {
            return -1; 
          } else if (dateB === null) {
            return 1; 
          }
          return dateB.getTime() - dateA.getTime();
        });
  }

  if (sortParam === "completionDate" || sortParam === "startDate") {
    return sortOrder
      ? listCopy.sort((a, b) => {
          const dateA = a[sortParam] ? new Date(a[sortParam]) : null;
          const dateB = b[sortParam] ? new Date(b[sortParam]) : null;

          if (dateA === null && dateB === null) {
            return 0;
          } else if (dateA === null) {
            return 1;
          } else if (dateB === null) {
            return -1;
          }
          return dateA.getTime() - dateB.getTime();
        })
      : listCopy.sort((a, b) => {
          const dateA = a[sortParam] ? new Date(a[sortParam]) : null;
          const dateB = b[sortParam] ? new Date(b[sortParam]) : null;

          if (dateA === null && dateB === null) {
            return 0;
          } else if (dateA === null) {
            return -1;
          } else if (dateB === null) {
            return 1;
          }
          return dateB.getTime() - dateA.getTime();
        });
  }
};
