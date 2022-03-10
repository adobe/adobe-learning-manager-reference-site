import { Button } from "@adobe/react-spectrum";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import React, { useState } from "react";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { filterLoReourcesBasedOnResourceType } from "../../utils/hooks";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeCourseItemContainer.module.css";
const PrimeCourseItemContainer: React.FC<{
  trainingId: string;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
}> = (props) => {
  const { trainingId, launchPlayerHandler, isPartOfLP = false } = props;
  const {
    name,
    description,
    overview,
    richTextOverview,
    training,
    trainingInstance,
    isLoading,
    cardBgStyle,
  } = useTrainingPage(trainingId);

  const [isCollapsed, setIsCollapsed] = useState(true);
  if (isLoading) {
    return <span></span>;
  }

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };

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
