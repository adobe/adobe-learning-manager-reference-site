import { Button } from "@adobe/react-spectrum";
import { useIntl } from "react-intl";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import { PrimeTrainingCard } from "../PrimeTrainingCard";
import styles from "./PrimeTrainingsContainer.module.css";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
  hasMoreItems: boolean;
}> = ({ trainings, loadMoreTraining, hasMoreItems }) => {
  const { formatMessage } = useIntl();
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
      {formatMessage({ id: "alm.catalog.no.result" })}
    </p>
  );
  return (
    <div className={styles.primeTrainingsContainer}>
      {listHtml}
      <div id="load-more-trainings" className={styles.loadMoreContainer}>
        {hasMoreItems ? (
          <Button
            variant="cta"
            isQuiet
            onPress={loadMoreTraining}
            UNSAFE_className={styles.loadMoreButton}
          >
            Load more
          </Button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PrimeTrainingsContainer;
