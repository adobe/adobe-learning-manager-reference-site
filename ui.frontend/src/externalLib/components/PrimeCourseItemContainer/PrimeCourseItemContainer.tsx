import React, { useContext, useMemo } from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectResource,
  PrimeResource,
} from "../../models/PrimeModels";
import { useConfigContext } from "../../contextProviders";
import styles from "./PrimeCourseItemContainer.module.css";
import { PrimeCourseOverview } from "..";
import { useLocalizedMetaData, useCardIcon, useSkills, useBadge, filterTrainingInstance } from "../../utils/hooks";

const PrimeCourseItemContainer: React.FC<{
  training: PrimeLearningObject;
}> = (props) => {

  const { training } = props;
  const config = useConfigContext();
  const locale = config.locale;

  const {
    name = "",
    description = "",
    overview = "",
    richTextOverview = "",
  } = useLocalizedMetaData(training,locale);

  const { cardIconUrl, color, bannerUrl } = useCardIcon(training);
  const skills =  useSkills(training);
  const trainingInstance = filterTrainingInstance(training);
  const instanceBadge = useBadge(trainingInstance);
  
  return (
    <li className={styles.container}>
      <PrimeCourseOverview
        description={description}
        overview={overview}
        richTextOverview={richTextOverview}
        skills={skills}
        training={training}
        trainingInstance={trainingInstance}
        instanceBadge={instanceBadge}
      />
      {/* <div className={styles.headerContainer} tabIndex={0}>
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
      </div> */}
    </li>
  );
};


export default PrimeCourseItemContainer;
