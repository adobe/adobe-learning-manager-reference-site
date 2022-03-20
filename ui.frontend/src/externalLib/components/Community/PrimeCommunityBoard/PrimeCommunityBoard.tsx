import {
  SOCIAL_MORE_OPTIONS_SVG, 
  SOCIAL_ACTIVITY_INDEX_HIGH_SVG,
  SOCIAL_ACTIVITY_INDEX_MEDIUM_SVG,
  SOCIAL_ACTIVITY_INDEX_LOW_SVG,
} from "../../../utils/inline_svg"
import { PrimeCommunityBoardOptions } from "../PrimeCommunityBoardOptions";
import { PrimeAlertDialog } from "../PrimeAlertDialog";
import { formatDate } from "../../../utils/dateTime";
import GlobeOutline from "@spectrum-icons/workflow/GlobeOutline"
import LockOpen from "@spectrum-icons/workflow/LockOpen"
import LockClosed from "@spectrum-icons/workflow/LockClosed"
import Info from "@spectrum-icons/workflow/Info"
import FileTxt from "@spectrum-icons/workflow/FileTxt"
import Visibility from "@spectrum-icons/workflow/Visibility"
import UserGroup from "@spectrum-icons/workflow/UserGroup"
import Clock from "@spectrum-icons/workflow/Clock"
import { getALMObject } from "../../../utils/global";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useBoardOptions } from "../../../hooks/community";
import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
import styles from "./PrimeCommunityBoard.module.css";

const PrimeCommunityBoard  = (props: any) => {
  const { formatMessage } = useIntl();
  let board = props.board;
  let showBoardOptions = false;
  const [isBoardOptionsOpen, setIsBoardOptionsOpen] = useState(showBoardOptions);
  const { reportBoard } = useBoardOptions();
  const [ showConfirmation, setShowConfirmation ] = useState(false);
  
  const boardSkills = board.skills?.map((skill: any, index: any) => {
    return (index ? ', ': '') + skill.name;
  });

  const toggleBoardOptionsHandler = () => {
    setIsBoardOptionsOpen((prevState) => !prevState);
  };

  const boardNameClickHandler = () => {
    getALMObject().navigateToBoardDetailsPage(board.id);
  }

  const reportBoardHandler = () => {
    setShowConfirmation(true);
  }

  const callReportBoard = async() => {
    try {
      await reportBoard(board.id);
    } catch(Exception){};
    hideConfirmationDialog();
  }

  const hideConfirmationDialog = () => {
      setShowConfirmation(false);
  }

  return (
    <>
    <div className={styles.primeBoardWrapper}>
      <div className={styles.primeBoardItem}>
        <div className="prime-title-skills-container">
          {/* <span id="sr-only">${i18n(state.locale).BOARD}</span> */}
          <button className={styles.primeBoardOptions} onClick={toggleBoardOptionsHandler} id={"prime-board-options-" + board.id}>
            {SOCIAL_MORE_OPTIONS_SVG()}
            {isBoardOptionsOpen && 
              <PrimeCommunityBoardOptions board={board} boardOptionsHandler={toggleBoardOptionsHandler} reportBoardHandler={reportBoardHandler}></PrimeCommunityBoardOptions>
            }  
          </button>
          {showConfirmation &&
            <PrimeAlertDialog
            variant="confirmation"
            title="Confirmation Required"
            primaryActionLabel="Report"
            onPrimaryAction={callReportBoard}
            secondaryActionLabel="Cancel"
            onSecondaryAction={hideConfirmationDialog}
            body="Are you sure you want to report this board? A notification will be sent to the board administrator and moderators."
            ></PrimeAlertDialog>
          }
          <div className={styles.primeBoardName} role="link" tabIndex={0} onClick={boardNameClickHandler}>{board.name}</div>
          <div className={styles.primeBoardSkill}>
            {boardSkills && 
              <span className={styles.primeBoardSkillNames}>
                {formatMessage({id: "prime.community.board.skills", defaultMessage: "Skills"})}: {boardSkills}
              </span>
            }
            <div className={styles.primeBoardIcon} title={
              board.visibility === "PUBLIC" ? 
                formatMessage({
                  id: "prime.community.board.public",
                  defaultMessage: "Public Board",
                }) 
                : board.visibility === "PRIVATE" ?
                  formatMessage({
                    id: "prime.community.board.private",
                    defaultMessage: "Private Board",
                  })
                  :
                  formatMessage({
                    id: "prime.community.board.restricted",
                    defaultMessage: "Restricted Board",
                })
              }
              >  
              {board.visibility === "PUBLIC" ? <GlobeOutline/> : board.visibility === "PRIVATE" ? <LockClosed/> : <LockOpen/>}
            </div>
          </div>
        </div>
        <PrimeCommunityObjectBody object={board} type="board"></PrimeCommunityObjectBody>
        <div className={styles.primeBoardActivityPanel}>
            <div className={styles.primeBoardActivityStats}>
                <div className={styles.primeActivityStatsIcon}>
                  {board.visibility === "HIGH" ? SOCIAL_ACTIVITY_INDEX_HIGH_SVG() : 
                    board.visibility === "NORMAL" ? SOCIAL_ACTIVITY_INDEX_MEDIUM_SVG() : SOCIAL_ACTIVITY_INDEX_LOW_SVG()}
                </div>
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
                <div className={styles.primeActivityInfoIcon} data-toggle="tooltip" data-trigger="hover" data-tooltip-position="right" title={
                  formatMessage({
                    id: "prime.community.board.activityCalc",
                    defaultMessage: "Calculated daily based on the number of new posts, comments, participants, views, likes and dislikes",
                  })}>
                  {<Info/>}
                </div>
            </div>
            <div className={styles.primeVerticalSeperator}></div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {<FileTxt/>}
              </div>
              <span className={styles.primeActivityStatsText}>
                {board.postCount} {formatMessage({id: "prime.community.board.post.label", defaultMessage: "Post(s)",})}
              </span>
            </div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {<Visibility/>}
              </div>
              <span className={styles.primeActivityStatsText}>
                {board.viewsCount} {formatMessage({id: "prime.community.board.view.label", defaultMessage: "View(s)",})}
              </span>
            </div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {<UserGroup/>}
              </div>
              <span className={styles.primeActivityStatsText}>
                {board.userCount} {formatMessage({id: "prime.community.board.people.label", defaultMessage: "People",})}
              </span>
            </div>
            <div className={styles.primeVerticalSeperator}></div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {<Clock/>}
              </div>
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
