import Calendar from "@spectrum-icons/workflow/Calendar";
import Clock from "@spectrum-icons/workflow/Clock";
import Link from "@spectrum-icons/workflow/Link";
import Location from "@spectrum-icons/workflow/Location";
import LockClosed from "@spectrum-icons/workflow/LockClosed";
import Seat from "@spectrum-icons/workflow/Seat";
import User from "@spectrum-icons/workflow/User";
import Visibility from "@spectrum-icons/workflow/Visibility";
import React from "react";
import { useIntl } from "react-intl";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeResource,
} from "../../../models/PrimeModels";
import {
  convertSecondsToTimeText,
  GetFormattedDate,
} from "../../../utils/dateTime";
import { getALMConfig, getALMObject } from "../../../utils/global";
import { useResource } from "../../../utils/hooks";
import {
  ACTIVITY_SVG,
  AUDIO_SVG,
  CLASSROOM_SVG,
  DOC_SVG,
  PDF_SVG,
  PPT_SVG,
  SCORM_SVG,
  VIDEO_SVG,
  VIRTUAL_CLASSROOM_SVG,
  XLS_SVG,
  CAPTIVATE_SVG,
  PRESENTER_SVG,
} from "../../../utils/inline_svg";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
} from "../../../utils/translationService";
import { formatMap } from "../../Catalog/PrimeTrainingCard/PrimeTrainingCard";
import styles from "./PrimeModuleItem.module.css";

const CLASSROOM = "Classroom";
const VIRTUAL_CLASSROOM = "Virtual Classroom";
const ELEARNING = "Elearning";

interface ActionMap {
  Classroom: string;
}
const moduleIconMap = {
  Classroom: CLASSROOM_SVG(),
  "Virtual Classroom": VIRTUAL_CLASSROOM_SVG(),
  Elearning: SCORM_SVG(),
  Activity: ACTIVITY_SVG(),
  VIDEO: VIDEO_SVG(),
  PPT: PPT_SVG(),
  DOC: DOC_SVG(),
  PDF: PDF_SVG(),
  XLS: XLS_SVG(),
  AUDIO: AUDIO_SVG(),
  CP:CAPTIVATE_SVG(),
  PR:PRESENTER_SVG(),
};

const PrimeModuleItem: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResource: PrimeLearningObjectResource;
  isPartOfLP?: boolean;
  isContent?: boolean;
}> = (props) => {
  const {
    training,
    trainingInstance,
    launchPlayerHandler,
    loResource,
    isPartOfLP,
    isContent,
  } = props;
  const { formatMessage } = useIntl();

  const config = getALMConfig();
  const locale = config.locale;

  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    locale
  );

  const resource = useResource(loResource, locale);
  const enrollment = training.enrollment;
  const isModulePreviewAble =
    (!enrollment || enrollment?.state === "PENDING_APPROVAL") &&
    loResource.previewEnabled;

  const isModuleLocked = (): boolean => {
    if (!isContent) {
      return false;
    }
    const id = loResource.id;

    if (
      training.prerequisiteLOs &&
      training.isPrerequisiteEnforced &&
      training.prerequisiteLOs.some(
        (prerequisiteLO) =>
          !prerequisiteLO.enrollment ||
          prerequisiteLO.enrollment.state !== "COMPLETED"
      )
    ) {
      return true;
    }

    if (training.isSubLoOrderEnforced) {
      for (const res of trainingInstance.loResources) {
        if (id === res.id) {
          break;
        }

        const loResourceGrades = enrollment
          ? enrollment.loResourceGrades
          : ([] as PrimeLearningObjectResourceGrade[]);
        const filteredResourceGrades = loResourceGrades.filter(
          (loResourceGrade) => loResourceGrade.id.search(loResource.id)
        );
        const loResourceGrade = filteredResourceGrades.length
          ? filteredResourceGrades[0]
          : ({} as PrimeLearningObjectResourceGrade);

        if (enrollment && loResourceGrades) {
          if (loResourceGrade && !loResourceGrade.hasPassed) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
    return false;
  };

  const isClassroomOrVC =
    loResource.resourceType === CLASSROOM ||
    loResource.resourceType === VIRTUAL_CLASSROOM;

  const isModuleClicable: boolean = enrollment
    ? enrollment.state != "PENDING_APPROVAL"
    : isModulePreviewAble;
 
  const isVC = loResource.resourceType === VIRTUAL_CLASSROOM;

  const isElearning = loResource.resourceType === ELEARNING;

  const hasSessionDetails =
    resource.dateStart && resource.completionDeadline ? true : false;

  const durationText = convertSecondsToTimeText(
    resource.authorDesiredDuration || resource.desiredDuration
  );

  const moduleIcon =
    moduleIconMap[resource.contentType as keyof ActionMap] || SCORM_SVG();

  const sessionsTemplate = getSessionsTemplate(
    styles,
    resource,
    isClassroomOrVC,
    hasSessionDetails,
    durationText,
    isVC,
    formatMessage
  );

  let descriptionTextHTML = getDescriptionTemplate(
    styles,
    description,
    overview,
    isClassroomOrVC,
    isElearning,
    hasSessionDetails
  );

  const itemClickHandler = () => {
    const enrollment = loResource?.learningObject?.enrollment;
    if (
      (enrollment && !isClassroomOrVC) ||
      (!enrollment &&
        loResource.previewEnabled &&
        getALMObject().isPrimeUserLoggedIn())
    ) {
      launchPlayerHandler({ id: training.id, moduleId: loResource.id });
    }
  };
  const keyDownHandler = (event: any) => {
    if (event.key === "Enter") {
      itemClickHandler();
    }
  };
  // const formatLabel = useMemo(() => {
  //   return loResource.resourceType && formatMap[loResource.resourceType]
  //     ? GetTranslation(`${formatMap[loResource.resourceType]}`, true)
  //     : "";
  // }, [loResource.resourceType]);
  const formatLabel =
    loResource.resourceType && formatMap[loResource.resourceType]
      ? GetTranslation(`${formatMap[loResource.resourceType]}`, true)
      : "";
  return (
    <li className={styles.container}>
      <div
        className={`${styles.headerContainer} ${
          isModuleClicable ? styles.cursor : ""
        }`}
        tabIndex={0}
        data-test={loResource.id}
        onClick={itemClickHandler}
        onKeyDown={keyDownHandler}
        role="button"
      >
        <div className={styles.icon} aria-hidden="true">
          {moduleIcon}
          {isModuleLocked() && (
            <span className={styles.moduleLocked}>
              <LockClosed aria-hidden="true" />
            </span>
          )}
        </div>
        <div className={styles.headerWrapper}>
          <div className={styles.titleContainer}>
            <span className={styles.title}>{name}</span>
            {isModulePreviewAble && (
              <span className={styles.previewable}>
                Preview <Visibility aria-hidden="true" />
              </span>
            )}
          </div>
          <div className={styles.resourceAndDuration}>
            <span className={styles.resourceType}>{formatLabel}</span>
            <span>{durationText}</span>
          </div>
        </div>
      </div>
      <div className={styles.wrapperContainer}>
        {descriptionTextHTML}
        {sessionsTemplate}
      </div>
    </li>
  );
};

const getDescriptionTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  description: string,
  overview: string,
  isClassroomOrVC: boolean,
  isElearning: boolean,
  hasSessionDetails: boolean
) => {
  if (isElearning) {
    return "";
  }
  if (isClassroomOrVC && !hasSessionDetails) {
    return (
      <div className={styles.moduleDescription}>
        No session details have been updated.
      </div>
    );
  }
  return description ? (
    <div className={styles.moduleDescription}>{description}</div>
  ) : (
    overview && (
      <div className={styles.moduleDescription}>
        hi {description || overview}
      </div>
    )
  );
};

const getSessionsTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  resource: PrimeResource,
  isClassroomOrVC: boolean,
  hasSessionDetails: boolean,
  durationText: string,
  isVC: boolean = false,
  formatMessage: Function
) => {
  if (!isClassroomOrVC || (isClassroomOrVC && !hasSessionDetails)) {
    return "";
  }
  const instructorNames = resource.instructorNames?.length
    ? resource.instructorNames.join(", ")
    : "Not Available";

  const timeInfo = getTimeInfo(resource, formatMessage);
  return (
    <div className={styles.metaDataContainer}>
      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <Calendar aria-hidden="true" />
        </div>
        <div className={styles.details}>
          <span>{timeInfo.dateText}</span>
          <span>{timeInfo.timeText}</span>
        </div>
      </div>

      {resource.seatLimit && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Seat aria-hidden="true" />
          </div>
          <div className={styles.details}>
            {formatMessage(
              { id: "alm.overview.seat.limit" },
              { 0: resource.seatLimit }
            )}
          </div>
        </div>
      )}

      {resource.location && !isVC && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Location aria-hidden="true" />
          </div>
          <div className={styles.details}>{resource.location}</div>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <User aria-hidden="true" />
        </div>
        <div className={styles.details}>{instructorNames}</div>
      </div>
      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <Clock aria-hidden="true" />
        </div>
        <div className={styles.details}>
          {formatMessage({ id: "alm.overview.duration" }, { 0: durationText })}
        </div>
      </div>

      {isVC && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Link aria-hidden="true" />
          </div>
          <a
            className={styles.details}
            href={resource.location}
            target="_blank"
            rel="noreferrer"
          >
            {GetTranslation("alm.overview.vc.url", true)}
          </a>
        </div>
      )}
    </div>
  );
};

const getTimeInfo = (
  resource: PrimeResource,
  formatMessage: Function
): { dateText: string; timeText: string } => {
  const { dateStart, completionDeadline } = resource;
  const { locale } = getALMConfig();
  let startDateObj = new Date(dateStart);
  let completionDateObj = new Date(completionDeadline);
  let dateText = "",
    timeText = "";
  if (
    startDateObj.toLocaleDateString() === completionDateObj.toLocaleDateString()
  ) {
    dateText = GetFormattedDate(dateStart, locale);
  } else {
    let startDate = GetFormattedDate(dateStart, locale);
    let endDate = GetFormattedDate(completionDeadline, locale);
    dateText = formatMessage(
      { id: "alm.overview.vc.date" },
      { 0: startDate, 1: endDate }
    );
  }
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  timeText = `(${startDateObj.toLocaleTimeString(
    locale,
    options
  )} - ${completionDateObj.toLocaleTimeString(locale, options)})`;
  return { dateText, timeText };
};

export default PrimeModuleItem;
