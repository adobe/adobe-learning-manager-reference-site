import { Button } from "@adobe/react-spectrum";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import React, { useState } from "react";
import { PrimeCourseOverview } from "..";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeCourseItemContainer.module.css";
const PrimeCourseItemContainer: React.FC<{
  trainingId: string;
}> = (props) => {
  const { trainingId } = props;
  const {
    name,
    description,
    overview,
    richTextOverview,
    skills,
    training,
    trainingInstance,
    isLoading,
    cardBgStyle,
    instanceBadge,
  } = useTrainingPage(trainingId);

  const [isCollapsed, setIsCollapsed] = useState(true);
  if (isLoading) {
    return <span></span>;
  }

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };

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
      />

      <div className={styles.collapsibleContainer}>
        <Button variant="overBackground" isQuiet onPress={clickHandler}>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      {!isCollapsed && (
        <PrimeCourseOverview
          description={description}
          overview={overview}
          richTextOverview={richTextOverview}
          skills={skills}
          training={training}
          trainingInstance={trainingInstance}
          instanceBadge={instanceBadge}
          showDuration={false}
          showNotes={false}
        />
      )}
    </li>
  );
};

export default PrimeCourseItemContainer;
