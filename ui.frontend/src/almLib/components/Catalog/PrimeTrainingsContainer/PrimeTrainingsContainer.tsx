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
import { useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstanceEnrollment,
  PrimeUser,
} from "../../../models/PrimeModels";
import { JOBAID, LIST_VIEW } from "../../../utils/constants";

import { PrimeTrainingList } from "../PrimeTrainingList";

import styles from "./PrimeTrainingsContainer.module.css";
import { navigateToLo } from "../../../utils/global";
import {
  showAuthorInfo,
  showEffectivenessIndex,
  showRating,
} from "../../Widgets/ALMPrimeStrip/ALMPrimeStrip.helper";
import { PrimeTrainingCardV2 } from "../PrimeTrainingCardV2";
import { useLoadMore } from "../../../hooks";
import {
  canShowPrice,
  launchPlayerHandler,
  openJobAid,
} from "../PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { CARD_WIDTH_EXCLUDING_PADDING } from "../../../utils/widgets/common";
import { PrimeFeedbackWrapper } from "../../ALMFeedback";
import { useFeedback } from "../../../hooks/feedback";

const PrimeTrainingsContainer: React.FC<{
  trainings: PrimeLearningObject[] | null;
  loadMoreTraining: () => void;
  hasMoreItems: boolean;
  guest?: boolean;
  signUpURL?: string;
  almDomain?: string;
  user: PrimeUser;
  account: PrimeAccount;
  view: string;
  enrollmentHandler: (
    loId: string,
    instanceId: string
  ) => Promise<PrimeLearningObjectInstanceEnrollment>;
  updateLearningObject: (loId: string) => Promise<PrimeLearningObject | Error>;
  isloading: boolean;
  removeTrainingFromListById: (loId: string) => void;
}> = ({
  trainings,
  loadMoreTraining,
  hasMoreItems,
  guest,
  signUpURL,
  almDomain,
  user,
  account,
  view,
  enrollmentHandler,
  updateLearningObject,
  isloading,
  removeTrainingFromListById,
}) => {
  const { formatMessage } = useIntl();
  const elementRef = useRef(null);
  useLoadMore({
    items: trainings,
    callback: loadMoreTraining,
    elementRef,
  });
  const {
    feedbackTrainingId,
    trainingInstanceId,
    playerLaunchTimeStamp,
    shouldLaunchFeedback,
    handleL1FeedbackLaunch,
    fetchCurrentLo,
    getFilteredNotificationForFeedback,
    submitL1Feedback,
    closeFeedbackWrapper,
  } = useFeedback();
  const handleLoEnrollment = async (loId: string, loInstanceId: string) => {
    return enrollmentHandler && (await enrollmentHandler(loId, loInstanceId));
  };

  const isListView = view === LIST_VIEW;
  const handleLoNameClick = (training: PrimeLearningObject, resourceLocation?: string) => {
    if (training.loType === JOBAID) {
      openJobAid(training, resourceLocation);
      return;
    }
    navigateToLo(training);
  };

  const getListViewHtml = () => {
    return (
      <ul className={styles.primeTrainingsList} data-automationid={"trainingsList"}>
        {trainings?.map(training => {
          return (
            <PrimeTrainingList
              training={training}
              key={`${training.id}-${view}`}
              guest={guest}
              signUpURL={signUpURL}
              almDomain={almDomain}
              account={account}
              showRating={showRating(training, account)}
              showEffectivenessIndex={showEffectivenessIndex(training, account)}
              handleLoEnrollment={handleLoEnrollment}
              updateLearningObject={updateLearningObject}
              removeTrainingFromListById={removeTrainingFromListById}
            ></PrimeTrainingList>
          );
        })}
      </ul>
    );
  };
  const getCardViewHtml = () => {
    return (
      <ul className={styles.primeTrainingsCards} data-automationid="trainingsCard">
        {trainings?.map(training => {
          return (
            <div style={{ width: CARD_WIDTH_EXCLUDING_PADDING }}>
              <PrimeTrainingCardV2
                training={training}
                key={`${training.id}-${view}`}
                account={account!}
                user={user!}
                signUpURL={signUpURL}
                almDomain={almDomain}
                showRating={showRating(training, account!)}
                showProgressBar={!!training?.enrollment}
                showSkills={true}
                showEffectivenessIndex={showEffectivenessIndex(training, account)}
                showAuthorInfo={showAuthorInfo(training)}
                handleLoEnrollment={handleLoEnrollment}
                handleActionClick={() => navigateToLo(training)}
                updateLearningObject={updateLearningObject}
                handlePlayerLaunch={launchPlayerHandler}
                handleLoNameClick={handleLoNameClick}
                showPrice={canShowPrice(training, account)}
                handleL1FeedbackLaunch={handleL1FeedbackLaunch}
                removeTrainingFromListById={removeTrainingFromListById}
              ></PrimeTrainingCardV2>
            </div>
          );
        })}
      </ul>
    );
  };

  const getTrainingsHtml = useMemo(() => {
    if (trainings?.length === 0 && !isloading) {
      return (
        <p className={styles.noResults} aria-live="polite" data-automationid="noSearchResults">
          {formatMessage({ id: "alm.catalog.no.result" })}
        </p>
      );
    }
    return isListView ? getListViewHtml() : getCardViewHtml();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trainings,
    trainings?.length,
    isloading,
    isListView,
    getListViewHtml,
    getCardViewHtml,
    formatMessage,
  ]);
  return (
    <>
      {shouldLaunchFeedback && (
        <PrimeFeedbackWrapper
          trainingId={feedbackTrainingId}
          trainingInstanceId={trainingInstanceId}
          playerLaunchTimeStamp={playerLaunchTimeStamp}
          fetchCurrentLo={fetchCurrentLo}
          getFilteredNotificationForFeedback={getFilteredNotificationForFeedback}
          submitL1Feedback={submitL1Feedback}
          closeFeedbackWrapper={closeFeedbackWrapper}
        />
      )}
      <div className={styles.primeTrainingsContainer} data-automationid="trainingsContainer">
        {getTrainingsHtml}
        <div ref={elementRef} id="load-more-trainings" data-automationid="loadMoreTrainingsLoader">
          {/* {hasMoreItems ? <ALMLoader classes={styles.loader} /> : ""} */}
        </div>
      </div>
    </>
  );
};

export default PrimeTrainingsContainer;
