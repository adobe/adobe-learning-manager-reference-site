import { Button } from "@adobe/react-spectrum";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import React, { useState } from "react";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeLPItemContainer.module.css";
const PrimeLPItemContainer: React.FC<{
  trainingId: string;
  launchPlayerHandler: Function;
  isPartOfLP: boolean;
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
                  trainingId={subLo.id}
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
