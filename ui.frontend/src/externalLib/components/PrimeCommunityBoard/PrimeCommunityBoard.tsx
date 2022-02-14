import {
  SOCIAL_MORE_OPTIONS_SVG, 
  SOCIAL_PRIVATE_BOARD_SVG, 
  SOCIAL_PUBLIC_BOARD_SVG,
  SOCIAL_ACTIVITY_INDEX_HIGH_SVG,
  SOCIAL_ACTIVITY_INDEX_MEDIUM_SVG,
  SOCIAL_ACTIVITY_INDEX_LOW_SVG,
  SOCIAL_ACTIVITY_INFO_SVG,
  SOCIAL_POST_COUNT_SVG,
  SOCIAL_VIEW_COUNT_SVG,
  SOCIAL_USER_COUNT_SVG,
  SOCIAL_LEARNER_CLOCK_SVG
} from "../../utils/inline_svg"
import { PrimeCommunityBoardOptions } from "../PrimeCommunityBoardOptions";

import styles from "./PrimeCommunityBoard.module.css";
import  {useState} from "react";
import { useIntl } from "react-intl";

const PrimeCommunityBoard  = (props: any) => {
  const { formatMessage } = useIntl();
  let board = props.board;
  let showBoardOptions = false;
  const [isBoardOptionsOpen, setIsBoardOptionsOpen] = useState(showBoardOptions);

  
  const boardSkills = board.skills.map((skill: any, index: any) => {
    return (index ? ', ': '') + skill.name;
  });

  // const showBoardOptionsHandler = () => {
  //   setIsBoardOptionsOpen(true);
  // };

  // const hideBoardOptionsHandler = () => {
  //   setIsBoardOptionsOpen(false);
  // };

  const toggleBoardOptionsHandler = () => {
    setIsBoardOptionsOpen((prevState) => !prevState);
  };

  const formatDate = (dateString: any) => {
    const options = { year: "numeric", month: "short", day: "2-digit" } as const;
    const value =  (new Date(dateString).toLocaleDateString(undefined, options)).split(" ");
    return value[1] + " " + value[0] + ", " + value[2];
  }

  return (
    <>
    <div className={styles.primeBoardWrapper}>
      <div className={styles.primeBoardItem}>
        <div className="prime-title-skills-container">
          {/* <span id="sr-only">${i18n(state.locale).BOARD}</span> */}
          <button className={styles.primeBoardOptions} onClick={toggleBoardOptionsHandler} id={"prime-board-options-" + board.id}>
            {SOCIAL_MORE_OPTIONS_SVG()}
            {isBoardOptionsOpen && <PrimeCommunityBoardOptions board={board} boardOptionsHandler={toggleBoardOptionsHandler}></PrimeCommunityBoardOptions>}
          </button>
          <div className={styles.primeBoardName} role="link" tabIndex={0}>{board.name}</div>
          <div className={styles.primeBoardSkill}>
            {formatMessage({
              id: "prime.community.board.skills",
              defaultMessage: "Skills",
            })}: {boardSkills}
            <span className={styles.primeBoardIcon} title={board.visibility === "PUBLIC" ? 
            formatMessage({
              id: "prime.community.board.public",
              defaultMessage: "Public Board",
            }) : 
            formatMessage({
              id: "prime.community.board.private",
              defaultMessage: "Private Board",
            })}>  
              {board.visibility === "PUBLIC" ? SOCIAL_PUBLIC_BOARD_SVG() : SOCIAL_PRIVATE_BOARD_SVG()}
            </span>
          </div>
        </div>
        <p className={styles.primeBoardDescription} dangerouslySetInnerHTML={{__html: board.richTextdescription}}></p>

        <div className={styles.primeBoardActivityPanel}>
            <div className={styles.primeBoardActivityStats}>
                <span className={styles.primeActivityStatsIcon}>
                  {board.visibility === "HIGH" ? SOCIAL_ACTIVITY_INDEX_HIGH_SVG() : 
                    board.visibility === "NORMAL" ? SOCIAL_ACTIVITY_INDEX_MEDIUM_SVG() : SOCIAL_ACTIVITY_INDEX_LOW_SVG()}
                </span>
                <span className={styles.primeActivityStatsText}>

                    {board.visibility === "HIGH" ? 
                    formatMessage({
                      id: "prime.community.board.highActivity",
                      defaultMessage: "High Activity",
                    }) : 
                      board.visibility === "NORMAL" ? 
                      formatMessage({
                        id: "prime.community.board.normalActivity",
                        defaultMessage: "Normal Activity",
                      }) : 
                        formatMessage({
                          id: "prime.community.board.lowActivity",
                          defaultMessage: "Low Activity",
                        })}
                </span>
                <span className={styles.primeActivityInfoIcon} data-toggle="tooltip" data-trigger="hover" data-tooltip-position="right" title={
                  formatMessage({
                    id: "prime.community.board.activityCalc",
                    defaultMessage: "Calculated daily based on the number of new posts, comments, participants, views, likes and dislikes",
                  })}>
                  {SOCIAL_ACTIVITY_INFO_SVG()}
                </span>
            </div>
            <div className={styles.primeVerticalSeperator}></div>
            <div className={styles.primeBoardActivityStats}>
              <span className={styles.primeActivityStatsIcon}>
                {SOCIAL_POST_COUNT_SVG()}
              </span>
              <span className={styles.primeActivityStatsText}>
                {board.postCount} {formatMessage({id: "prime.community.board.post.label", defaultMessage: "Post(s)",})}
              </span>
            </div>
            <div className={styles.primeBoardActivityStats}>
              <span className={styles.primeActivityStatsIcon}>
                {SOCIAL_VIEW_COUNT_SVG()}
              </span>
              <span className={styles.primeActivityStatsText}>
                {board.viewsCount} {formatMessage({id: "prime.community.board.view.label", defaultMessage: "View(s)",})}
              </span>
            </div>
            <div className={styles.primeBoardActivityStats}>
              <span className={styles.primeActivityStatsIcon}>
                {SOCIAL_USER_COUNT_SVG()}
              </span>
              <span className={styles.primeActivityStatsText}>
                {board.userCount} {formatMessage({id: "prime.community.board.people.label", defaultMessage: "People",})}
              </span>
            </div>
            <div className={styles.primeVerticalSeperator}></div>
            <div className={styles.primeBoardActivityStats}>
              <span className={styles.primeActivityStatsIcon}>
                {SOCIAL_LEARNER_CLOCK_SVG()}
              </span>
              <span className={styles.primeActivityStatsText}>
                {formatMessage({id: "prime.community.board.createdOn.label", defaultMessage: "Created on ",})}
                {formatDate(board.dateCreated)}
                {formatMessage({id: "prime.community.board.by.label", defaultMessage: " by ",})}
                {board.createdBy.name !== "" ? board.createdBy.name : 
                  formatMessage({id: "prime.community.board.anoymous.label", defaultMessage: "Anonymous",})}
              </span>
            </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default PrimeCommunityBoard;
