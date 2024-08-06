import { useEffect, useState } from "react";
import styles from "./ALMLeaderboard.module.css";
import { useLeaderboard } from "../../../hooks/widgets/leaderboard/useLeaderboard";
import { getALMAccount, getALMObject, getWidgetConfig } from "../../../utils/global";
import { PrimeUser } from "../../../models";
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import {
  BRONZE_LEVEL_SVG,
  GOLD_LEVEL_SVG,
  EMPTY_STATE_CARD,
  PLATINUM_LEVEL_SVG,
  SILVER_LEVEL_SVG,
} from "../../../utils/inline_svg";
import {
  CARD_HEIGHT,
  CARD_WIDTH_EXCLUDING_PADDING,
  WIDGET_HEIGHT,
} from "../../../utils/widgets/common";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";

const MAX_NUM_COMPETITORS = 5;
const ALMLeaderboard = (props: any) => {
  const { widget, doRefresh, user } = props;
  const { getCompetitors } = useLeaderboard();

  const cardWidth = `${CARD_WIDTH_EXCLUDING_PADDING}px`;
  const leaderboardStr = GetTranslation("leaderboard", true);
  const currUser = user;

  const initialLevelState: {
    progressPercent: number;
    nextLevelStr: string;
    pointsAwayFromNextLevel: number;
    pointsAwayFromNextLevelText: string;
    previousLevelImage: JSX.Element | null;
    previousLevelStr: string;
  } = {
    progressPercent: 0,
    nextLevelStr: "",
    pointsAwayFromNextLevel: 0,
    pointsAwayFromNextLevelText: "",
    previousLevelImage: null,
    previousLevelStr: "",
  };
  const [users, setUsers] = useState<PrimeUser[]>();
  const [showFirstTimeView, setShowFirstTimeView] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [allLevelsAchieved, setAllLevelsAchieved] = useState(false);
  const [level, setLevel] = useState(initialLevelState);
  const [allCompetitorsHaveZeroPoints, setAllCompetitorsHaveZeroPoints] = useState(false);
  const showExploreButton = !isLeaderboardLinkDisabled() && !allCompetitorsHaveZeroPoints;

  useEffect(() => {
    widget.attributes!.heading = GetTranslation("text.skipToLeaderboard", true);
    computeCompetitorsList();
  }, []);

  useEffect(() => {
    renderLeaderboard();
  }, [pointsEarned, doRefresh]);

  async function computeCompetitorsList() {
    const competitorsResponse = await getCompetitors();
    const userPointsEarned = currUser?.pointsEarned;
    setPointsEarned(userPointsEarned);
    const competitors = competitorsResponse.userList;
    const numCompetitors = competitors?.length;
    let currentUserPresentInCompetitors = false;
    let allCompetitorsHaveZeroPoints = true;
    for (let i = 0; i < numCompetitors; i++) {
      if (competitors[i].id == currUser?.id) {
        currentUserPresentInCompetitors = true;
      }
      if (competitors[i].pointsEarned !== 0) {
        allCompetitorsHaveZeroPoints = false;
      }
    }
    if (!currentUserPresentInCompetitors) {
      if (numCompetitors === MAX_NUM_COMPETITORS) {
        competitors.pop();
      }
      competitors?.push(currUser);
    }
    setAllCompetitorsHaveZeroPoints(allCompetitorsHaveZeroPoints);
    setUsers(competitors);
    computeProgress(userPointsEarned);
  }

  async function computeProgress(points: number) {
    const account = await getALMAccount();
    const gamificationLevels = account?.gamificationLevels;
    const numLevels = gamificationLevels.length;
    const highestLevel = gamificationLevels[numLevels - 1];
    let firstTimeView = false;
    let nextLevelName = "";
    let prevLevelImg = null;
    let prevLevelStr = "";
    let nextLevelStr = "";
    if (points >= highestLevel.points) {
      setAllLevelsAchieved(true);
      prevLevelStr = GetTranslation("lb.platinum");
      return;
    }
    for (let i = 0; i < numLevels; i++) {
      const nextLevelPoints = gamificationLevels[i].points;

      if (points < nextLevelPoints) {
        switch (i) {
          case 0:
            firstTimeView = true;
            nextLevelStr = GetTranslation("lb.bronze");
            break;
          case 1:
            prevLevelImg = BRONZE_LEVEL_SVG();
            prevLevelStr = GetTranslation("lb.bronze");
            nextLevelStr = GetTranslation("lb.silver");
            break;
          case 2:
            prevLevelImg = SILVER_LEVEL_SVG();
            prevLevelStr = GetTranslation("lb.silver");
            nextLevelStr = GetTranslation("lb.gold");
            break;
          case 3:
            prevLevelImg = GOLD_LEVEL_SVG();
            prevLevelStr = GetTranslation("lb.gold");
            nextLevelStr = GetTranslation("lb.platinum");
            break;
        }
        const progressPercent = (points / nextLevelPoints) * 100;
        const pointsAwayFromNextLevelText = GetTranslationsReplaced("lb.noLevel.pointsAway", {
          x: nextLevelPoints - points,
          level: nextLevelStr,
        });
        setLevel({
          progressPercent: progressPercent,
          nextLevelStr: nextLevelStr,
          pointsAwayFromNextLevel: nextLevelPoints - points,
          pointsAwayFromNextLevelText: pointsAwayFromNextLevelText,
          previousLevelImage: prevLevelImg,
          previousLevelStr: prevLevelStr,
        });
        setShowFirstTimeView(firstTimeView);
        return;
      }
    }
  }

  function isLeaderboardLinkDisabled() {
    const config = getWidgetConfig();
    return config?.disableLinks || config?.disableLeaderBoardWidgetLink;
  }

  function handleExploreClick() {
    if (!isLeaderboardLinkDisabled()) {
      getALMObject().navigateToLeaderboardPage();
    }
  }

  const renderProgressBar = () => {
    const progressPercentStr = GetTranslationReplaced(
      "progessPercent",
      level.progressPercent ? Math.floor(level.progressPercent).toString() : "0"
    );
    return (
      <div
        className={styles.leaderboardProgressBar}
        data-automationid="alm_leaderboard_progressBar"
        aria-label={progressPercentStr}
        title={progressPercentStr}
      >
        <div
          className={styles.leaderboardProgressPercent}
          style={{
            width: `${level.progressPercent}%`,
            borderRadius: "8px",
          }}
        ></div>
      </div>
    );
  };

  const renderFirstTimeView = () => {
    return (
      <>
        <div className={styles.beginnerState}>
          {pointsEarned === 0 ? GetTranslation("lb.getStarted") : GetTranslation("lb.keepGoing")}
          <div className={styles.pointsText}>
            {GetTranslation("lb.yourPoints")}
            <span className={styles.boldText}>{pointsEarned}</span>
          </div>
          {renderProgressBar()}
          <div className={styles.beginnerStateTextContainer}>
            {level.pointsAwayFromNextLevelText}
          </div>
        </div>
      </>
    );
  };

  const renderCurrentLevelView = () => {
    return (
      <>
        <div className={`${styles.levelBadgeSvg} ${styles.levelImgContainer}`}>
          {level.previousLevelImage}
        </div>
        <div className={styles.levelProgressContainer}>
          <div data-automationid="ALMYourLevel" aria-label={GetTranslation("lb.yourLevel")}>
            {GetTranslation("lb.yourLevel")}
          </div>
          <div
            className={`${styles.boldText} ${styles.currentLevel}`}
            data-automationid="ALMLevelText"
            aria-label={level.previousLevelStr}
            title={level.previousLevelStr}
          >
            {level.previousLevelStr}
          </div>
          {renderProgressBar()}
          <div
            aria-label={`${GetTranslationsReplaced("lb.points", {
              x: level.pointsAwayFromNextLevel,
            })}${GetTranslation("lb.pointsAway")}${level.nextLevelStr}`}
            data-automationid="ALMPointsToNextLevelText"
          >
            <span className={styles.boldText}>
              {GetTranslationsReplaced("lb.points", {
                x: level.pointsAwayFromNextLevel,
              })}
            </span>
            {GetTranslation("lb.pointsAway")} {level.nextLevelStr}
          </div>
        </div>
      </>
    );
  };

  const renderAllLevelsAchievedView = () => {
    const allLevelsAchievedStr = GetTranslation("lb.allLevelsAchieved");
    const yourPointsStr = GetTranslation("lb.yourPoints");
    return (
      <>
        <div
          className={`${styles.allLevelsAchievedSvgGroup} ${styles.levelImgContainer}`}
          data-automationid="ALMAllLevelsAchievedSvgGroup"
        >
          <div>
            {BRONZE_LEVEL_SVG()}
            {SILVER_LEVEL_SVG()}
          </div>
          <div>
            {GOLD_LEVEL_SVG()}
            {PLATINUM_LEVEL_SVG()}
          </div>
        </div>
        <div
          className={styles.allLevelsAchievedTextContainer}
          data-automationid="ALMAllLevelsAchievedTextBox"
        >
          <div
            className={styles.confettiText}
            data-automationid="ALMLbConfettiText"
            aria-hidden="true"
          >
            🎉
          </div>
          <div
            className={styles.text}
            aria-label={allLevelsAchievedStr}
            title={allLevelsAchievedStr}
            data-automationid="ALMAllLevelsAchievedText"
          >
            {allLevelsAchievedStr}
          </div>
          <div aria-label={`${yourPointsStr} ${pointsEarned}`}>
            <span className={styles.subtleText}>{yourPointsStr} </span>
            <span className={styles.boldText} aria-hidden="true">
              {" "}
              {pointsEarned}
            </span>
          </div>
        </div>
      </>
    );
  };

  const renderCompetitorsList = () => {
    return (
      <>
        {!allCompetitorsHaveZeroPoints ? (
          <div
            className={`${styles.competitorsList} ${styles.competitorsContainer}`}
            data-automationid="ALMCompetitorsTable"
          >
            {users?.map((user, index) => {
              const { name, pointsEarned, id } = user;
              const isCurrentUser = currUser?.id === id;
              return (
                <div
                  key={index}
                  className={`${styles.row} ${isCurrentUser ? `${styles.boldText}` : ""}`}
                >
                  <div
                    className={styles.leftColumn}
                    aria-label={name}
                    data-automationid={`ALMUserName${name}`}
                    title={name}
                  >
                    {name}
                    {isCurrentUser ? ` (${GetTranslation("lb.you")})` : ""}
                  </div>
                  <div
                    className={`${styles.rightColumn} ${styles.competitorsPoints}`}
                    aria-label={`${GetTranslationsReplaced("lb.points", {
                      x: pointsEarned,
                    })},`}
                    data-automationid={`ALMUserPoints${name}`}
                  >
                    {pointsEarned}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`${styles.noCompetitors} ${styles.competitorsContainer}`}
            data-automationid="ALMNoCompetitorsContainer"
          >
            <div className={styles.noCompetitorSvg} data-automationid="ALMExploreLeaderboardSvg">
              {EMPTY_STATE_CARD()}
            </div>
            <div
              data-automationid="ALMLbLeadWayText"
              aria-label={GetTranslation("lb.leadWay")}
              className={styles.subtleText}
            >
              {GetTranslation("lb.leadWay")}
            </div>
            <button
              data-automationid="ALMExploreLeaderboardButton"
              aria-label={GetTranslation("lb.explore", true)}
              onClick={() => handleExploreClick()}
              className={`${styles.exploreButton} ${styles.boldText} ${styles.exploreLeaderboardtext}`}
              style={{
                pointerEvents: isLeaderboardLinkDisabled() ? "none" : "auto",
              }}
            >
              {GetTranslation("lb.explore", true)}
            </button>
          </div>
        )}
      </>
    );
  };

  const levelToRender = () => {
    if (showFirstTimeView) {
      return renderFirstTimeView();
    } else if (allLevelsAchieved) {
      return renderAllLevelsAchievedView();
    }
    return renderCurrentLevelView();
  };

  const renderLeaderboard = () => {
    return (
      <section
        style={{ width: cardWidth, height: `${CARD_HEIGHT}px` }}
        className={styles.lbWidgetContainer}
        data-automationid="ALMLeaderboardWidget"
      >
        <div className={styles.levelContainer} data-automationid="ALMLeaderboardLevelContainer">
          {levelToRender()}
        </div>
        {renderCompetitorsList()}
      </section>
    );
  };

  return (
    <div style={{ width: cardWidth, height: `${WIDGET_HEIGHT}px` }}>
      <div className={styles.headerContainer}>
        <h2
          id="header"
          data-automationid="leaderboardHeader"
          title={leaderboardStr}
          className={`${styles.header} `}
          data-skip-link-target={widget.layoutAttributes?.id}
          tabIndex={0}
        >
          {leaderboardStr}
        </h2>
        {showExploreButton && (
          <button
            className={styles.exploreButton}
            onClick={handleExploreClick}
            data-automationid={`social-explore-button`}
            style={{
              pointerEvents: isLeaderboardLinkDisabled() ? "none" : "auto",
            }}
          >
            {GetTranslation("alm.text.explore")}
          </button>
        )}
      </div>
      {renderLeaderboard()}
    </div>
  );
};

export default ALMLeaderboard;
