import { useRef } from "react";
import { useLoadMore } from "../../hooks/loadMore";
import { PrimeLearningObject } from "../../models/PrimeModels";
import { PrimeTrainingCard } from "../Catalog/PrimeTrainingCard";
import styles from "./PrimeTrainingsContainer.module.css";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
}> = ({ trainings, loadMoreTraining }) => {
  const elementRef = useRef(null);
  useLoadMore({
    items: trainings,
    callback: loadMoreTraining,
    elementRef,
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
      <div ref={elementRef}></div>
    </div>
  );
};

export default PrimeTrainingsContainer;
