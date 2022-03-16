import { useRef } from "react";
import { useLoadMore } from "../../../hooks/loadMore";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeTrainingCard } from "../PrimeTrainingCard";
import styles from "./PrimeTrainingsContainer.module.css";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
  hasMoreItems: boolean;
}> = ({ trainings, loadMoreTraining, hasMoreItems }) => {
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
      <div ref={elementRef} id="load-more-trainings">
        {hasMoreItems ? <ALMLoader /> : ""}
      </div>
    </div>
  );
};

export default PrimeTrainingsContainer;
