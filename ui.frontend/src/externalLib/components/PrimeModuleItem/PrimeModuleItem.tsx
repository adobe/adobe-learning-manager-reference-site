import React, { useContext, useMemo } from "react";
import {
  PrimeLearningObjectResource,
  PrimeResource,
} from "../../models/PrimeModels";
import { useConfigContext } from "../../contextProviders";
import styles from "./PrimeModuleItem.module.css";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";

const PrimeModuleItem = (props: any) => {
  const loResource: PrimeLearningObjectResource = props.loResource;
  const config = useConfigContext();
  const locale = config.locale;
  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    locale
  );

  const descriptionTextHTML = description && (
    <div className={styles.primeModuleDescription}>{description}</div>
  );

  const resource = useMemo((): PrimeResource => {
    return (
      loResource.resources.filter((item) => item.locale == locale)[0] ||
      loResource.resources.filter((item) => item.locale == "en-US")[0] ||
      loResource.resources[0]
    );
  }, [loResource.resources, locale]);

  return (
    <div className={styles.primeModuleContainer}>
      <div className={styles.headerContainer}>
        <div>{name}</div>
        <div>{loResource.resourceType}</div>
      </div>
      <div className={styles.primeModuleWrapperContainer}>
        {" "}
        {descriptionTextHTML}
        <div className={styles.primeModuleMetaDataContainer}>
          <div className={styles.primeModuleMetadata}>
            <div className={styles.primeModuleIcon}>Icon</div>
            <div className={styles.primeModuleDetails}>
              {resource.dateStart} - {resource.completionDeadline}
            </div>
          </div>
          <div className={styles.primeModuleMetadata}>
            <div className={styles.primeModuleIcon}>Icon</div>
            <div className={styles.primeModuleDetails}>
              {resource.seatLimit}
            </div>
          </div>
          <div className={styles.primeModuleMetadata}>
            <div className={styles.primeModuleIcon}>Icon</div>
  <div className={styles.primeModuleDetails}>{resource.location}</div>
          </div>
          <div className={styles.primeModuleMetadata}>
            <div className={styles.primeModuleIcon}>Icon</div>
  <div className={styles.primeModuleDetails}>{resource.instructorNames?.join(", ")}</div>
          </div>
          <div className={styles.primeModuleMetadata}>
            <div className={styles.primeModuleIcon}>Icon</div>
            <div className={styles.primeModuleDetails}>{resource.authorDesiredDuration || resource.desiredDuration}</div>
          </div>
          <div className={styles.primeModuleMetadata}>
            <div className={styles.primeModuleIcon}>Icon</div>
            <div className={styles.primeModuleDetails}>Description</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeModuleItem;
