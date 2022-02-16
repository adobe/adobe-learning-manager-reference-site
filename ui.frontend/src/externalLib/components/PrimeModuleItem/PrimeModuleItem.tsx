import React, { useContext, useMemo } from "react";
import {
  PrimeLearningObjectResource,
  PrimeResource,
} from "../../models/PrimeModels";
import { useConfigContext } from "../../contextProviders";
import styles from "./PrimeModuleItem.module.css";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { convertSecondsToTimeText } from "../../utils/dateTime";

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
    loResource.resourceType == "Classroom" ||
    loResource.resourceType == "Virtual Classroom";

  const hasSessionDetails =
    resource.dateStart && resource.completionDeadline ? true : false;

  const durationText = convertSecondsToTimeText(
    resource.authorDesiredDuration || resource.desiredDuration
  );

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
        <div>{name}</div>
        <div className={styles.resourceAndDuration}>
          <span>{loResource.resourceType}</span>
          <span>{durationText}</span>
        </div>
      </div>
      <div className={styles.wrapperContainer}>
        {descriptionTextHTML}
        {sessionsTemplate}
      </div>
    </div>
  );
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
        <div className={styles.icon}>Icon</div>
        <div className={styles.details}>
          {resource.dateStart} - {resource.completionDeadline}
        </div>
      </div>

      {resource.seatLimit && (
        <div className={styles.metadata}>
          <div className={styles.icon}>Icon</div>
          <div className={styles.details}>{resource.seatLimit}</div>
        </div>
      )}

      {resource.location && (
        <div className={styles.metadata}>
          <div className={styles.icon}>Icon</div>
          <div className={styles.details}>{resource.location}</div>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.icon}>Icon</div>
        <div className={styles.details}>{instructorNames}</div>
      </div>
      <div className={styles.metadata}>
        <div className={styles.icon}>Icon</div>
        <div className={styles.details}>{durationText}</div>
      </div>
    </div>
  );
};

export default PrimeModuleItem;
