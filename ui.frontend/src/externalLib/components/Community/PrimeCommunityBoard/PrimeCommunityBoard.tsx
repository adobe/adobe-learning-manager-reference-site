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
import {
  SOCIAL_MORE_OPTIONS_SVG,
  SOCIAL_ACTIVITY_INDEX_HIGH_SVG,
  SOCIAL_ACTIVITY_INDEX_MEDIUM_SVG,
  SOCIAL_ACTIVITY_INDEX_LOW_SVG,
} from "../../../utils/inline_svg";
import { PrimeCommunityBoardOptions } from "../PrimeCommunityBoardOptions";
import { GetFormattedDate } from "../../../utils/dateTime";
import GlobeOutline from "@spectrum-icons/workflow/GlobeOutline";
import LockOpen from "@spectrum-icons/workflow/LockOpen";
import LockClosed from "@spectrum-icons/workflow/LockClosed";
import Info from "@spectrum-icons/workflow/Info";
import FileTxt from "@spectrum-icons/workflow/FileTxt";
import Visibility from "@spectrum-icons/workflow/Visibility";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import Clock from "@spectrum-icons/workflow/Clock";
import { getALMConfig, getALMObject } from "../../../utils/global";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useBoardOptions } from "../../../hooks/community";
import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
import styles from "./PrimeCommunityBoard.module.css";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { BOARD, HIGH, NORMAL, PRIVATE, PUBLIC } from "../../../utils/constants";

const PrimeCommunityBoard = (props: any) => {
  const { formatMessage } = useIntl();
  let board = props.board;
  let showBoardOptions = false;
  const [isBoardOptionsOpen, setIsBoardOptionsOpen] =
    useState(showBoardOptions);
  const { reportBoard } = useBoardOptions();
  const [almAlert] = useAlert();
  const [almConfirmationAlert] = useConfirmationAlert();
  const config = getALMConfig();

  const boardSkills = board.skills?.map((skill: any, index: any) => {
    return (index ? ", " : "") + skill.name;
  });

  const toggleBoardOptionsHandler = () => {
    setIsBoardOptionsOpen((prevState) => !prevState);
  };

  const boardNameClickHandler = () => {
    getALMObject().navigateToBoardDetailsPage(board.id);
  };

  const reportBoardHandler = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      formatMessage({
        id: "alm.community.board.reportBoardMessage",
        defaultMessage:
          "Are you sure you want to report this board? A notification will be sent to the board administrator and moderators.",
      }),
      formatMessage({
        id: "alm.community.board.report",
        defaultMessage: "Report",
      }),
      formatMessage({
        id: "alm.community.cancel.label",
        defaultMessage: "Cancel",
      }),
      callReportBoard
    );
  };

  const copyBoardUrlHandler = () => {
    almAlert(
      true,
      formatMessage({
        id: "alm.community.board.copyUrlSuccess",
        defaultMessage: "URL copied successfully",
      }),
      AlertType.success
    );
  };

  const callReportBoard = async () => {
    await reportBoard(board.id);
  };

  return (
    <>
      <div className={styles.primeBoardWrapper}>
        <div
          className={
            props.showBorder
              ? styles.primeBoardItemWithBorder
              : styles.primeBoardItem
          }
        >
          <div className="prime-title-skills-container">
            <button
              className={styles.primeBoardOptions}
              onClick={toggleBoardOptionsHandler}
              id={"prime-board-options-" + board.id}
            >
              {SOCIAL_MORE_OPTIONS_SVG()}
              {isBoardOptionsOpen && (
                <PrimeCommunityBoardOptions
                  board={board}
                  boardOptionsHandler={toggleBoardOptionsHandler}
                  reportBoardHandler={reportBoardHandler}
                  copyBoardUrlHandler={copyBoardUrlHandler}
                ></PrimeCommunityBoardOptions>
              )}
            </button>
            <div className={styles.primeBoardName} role="link" tabIndex={0}>
              <span
                className={styles.primeBoardNameSpan}
                onClick={boardNameClickHandler}
              >
                {board.name}
              </span>
            </div>
            <div className={styles.primeBoardSkill}>
              {boardSkills && (
                <span className={styles.primeBoardSkillNames}>
                  {formatMessage({
                    id: "alm.community.board.skills",
                    defaultMessage: "Skills",
                  })}
                  : {boardSkills}
                </span>
              )}
              <div
                className={styles.primeBoardIcon}
                title={
                  board.visibility === PUBLIC
                    ? formatMessage({
                        id: "alm.community.board.public",
                        defaultMessage: "Public Board",
                      })
                    : board.visibility === PRIVATE
                    ? formatMessage({
                        id: "alm.community.board.private",
                        defaultMessage: "Private Board",
                      })
                    : formatMessage({
                        id: "alm.community.board.restricted",
                        defaultMessage: "Restricted Board",
                      })
                }
              >
                {board.visibility === PUBLIC ? (
                  <GlobeOutline />
                ) : board.visibility === PRIVATE ? (
                  <LockClosed />
                ) : (
                  <LockOpen />
                )}
              </div>
            </div>
          </div>
          <PrimeCommunityObjectBody
            object={board}
            type={BOARD}
          ></PrimeCommunityObjectBody>
          <div className={styles.primeBoardActivityPanel}>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {board.activityLevel === HIGH
                  ? SOCIAL_ACTIVITY_INDEX_HIGH_SVG()
                  : board.activityLevel === NORMAL
                  ? SOCIAL_ACTIVITY_INDEX_MEDIUM_SVG()
                  : SOCIAL_ACTIVITY_INDEX_LOW_SVG()}
              </div>
              <span className={styles.primeActivityStatsText}>
                {board.activityLevel === HIGH
                  ? formatMessage({
                      id: "alm.community.board.highActivity",
                      defaultMessage: "High Activity",
                    })
                  : board.activityLevel === NORMAL
                  ? formatMessage({
                      id: "alm.community.board.normalActivity",
                      defaultMessage: "Normal Activity",
                    })
                  : formatMessage({
                      id: "alm.community.board.lowActivity",
                      defaultMessage: "Low Activity",
                    })}
              </span>
              <div
                className={styles.primeActivityInfoIcon}
                data-toggle="tooltip"
                data-trigger="hover"
                data-tooltip-position="right"
                title={formatMessage({
                  id: "alm.community.board.activityCalc",
                  defaultMessage:
                    "Calculated daily based on the number of new posts, comments, participants, views, likes and dislikes",
                })}
              >
                {<Info />}
              </div>
            </div>
            <div className={styles.primeVerticalSeperator}></div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>{<FileTxt />}</div>
              <span className={styles.primeActivityStatsText}>
                {board.postCount}{" "}
                {formatMessage({
                  id: "alm.community.board.post.label",
                  defaultMessage: "Post(s)",
                })}
              </span>
            </div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {<Visibility />}
              </div>
              <span className={styles.primeActivityStatsText}>
                {board.viewsCount}{" "}
                {formatMessage({
                  id: "alm.community.board.view.label",
                  defaultMessage: "View(s)",
                })}
              </span>
            </div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>
                {<UserGroup />}
              </div>
              <span className={styles.primeActivityStatsText}>
                {board.userCount}{" "}
                {formatMessage({
                  id: "alm.community.board.people.label",
                  defaultMessage: "People",
                })}
              </span>
            </div>
            <div className={styles.primeVerticalSeperator}></div>
            <div className={styles.primeBoardActivityStats}>
              <div className={styles.primeActivityStatsIcon}>{<Clock />}</div>
              <span className={styles.primeActivityStatsText}>
                {formatMessage({
                  id: "alm.community.board.createdOn.label",
                  defaultMessage: "Created on ",
                })}
                {GetFormattedDate(board.dateCreated, config.locale)}
                {formatMessage({
                  id: "alm.community.board.by.label",
                  defaultMessage: " by ",
                })}
                {board.createdBy.name !== ""
                  ? board.createdBy.name
                  : formatMessage({
                      id: "alm.community.board.anoymous.label",
                      defaultMessage: "Anonymous",
                    })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrimeCommunityBoard;
