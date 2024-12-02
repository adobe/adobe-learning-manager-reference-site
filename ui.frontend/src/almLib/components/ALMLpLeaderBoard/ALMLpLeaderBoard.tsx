import React, { useMemo } from "react";
import {
  PrimeGamificationSettings,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeUser,
} from "../../models";
import { useLeaderBoard } from "../../hooks/lpLeaderBoard";
import styles from "./ALMLpLeaderBoard.module.css";
import { GetTranslation, GetTranslationsReplaced } from "../../utils/translationService";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import { useCallback, useEffect, useState } from "react";
import ALMLeaderBoardItem from "./ALMLpLeaderBoardItem";
import LEADERBOARD_DOTS_ICON from "../../assets/images/lo_leaderboard_dots.svg";
import {
  NONE,
  ALL_LEARNERS,
  TOP_LEARNERS,
  EARLY_COMPLETION,
  BETTER_ASSESSMENT,
  COMPREHENSIVE_LEARNER,
} from "../../utils/constants";
import { AlmModalDialog } from "../Common/AlmModalDialog";
import { getALMObject } from "../../utils/global";

const PrimeLoLeaderBoard: React.FC<{
  training: PrimeLearningObject;
  trainingInstanceId: PrimeLearningObjectInstance;
}> = props => {
  const { training, trainingInstanceId } = props;
  const { leaderBoardList, currentUser, gamificationRules, isGamificationEnabled } = useLeaderBoard(
    training,
    trainingInstanceId
  );
  const MAX_LEARNERS_COUNT = 5;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const learnerLeaderBoard = GetTranslation("alm.lp.leaderboard", true);
  const [learnersDisplay, setLearnersDisplay] = useState(NONE);
  const [leaderBoardUserList, setLeaderBoardUserList] = useState([] as PrimeUser[]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const topThreeLearners = leaderBoardList.slice(0, 3);
  const toggle = () => {
    setIsCollapsed(prevState => !prevState);
  };
  const getCollapseOrExpandImage = () => {
    return isCollapsed ? <ChevronDown size="S" /> : <ChevronUp size="S" />;
  };

  const isCurrentUserInExistingList = (leaderBoardList: PrimeUser[], currentUser: PrimeUser) => {
    const isUserInExistingList = leaderBoardList.find(user => user.id === currentUser.id);
    return isUserInExistingList;
  };
  const getTopThreeLearners = useMemo(() => {
    return [...topThreeLearners, currentUser];
  }, [leaderBoardList, currentUser]);
  useEffect(() => {
    const getLeaderBoardData = () => {
      const isLeaderboardEmpty = leaderBoardList.length === 0 || leaderBoardList[0]?.points === 0;
      const isCurrentUserInList = isCurrentUserInExistingList(leaderBoardList, currentUser);
      const learnersDisplayType = isLeaderboardEmpty
        ? NONE
        : isCurrentUserInList
          ? ALL_LEARNERS
          : TOP_LEARNERS;
      const updatedLeaderBoardList = isCurrentUserInList ? leaderBoardList : getTopThreeLearners;

      setLearnersDisplay(learnersDisplayType);
      setLeaderBoardUserList(updatedLeaderBoardList);
    };
    getLeaderBoardData();
  }, [leaderBoardList, currentUser]);

  const getLearnerName = (user: PrimeUser) => {
    if (user.id === currentUser.id) {
      return GetTranslation("alm.leaderboard.text.you");
    }
    return user.name;
  };
  const leaderBoardUserData = (leaderBoardUserList: PrimeUser[]) => {
    return leaderBoardUserList.map((user, index) => {
      const { id, points, rank, avatarUrl } = user;
      return (
        <div key={id}>
          <ALMLeaderBoardItem
            learnerName={getLearnerName(user)}
            learnerPoints={points}
            learnerRank={rank}
            learnerImageUrl={avatarUrl}
            key={rank}
            previousLearnerRank={index > 0 ? leaderBoardUserList[index - 1].rank : null}
          />
          {index !== leaderBoardUserList.length - 1 && (
            <div
              className={
                user.rank === leaderBoardUserList[index + 1].rank
                  ? styles.smallSeparator
                  : styles.seperator
              }
            ></div>
          )}
        </div>
      );
    });
  };

  const topLearnersWithCurrentUserData = useMemo(() => {
    const { points, rank, avatarUrl } = currentUser;
    return (
      <div>
        {leaderBoardUserData(topThreeLearners)}
        <img
          className={styles.dotsImage}
          alt={GetTranslation("gamification.points.achieved.img")}
          src={LEADERBOARD_DOTS_ICON}
        />
        <ALMLeaderBoardItem
          learnerName={GetTranslation("alm.leaderboard.text.you")}
          learnerPoints={points}
          learnerRank={rank}
          learnerImageUrl={avatarUrl}
          isCurrentUser={true}
        />
      </div>
    );
  }, [learnersDisplay, leaderBoardUserList, currentUser]);

  const leaderBoardData = useCallback(() => {
    const showNoActivity = GetTranslation("alm.lo.leaderboard.noActivity", true);
    switch (learnersDisplay) {
      case NONE:
        return <div>{showNoActivity}</div>;
      case ALL_LEARNERS:
        return leaderBoardUserData(leaderBoardList.slice(0, MAX_LEARNERS_COUNT));
      case TOP_LEARNERS:
        return topLearnersWithCurrentUserData;
    }
  }, [learnersDisplay, leaderBoardUserList, currentUser]);

  const getLeaderBoardStats = () => {
    return (
      <>
        <div className={styles.seperator}></div>
        {leaderBoardData()}
        <div className={styles.seperator}></div>
      </>
    );
  };
  const getSpecifiedRuleItem = (typeOfRule: string) => {
    return gamificationRules.length > 0
      ? gamificationRules.find(item => item.name === typeOfRule)
      : ({} as PrimeGamificationSettings);
  };

  const getSpecifiedRuleData = (
    isRuleEnabled: boolean | undefined,
    ruleItem: PrimeGamificationSettings | undefined,
    ruleHeader: string,
    ruleDetails: string
  ) => {
    return (
      isRuleEnabled && (
        <div className={styles.ruleItem}>
          <div className={styles.ruleHeader}>{GetTranslation(ruleHeader)}</div>
          <div className={styles.ruleDetails}>
            {GetTranslationsReplaced(
              ruleDetails,
              {
                count: ruleItem?.count || 0,
                points: ruleItem?.points || 0,
              },
              true
            )}
          </div>
        </div>
      )
    );
  };
  const getRuleData = () => {
    const earlyCompletion = getSpecifiedRuleItem(EARLY_COMPLETION);
    const betterAssessment = getSpecifiedRuleItem(BETTER_ASSESSMENT);
    const comprehensiveLearner = getSpecifiedRuleItem(COMPREHENSIVE_LEARNER);
    const isEarlyCompletionEnabled = earlyCompletion?.enabled;
    const isBetterAssessmentEnabled = betterAssessment?.enabled;
    const isComprehensiveEnabled = comprehensiveLearner?.enabled;
    return (
      <>
        {getSpecifiedRuleData(
          isEarlyCompletionEnabled,
          earlyCompletion,
          "lpi.earlyCompletion.title",
          "lpi.earlyCompletion.text"
        )}
        {getSpecifiedRuleData(
          isBetterAssessmentEnabled,
          betterAssessment,
          "lpi.betterResults.title",
          "lpi.betterResults.text"
        )}
        {getSpecifiedRuleData(
          isComprehensiveEnabled,
          comprehensiveLearner,
          "lpi.additionalLearning.title",
          "lpi.additionalLearning.text"
        )}
      </>
    );
  };
  const closeAlmModalDialog = () => {
    setShowRulesModal(false);
  };
  const openAlmModalDialog = () => {
    const modalBody = getRuleData();
    return (
      <AlmModalDialog
        title={GetTranslation("alm.leaderboard.rules")}
        showCrossButton={true}
        showCloseButton={true}
        body={modalBody}
        closeDialog={() => closeAlmModalDialog()}
      />
    );
  };
  const handleOpenRulesModal = async () => {
    setShowRulesModal(true);
  };
  const handleSeeAllModal = async () => {
    // sending it to parent to handle the seeAll modal
    getALMObject().handleLpLeaderBoardSeeAllModal &&
      getALMObject().handleLpLeaderBoardSeeAllModal(training.id, trainingInstanceId.id);
  };

  const showRulesAndSeeAll = () => {
    return (
      <div className={styles.leaderBoardTextContainer}>
        <div className={styles.ruleAndSeeAllText} onClick={handleOpenRulesModal}>
          {GetTranslation("alm.leaderboard.rules")}
        </div>
        {learnersDisplay != NONE && (
          <div className={styles.ruleAndSeeAllText} onClick={handleSeeAllModal}>
            {GetTranslation("text.viewAll")}
          </div>
        )}
      </div>
    );
  };

  const showLeaderBoardData = () => {
    return (
      <>
        <div>{getLeaderBoardStats()}</div>
        <div>{showRulesAndSeeAll()}</div>
      </>
    );
  };
  return isGamificationEnabled ? (
    <div
      className={`${styles.borderContainer} ${styles.paddingSeperatorForBorderContainer}`}
      data-automationid="leaderboard-container"
    >
      <div className={styles.leaderBoardTextContainer}>
        <div className={styles.leaderBoardText} data-automationid="leaderboard-text">
          {learnerLeaderBoard}
        </div>
        <button className={styles.chevron} data-automationid="toggleShowHide" onClick={toggle}>
          {getCollapseOrExpandImage()}
        </button>
      </div>
      {!isCollapsed && showLeaderBoardData()}
      {showRulesModal && openAlmModalDialog()}
    </div>
  ) : null;
};
export default PrimeLoLeaderBoard;
