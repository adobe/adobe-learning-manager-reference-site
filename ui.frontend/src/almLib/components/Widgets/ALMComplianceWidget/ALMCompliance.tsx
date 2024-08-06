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
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import styles from "./ALMCompliance.module.css";

import {
  ALL_DEADLINES,
  CARD_HEIGHT,
  CARD_WIDTH_EXCLUDING_PADDING,
  DOUBLE_CARD_WIDTH_EXCLUDING_PADDING,
  ONTRACK,
  OVERDUE,
  UPCOMING,
  Widget,
  WIDGET_HEIGHT,
} from "../../../utils/widgets/common";

import { PrimeLearningObjectInstanceEnrollment } from "../../../models/PrimeModels";

import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import React from "react";
import { useCompliance } from "../../../hooks/compliance";
import { EMPTY_STATE_CARD, COMPLIANCE_MORE_ENROLLMENTS } from "../../../utils/inline_svg";
import { getDonutDimensions, GetFormattedDateForCompliance } from "../../../utils/widgets/utils";
import { GetTileColor, GetTileImageFromId } from "../../../utils/themes";
import { Divider, Item, Picker, StatusLight } from "@adobe/react-spectrum";
import { getALMObject } from "../../../utils/global";

export const COMPLIANCE_WIDGET_NAME = "compliance-widget";
const DETAIL_CARD_WIDTH_IN_DOUBLE_VIEW = 307;

const ALMCompliance: React.FC<{
  widget: Widget;
  doRefresh: boolean;
  isComplianceLabelEnabled: boolean;
  complianceLabelDefaultValueId: string;
}> = ({ widget, doRefresh, isComplianceLabelEnabled, complianceLabelDefaultValueId }) => {
  const {
    isEnrollmentsOverLimit,
    getDeadlineCategory,
    complianceData,
    COMPLIANCE_VIEWS,
    COMPLIANCE_COLORS,
    allEnrollmentsData,
    complianceLabelValueDetails,
    isLoading,
    getSelectedCategoryData,
    cpCatagorySelected,
    noOfCards,
    handleScroll,
    handleComplianceLabelValueChange,
    selectedComplianceValueId,
    reloadDonutForNewCategory,
  } = useCompliance(widget, doRefresh, isComplianceLabelEnabled, complianceLabelDefaultValueId);

  const { locale } = useIntl();
  // Number of cards to be displayed
  // compliance widget support 2 views

  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const [expandedSlice, setExpandedSlice] = useState<SVGPathElement | null>(null);

  const isDonutClickEventBound = useRef(false);

  const [singleComplianceView, setSingleComplianceView] = useState(COMPLIANCE_VIEWS.COMPLIANCE);
  const [doubleComplianceView, setDoubleComplianceView] = useState(COMPLIANCE_VIEWS.COMPLIANCE);

  function isSingleCompliance() {
    return noOfCards === 1;
  }

  //Compliance detial view template
  const [detailViewTemplate, setDetailViewTemplate] = useState<JSX.Element[]>([]);
  const totalWidgetWidth = isSingleCompliance()
    ? CARD_WIDTH_EXCLUDING_PADDING
    : DOUBLE_CARD_WIDTH_EXCLUDING_PADDING;

  useEffect(() => {
    // connected callback
    widget.attributes!.heading = GetTranslation("text.skipToCompliance");
    document.addEventListener("keydown", keydown);

    return () => {
      // disconnected callback
      document.removeEventListener("keydown", keydown);
    };
  }, []);

  function handleComplianceSliceClick(event: any) {
    const target = event.target;

    // Donut slice expand on click code below - new enhancement

    // if (target.classList.contains('compliance-slice')) {
    //   const dataName = target.getAttribute('data-name');
    //   showDetailView(event, dataName, true);
    //   let currDataName = '';

    //   //removing transform from current expanded slice
    //   if (expandedSlice) {
    //     currDataName = expandedSlice.getAttribute('data-name')!;
    //     expandedSlice.classList.add('smoothTransition');
    //     expandedSlice.removeAttribute('transform');
    //     expandedSlice.addEventListener('transitionend', () => {
    //       expandedSlice?.classList.remove('smoothTransition');
    //     });
    //     const element = querySelector(`.slice-text-${currDataName}`) as HTMLElement;
    //     if (element) {
    //       element.style.display = 'inline';
    //     }
    //     setExpandedSlice(null);
    //   }

    //   if (currDataName == dataName) {
    //     return;
    //   }

    //   const sliceTransition =
    //     getSelectedCategoryData(dataName).donutStyles.tranformDirection;

    //   //adding smooth transform to new selected slice
    //   target.classList.add('smoothTransition');

    //   setTimeout(() => {
    //     const transformValue = `translate(${sliceTransition.x}, ${sliceTransition.y}) scale(1.1)`;
    //     target.setAttribute('transform', transformValue);
    //   }, 0); // Use a small delay to ensure the class is applied before the transform
    //   target.addEventListener('transitionend', () => {
    //     target.classList.remove('smoothTransition');
    //   });

    //   setExpandedSlice(target);

    //   const element = querySelector(`.slice-text-${dataName}`) as HTMLElement;
    //   if (element) {
    //     element.style.display = 'none';
    //   }
    // }
  }

  function setDetailViewTabIndex(tabIndex: string) {
    querySelectorAll(".trainingLink").forEach((button: Element) => {
      button.setAttribute("tabIndex", tabIndex);
    });
  }

  function getAllNavigationLinksElement() {
    return querySelectorAll(".detailContainer .trainingLink");
  }

  function moveFocusToDetailViewFirstItem() {
    const firstElementOfEnrollmentList: any = getAllNavigationLinksElement()?.[0];
    if (firstElementOfEnrollmentList) {
      firstElementOfEnrollmentList.focus();
    }
  }

  function moveFocusToDetailViewLastItem() {
    const allLinks = getAllNavigationLinksElement();
    const lastElementOfEnrollmentList: any = allLinks?.[allLinks?.length - 1];

    if (lastElementOfEnrollmentList) {
      lastElementOfEnrollmentList.focus();
    }
  }

  function querySelectorAll(query: string) {
    return document.querySelectorAll(query);
  }

  function querySelector(query: string) {
    return document.querySelector(query);
  }

  function getActiveElement() {
    return document.activeElement;
  }

  function focusOnLastElement() {
    setTimeout(() => {
      if (lastFocusedElement.current) {
        const lastFocusedDiv = querySelector(
          `.${lastFocusedElement.current.classList[0]}`
        ) as HTMLElement;
        if (lastFocusedDiv) {
          lastFocusedDiv.focus();
          lastFocusedDiv.setAttribute("aria-pressed", "false");
        }
      }
    });
  }

  function keydown(event: any) {
    const allCourseLinks = getAllNavigationLinksElement();

    // When pressed back button in concise view
    if (event.key === "Enter" && getActiveElement()?.classList[0] === "loLink") {
      focusOnLastElement();
    } else if (event.key === "Escape") {
      focusOnLastElement();
      if (noOfCards === 1) {
        handleSessionsListBack();
      }
      if (noOfCards === 2) {
        setDetailViewTabIndex("-1");
      }
    } else if (
      event.shiftKey &&
      event.key === "Tab" &&
      getActiveElement() &&
      getActiveElement() === allCourseLinks?.[0]
    ) {
      event.preventDefault();
      event.stopPropagation();
      moveFocusToDetailViewLastItem();
    } else if (
      !event.shiftKey &&
      event.key === "Tab" &&
      getActiveElement() &&
      getActiveElement() === allCourseLinks?.[allCourseLinks.length - 1]
    ) {
      event.preventDefault();
      event.stopPropagation();
      moveFocusToDetailViewFirstItem();
    }
  }

  function scrollToTopOfDetailView(selector: string) {
    const element = querySelector(selector);

    if (element && element.scrollTop) {
      element.scrollTop = 0;
    }
  }

  const emptyCompliance = (emptyMessage: string) => {
    return (
      <div
        className={styles.emptyBody}
        data-automationid="compliance-empty-state"
        key="compliance-empty-state"
      >
        <div>{EMPTY_STATE_CARD()}</div>
        <div className={styles.emptyBodyText}>{emptyMessage}</div>
      </div>
    );
  };

  function sortOverdueList(enrollmentList: PrimeLearningObjectInstanceEnrollment[]) {
    const currentDate = new Date();
    const pastDates = enrollmentList.filter((enrollment: PrimeLearningObjectInstanceEnrollment) => {
      const completionDeadline = new Date(enrollment.completionDeadline);
      return completionDeadline < currentDate;
    });
    const sortedPastDates = pastDates.sort(
      (a: PrimeLearningObjectInstanceEnrollment, b: PrimeLearningObjectInstanceEnrollment) => {
        const dateA = new Date(a.completionDeadline);
        const dateB = new Date(b.completionDeadline);
        return dateB.getTime() - dateA.getTime();
      }
    );
    const futureDates = enrollmentList.filter(
      (enrollment: PrimeLearningObjectInstanceEnrollment) => {
        const completionDeadline = new Date(enrollment.completionDeadline);
        return completionDeadline >= currentDate;
      }
    );

    return [...sortedPastDates, ...futureDates];
  }

  function handleClickOnSessions(enrollment: PrimeLearningObjectInstanceEnrollment) {
    if (!widget?.attributes!.disableLinks) {
      getALMObject().navigateFromComplianceWidget(enrollment);
    }
  }

  useEffect(() => {
    generateDetailView();
  }, [allEnrollmentsData.enrollmentList, complianceData]);

  function generateDetailView() {
    const detailViewTemplate = [];

    let enrollemntsList: PrimeLearningObjectInstanceEnrollment[];

    if (cpCatagorySelected.current == ALL_DEADLINES) {
      enrollemntsList = allEnrollmentsData.enrollmentList.learningObjectInstanceEnrollmentList;
    } else {
      const category = getSelectedCategoryData(cpCatagorySelected.current);
      enrollemntsList = category.enrollmentList.learningObjectInstanceEnrollmentList;
    }

    if (!enrollemntsList || enrollemntsList.length == 0) {
      detailViewTemplate.push(emptyCompliance(GetTranslation("cpw.empty.detail.message")));
    }

    if (cpCatagorySelected.current == ALL_DEADLINES || cpCatagorySelected.current == OVERDUE) {
      enrollemntsList = sortOverdueList(enrollemntsList);
    }

    enrollemntsList?.forEach((enrollment: PrimeLearningObjectInstanceEnrollment, index: number) => {
      let imageUrl = enrollment.learningObject.imageUrl;
      let previewImageClass = styles.loImageImg;
      let previewImageContainerClass = "";
      const enrollmentSourceString = `${GetTranslation(
        `cpw.loType.${enrollment.learningObject.loType}`,
        true
      )} : ${GetTranslation(`cpw.training.${enrollment.enrollmentSource}`, true)}`;

      const deadlineCategory = getDeadlineCategory(enrollment.completionDeadline);
      const iconSvg = (
        <StatusLight
          UNSAFE_className={`${styles.statusIcon} ${styles[`${deadlineCategory.toLowerCase()}StatusIcon`]}`}
          variant="positive"
          data-automationid={`${deadlineCategory}-status-icon`}
        >
          {GetTranslation(`cpw.donut.${deadlineCategory.toLowerCase()}`, true)}
        </StatusLight>
      );

      if (!imageUrl) {
        imageUrl = GetTileImageFromId(enrollment.learningObject.id);
        previewImageClass = styles.loDefaultImg;
        previewImageContainerClass = "loDefaultImgContainer";
      }
      detailViewTemplate.push(
        <li
          className={styles.loDetail}
          key={`enrollment-${index}`}
          data-automationid={`enrollment-${index}`}
        >
          <span
            className={`${styles.loImageContainer} ${styles[previewImageContainerClass]}`}
            style={{
              backgroundColor: GetTileColor(enrollment.learningObject.id),
            }}
          >
            {imageUrl ? (
              <img
                className={previewImageClass}
                src={imageUrl}
                alt={GetTranslationReplaced(
                  "cw.aria.label.image.of.course",
                  enrollment.learningObject.localizedMetadata[0].name
                )}
              />
            ) : (
              ""
            )}
          </span>
          <span className={styles.loDescriptionContainer}>
            <span className={styles.courseDetails}>
              <button
                className={`${styles.loName} ${styles.overflowEllipsis} trainingLink`}
                data-automationid={enrollment.learningObject.localizedMetadata[0].name}
                onClick={() => handleClickOnSessions(enrollment)}
                onKeyDown={(event: any) => {
                  if (event.key === "Enter") {
                    handleClickOnSessions(enrollment);
                  }
                }}
                title={enrollment.learningObject.localizedMetadata[0].name}
                tabIndex={0}
              >
                {enrollment.learningObject.localizedMetadata[0].name}
              </button>
            </span>

            <span
              className={`${styles.overflowEllipsis} ${styles.courseDetails}`}
              data-automationid={`enrollment-source-${index.toString()}`}
            >
              <span
                className="enrollmentSource"
                title={enrollmentSourceString}
                data-automationid={`enrollment-source-${index.toString()}`}
              >
                {GetTranslation(`cpw.loType.${enrollment.learningObject.loType}`, true)} &middot;{" "}
                {GetTranslation(`cpw.training.${enrollment.enrollmentSource}`, true)}
              </span>
            </span>

            <span
              className={`${styles.courseDetails} ${styles.dueDateContainer}`}
              data-automationid={`dueDate-container-${index.toString()}`}
            >
              <span className={styles.enrollmentDueDate}>
                {GetTranslationsReplaced(
                  "cpw.due.text",
                  {
                    date: GetFormattedDateForCompliance(enrollment.completionDeadline, locale),
                  },
                  false
                )}
              </span>
              {iconSvg}
            </span>

            <span
              className={`${styles.courseDetails} ${styles.progressBarContainer}`}
              data-automationid={`progress-bar-container-${index.toString()}`}
            >
              {renderProgressBar(enrollment)}
            </span>
          </span>
        </li>
      );
    });

    setDetailViewTemplate(detailViewTemplate);
  }

  const renderProgressBar = (enrollment: PrimeLearningObjectInstanceEnrollment) => {
    return (
      <div
        className={styles.progressBar}
        data-automationid="cpw-progress-bar"
        aria-label={GetTranslationReplaced(
          "progessPercent",
          enrollment.progressPercent ? enrollment.progressPercent.toString() : "0"
        )}
        title={GetTranslationReplaced(
          "progessPercent",
          enrollment.progressPercent ? enrollment.progressPercent.toString() : "0"
        )}
      >
        <div
          className={styles.progressPercent}
          style={{ width: `${enrollment.progressPercent || 0}%` }}
        ></div>
      </div>
    );
  };

  function showDetailView(event: any, filter: string, donutClicked: boolean) {
    // for scroll handling call
    isLoading[filter] = false;

    setSingleComplianceView(
      noOfCards === 2 ? COMPLIANCE_VIEWS.COMPLIANCE : COMPLIANCE_VIEWS.SESSIONS
    );
    cpCatagorySelected.current = filter;

    const currentTarget = event.currentTarget;

    lastFocusedElement.current = currentTarget;

    currentTarget.setAttribute("tabIndex", "0");
    currentTarget.setAttribute("aria-pressed", "true");

    if (!donutClicked) {
      // For session view opened through buttons click
      // removing transform from current expanded slice
      if (expandedSlice) {
        expandedSlice.classList.add("smoothTransition");
        expandedSlice.removeAttribute("transform");
        expandedSlice.addEventListener("transitionend", () => {
          expandedSlice.classList.remove("smoothTransition");
        });
        const element = querySelector(
          `.slice-text-${expandedSlice.getAttribute("data-name")}`
        ) as HTMLElement;
        if (element) {
          element.style.display = "inline";
        }
        setExpandedSlice(null);
      }
    }

    scrollToTopOfDetailView(".trainingListContainer");

    generateDetailView();

    const intervalId = setInterval(() => {
      moveFocusToDetailViewFirstItem();
      setDetailViewTabIndex("0");
    }, 0);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 100);
  }

  function loadMyLearningPage() {
    if (!widget?.attributes!.disableLinks) {
      getALMObject().navigateToMyLearningPage();
    }
  }

  function handleSessionsListBack() {
    focusOnLastElement();
    setSingleComplianceView(COMPLIANCE_VIEWS.COMPLIANCE);
  }

  function renderMoreEnrollmentsState() {
    const showSessionListArrow = isSingleCompliance() ? (
      <button
        onClick={(e: any) => showDetailView(e, ALL_DEADLINES, false)}
        className={`${styles.sessionListViewButton} trainingLink`}
      >
        <div className={styles.arrow}></div>
      </button>
    ) : (
      ``
    );

    return (
      <div className={styles.moreEnrollments} data-automationid="view-more-enrollments">
        <div className={styles.moreEnrollmentsIcon}>{COMPLIANCE_MORE_ENROLLMENTS()}</div>
        <div
          className={styles.moreEnrollmentsText}
          data-automationid="compliance-more-enrollments-text"
        >
          <p className={styles.overflowEllipsis}>
            {GetTranslationsReplaced("cpw.more.enrollments.message", {
              count: allEnrollmentsData.count,
            })}
          </p>
          {showSessionListArrow}
        </div>
        <button
          className={`${styles.myLearning} trainingLink`}
          onClick={loadMyLearningPage}
          data-automationid="my-learning-button"
        >
          {GetTranslation("cpw.view.all.enrollments", true)}
        </button>
      </div>
    );
  }

  function polarToCartesian(radius: number, angle: number) {
    const radians = (angle - 90) * (Math.PI / 180);
    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;
    return { x, y };
  }

  function addDonutSvgPath() {
    // Donut chart is following OVERDUE -> UPCOMING -> ONTRACK ordering
    // Below calculation is only for above 3 mentioned categories

    const data = Object.values(complianceData);
    const total = data.reduce((sum, slice) => sum + slice.count, 0);
    let startAngle = 0;
    let endAngle = 0;
    let previousTextY: number | null = null;
    const MAX_TEXT_SPACING = 30;
    const SLANTING_LINE_LENGTH = 8;
    const TEXT_Y_OFFSET = 3.5;
    const TEXT_X_OFFSET = 6;
    const donutDimensions = getDonutDimensions(isComplianceLabelEnabled);
    const OUTER_RADIUS = donutDimensions.outerRadius; // Outer radius for the slice
    const INNER_RADIUS = donutDimensions.innerRadius; // Inner radius for the slice

    data.forEach(slice => {
      if (slice.count === 0) {
        slice.donutStyles.pathData = "";
        return;
      }

      // Slice PATH Calculations
      let pathData = "";
      endAngle = startAngle + (slice.count / total) * 360;

      const startOuter = polarToCartesian(OUTER_RADIUS, startAngle);
      const endOuter = polarToCartesian(OUTER_RADIUS, endAngle);
      const startInner = polarToCartesian(INNER_RADIUS, startAngle);
      const endInner = polarToCartesian(INNER_RADIUS, endAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      let midAngle;

      // Slice Drawing
      if (slice.count === total) {
        pathData = donutDimensions.fullDonutSvgPath;
        midAngle = 90;
      } else {
        pathData += `M ${startOuter.x} ${startOuter.y}`;
        pathData += `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`;
        pathData += `L ${endInner.x} ${endInner.y}`;
        pathData += `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`;
        pathData += "Z";
        midAngle = (startAngle + endAngle) / 2;
      }

      let isLeftSlice = midAngle > 180 && midAngle <= 360;
      let lineStart, lineEnd, slantingLineStart, slantingLineEnd, textX;

      const annotationText = new String(
        GetTranslation(`cpw.donut.${slice.name.toLowerCase()}`, true)
      );
      const annotationLength = annotationText.length;
      const lineLength =
        midAngle < 30 || midAngle > 330 || (midAngle < 210 && midAngle > 150)
          ? 40
          : annotationLength > 8
            ? 18 - annotationLength
            : 20;

      const isOverlapping = previousTextY && Math.abs(midAngle - previousTextY) <= MAX_TEXT_SPACING;

      // Annotation Positions
      if (isOverlapping) {
        // for overlapping annotations, if ordering is OVERDUE -> UPCOMING -> ONTRACK
        const increasedLength = 50;
        if (slice.name == ONTRACK) {
          // Case-1: Overdue overlapping with Ontrack => adjusting Ontrack position

          slantingLineStart = polarToCartesian(OUTER_RADIUS, midAngle);
          slantingLineEnd = {
            x: slantingLineStart.x,
            y: slantingLineStart.y - SLANTING_LINE_LENGTH,
          };
          lineStart = slantingLineEnd;

          slice.donutStyles.slantingLineStart = slantingLineStart;
          slice.donutStyles.slantingLineEnd = slantingLineEnd;
          isLeftSlice = false;
        } else {
          // Case-2: Upcoming overlapping with Overdue => adjusting previously calculated Overdue position

          // for overdue slice
          const overdueSlice = complianceData.OVERDUE;
          slantingLineStart = overdueSlice.donutStyles.lineStart;
          slantingLineEnd = {
            x: slantingLineStart.x,
            y: slantingLineStart.y - SLANTING_LINE_LENGTH,
          };

          overdueSlice.donutStyles.lineStart = slantingLineEnd;
          overdueSlice.donutStyles.lineEnd = {
            x: overdueSlice.donutStyles.lineStart.x - increasedLength,
            y: overdueSlice.donutStyles.lineStart.y,
          };

          overdueSlice.donutStyles.slantingLineStart = slantingLineStart;
          overdueSlice.donutStyles.slantingLineEnd = slantingLineEnd;
          overdueSlice.donutStyles.annotationPosition = {
            x: overdueSlice.donutStyles.slantingLineEnd.x - increasedLength - TEXT_X_OFFSET,
            y: overdueSlice.donutStyles.slantingLineEnd.y + TEXT_Y_OFFSET,
          };

          overdueSlice.donutStyles.isLeftSlice = true;

          //for upcoming slice
          lineStart = polarToCartesian(OUTER_RADIUS, midAngle);
        }

        lineEnd = {
          x: lineStart.x + lineLength,
          y: lineStart.y,
        };
        textX = lineEnd.x + TEXT_X_OFFSET;
      } else {
        lineStart = polarToCartesian(OUTER_RADIUS, midAngle);
        lineEnd = {
          x: isLeftSlice ? lineStart.x - lineLength : lineStart.x + lineLength,
          y: lineStart.y,
        };
        textX = isLeftSlice ? lineEnd.x - TEXT_X_OFFSET : lineEnd.x + TEXT_X_OFFSET;
      }

      const textY = lineEnd.y + TEXT_Y_OFFSET;

      slice.donutStyles.lineStart = lineStart;
      slice.donutStyles.lineEnd = lineEnd;
      slice.donutStyles.annotationPosition = {
        x: textX,
        y: textY,
      };
      slice.donutStyles.isLeftSlice = isLeftSlice;
      slice.donutStyles.pathData = pathData;
      slice.donutStyles.tranformDirection = polarToCartesian(5, midAngle);

      startAngle = endAngle;
      previousTextY = midAngle;
    });
  }

  const renderedSVG = useMemo(() => {
    const hasEmptyEnrollmentList = Object.values(complianceData).some(
      data =>
        data.enrollmentList.learningObjectInstanceEnrollmentList.length === 0 && data.count > 0
    );
    if (!hasEmptyEnrollmentList) {
      return renderComplianceDonut();
    }
  }, [complianceData, allEnrollmentsData]);

  function renderComplianceDonut() {
    const complianceDataObject = Object.values(complianceData);

    const emptyComplianceState = complianceDataObject.every(data => data.count === 0);
    const donutDimensions = getDonutDimensions(isComplianceLabelEnabled);

    return (
      <svg
        focusable="false"
        id="by-due"
        width="280"
        height={donutDimensions.svgHeight}
        aria-label={GetTranslation("cpw.donut.aria.label", true)}
        data-automationid="compliance-donut"
      >
        <g transform={`translate(145,${donutDimensions.transformY})`}>
          {emptyComplianceState ? (
            <path className={styles.emptyDonut} d={donutDimensions.fullDonutSvgPath}></path>
          ) : (
            complianceDataObject.map(data => {
              return data.count > 0 ? (
                <g
                  key={data.name}
                  data-automationid={`prime-compliance-${data.name}`}
                  onClick={(e: any) => showDetailView(e, data.name, true)}
                >
                  <g className={`slice-text-${data.name}`}>
                    <line
                      className={styles.donutLegends}
                      x1={data.donutStyles.slantingLineStart.x}
                      y1={data.donutStyles.slantingLineStart.y}
                      x2={data.donutStyles.slantingLineEnd.x}
                      y2={data.donutStyles.slantingLineEnd.y}
                    />
                    <line
                      className={styles.donutLegends}
                      x1={data.donutStyles.lineStart.x}
                      y1={data.donutStyles.lineStart.y}
                      x2={data.donutStyles.lineEnd.x}
                      y2={data.donutStyles.lineEnd.y}
                    />
                    <circle
                      cx={data.donutStyles.lineEnd.x}
                      cy={data.donutStyles.lineEnd.y}
                      r="3.5"
                      fill={data.donutStyles.color}
                    />
                    <text fontSize="10" textAnchor={data.donutStyles.isLeftSlice ? "end" : "start"}>
                      <tspan
                        x={data.donutStyles.annotationPosition.x}
                        y={data.donutStyles.annotationPosition.y}
                        dy="0"
                        fontWeight="bold"
                      >
                        {data.count}
                      </tspan>
                      <tspan
                        x={data.donutStyles.annotationPosition.x}
                        y={data.donutStyles.annotationPosition.y}
                        dy="1em"
                      >
                        {GetTranslation(`cpw.donut.${data.name.toLowerCase()}`, true)}
                      </tspan>
                    </text>
                  </g>
                  <path
                    className={styles.donutSlice}
                    data-name={data.name}
                    fill={data.donutStyles.color}
                    d={data.donutStyles.pathData}
                  ></path>
                </g>
              ) : (
                ""
              );
            })
          )}

          <text textAnchor="middle" className={styles.donutText}>
            <tspan x="0" dy="0">
              {GetTranslation("cpw.donut.total", true)}
            </tspan>
            <tspan x="0" dy="1.2em">
              {allEnrollmentsData.count}
            </tspan>
          </text>
        </g>
      </svg>
    );
  }

  function getClassName(elementCategory: string) {
    return `${styles.categoryButtonText} ${
      cpCatagorySelected.current === elementCategory && !isSingleCompliance()
        ? styles.selectedCategoryStyle
        : ""
    }`;
  }
  const getComplianceDropdown = () => {
    const dropdownOptions = [
      <Item key="">{GetTranslation("cpw.all.compliance.enrollments")}</Item>,
      ...complianceLabelValueDetails.values.map((value: any) => (
        <Item key={value.id} data-automationid={value.id}>
          {value.name}
        </Item>
      )),
    ];

    return (
      <Picker
        UNSAFE_className={styles.complianceDropdown}
        aria-label={GetTranslation("cpw.compliance.label.select.aria.label")}
        data-automationid="compliance-dropdown-select"
        onSelectionChange={(key: any) => handleComplianceLabelValueChange(key)}
        selectedKey={selectedComplianceValueId.current}
      >
        {dropdownOptions}
      </Picker>
    );
  };

  function renderComplianceView(containerWidth: number) {
    const complianceDataArray = Object.values(complianceData);
    const hasPathData =
      complianceDataArray.filter(slice => slice.donutStyles.pathData === "").length === 0;

    if (!hasPathData || reloadDonutForNewCategory.current) {
      addDonutSvgPath();
    }

    // Adding donut slice click event only if it hasn't been bound yet
    const interval = setInterval(() => {
      const donutDiv = querySelector(`.donut`);
      if (donutDiv && !isDonutClickEventBound.current) {
        donutDiv.addEventListener("click", handleComplianceSliceClick);
        clearInterval(interval);
        if (!isSingleCompliance()) {
          //not applicable for single card view
          isDonutClickEventBound.current = true;
        }
      }
    }, 200);

    return (
      <div
        className={styles.donutCardContainer}
        style={{ width: `${containerWidth}px`, height: `${CARD_HEIGHT}px` }}
        data-automationid="compliance-donut-container"
      >
        {isComplianceLabelEnabled && getComplianceDropdown()}
        {isEnrollmentsOverLimit === "" ? (
          ""
        ) : isEnrollmentsOverLimit === "true" ? (
          renderMoreEnrollmentsState()
        ) : (
          <>
            <div className={styles.donut} data-automationid="compliance-donut">
              {renderedSVG}
            </div>

            <div className={styles.categoryButtons} data-automationid="compliance-buttons">
              <button
                onClick={(e: any) => showDetailView(e, ALL_DEADLINES, false)}
                data-automationid={`${ALL_DEADLINES}-button`}
                className={`${ALL_DEADLINES}-button`}
              >
                <span className={getClassName(ALL_DEADLINES)}>
                  {GetTranslationsReplaced(
                    "cpw.all.message",
                    {
                      count: allEnrollmentsData.count,
                    },
                    false
                  )}
                </span>
                <span className={styles.rightArrow}></span>
              </button>

              <Divider UNSAFE_className={styles.categoriesDivider} />

              <button
                onClick={(e: any) => showDetailView(e, OVERDUE, false)}
                title={GetTranslation("cpw.overdue.legend.tooltip", true)}
                data-automationid={`${OVERDUE}-button`}
                className={`${OVERDUE}-button`}
              >
                <span
                  className={styles.categoryIcon}
                  style={{ background: COMPLIANCE_COLORS.OVERDUE }}
                ></span>

                <span className={getClassName(OVERDUE)}>
                  {GetTranslationsReplaced("cpw.overdue.message", {
                    count: complianceData.OVERDUE.count,
                  })}
                </span>
                <span className={styles.rightArrow}></span>
              </button>

              <button
                onClick={(e: any) => showDetailView(e, UPCOMING, false)}
                title={GetTranslation("cpw.upcoming.legend.tooltip", true)}
                data-automationid={`${UPCOMING}-button`}
                className={`${UPCOMING}-button`}
              >
                <span
                  className={styles.categoryIcon}
                  style={{ background: COMPLIANCE_COLORS.UPCOMING }}
                ></span>

                <span className={getClassName(UPCOMING)}>
                  {GetTranslationsReplaced(
                    "cpw.upcomingDeadline.message",
                    {
                      count: complianceData.UPCOMING.count,
                    },
                    false
                  )}
                </span>
                <span className={styles.rightArrow}></span>
              </button>

              <button
                onClick={(e: any) => showDetailView(e, ONTRACK, false)}
                title={GetTranslation("cpw.ontrack.legend.tooltip", true)}
                data-automationid={`${ONTRACK}-button`}
                className={`${ONTRACK}-button`}
              >
                <span
                  className={styles.categoryIcon}
                  style={{ background: COMPLIANCE_COLORS.ONTRACK }}
                ></span>

                <span className={getClassName(ONTRACK)}>
                  {GetTranslationsReplaced(
                    "cpw.ontrack.message",
                    {
                      count: complianceData.ONTRACK.count,
                    },
                    false
                  )}
                </span>
                <span className={styles.rightArrow}></span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderSessionsListView(containerWidth: number) {
    const enrollmentCount =
      cpCatagorySelected.current == ALL_DEADLINES
        ? allEnrollmentsData.count
        : getSelectedCategoryData(cpCatagorySelected.current).count;

    const enrollmentMessage =
      isEnrollmentsOverLimit == "true"
        ? GetTranslationsReplaced(`cpw.more.enrollments.count.message`, {
            count: enrollmentCount,
          })
        : GetTranslationsReplaced(`cpw.${cpCatagorySelected.current.toLowerCase()}.message`, {
            count: enrollmentCount,
          });

    const contentWidth = containerWidth - 6 - 16; // 6px and 16px for right and left padding

    return (
      <div
        className={`detailContainer ${styles.detailContainer}`}
        style={{ height: `${CARD_HEIGHT}px` }}
        data-automationid="enrollments-detail-card"
      >
        <div className={styles.detailHeader} style={{ width: `${contentWidth}px` }}>
          {isSingleCompliance() ? (
            <button
              className={`${styles.loLink} trainingLink loLink`}
              onClick={handleSessionsListBack}
              aria-label={GetTranslation("cpw.back.button.aria.label", true)}
              data-automationid="detail-card-backButton"
            >
              <div className={styles.leftArrow}></div>
            </button>
          ) : (
            ""
          )}
          <div
            className={`${styles.detailHeaderTitle} trainingLink`}
            data-automationid="category-count"
          >
            {enrollmentMessage}
          </div>
        </div>
        <ul
          className={`${styles.detailBody} trainingListContainer`}
          style={{ width: `${contentWidth}px` }}
          onScroll={handleScroll}
          data-automationid="enrollment-list"
        >
          {detailViewTemplate}
        </ul>
      </div>
    );
  }

  function renderSingleViewCompliance() {
    let viewToRender;

    switch (singleComplianceView) {
      case COMPLIANCE_VIEWS.COMPLIANCE:
        viewToRender = renderComplianceView(CARD_WIDTH_EXCLUDING_PADDING);
        break;
      case COMPLIANCE_VIEWS.SESSIONS:
        viewToRender = renderSessionsListView(CARD_WIDTH_EXCLUDING_PADDING);
        break;
    }
    return (
      <section
        className={styles.widget}
        role="application"
        aria-labelledby="id-compliance-header-title"
        style={{ width: `${totalWidgetWidth}px`, height: `${CARD_HEIGHT}px` }}
        data-automationid="compliance-card"
      >
        {viewToRender}
      </section>
    );
  }

  function renderDoubleViewCompliance() {
    let viewToRender;

    switch (doubleComplianceView) {
      case COMPLIANCE_VIEWS.COMPLIANCE:
        viewToRender = (
          <>
            {renderComplianceView(CARD_WIDTH_EXCLUDING_PADDING)}
            <Divider orientation="vertical" UNSAFE_className={styles.cardsDivider}></Divider>
            {renderSessionsListView(DETAIL_CARD_WIDTH_IN_DOUBLE_VIEW)}
          </>
        );
        break;
    }
    return (
      <section
        className={styles.widget}
        role="complementary"
        aria-labelledby="id-compliance-header-title"
        style={{ width: `${totalWidgetWidth}px`, height: `${CARD_HEIGHT}px` }}
        data-automationid="compliance-card"
      >
        {viewToRender}
      </section>
    );
  }

  const widgetTitle = GetTranslation("cpw.detail.header", true);

  return (
    <ALMErrorBoundary>
      <div
        className={styles.parentContainer}
        style={{ width: `${totalWidgetWidth}px`, height: `${WIDGET_HEIGHT}px` }}
        data-automationid="compliance-widget-container"
      >
        <h2
          className={styles.containerHeader}
          data-automationid="compliance-header"
          aria-labelledby={widgetTitle}
          title={widgetTitle}
          data-skip-link-target={widget.layoutAttributes?.id}
          tabIndex={0}
        >
          {widgetTitle}
        </h2>
        {isSingleCompliance() ? renderSingleViewCompliance() : renderDoubleViewCompliance()}
      </div>
    </ALMErrorBoundary>
  );
};

export default ALMCompliance;
