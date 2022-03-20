import { useBoardOptions } from "../../../hooks/community";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityBoardOptions.module.css";
import { useRef, useEffect } from "react";
import { getALMConfig, getALMObject } from "../../../utils/global";

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

  const copyUrlHandler = () => {
    const primeConfig = getALMConfig();
    const hostUrl = primeConfig.almBaseURL;
    const boardUrl = hostUrl + "/app/learner/#/social/board/" + boardId;
    copyUrl(boardUrl);
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
              id: "prime.community.board.removeFromFavourites",
              defaultMessage: "Remove from Favourites",
            })}
          </div>
        ) : (
          <div
            className={styles.primeBoardOption}
            onClick={addFavouriteHandler}
          >
            {formatMessage({
              id: "prime.community.board.addToFavourites",
              defaultMessage: "Add to Favourites",
            })}
          </div>
        )} */}
        <div className={styles.primeBoardOption} onClick={copyUrlHandler}>
          {formatMessage({
            id: "prime.community.board.copyUrl",
            defaultMessage: "Copy URL",
          })}
        </div>
        <div className={styles.primeSeperator}></div>
        {/* <div className={styles.primeBoardCriticalOption} onClick={deleteBoardHandler}>
                {
                    formatMessage({
                    id: "prime.community.board.delete",
                    defaultMessage: "Delete",
                    })
                }
            </div> */}
        <div
          className={styles.primeBoardCriticalOption}
          onClick={reportBoardHandler}
        >
          {formatMessage({
            id: "prime.community.board.report",
            defaultMessage: "Report",
          })}
        </div>
      </div>
    </>
  );
};

export default PrimeCommunityBoardOptions;
