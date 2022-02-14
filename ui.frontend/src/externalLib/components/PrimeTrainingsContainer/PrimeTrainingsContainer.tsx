import { useLoadMore } from "../../hooks/loadMore";
import { PrimeLearningObject } from "../../models/PrimeModels";
import { PrimeTrainingCard } from "../PrimeTrainingCard";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
}> = ({ trainings, loadMoreTraining }) => {
  const [elementRef] = useLoadMore({
    trainings,
    callback: loadMoreTraining,
  });
  return (
    <>
      <div
        style={{
          margin: "10px",
          padding: "10px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {trainings?.map((training) => (
          <PrimeTrainingCard
            training={training}
            key={training.id}
          ></PrimeTrainingCard>
        ))}
      </div>
      <div ref={elementRef}>TO DO add Loading more..</div>
    </>
  );
};

export default PrimeTrainingsContainer;
