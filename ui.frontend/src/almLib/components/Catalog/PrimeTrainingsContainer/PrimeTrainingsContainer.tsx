/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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
