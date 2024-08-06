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
import Alert from "@spectrum-icons/workflow/Alert";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useInstancePage } from "../../../hooks/instance/useInstancePage";
import { PrimeExtension, PrimeLearningObjectResource } from "../../../models/PrimeModels";
import {
  containsElement,
  containsSubstr,
  getALMAccount,
  getALMConfig,
  getALMObject,
  getALMUser,
  getPathParams,
  getTokenForNativeExtensions,
  isEnrolled,
  isExtensionAllowed,
  setTrainingsLayout,
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
  COMPLETION_DATE,
  COURSE,
  ENGLISH_LOCALE,
  LEARNING_PROGRAM,
  LIST_VIEW,
  LOCATION,
  TILE_VIEW,
  TRAINING_INSTANCE_ID_STR,
} from "../../../utils/constants";
import { getEnrollment, getLoId, getLoName, getBreadcrumbPath } from "../../../utils/hooks";
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
import { useAccount } from "../../../hooks/account/useAccount";
import { doesLPHaveActiveInstance } from "../../../utils/lo-utils";
import { canShowPrice } from "../../Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { useTrainingPage } from "../../../hooks";
import { useUserContext } from "../../../contextProviders/userContextProvider";

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

  const [viewType, setviewType] = useState(() => {
    return getALMObject().storage.getItem(TILE_VIEW) || LIST_VIEW;
  });

  const isListView = () => {
    return viewType === LIST_VIEW;
  };

  const { formatMessage } = useIntl();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
  const [list, setList] = useState([] as any[]);
  const [isAscendingOrder, setIsAscendingOrder] = useState(true);
  const [loInstanceExtension, setLoInstanceExtension] = useState<PrimeExtension | null>(null);

  const [extensionAppIframeUrl, setExtensionAppIframeUrl] = useState<string>("");
  const almObject = getALMObject();
  const locale = almObject.getALMConfig().locale || ENGLISH_LOCALE;
  const { account } = useAccount();
  const learnerHelpLinks = account.learnerHelpLinks;
  const adminLink = learnerHelpLinks && learnerHelpLinks[1]?.localizedHelpLink;
  const adminEmail = adminLink && (getPreferredLocalizedMetadata(adminLink, locale) as any).link;
  const {
    isLoading,
    training,
    name,
    overview,
    richTextOverview,
    cardBgStyle,
    listThumbnailBgStyle,
    activeInstances,
    selectInstanceHandler,
    getSummary,
  } = useInstancePage(trainingId);
  const { waitlistPosition } = useTrainingPage(trainingId);
  const { skillNames, type } = useTrainingCard(training);
  const showNoActiveInstanceMessage =
    training.loType === LEARNING_PROGRAM && !doesLPHaveActiveInstance(training);
  const areCrVcrModulesOnly = (loResources: PrimeLearningObjectResource[]): boolean => {
    return loResources?.every(loResource => isClassroomOrVC(loResource));
  };

  const hasCrVcModule =
    activeInstances[0] &&
    training.loType === COURSE &&
    (activeInstances[0].loResources?.filter(loResource => isClassroomOrVC(loResource))).length > 0;

  const showColumn = (columnName: string) => {
    const instances = list!.filter((item: any) => {
      return item[columnName]?.length > 0;
    });
    return instances.length > 0;
  };

  const showStartDateAndInstructor =
    training.loType === COURSE &&
    (training.loFormat === CLASSROOM ||
      training.loFormat === VIRTUAL_CLASSROOM ||
      (activeInstances?.[0]?.loResources && areCrVcrModulesOnly(activeInstances[0].loResources)) ||
      training.loFormat === BLENDED);

  const isCrVcCourse =
    training.loFormat === CLASSROOM ||
    training.loFormat === VIRTUAL_CLASSROOM ||
    (training.loType === COURSE &&
      activeInstances?.[0]?.loResources &&
      areCrVcrModulesOnly(activeInstances[0].loResources));

  useEffect(() => {
    if (activeInstances && activeInstances.length) {
      Promise.all(
        activeInstances.map(async instance => {
          let item: any = {};
          item.id = instance.id;
          item.name = getPreferredLocalizedMetadata(
            instance.localizedMetadata,
            contentLocale
          )?.name;
          item.format = training.loFormat;
          item.enrollment = getEnrollment(training, instance);
          item.enrollByDate = instance.enrollmentDeadline;

          item.completionDate = instance.completionDeadline;
          if (showStartDateAndInstructor) {
            let [location, instructorsName] = getInstanceLocationAndInstructorsName(
              instance.loResources,
              locale
            );
            item.instructorsName = instructorsName;
            item.location = location;
            item.startDate = getStartDateforInstance(instance.loResources, locale);

            for (const loResource of instance.loResources) {
              if (isClassroomOrVC(loResource)) {
                const instanceSummary = await getSummary(instance);
                const enrollmentCount = instanceSummary?.enrollmentCount;
                item.seatLimit = instanceSummary?.seatLimit;
                item.seatsAvailable =
                  item.seatLimit !== undefined ? item.seatLimit - (enrollmentCount || 0) : -1;
                break;
              }
            }
          }
          return item;
        })
      ).then(listArray => sortingInstanceList(listArray));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInstances.length, locale, training.loFormat]);
  useEffect(() => {
    if (isEnrolled(training, LEARNING_PROGRAM) && almObject.handleInstanceNavigationAfterEnroll) {
      return almObject.handleInstanceNavigationAfterEnroll();
    }
    const getLoInstanceExtension = async () => {
      const account = await getALMAccount();
      if (account) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_INSTANCE_ROW
        );

        extension && isExtensionAllowed(extension) && setLoInstanceExtension(extension);
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

  const getInstances = (arr: any, enrolled: boolean) => {
    return arr.filter((item: any) => {
      const value = enrolled ? item.enrollment : !item.enrollment;
      if (value) {
        return item;
      }
    });
  };

  const sortingInstanceList = (listArray: any[]) => {
    let instanceList = getInstances(listArray, true);
    instanceList.sort(comparatorByProgressPercent);
    let unenrolledInstanceList = getInstances(listArray, false);
    unenrolledInstanceList = sortList(unenrolledInstanceList, COMPLETION_DATE, false) as any;
    setList(instanceList.concat(unenrolledInstanceList));
  };

  const applySort = (sortParam: string) => {
    const sortedList = sortList(list, sortParam, isAscendingOrder);
    setList(sortedList as any[]);
    setIsAscendingOrder(prevState => !prevState);
  };

  if (isLoading) {
    return <ALMLoader classes={styles.loader} />;
  }

  const headerLabelId = () => {
    if (training.instanceSwitchEnabled) {
      return training.enrollment
        ? "alm.instance.switch.header.enrolled.label"
        : `alm.instance.switch.header.${training.loType}.label`;
    } else if (training.multienrollmentEnabled && training.enrollment) {
      return `alm.instance.header.${training.loType}.multienroll.label`;
    } else {
      return `alm.instance.header.${training.loType}.label`;
    }
  };

  const showParentBreadCrumbs = () => {
    const { parentPath, currentPath } = getBreadcrumbPath();

    if (parentPath.length === 0) {
      return;
    }
    return (
      <div className={styles.breadcrumbParent}>
        {parentPath.map((loDetails: string, index: number) => {
          const loName = decodeURI(getLoName(loDetails));
          let loId = getLoId(loDetails);
          let loInstanceId = "";
          const instanceIdPath = `/${TRAINING_INSTANCE_ID_STR}/`;
          if (containsSubstr(loId, instanceIdPath)) {
            const [id, instanceId] = loId.split(instanceIdPath);
            loId = id;
            loInstanceId = instanceId;
          }
          return (
            <React.Fragment key={`breadcrumb-${index}`}>
              <button
                className={styles.breadcrumbLink}
                onClick={() => almObject.navigateToTrainingOverviewPage(loId, loInstanceId)}
                title={loName}
              >
                {loName}
              </button>
              {index <= parentPath.length - 1 && (
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
      authToken: getTokenForNativeExtensions(),
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

  const getSkills = () => {
    const skills = training.skills || [];
    const skillList = [] as string[];
    skills.forEach(skill => {
      if (!containsElement(skillList, skill.skillLevel?.skill.name))
        skillList.push(skill.skillLevel?.skill.name);
    });
    return skillList.join(", ");
  };

  const getPrice = () => {
    return canShowPrice(training, account) ? training.price : undefined;
  };

  const handleNoInstanceAlertClick = (event: any) => {
    const elementId = event.target.id;
    if (!elementId) {
      return;
    }

    if (elementId === "mailLink") {
      window.location.href = `mailto:${adminEmail}`;
    } else if (elementId === "catalogLink") {
      almObject.navigateToCatalogPage();
    }
    return;
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.backgroundPage}>
          {!getALMConfig().hideBackButton && <ALMBackButton />}
          <section className={styles.pageContainerBackground}>
            <section className={styles.pageContainer}>
              <div className={styles.breadcrumbMobile}>{showParentBreadCrumbs()}</div>

              {/* Hidden in mobile */}

              <div className={styles.courseDetailsContainer}>
                <div className={styles.card} style={{ ...listThumbnailBgStyle }}>
                  <div className={styles.band}></div>
                </div>
                <div className={styles.loDetails}>
                  <h3
                    className={styles.title}
                    aria-label={`${GetTranslation(`alm.training.${training.loType}`, true)} ${name}`}
                    tabIndex={0}
                    data-skip="skip-target"
                  >
                    {name}
                  </h3>
                  <p className={styles.type}>
                    {GetTranslation(`alm.catalog.card.${training.loType}`, true)}
                  </p>
                  {(richTextOverview || overview) && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: richTextOverview || overview,
                      }}
                      className={`${styles.overview}`}
                    ></div>
                  )}
                  {training.skills?.length && (
                    <>
                      <p
                        className={styles.skills}
                      >{`${GetTranslation("alm.catalog.filter.skills.label", true)}: ${getSkills()}`}</p>
                      <p className={styles.type}></p>
                    </>
                  )}
                </div>
              </div>

              {/* Shown only in Mobile */}

              <h2 className={styles.instancePageHeading}>{training.localizedMetadata[0].name}</h2>

              {showNoActiveInstanceMessage ? (
                <section
                  className={styles.noInstanceAvailableContainer}
                  data-automationid={`${name}-no-active-instance`}
                >
                  <Alert
                    UNSAFE_className={styles.alertIcon}
                    aria-label={GetTranslation("text.alert")}
                  />
                  <div
                    className={styles.noInstanceAvailable}
                    dangerouslySetInnerHTML={{
                      __html: GetTranslationsReplaced(
                        "alm.msg.lp.no.active.instances",
                        {
                          email: adminEmail,
                          emailList: adminEmail,
                        },
                        true
                      ),
                    }}
                    onClick={handleNoInstanceAlertClick}
                  />
                </section>
              ) : (
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
              )}

              {!showNoActiveInstanceMessage && (
                <div className={styles.viewButtonBox}>
                  <button
                    className={viewType === LIST_VIEW ? styles.viewButtonShaded : styles.viewButton}
                    onClick={() => setTrainingsLayout(LIST_VIEW, setviewType)}
                    tabIndex={0}
                    aria-label={GetTranslation("alm.instance.listView", true)}
                  >
                    <ViewList />
                  </button>
                  <button
                    className={viewType === TILE_VIEW ? styles.viewButtonShaded : styles.viewButton}
                    onClick={() => setTrainingsLayout(TILE_VIEW, setviewType)}
                    tabIndex={0}
                    aria-label={GetTranslation("alm.instance.gridView", true)}
                    aria-pressed={viewType === TILE_VIEW}
                  >
                    <ClassicGridView />
                  </button>
                </div>
              )}

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
                      <div role="table" className={styles.instancesContainer}>
                        <div role="row" className={styles.instancesHeaderSection}>
                          {/* Instance Name Column */}
                          <div
                            role="columnheader"
                            className={`${styles.instanceNameWrapper} ${styles.commonHeader}`}
                          >
                            {GetTranslation("alm.instance.name", true)}
                            <span onClick={() => applySort("name")} className={styles.sortIcon}>
                              {SORT_ORDER_SVG()}
                            </span>
                          </div>

                          <div className={styles.middleSection}>
                            {showStartDateAndInstructor && (
                              // Starting date for CR/VCR Course
                              <div
                                role="columnheader"
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
                            )}
                            {showColumn(COMPLETION_DATE) && (
                              // Completion Deadline
                              <div
                                role="columnheader"
                                className={`${styles.completionDateWrapper} ${styles.commonHeader}`}
                              >
                                <>
                                  {formatMessage({
                                    id: "alm.instance.completeBy.label",
                                    defaultMessage: "Complete By",
                                  })}

                                  <span
                                    onClick={() => applySort(COMPLETION_DATE)}
                                    className={styles.sortIcon}
                                  >
                                    {SORT_ORDER_SVG()}
                                  </span>
                                </>
                              </div>
                            )}

                            {/* List of CR/VCR locations */}
                            {showColumn(LOCATION) && (
                              <div
                                role="columnheader"
                                className={`${styles.locationWrapper} ${styles.commonHeader}`}
                              >
                                {formatMessage({
                                  id: "alm.instance.location",
                                  defaultMessage: "Location(s)",
                                })}

                                <span
                                  onClick={() => applySort(LOCATION)}
                                  className={styles.sortIcon}
                                >
                                  {SORT_ORDER_SVG()}
                                </span>
                              </div>
                            )}

                            {/* Training Price */}
                            {canShowPrice(training, account) && (
                              <div
                                role="columnheader"
                                className={`${styles.priceWrapper} ${styles.commonHeader}`}
                              >
                                {formatMessage({
                                  id: "alm.instance.price",
                                  defaultMessage: "Price",
                                })}
                              </div>
                            )}
                          </div>
                          {/* View instance button */}
                          <div
                            role="columnheader"
                            className={`${styles.actionWrapper} ${styles.commonHeader}`}
                            style={{ alignItems: "center" }}
                          >
                            {formatMessage({
                              id: "alm.instance.actions",
                              defaultMessage: "Actions",
                            })}
                          </div>
                        </div>

                        {/* Instances list */}
                        {showStartDateAndInstructor ? (
                          <div className={styles.instanceList}>
                            {list!.map((item: any) => (
                              <PrimeInstanceItem
                                key={item.id}
                                showStartDateAndInstructor={true}
                                showLocation={showColumn(LOCATION)}
                                showCompletionDateColumn={showColumn(COMPLETION_DATE)}
                                name={item.name}
                                format={item.format}
                                startDate={item.startDate}
                                enrollByDate={item.enrollByDate}
                                completionDate={item.completionDate}
                                location={item.location}
                                instructorsName={item.instructorsName}
                                id={item.id}
                                selectInstanceHandler={selectInstanceHandler}
                                locale={locale}
                                price={getPrice()}
                                enrollment={item.enrollment}
                                showProgressBar={item.enrollment}
                                seatLimit={item.seatLimit}
                                seatsAvailable={item.seatsAvailable}
                                extensionClickHandler={extensionClickHandler}
                                extension={loInstanceExtension}
                                instanceId={item.id}
                                hasCrVcModule={hasCrVcModule}
                                waitlistPosition={waitlistPosition}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className={styles.instanceList}>
                            {list!.map((item: any) => (
                              <PrimeInstanceItem
                                key={item.id}
                                name={item.name}
                                showStartDateAndInstructor={false}
                                showLocation={false}
                                showCompletionDateColumn={showColumn(COMPLETION_DATE)}
                                format={item.format}
                                completionDate={item.completionDate}
                                enrollByDate={item.enrollByDate}
                                id={item.id}
                                price={getPrice()}
                                selectInstanceHandler={selectInstanceHandler}
                                locale={locale}
                                enrollment={item.enrollment}
                                showProgressBar={item.enrollment}
                                extensionClickHandler={extensionClickHandler}
                                extension={loInstanceExtension}
                                instanceId={item.id}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div>
                  {/* <section className={styles.pageContainer}> */}
                  <ul className={styles.primeTrainingsCards}>
                    {list!.map((item: any) => (
                      <li className={styles.listItem}>
                        {showStartDateAndInstructor ? (
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
                            price={getPrice()}
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
                            hasCrVcModule={hasCrVcModule}
                            waitlistPosition={waitlistPosition}
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
                            price={getPrice()}
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
  loResources?.forEach(loResource => {
    const resource = getResourceBasedOnLocale(loResource, locale);
    if (resource.dateStart) dateArray.push(new Date(resource.dateStart));
  });
  return dateArray.sort((a, b) => a - b)[0];
};

const isClassroomOrVC = (loResource: any) => {
  return loResource.resourceType === CLASSROOM || loResource.resourceType === VIRTUAL_CLASSROOM;
};

const getInstanceLocationAndInstructorsName = (
  loResources: PrimeLearningObjectResource[],
  locale: string
) => {
  let location = new Set();
  let instructorNames = new Set();
  loResources?.forEach(loResource => {
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
    } else if (resource.contentType !== VIRTUAL_CLASSROOM && resource.location) {
      // For VIRTUAL_CLASSROOM, location contains url always which must not be shown in instances page
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

const sort = (value1: any, value2: any, type?: string) => {
  if (!value1 && !value2) {
    return 0;
  }
  if (!value1) {
    return 1;
  }
  if (!value2) {
    return -1;
  }
  return type === "date" ? value1.getTime() - value2.getTime() : value2.localeCompare(value1);
};

const sortList = (list: any[], sortParam: string, sortOrder: any) => {
  let listCopy = [...list];
  if (sortParam === "name") {
    return sortOrder
      ? listCopy.sort((arr1, arr2) => arr2[sortParam].localeCompare(arr1[sortParam]))
      : listCopy.sort((arr1, arr2) => arr1[sortParam].localeCompare(arr2[sortParam]));
  }

  if (sortParam === LOCATION) {
    return sortOrder
      ? listCopy.sort((arr1, arr2) => {
          return sort(arr1[sortParam][0], arr2[sortParam][0]);
        })
      : listCopy.sort((arr1, arr2) => {
          return sort(arr2[sortParam][0], arr1[sortParam][0]);
        });
  }

  if (sortParam === COMPLETION_DATE || sortParam === "startDate") {
    return sortOrder
      ? listCopy.sort((arr1, arr2) => {
          const dateA = arr1[sortParam] ? new Date(arr1[sortParam]) : arr1[sortParam];
          const dateB = arr2[sortParam] ? new Date(arr2[sortParam]) : arr2[sortParam];
          return sort(dateA, dateB, "date");
        })
      : listCopy.sort((arr1, arr2) => {
          const dateA = arr1[sortParam] ? new Date(arr1[sortParam]) : arr1[sortParam];
          const dateB = arr2[sortParam] ? new Date(arr2[sortParam]) : arr2[sortParam];
          return sort(dateB, dateA, "date");
        });
  }
};
