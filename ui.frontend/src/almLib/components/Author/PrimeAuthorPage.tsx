/***
 *
 * Please Do not use this Component.
 */
import { Provider, lightTheme } from "@adobe/react-spectrum";
import styles from "./PrimeAuthorPage.module.css";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  TILE_VIEW,
  LIST_VIEW,
  AUTHOR_ID_STR,
  IS_LEGACY_AUTHOR,
  AUTHOR_NAME,
  INTERNAL_STR,
  EXTERNAL_STR,
} from "../../utils/constants";
import { DEFAULT_USER_SVG } from "../../utils/inline_svg";
import { PrimeTrainingList } from "../Catalog/PrimeTrainingList";
import { useIntl } from "react-intl";
import { useAccount, useLoadMore } from "../../hooks";
import { BACK_BUTTON_ICON } from "../../utils/inline_svg";
import { useAuthor } from "../../hooks/author";
import {
  containsSubstr,
  getALMConfig,
  getALMObject,
  getPathParams,
  getQueryParamsFromUrl,
  navigateToLo,
  setTrainingsLayout,
} from "../../utils/global";
import { PrimeTrainingCardV2 } from "../Catalog/PrimeTrainingCardV2";
import { GetTranslation } from "../../utils/translationService";
import { PrimeLearningObject } from "../../models";
import { ALMCustomPicker } from "../Common/ALMCustomPicker";
import { ALMLoader } from "../Common/ALMLoader";
import {
  canShowPrice,
  launchPlayerHandler,
} from "../Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { showEffectivenessIndex, showRating } from "../Widgets/ALMPrimeStrip/ALMPrimeStrip.helper";
import ViewList from "@spectrum-icons/workflow/ViewList";
import ClassicGridView from "@spectrum-icons/workflow/ClassicGridView";
import { PrimeFeedbackWrapper } from "../ALMFeedback";
import { useFeedback } from "../../hooks/feedback";
import { ALMGoToTop } from "../ALMGoToTop";

const PrimeAuthorPage = (props: any) => {
  const config = getALMConfig();
  const authorPath = config.authorPath;

  const pathParams = getPathParams(authorPath, [AUTHOR_ID_STR]);
  const queryParam = getQueryParamsFromUrl();
  const authorId = containsSubstr(pathParams[AUTHOR_ID_STR], "?")
    ? pathParams[AUTHOR_ID_STR].split("?")[0]
    : pathParams[AUTHOR_ID_STR];
  const authorType = queryParam[IS_LEGACY_AUTHOR] ? EXTERNAL_STR : INTERNAL_STR;
  const authorName = queryParam[AUTHOR_NAME];
  const {
    trainings,
    totalTrainings,
    hasMoreItems,
    loadMoreTraining,
    enrollmentHandler,
    updateLearningObject,
    fetchTrainings,
    authorDetails,
    isLoading,
  } = useAuthor(authorId, authorType);
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
  const elementRef = useRef(null);
  useLoadMore({
    items: trainings,
    callback: loadMoreTraining,
    elementRef,
  });
  const { account } = useAccount();
  const { formatMessage } = useIntl();
  const alm = getALMObject();
  const setInitialView = () => {
    return getALMObject().storage.getItem(TILE_VIEW) || TILE_VIEW;
  };
  const isAuthorExternal = authorType === EXTERNAL_STR;
  const isListView = () => {
    return view === LIST_VIEW;
  };
  const handleLoEnrollment = async (loId: string, loInstanceId: string) => {
    return enrollmentHandler && (await enrollmentHandler(loId, loInstanceId));
  };
  const [view, setView] = useState(setInitialView());

  const navigateToLOPage = (training: PrimeLearningObject) => {
    navigateToLo(training);
  };
  const sortByDropdown = [
    { id: "-date", name: GetTranslation("alm.picker.sort.recentlyPublished") },
    { id: "name", name: GetTranslation("alm.picker.sort.nameAZ") },
    { id: "-name", name: GetTranslation("alm.picker.sort.nameZA") },
  ];
  const [selectedOptionId, setSelectedOptionId] = useState(sortByDropdown[0].id);

  const handleOptionSelected = (selectedOption: string) => {
    setSelectedOptionId(selectedOption);
    fetchTrainings(selectedOption);
  };
  const gridButtonTitle = useMemo(() => GetTranslation("alm.grid.view.aria", true), []);
  const listButtonTitle = useMemo(() => GetTranslation("alm.list.view.aria", true), []);

  const listHtml = trainings?.length ? (
    <ul className={isListView() ? styles.primeTrainingsList : styles.primeTrainingsCards}>
      {trainings?.map((training: PrimeLearningObject, index: number) =>
        isListView() ? (
          <PrimeTrainingList
            training={training}
            key={`${training.id}-${view}`}
            account={account}
          ></PrimeTrainingList>
        ) : (
          <li key={training.id}>
            <div className={styles.loCard}>
              <PrimeTrainingCardV2
                training={training}
                key={`${training.id}-${view}`}
                account={account}
                user={authorDetails}
                showProgressBar={!!training?.enrollment}
                showSkills={true}
                showPrice={canShowPrice(training, account)}
                showRating={showRating(training, account!)}
                showEffectivenessIndex={showEffectivenessIndex(training, account)}
                showActionButton={true}
                showRecommendedReason={true}
                handleLoEnrollment={handleLoEnrollment}
                updateLearningObject={updateLearningObject}
                handlePlayerLaunch={launchPlayerHandler}
                handleLoNameClick={() => navigateToLOPage(training)}
                handleL1FeedbackLaunch={handleL1FeedbackLaunch}
              ></PrimeTrainingCardV2>
            </div>
          </li>
        )
      )}
    </ul>
  ) : (
    !isLoading && (
      <p className={styles.noResults}>{formatMessage({ id: "alm.catalog.no.result" })}</p>
    )
  );
  const getAuthorImage = () => {
    if (isAuthorExternal) {
      return (
        <span className={styles.avatar} data-automationid="default-avatar">
          {DEFAULT_USER_SVG()}
        </span>
      );
    }
    return (
      <img
        className={styles.avatar}
        src={authorDetails.avatarUrl}
        alt={GetTranslation("author.avatar.text")}
      />
    );
  };
  const getAuthorName = useCallback(() => {
    if (isAuthorExternal) {
      return authorName;
    }
    return authorDetails.name;
  }, [authorDetails, authorType]);
  return (
    <Provider theme={lightTheme} colorScheme="light">
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
      <div className={styles.pageContainer}>
        <div className={styles.authorBox}>
          <div className={styles.back} data-automationid="back-button">
            <button
              className={styles.btn}
              onClick={() => window.history.back()}
              data-automationid="Back-Button"
            >
              <div
                className={styles.backIcon}
                aria-label={GetTranslation("cpw.back.button.aria.label")}
              >
                {BACK_BUTTON_ICON()}
              </div>
              {formatMessage({ id: "alm.author.back.label" })}
            </button>
          </div>
          <div className={styles.authorDetails} data-automationid="author-details">
            {getAuthorImage()}
          </div>
          <div className={styles.about} data-automationid="trainings-note">
            <span className={styles.allLearningsHeader}>
              {GetTranslation("alm.author.trainings.note", true)}
            </span>
            <span
              className={styles.authorName}
              data-automationid={getAuthorName()}
              aria-label={`${formatMessage({
                id: "alm.label.authorName",
                defaultMessage: "Author name",
              })} ${getAuthorName()}`}
              tabIndex={0}
              data-skip="skip-target"
            >
              {getAuthorName()}
            </span>
          </div>
          <div className={styles.authorDescription} data-automationId="author-description">
            {authorDetails.bio}
          </div>
        </div>
        <div className={styles.authorLoContainer}>
          <div className={styles.actionsContainer}>
            <div
              className={styles.totalTrainingsDetails}
              data-automationid="total-trainings-by-author"
            >
              {isLoading
                ? ""
                : formatMessage({ id: "alm.author.trainings" }, { x: totalTrainings })}
            </div>
            <div className={styles.right}>
              <div>{formatMessage({ id: "alm.picker.sortBy" })}</div>
              <div className={styles.picker}>
                <ALMCustomPicker
                  options={sortByDropdown}
                  onOptionSelected={handleOptionSelected}
                  defaultSelectedOptionId={selectedOptionId}
                />
              </div>
              <div className={styles.toggle}>
                <button
                  className={`${styles.viewButton} ${
                    view === TILE_VIEW ? styles.selectedView : ""
                  }`}
                  onClick={() => setTrainingsLayout(TILE_VIEW, setView)}
                  title={gridButtonTitle}
                  aria-label={gridButtonTitle}
                  data-automationid="trainingsTileView"
                  aria-pressed={view === TILE_VIEW}
                >
                  <ClassicGridView />
                </button>

                <button
                  className={`${styles.viewButton} ${
                    view === LIST_VIEW ? styles.selectedView : ""
                  }`}
                  onClick={() => setTrainingsLayout(LIST_VIEW, setView)}
                  title={listButtonTitle}
                  aria-label={listButtonTitle}
                  data-automationid="trainingsListView"
                  aria-pressed={view === LIST_VIEW}
                >
                  <ViewList />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.top}>
            <div>
              {listHtml}
              <div
                ref={elementRef}
                id="load-more-trainings"
                data-automationid="loadMoreTrainingsLoader"
              >
                {isLoading || hasMoreItems ? <ALMLoader classes={styles.loader} /> : ""}
              </div>
            </div>
          </div>
        </div>
        <ALMGoToTop />
      </div>
    </Provider>
  );
};

export default PrimeAuthorPage;
