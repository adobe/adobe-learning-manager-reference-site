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

import { useEffect, useRef, useState } from "react";
import {
  CatalogLabelValueId,
  ComplianceLabelDetails,
  ComplianceLabelResponse,
  LabelValueDetails,
  LearningObjectItem,
  PrimeComplianceData,
  PrimeComplianceDonutStyles,
  PrimeComplianceEnrollmentData,
  PrimeLearningObjectInstanceEnrollment,
} from "../../models";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { ALL_DEADLINES, ONTRACK, OVERDUE, UPCOMING, Widget } from "../../utils/widgets/common";
import { splitStringIntoArray } from "../../utils/catalog";
import { GetTranslation } from "../../utils/translationService";
import { AlertType } from "../../common/Alert/AlertDialog";
import { useAlert } from "../../common/Alert/useAlert";

const COMPLIANCE_VIEWS = {
  COMPLIANCE: "COMPLIANCE",
  SESSIONS: "SESSIONS",
};

const COMPLIANCE_COLORS = {
  OVERDUE: "#F75C46",
  UPCOMING: "#FFA037",
  ONTRACK: "#F8D904",
};

const COMPLIANCE_LABEL = "COMPLIANCE";

const defaultDonutStyles: PrimeComplianceDonutStyles = {
  color: "",
  pathData: "",
  lineStart: { x: 0, y: 0 },
  lineEnd: { x: 0, y: 0 },
  slantingLineStart: { x: 0, y: 0 },
  slantingLineEnd: { x: 0, y: 0 },
  annotationPosition: { x: 0, y: 0 },
  tranformDirection: { x: null, y: null },
  isLeftSlice: false,
};

const initializeAllEnrollmentsData = (): PrimeComplianceData => ({
  name: ALL_DEADLINES,
  index: 0,
  count: 0,
  enrollmentIds: [],
  enrollmentList: {
    learningObjectInstanceEnrollmentList: [],
  },
});

const createEnrollmentData = (name: string, color: string): PrimeComplianceEnrollmentData => ({
  name,
  index: 0,
  count: 0,
  enrollmentIds: [],
  enrollmentList: {
    learningObjectInstanceEnrollmentList: [],
  },
  donutStyles: {
    ...defaultDonutStyles,
    color: color,
  },
});

const initializeComplianceData = (): Record<string, PrimeComplianceEnrollmentData> => ({
  OVERDUE: createEnrollmentData("OVERDUE", COMPLIANCE_COLORS.OVERDUE),
  UPCOMING: createEnrollmentData("UPCOMING", COMPLIANCE_COLORS.UPCOMING),
  ONTRACK: createEnrollmentData("ONTRACK", COMPLIANCE_COLORS.ONTRACK),
});

const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
const defaultCardsToShow = 2;
const THRESHOLD_LIMIT = 200;

const isLoading: Record<string, boolean> = {
  ALL_DEADLINES: false,
  OVERDUE: false,
  UPCOMING: false,
  ONTRACK: false,
};

export const useCompliance = (
  widget: Widget,
  doRefresh: boolean,
  isComplianceLabelEnabled: boolean,
  complianceLabelDefaultValueId = ""
) => {
  const [almAlert] = useAlert();
  const cpCatagorySelected = useRef(ALL_DEADLINES);

  const [isEnrollmentsOverLimit, setIsEnrollmentsOverLimit] = useState(""); //updates when compliance label changes
  const [areEnrollmentsAboveThreshold, setAreEnrollmentsAboveThreshold] = useState(""); //for total enrollment count
  const [noOfCards, setNoOfCards] = useState(
    widget.layoutAttributes?.cardsToShow || defaultCardsToShow
  );
  const selectedComplianceValueId = useRef("");
  const reloadDonutForNewCategory = useRef(false);

  const [allEnrollmentsData, setAllEnrollmentsData] = useState<PrimeComplianceData>(
    initializeAllEnrollmentsData
  );

  const [allEnrollmentsDataOriginal, setAllEnrollmentsDataOriginal] = useState<PrimeComplianceData>(
    initializeAllEnrollmentsData
  );

  const [complianceData, setComplianceData] =
    useState<Record<string, PrimeComplianceEnrollmentData>>(initializeComplianceData);

  const [complianceDataOriginal, setComplianceDataOriginal] =
    useState<Record<string, PrimeComplianceEnrollmentData>>(initializeComplianceData);

  const getSelectedCategoryData = (category: string) => {
    return category === OVERDUE
      ? complianceData.OVERDUE
      : category === UPCOMING
        ? complianceData.UPCOMING
        : complianceData.ONTRACK;
  };

  const [complianceLabelValueDetails, setComplianceLabelValueDetails] =
    useState<ComplianceLabelDetails>({
      name: "",
      type: "",
      values: [],
    });

  useEffect(() => {
    setNoOfCards(widget.layoutAttributes?.cardsToShow || defaultCardsToShow);
  }, [doRefresh]);

  // Initialisation
  useEffect(() => {
    const fetchData = async () => {
      await getCPrimeComplianceData();
    };
    fetchData();
  }, []);

  const fetchBatchEnrollmentsHelper = (data: PrimeComplianceData, type: string) => {
    const { enrollmentIds, count, enrollmentList } = data;
    const { learningObjectInstanceEnrollmentList } = enrollmentList;

    if (
      learningObjectInstanceEnrollmentList.length === 0 &&
      !isLoading[type] &&
      count &&
      count === enrollmentIds.length
    ) {
      try {
        fetchBatchEnrollments(type);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Getting first 10 enrollments for each category
  useEffect(() => {
    const loadComplianceLoDetails = async () => {
      try {
        await Promise.all([
          fetchBatchEnrollmentsHelper(complianceData.OVERDUE, OVERDUE),
          fetchBatchEnrollmentsHelper(complianceData.UPCOMING, UPCOMING),
          fetchBatchEnrollmentsHelper(complianceData.ONTRACK, ONTRACK),
        ]);
      } catch (error) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
      }
    };

    loadComplianceLoDetails();
  }, [complianceData]);

  // Getting first 10 enrollments for all deadlines
  useEffect(() => {
    const loadAllEnrollments = async () => {
      try {
        await fetchBatchEnrollmentsHelper(allEnrollmentsData, ALL_DEADLINES);
      } catch (error) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
      }
    };

    loadAllEnrollments();
  }, [allEnrollmentsData]);

  // Accumulate enrollments from all three categories to allEnrollmentsData
  useEffect(() => {
    const { OVERDUE, UPCOMING, ONTRACK } = complianceDataOriginal;

    const allEnrollmentsFetched =
      OVERDUE.enrollmentIds.length === OVERDUE.count &&
      UPCOMING.enrollmentIds.length === UPCOMING.count &&
      ONTRACK.enrollmentIds.length === ONTRACK.count;

    // Once all individual category enrollments are fetched, set allEnrollmentsData.enrollmentIds
    if (allEnrollmentsFetched) {
      setAllEnrollmentsDataOriginal(prevState => ({
        ...prevState,
        enrollmentIds: [
          ...OVERDUE.enrollmentIds,
          ...UPCOMING.enrollmentIds,
          ...ONTRACK.enrollmentIds,
        ],
      }));
    }
  }, [complianceDataOriginal]);

  useEffect(() => {
    const setComplianceDataForSelectedLabel = async () => {
      const count = allEnrollmentsDataOriginal.count;
      if (allEnrollmentsDataOriginal.enrollmentIds.length === count && count !== 0) {
        if (isComplianceLabelEnabled) {
          await getComplianceCategoryData();
          setDefaultLabelValue();
        }
        await setCPrimeComplianceDataBySelectedLabel();
      }
    };

    setComplianceDataForSelectedLabel();
  }, [allEnrollmentsDataOriginal]);

  // First call to get compliance data
  async function getCPrimeComplianceData() {
    const params: QueryParams = {};
    params["filter.loTypes"] = "course,learningProgram,certification";
    params["filter.hasDeadline"] = true;
    params["filter.completed"] = false;
    params["filter.states"] = "active";
    params["sort"] = "dueDate";
    params["page[limit]"] = 100;
    params["includeHierarchicalEnrollments"] = true;

    let response: any = await RestAdapter.get({
      url: `${getALMConfig().primeApiURL}/enrollments`,
      params: params,
    });
    let nextLink;
    try {
      const parsedResponse = JSON.parse(response);
      response = JSON.stringify(parsedResponse);
      nextLink = parsedResponse.links.next;
    } catch (error) {}
    let enrollmentList: PrimeLearningObjectInstanceEnrollment[] = JsonApiParse(
      response
      // WidgetType.COMPLIANCE
    ).learningObjectInstanceEnrollmentList;

    // fetching next 100 enrollments if present
    if (nextLink && nextLink !== "") {
      const newUrl = new URL(nextLink);
      const pageCursor = newUrl.searchParams.get("page[cursor]");
      if (pageCursor) {
        params["page[cursor]"] = pageCursor;
      }

      let nextResponse: any = await RestAdapter.get({
        url: `${getALMConfig().primeApiURL}/enrollments`,
        params: params,
      });
      try {
        const parsedResponse = JSON.parse(nextResponse);
        nextResponse = JSON.stringify(parsedResponse);
        nextLink = parsedResponse.links.next;
      } catch (error) {}

      const nextEnrollments: PrimeLearningObjectInstanceEnrollment[] =
        JsonApiParse(nextResponse).learningObjectInstanceEnrollmentList || [];

      enrollmentList = [...enrollmentList, ...nextEnrollments];
    }

    const areEnrollmentsMoreThan200 = nextLink ? "true" : "false";
    setAreEnrollmentsAboveThreshold(areEnrollmentsMoreThan200);

    let overdueCount = 0;
    let upcomingCount = 0;
    let onTrackCount = 0;
    const newComplianceData = { ...complianceDataOriginal };

    enrollmentList?.forEach((enrollment: PrimeLearningObjectInstanceEnrollment) => {
      const category = getDeadlineCategory(enrollment.completionDeadline);

      if (category === OVERDUE) {
        overdueCount++;
        newComplianceData.OVERDUE.enrollmentIds.push(enrollment.id);
      } else if (category === UPCOMING) {
        upcomingCount++;
        newComplianceData.UPCOMING.enrollmentIds.push(enrollment.id);
      } else {
        onTrackCount++;
        newComplianceData.ONTRACK.enrollmentIds.push(enrollment.id);
      }
    });

    // reverse order of completion deadline for overdue
    newComplianceData.OVERDUE.enrollmentIds.reverse();

    newComplianceData.OVERDUE.count = overdueCount;
    newComplianceData.UPCOMING.count = upcomingCount;
    newComplianceData.ONTRACK.count = onTrackCount;

    setComplianceDataOriginal(newComplianceData);
    setIsEnrollmentsOverLimit(areEnrollmentsMoreThan200);

    setAllEnrollmentsDataOriginal(prevState => ({
      ...prevState,
      count: enrollmentList ? enrollmentList.length : 0,
    }));
  }

  //////////////////////////// Compliance Category Labels /////////////////////////////

  // value.id  is in this format - "catalogLabel:3213_6953"
  function setDefaultLabelValue() {
    const defaultLabelValue = complianceLabelValueDetails.values.find(
      value => splitStringIntoArray(value.id, "_")[1] === complianceLabelDefaultValueId.toString()
    );
    if (defaultLabelValue) {
      selectedComplianceValueId.current = defaultLabelValue.id;
    }
  }

  async function handleComplianceLabelValueChange(key: string) {
    if (key === selectedComplianceValueId.current) {
      return;
    }
    selectedComplianceValueId.current = key;
    setCPrimeComplianceDataBySelectedLabel();
    reloadDonutForNewCategory.current = true;
  }

  function setCPrimeComplianceDataBySelectedLabel() {
    let newComplianceData = { ...complianceData };
    let newAllEnrollmentsData = { ...allEnrollmentsData };
    if (!selectedComplianceValueId.current) {
      newComplianceData = { ...complianceDataOriginal };
      newAllEnrollmentsData = { ...allEnrollmentsDataOriginal };
    } else {
      const selectedLabelValue = complianceLabelValueDetails.values.find(
        (value: LabelValueDetails) => value.id === selectedComplianceValueId.current
      );
      if (selectedLabelValue != null) {
        const loIds = selectedLabelValue.loIds;
        const categories = [OVERDUE, UPCOMING, ONTRACK];
        categories.forEach(category => {
          newComplianceData[category].enrollmentIds = complianceDataOriginal[
            category
          ].enrollmentIds.filter(enrollmentId =>
            loIds.includes(extractLearningObjectID(enrollmentId))
          );

          // Update counts
          newComplianceData[category].count = newComplianceData[category].enrollmentIds.length;
          newComplianceData[category].index = 0;
          newComplianceData[category].enrollmentList.learningObjectInstanceEnrollmentList = [];
        });

        newAllEnrollmentsData.enrollmentIds = categories.flatMap(
          category => newComplianceData[category].enrollmentIds
        );

        newAllEnrollmentsData.count = newAllEnrollmentsData.enrollmentIds.length;
        newAllEnrollmentsData.index = 0;
        newAllEnrollmentsData.enrollmentList.learningObjectInstanceEnrollmentList = [];
      }
    }

    setAllEnrollmentsData(newAllEnrollmentsData);
    setComplianceData(newComplianceData);
    const overLimitCondition =
      areEnrollmentsAboveThreshold && newAllEnrollmentsData.count >= THRESHOLD_LIMIT;
    setIsEnrollmentsOverLimit(overLimitCondition ? "true" : "false");
  }

  const extractLearningObjectID = (enrollmentId: string) => {
    return splitStringIntoArray(enrollmentId, "_")[0];
  };

  async function getComplianceCategoryData(): Promise<void> {
    try {
      const enrollmentIds = allEnrollmentsDataOriginal.enrollmentIds;
      const complianceLabelDataUrl = `${getALMConfig().primeApiURL}/preview/learningObjects`;
      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < enrollmentIds.length; i += chunkSize) {
        const chunk = enrollmentIds.slice(i, i + chunkSize).map(extractLearningObjectID);
        chunks.push(chunk);
      }
      for (const chunk of chunks) {
        const params: QueryParams = {
          ids: chunk.join(","),
          "enforcedFields[learningObjectPreview]": "catalogLabels",
        };
        const response = (await RestAdapter.get({
          url: complianceLabelDataUrl,
          params: params,
        })) as string;
        const typedResponse: ComplianceLabelResponse = JSON.parse(response);
        setComplianceCategoryData(typedResponse);
      }
    } catch (error) {
      console.error(`Error preparing compliance category data request: ${error}`);
    }
  }

  function setComplianceCategoryData(jsonResponse: ComplianceLabelResponse) {
    const data = jsonResponse.data;

    let newComplianceLabelValueDetails = { ...complianceLabelValueDetails };

    data.forEach((item: LearningObjectItem) => {
      const catalogLabels = item.attributes.catalogLabels;
      if (!catalogLabels || catalogLabels.length === 0) {
        return;
      }

      catalogLabels
        .filter(label => label.type === COMPLIANCE_LABEL)
        .forEach(label => {
          if (newComplianceLabelValueDetails.name.length === 0) {
            newComplianceLabelValueDetails.name = label.name;
            newComplianceLabelValueDetails.type = label.type;
          }

          label.catalogLabelValueIds.forEach((value: CatalogLabelValueId) => {
            const existingResultIndex = newComplianceLabelValueDetails.values.findIndex(
              (obj: LabelValueDetails) => obj.name === value.name
            );
            const loId = extractLearningObjectID(item.id);
            if (existingResultIndex !== -1) {
              newComplianceLabelValueDetails.values[existingResultIndex] = {
                ...newComplianceLabelValueDetails.values[existingResultIndex],
                loIds: [...newComplianceLabelValueDetails.values[existingResultIndex].loIds, loId],
              };
            } else {
              newComplianceLabelValueDetails.values.push({
                _transient: null,
                id: value.id,
                name: value.name,
                loIds: [loId],
              } as LabelValueDetails);
            }
          });
        });
    });

    setComplianceLabelValueDetails(newComplianceLabelValueDetails);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////

  // Fetching batch(10) enrollments of selected category and further adding list to compliance data
  async function fetchBatchEnrollments(category = "") {
    const tempCategory = category || cpCatagorySelected.current;
    isLoading[tempCategory] = true;

    const [enrollmentIds, idxToSet] = fetchEnrollmentIds(tempCategory);

    if (enrollmentIds.length === 0) {
      isLoading[tempCategory] = false;
      return;
    }

    const complianceResponse = await fetchEnrollments(enrollmentIds);
    const { learningObjectInstanceEnrollmentList } = complianceResponse;

    updateEnrollmentsData(tempCategory, learningObjectInstanceEnrollmentList, idxToSet);
    isLoading[tempCategory] = false;
  }

  // Fetching 10 enrollment ids for selected category and further making get enrollments call
  function fetchEnrollmentIds(category: string): [string[], number] {
    let enrollmentIds: string[];
    let startIdx: number;

    if (category === ALL_DEADLINES) {
      enrollmentIds = allEnrollmentsData.enrollmentIds;
      startIdx = allEnrollmentsData.index;
    } else {
      const data = getSelectedCategoryData(category);
      enrollmentIds = data.enrollmentIds;
      startIdx = data.index;
    }
    const endIdx = Math.min(startIdx + 10, enrollmentIds.length);
    return [enrollmentIds.slice(startIdx, endIdx), endIdx];
  }

  // API call to get batch(10) enrollments of selected category
  async function fetchEnrollments(enrollmentIds: string[]) {
    const params: QueryParams = {
      include: "learningObject",
      "page[limit]": 10,
      sort: "dueDate",
      ids: enrollmentIds,
    };

    let response: any = await RestAdapter.get({
      url: `${getALMConfig().primeApiURL}/enrollments`,
      params: params,
    });

    try {
      const parsedResponse = JSON.parse(response);
      response = JSON.stringify(parsedResponse);
    } catch (error) {}

    return JsonApiParse(response);
  }

  // Updating compliance data with fetched enrollments
  function updateEnrollmentsData(
    category: string,
    learningObjectInstanceEnrollmentList: any[],
    idxToSet: number
  ) {
    if (category === ALL_DEADLINES) {
      setAllEnrollmentsData(prevState => ({
        ...prevState,
        index: idxToSet,
        enrollmentList: {
          ...prevState.enrollmentList,
          learningObjectInstanceEnrollmentList: [
            ...prevState.enrollmentList.learningObjectInstanceEnrollmentList,
            ...learningObjectInstanceEnrollmentList,
          ],
        },
      }));
    } else {
      setComplianceData(prevState => ({
        ...prevState,
        [category]: {
          ...prevState[category],
          index: idxToSet,
          enrollmentList: {
            ...prevState[category].enrollmentList,
            learningObjectInstanceEnrollmentList: [
              ...prevState[category].enrollmentList.learningObjectInstanceEnrollmentList,
              ...learningObjectInstanceEnrollmentList,
            ],
          },
        },
      }));
    }
  }

  function handleScroll(event: any) {
    const scrollContainer = event.target;
    const scrollThreshold = 100;

    // Check if the scroll position is close to the bottom
    if (
      scrollContainer.scrollHeight - scrollContainer.scrollTop <=
        scrollContainer.clientHeight + scrollThreshold &&
      !isLoading[cpCatagorySelected.current]
    ) {
      // Load next batch on scroll
      fetchBatchEnrollments();
    }
  }

  function getDeadlineCategory(completionDate: string) {
    const completionDeadline = new Date(completionDate);
    const currentDate = new Date();
    const diff = (completionDeadline as never) - (currentDate as never);

    if (diff < 0) {
      return OVERDUE;
    } else if (diff <= thirtyDaysInMillis && diff >= 0) {
      return UPCOMING;
    } else {
      return ONTRACK;
    }
  }

  return {
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
    fetchBatchEnrollments,
    handleScroll,
    handleComplianceLabelValueChange,
    selectedComplianceValueId,
    reloadDonutForNewCategory,
  };
};
