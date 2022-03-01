import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { InstanceBadge, Skill } from "../../models/common";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeLearningObject, PrimeLearningObjectInstance, PrimeLearningObjectResource } from "../../models/PrimeModels";
import styles from "./PrimeTrainingOverview.module.css";
import { useConfigContext } from "../../contextProviders/configContextProvider";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const CERTIFICATION = "certification";
const PrimeTrainingOverview: React.FC<{
  name: string,
  description: string;
  overview: string;
  richTextOverview: string;
  skills: Skill[];
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  instanceBadge: InstanceBadge;
}> = (props) => {
  const {
    name, 
    description,
    overview,
    richTextOverview,
    skills,
    training,
    trainingInstance,
    instanceBadge,
  } = props;

  const { locale } = useConfigContext();

  // const subLos = trainingInstance.subLoInstances.map(subLo => {
  //   return subLo.learningObject;
  // });

  const subLos = training.subLOs;

  return (
    <>
    {subLos.map((subLo) => {
      const loType = subLo.loType;
      if(loType === COURSE) {
        return <PrimeCourseItemContainer key={subLo.id} trainingId={subLo.id} ></PrimeCourseItemContainer>
       } else if (loType == LEARNING_PROGRAM) {
         return <PrimeLPItemContainer key={subLo.id} trainingId={subLo.id} ></PrimeLPItemContainer>
       
       }
    })}
    </>
  );
};

export default PrimeTrainingOverview;
