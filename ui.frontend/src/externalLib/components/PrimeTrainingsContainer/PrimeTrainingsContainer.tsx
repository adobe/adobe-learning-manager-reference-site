import { useLoadMore } from "../../hooks/loadMore";
import { PrimeLearningObject } from "../../models/PrimeModels";
import { PrimeTrainingCard } from "../PrimeTrainingCard";
import styles from "./PrimeTrainingsContainer.module.scss";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
}> = ({ trainings, loadMoreTraining }) => {
  const [elementRef] = useLoadMore({
    trainings,
    callback: loadMoreTraining,
  });
  return (
    <div className={styles.primeTrainingsContainer}>
      <ul className={styles.primeTrainingsList}>
        {trainings?.map((training) => (
          <PrimeTrainingCard
            training={training}
            key={training.id}
          ></PrimeTrainingCard>
        ))}
      </ul>
      <div ref={elementRef}>TO DO add Loading more..</div>
    </div>
  );
};

export default PrimeTrainingsContainer;
