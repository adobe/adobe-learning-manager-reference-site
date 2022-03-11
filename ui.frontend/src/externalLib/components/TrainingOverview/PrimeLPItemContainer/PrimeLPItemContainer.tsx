import { Button } from "@adobe/react-spectrum";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import React, { useMemo, useState } from "react";
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../../models";
import { getALMConfig } from "../../../utils/global";
import {
  filterTrainingInstance,
  useCardBackgroundStyle,
  useCardIcon,
} from "../../../utils/hooks";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeLPItemContainer.module.css";
const PrimeLPItemContainer: React.FC<{
  training: PrimeLearningObject;
  launchPlayerHandler: Function;
  isPartOfLP: boolean;
}> = (props) => {
  const { training, launchPlayerHandler, isPartOfLP = false } = props;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const { locale } = getALMConfig();

  const trainingInstance = filterTrainingInstance(training);
  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const { cardIconUrl, color } = useCardIcon(training);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };
  const subLos = training.subLOs;
  return (
    <li
      className={`${styles.container} ${isPartOfLP ? styles.isPartOfLP : ""}`}
    >
      <PrimeTrainingItemContainerHeader
        name={name}
        description={description}
        cardBgStyle={cardBgStyle}
        training={training}
        trainingInstance={trainingInstance}
        overview={overview}
        richTextOverview={richTextOverview}
        launchPlayerHandler={launchPlayerHandler}
        isPartOfLP={isPartOfLP}
      />
      <div className={styles.collapsibleContainer}>
        <Button variant="overBackground" isQuiet onPress={clickHandler}>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      {!isCollapsed && (
        <ul className={styles.lpList}>
          {subLos.map((subLo) => {
            // There will only be list of courses inside nested LP
            return (
              <div key={subLo.id} className={styles.lpListItemContainer}>
                <PrimeCourseItemContainer
                  training={subLo}
                  launchPlayerHandler={launchPlayerHandler}
                  isPartOfLP={isPartOfLP}
                ></PrimeCourseItemContainer>
              </div>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default PrimeLPItemContainer;
