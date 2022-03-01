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
}> = (props) => {
  const { trainingId } = props;
  const {
    name,
    description,
    overview,
    richTextOverview,
    cardIconUrl,
    color,
    bannerUrl,
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
  const subLos = training.subLOs;
  return (
    <li className={styles.container}>
      <PrimeTrainingItemContainerHeader
        name={name}
        description={description}
        cardBgStyle={cardBgStyle}
        training={training}
        overview={overview}
        richTextOverview={richTextOverview}
      />
      <div className={styles.collapsibleContainer}>
        <Button variant="overBackground" isQuiet onPress={clickHandler}>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      {!isCollapsed && (
        <ul>
          {subLos.map((subLo) => {
            // There will only be list of courses inside nested LP
            return (
              <PrimeCourseItemContainer
                key={subLo.id}
                trainingId={subLo.id}
              ></PrimeCourseItemContainer>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default PrimeLPItemContainer;
