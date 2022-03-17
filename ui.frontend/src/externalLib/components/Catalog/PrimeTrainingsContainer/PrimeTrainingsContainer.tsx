import { useRef } from "react";
import { useIntl } from "react-intl";
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
  const { formatMessage } = useIntl();
  useLoadMore({
    items: trainings,
    callback: loadMoreTraining,
    elementRef,
  });
  const listHtml = trainings?.length ? (
    <ul className={styles.primeTrainingsList}>
      {trainings?.map((training) => (
        <PrimeTrainingCard
          training={training}
          key={training.id}
        ></PrimeTrainingCard>
      ))}
    </ul>
  ) : (
    <p className={styles.noResults}>
      {formatMessage({ id: "prime.catalog.no.result" })}
    </p>
  );
  return (
    <div className={styles.primeTrainingsContainer}>
      {listHtml}
      <div ref={elementRef} id="load-more-trainings">
        {hasMoreItems ? <ALMLoader /> : ""}
      </div>
    </div>
  );
};

export default PrimeTrainingsContainer;
