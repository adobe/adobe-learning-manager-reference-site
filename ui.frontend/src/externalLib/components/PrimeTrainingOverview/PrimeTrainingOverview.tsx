import { InstanceBadge, Skill } from "../../models/common";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../models/PrimeModels";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const PrimeTrainingOverview: React.FC<{
  name: string;
  description: string;
  overview: string;
  richTextOverview: string;
  skills: Skill[];
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  instanceBadge: InstanceBadge;
}> = (props) => {
  const { training } = props;

  const subLos = training.subLOs;

  return (
    <>
      {subLos.map((subLo) => {
        const loType = subLo.loType;
        if (loType === COURSE) {
          return (
            <PrimeCourseItemContainer
              key={subLo.id}
              trainingId={subLo.id}
            ></PrimeCourseItemContainer>
          );
        } else if (loType === LEARNING_PROGRAM) {
          return (
            <PrimeLPItemContainer
              key={subLo.id}
              trainingId={subLo.id}
            ></PrimeLPItemContainer>
          );
        }
        return <></>;
      })}
    </>
  );
};

export default PrimeTrainingOverview;
