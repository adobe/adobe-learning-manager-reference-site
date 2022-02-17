import React, { useContext, useMemo } from "react";
import {
  PrimeLearningObjectResource,
  PrimeResource,
} from "../../models/PrimeModels";
import { useConfigContext } from "../../contextProviders";
import styles from "./PrimeModuleItem.module.css";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import {
  ACTIVITY_SVG,
  CAPTIVATE_SVG,
  DOC_SVG,
  HTML_SVG,
  PDF_SVG,
  PPT_SVG,
  PRESENTER_SVG,
  SCORM_SVG,
  AUDIO_SVG,
  URL_SVG,
  VIDEO_SVG,
  XLS_SVG,
  REJECT_SVG,
  CALENDAR_SVG,
  CLOCK_SVG,
  LINK_SVG,
  SEATS_SVG,
  VENUE_SVG,
  SKILLS_SVG,
  MULTILINGUAL_SVG,
  DEFAULT_USER_SVG,
  VIRTUAL_CLASSROOM_SVG,
  CLASSROOM_SVG,
  USER_SVG,
} from "../../utils/inline_svg";

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
  const config = useConfigContext();
  const locale = config.locale;
  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    locale
  );
  const resource = useMemo((): PrimeResource => {
    return (
      loResource.resources.filter((item) => item.locale == locale)[0] ||
      loResource.resources.filter((item) => item.locale == "en-US")[0] ||
      loResource.resources[0]
    );
  }, [loResource.resources, locale]);

  const isClassroomOrVC =
    loResource.resourceType == CLASSROOM ||
    loResource.resourceType == VIRTUAL_CLASSROOM;

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
    isClassroomOrVC,
    hasSessionDetails
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
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
    </div>
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
  isClassroomOrVC: boolean,
  hasSessionDetails: boolean
) => {
  if (isClassroomOrVC && !hasSessionDetails) {
    return (
      <div className={styles.moduleDescription}>
        No session details have been updated.
      </div>
    );
  }
  return (
    description && <div className={styles.moduleDescription}>{description}</div>
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
