import { PrimeLearningObject } from "../../models/PrimeModels";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const PrimeTrainingOverview: React.FC<{
  trainings: PrimeLearningObject[];
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
}> = (props) => {
  const { trainings, launchPlayerHandler, isPartOfLP = false } = props;
  return (
    <>
      {trainings.map((trainings) => {
        const loType = trainings.loType;
        if (loType === COURSE) {
          return (
            <PrimeCourseItemContainer
              key={trainings.id}
              trainingId={trainings.id}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
            ></PrimeCourseItemContainer>
          );
        } else if (loType === LEARNING_PROGRAM) {
          return (
            <PrimeLPItemContainer
              key={trainings.id}
              trainingId={trainings.id}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
            ></PrimeLPItemContainer>
          );
        }
        return <></>;
      })}
    </>
  );
};

export default PrimeTrainingOverview;
