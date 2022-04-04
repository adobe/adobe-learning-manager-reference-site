import { PrimeLearningObject } from "../../../models/PrimeModels";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const PrimeTrainingOverview: React.FC<{
  trainings: PrimeLearningObject[];
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  showMandatoryLabel?: boolean;
}> = (props) => {
  const {
    trainings,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
  } = props;
  return (
    <>
      {trainings.map((training) => {
        const loType = training.loType;
        if (loType === COURSE) {
          return (
            <PrimeCourseItemContainer
              key={training.id}
              training={training}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              showMandatoryLabel={showMandatoryLabel}
            ></PrimeCourseItemContainer>
          );
        } else if (loType === LEARNING_PROGRAM) {
          return (
            <PrimeLPItemContainer
              key={training.id}
              training={training}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              showMandatoryLabel={showMandatoryLabel}
            ></PrimeLPItemContainer>
          );
        }
        return <></>;
      })}
    </>
  );
};

export default PrimeTrainingOverview;
