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
// import { useBoardOptions } from "../../../hooks/community";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityBoardOptions.module.css";
import { useRef, useEffect } from "react";
import { getALMConfig } from "../../../utils/global";

const PrimeCommunityBoardOptions = (props: any) => {
  const ref = useRef<any>();
  const { formatMessage } = useIntl();
  const boardId = props.board.id;
  // const { addBoardToFavourite, removeBoardFromFavourite } = useBoardOptions();
  // const accountId = props.board.createdBy.account.id;
  // const isFavourite = props.board.isFavorite;

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        props.boardOptionsHandler && props.boardOptionsHandler();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  // const addFavouriteHandler = () => {
  //   addBoardToFavourite(boardId);
  // };
  // const removeFavouriteHandler = () => {
  //   removeBoardFromFavourite(boardId);
  // };

  // const deleteBoardHandler = () => {
  //     deleteBoardFromServer(boardId, accountId);
  // }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url); //to-do need to check in all browsers
  };

  const copyBoardUrlHandler = () => {
    let { communityBoardDetailsPath } = getALMConfig();
    let domain = new URL(window.location.href);
    let hostUrl =
      domain.protocol +
      "//" +
      domain.hostname +
      (domain.port ? ":" + domain.port : "") +
      communityBoardDetailsPath;
    const boardUrl = hostUrl + "/boardId/" + boardId;
    copyUrl(boardUrl);
    if (typeof props.copyBoardUrlHandler === "function") {
      props.copyBoardUrlHandler();
    }
  };

  const reportBoardHandler = () => {
    if (typeof props.reportBoardHandler === "function") {
      props.reportBoardHandler();
    }
  };

  return (
    <>
      <div ref={ref} className={styles.primeBoardOptionsList}>
        {/* {isFavourite ? (
          <div
            className={styles.primeBoardOption}
            onClick={removeFavouriteHandler}
          >
            {formatMessage({
              id: "alm.community.board.removeFromFavourites",
              defaultMessage: "Remove from Favourites",
            })}
          </div>
        ) : (
          <div
            className={styles.primeBoardOption}
            onClick={addFavouriteHandler}
          >
            {formatMessage({
              id: "alm.community.board.addToFavourites",
              defaultMessage: "Add to Favourites",
            })}
          </div>
        )} */}
        <div className={styles.primeBoardOption} onClick={copyBoardUrlHandler}>
          {formatMessage({
            id: "alm.community.board.copyUrl",
            defaultMessage: "Copy URL",
          })}
        </div>
        <div className={styles.primeSeperator}></div>
        {/* <div className={styles.primeBoardCriticalOption} onClick={deleteBoardHandler}>
                {
                    formatMessage({
                    id: "alm.text.delete",
                    defaultMessage: "Delete",
                    })
                }
            </div> */}
        <div className={styles.primeBoardCriticalOption} onClick={reportBoardHandler}>
          {formatMessage({
            id: "alm.community.board.report",
            defaultMessage: "Report",
          })}
        </div>
      </div>
    </>
  );
};

export default PrimeCommunityBoardOptions;
