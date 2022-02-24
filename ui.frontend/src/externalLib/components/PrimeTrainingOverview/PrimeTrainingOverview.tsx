import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { InstanceBadge, Skill } from "../../models/common";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
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

  const subLos = trainingInstance.subLoInstances.map(subLo => {
    return subLo.learningObject;
  });

  return (
    <>
    {subLos.map((subLo) => {
      const loType = subLo.loType;
     
      //Although its guaranteed that all child LOs will be courses only, still explicitly adding this check. 
      if(loType === COURSE) {
        return <PrimeCourseItemContainer key={subLo.id} training={subLo} ></PrimeCourseItemContainer>
       }
    })}
    </>
  );
};

export default PrimeTrainingOverview;
