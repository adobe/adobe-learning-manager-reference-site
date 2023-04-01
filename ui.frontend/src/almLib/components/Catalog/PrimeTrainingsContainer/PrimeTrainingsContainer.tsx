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
import { useState } from "react";
import { useIntl } from "react-intl";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import { LIST_VIEW, TILE_VIEW } from "../../../utils/constants";
import { PrimeTrainingCard } from "../PrimeTrainingCard";
import { PrimeTrainingList } from "../PrimeTrainingList";
import ViewList from "@spectrum-icons/workflow/ViewList";
import ClassicGridView from "@spectrum-icons/workflow/ClassicGridView";

import styles from "./PrimeTrainingsContainer.module.css";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
  hasMoreItems: boolean;
  guest?: boolean;
  signUpURL?: string;
  almDomain?: string;
}> = ({
  trainings,
  loadMoreTraining,
  hasMoreItems,
  guest,
  signUpURL,
  almDomain,
}) => {
  const { formatMessage } = useIntl();

  const setInitialView = () => {
    return window.localStorage.getItem("view") || TILE_VIEW;
  };

  const isListView = () => {
    return view === LIST_VIEW;
  };

  const [view, setView] = useState(setInitialView());

  const listHtml = trainings?.length ? (
    <ul
      className={
        isListView() ? styles.primeTrainingsList : styles.primeTrainingsCards
      }
    >
      {trainings?.map((training) =>
        isListView() ? (
          <PrimeTrainingList
            training={training}
            key={training.id}
            guest={guest}
            signUpURL={signUpURL}
            almDomain={almDomain}
          ></PrimeTrainingList>
        ) : (
          <PrimeTrainingCard
            training={training}
            key={training.id}
            guest={guest}
            signUpURL={signUpURL}
            almDomain={almDomain}
          ></PrimeTrainingCard>
        )
      )}
    </ul>
  ) : (
    <p className={styles.noResults}>
      {formatMessage({ id: "alm.catalog.no.result" })}
    </p>
  );

  const setCatalogView = (view: string) => {
    setView(view);
    window.localStorage.setItem("view", view);
  };

  return (
    <>
      {isListView() && (
        <div
          className={styles.viewButton}
          onClick={() => setCatalogView(TILE_VIEW)}
        >
          <ClassicGridView />
        </div>
      )}
      {!isListView() && (
        <div
          className={styles.viewButton}
          onClick={() => setCatalogView(LIST_VIEW)}
        >
          <ViewList />
        </div>
      )}

      <div className={styles.primeTrainingsContainer}>
        {isListView() && <hr className={styles.primeVerticalSeparator}></hr>}
        {listHtml}
        <div id="load-more-trainings" className={styles.loadMoreContainer}>
          {hasMoreItems ? (
            <button onClick={loadMoreTraining} className="almButton secondary">
              {formatMessage({ id: "alm.community.loadMore" })}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default PrimeTrainingsContainer;
