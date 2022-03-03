import React, { useMemo } from "react";
import { useConfigContext } from "../../contextProviders";
import {
  PrimeLearningObjectResource,
  PrimeResource,
} from "../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import {
  ACTIVITY_SVG,
  AUDIO_SVG,
  CALENDAR_SVG,
  CLASSROOM_SVG,
  CLOCK_SVG,
  DOC_SVG,
  PDF_SVG,
  PPT_SVG,
  SCORM_SVG,
  SEATS_SVG,
  USER_SVG,
  VENUE_SVG,
  VIDEO_SVG,
  VIRTUAL_CLASSROOM_SVG,
  XLS_SVG,
} from "../../utils/inline_svg";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import styles from "./PrimeModuleItem.module.css";

const CLASSROOM = "Classroom";
const VIRTUAL_CLASSROOM = "Virtual Classroom";
const ELEARNING = "Elearning";
const ACTIVITY = "Activity";
const VIDEO = "VIDEO";
const PPTX = "PPTX";
const DOC = "DOC";
const PDF = "PDF";
const XLS = "XLS";
const AUDIO = "AUDIO";

const PrimeModuleItem = (props: any) => {
  const loResource: PrimeLearningObjectResource = props.loResource;

  // loResource.learningObject.

  const launchPlayerHandler = props.launchPlayerHandler;
  const config = useConfigContext();
  const locale = config.locale;
  const trainingId = props.trainingId;

  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    locale
  );
  const resource = useMemo((): PrimeResource => {
    return (
      loResource.resources.filter((item) => item.locale === locale)[0] ||
      loResource.resources.filter((item) => item.locale === "en-US")[0] ||
      loResource.resources[0]
    );
  }, [loResource.resources, locale]);

  const isClassroomOrVC =
    loResource.resourceType === CLASSROOM ||
    loResource.resourceType === VIRTUAL_CLASSROOM;

  const isElearning = loResource.resourceType === ELEARNING;

  const hasSessionDetails =
    resource.dateStart && resource.completionDeadline ? true : false;

  const durationText = convertSecondsToTimeText(
    resource.authorDesiredDuration || resource.desiredDuration
  );

  const moduleIcon = getModuleIcon(resource.contentType);

  const sessionsTemplate = getSessionsTemplate(
    styles,
    resource,
    isClassroomOrVC,
    hasSessionDetails,
    durationText
  );

  let descriptionTextHTML = getDescriptionTemplate(
    styles,
    description,
    overview,
    isClassroomOrVC,
    isElearning,
    hasSessionDetails
  );

  return (
    <li className={styles.container}>
      <div
        className={styles.headerContainer}
        tabIndex={0}
        data-test={loResource.id}
        onClick={() =>
          launchPlayerHandler({ id: trainingId, moduleId: loResource.id })
        }
      >
        <div className={styles.icon}> {moduleIcon}</div>
        <div className={styles.headerWrapper}>
          <div>{name}</div>
          <div className={styles.resourceAndDuration}>
            <span>{loResource.resourceType}</span>
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

const getModuleIcon = (contentType: string) => {
  switch (contentType) {
    case CLASSROOM:
      return CLASSROOM_SVG();
    case VIRTUAL_CLASSROOM:
      return VIRTUAL_CLASSROOM_SVG();
    case ACTIVITY:
      return ACTIVITY_SVG();
    case VIDEO:
      return VIDEO_SVG();
    case AUDIO:
      return AUDIO_SVG();
    case PPTX:
      return PPT_SVG();
    case DOC:
      return DOC_SVG();
    case PDF:
      return PDF_SVG();
    case XLS:
      return XLS_SVG();
    default:
      return SCORM_SVG();
  }
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
  return (
    description ||
    (overview && (
      <div className={styles.moduleDescription}>{description || overview}</div>
    ))
  );
};

const getSessionsTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  resource: PrimeResource,
  isClassroomOrVC: boolean,
  hasSessionDetails: boolean,
  durationText: string
) => {
  if (!isClassroomOrVC || (isClassroomOrVC && !hasSessionDetails)) {
    return "";
  }
  const instructorNames = resource.instructorNames?.length
    ? resource.instructorNames.join(", ")
    : "Not Available";
  return (
    <div className={styles.metaDataContainer}>
      <div className={styles.metadata}>
        <div className={styles.icon}>{CALENDAR_SVG()}</div>
        <div className={styles.details}>
          {resource.dateStart} - {resource.completionDeadline}
        </div>
      </div>

      {resource.seatLimit && (
        <div className={styles.metadata}>
          <div className={styles.icon}>{SEATS_SVG()}</div>
          <div className={styles.details}>{resource.seatLimit}</div>
        </div>
      )}

      {resource.location && (
        <div className={styles.metadata}>
          <div className={styles.icon}>{VENUE_SVG()}</div>
          <div className={styles.details}>{resource.location}</div>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.icon}>{USER_SVG()}</div>
        <div className={styles.details}>{instructorNames}</div>
      </div>
      <div className={styles.metadata}>
        <div className={styles.icon}>{CLOCK_SVG()}</div>
        <div className={styles.details}>{durationText}</div>
      </div>
    </div>
  );
};

export default PrimeModuleItem;
