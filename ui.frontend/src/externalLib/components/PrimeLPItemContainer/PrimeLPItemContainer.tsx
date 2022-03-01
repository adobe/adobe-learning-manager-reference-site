import React, { useContext, useMemo } from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectResource,
  PrimeResource,
} from "../../models/PrimeModels";
import { useConfigContext } from "../../contextProviders";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import styles from "./PrimeLPItemContainer.module.css";
import { filterTrainingInstance } from "../../utils/hooks";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";

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
    instanceBadge,
  } = useTrainingPage(trainingId);

  if (isLoading) {
    return <span>Loading...</span>;
  }
  const subLos = training.subLOs;
  return (
    <ul>
    {subLos.map((subLo) => {
        // There will only be list of courses inside nested LP
        return <PrimeCourseItemContainer key={subLo.id} trainingId={subLo.id} ></PrimeCourseItemContainer>
       
    })}
    </ul>
  );
};


export default PrimeLPItemContainer;
