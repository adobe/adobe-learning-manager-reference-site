import { PrimeLearningObject } from "../../models/PrimeModels";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const PrimeTrainingOverview: React.FC<{
  // name: string;
  // description: string;
  // overview: string;
  // richTextOverview: string;
  // skills: Skill[];
  trainings: PrimeLearningObject[];
  // trainingInstance: PrimeLearningObjectInstance;
  // instanceBadge: InstanceBadge;
}> = (props) => {
  const { trainings } = props;

  //const subLos = training.subLOs;

  return (
    <>
      {trainings.map((trainings) => {
        const loType = trainings.loType;
        if (loType === COURSE) {
          return (
            <PrimeCourseItemContainer
              key={trainings.id}
              trainingId={trainings.id}
            ></PrimeCourseItemContainer>
          );
        } else if (loType === LEARNING_PROGRAM) {
          return (
            <PrimeLPItemContainer
              key={trainings.id}
              trainingId={trainings.id}
            ></PrimeLPItemContainer>
          );
        }
        return <></>;
      })}
    </>
  );
};

export default PrimeTrainingOverview;
