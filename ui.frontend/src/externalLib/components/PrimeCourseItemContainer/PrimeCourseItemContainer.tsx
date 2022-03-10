import { Button } from "@adobe/react-spectrum";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import React, { useMemo, useState } from "react";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeLearningObject, PrimeLocalizationMetadata } from "../../models";
import { getALMConfig } from "../../utils/global";
import {
  filterLoReourcesBasedOnResourceType,
  filterTrainingInstance,
  useCardBackgroundStyle,
  useCardIcon,
} from "../../utils/hooks";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeCourseItemContainer.module.css";
const PrimeCourseItemContainer: React.FC<{
  training: PrimeLearningObject;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
}> = (props) => {
  const { training, launchPlayerHandler, isPartOfLP = false } = props;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const { locale } = getALMConfig();

  const trainingInstance = filterTrainingInstance(training);
  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const { cardIconUrl, color } = useCardIcon(training);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);

  const noOfModules = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Content"
  ).length;

  return (
    <li className={styles.container}>
      <PrimeTrainingItemContainerHeader
        name={name}
        description={description}
        overview={overview}
        richTextOverview={richTextOverview}
        cardBgStyle={cardBgStyle}
        training={training}
        trainingInstance={trainingInstance}
        launchPlayerHandler={launchPlayerHandler}
        isPartOfLP={isPartOfLP}
      />
      {!isCollapsed && (
        <PrimeCourseOverview
          training={training}
          trainingInstance={trainingInstance}
          showDuration={false}
          showNotes={false}
          launchPlayerHandler={launchPlayerHandler}
          isPartOfLP={isPartOfLP}
        />
      )}

      <div className={styles.collapsibleContainer}>
        <Button variant="overBackground" isQuiet onPress={clickHandler}>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
        {noOfModules > 0 && (
          <span className={styles.count}>{noOfModules} module(s)</span>
        )}
      </div>
    </li>
  );
};

export default PrimeCourseItemContainer;
