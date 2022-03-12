import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { useBoard } from "../../hooks/community";
import { usePosts } from "../../hooks/community";
import styles from "./PrimeCommunityBoardPage.module.css";
import { PrimeCommunityAddPost } from "../PrimeCommunityAddPost";
import { PrimeCommunityPosts } from "../PrimeCommunityPosts";
import { PrimeCommunitySearch } from "../PrimeCommunitySearch";
import { PrimeCommunityMobileBackBanner } from "../PrimeCommunityMobileBackBanner";
import { PrimeCommunityMobileScrollToTop } from "../PrimeCommunityMobileScrollToTop";
// import { PrimeCommunitySearch } from "../PrimeCommunitySearch";

import { useState } from "react";
import { useIntl } from "react-intl";
import loadingImage from "../../assets/images/LoadingButton.gif";
import { getALMConfig, getPathParams } from "../../utils/global";
const BOARD_ID_STR = "boardId";

const PrimeCommunityBoardPage = () => {
  const [boardId] = useState(() => {
    let { communityBoardsPath } = getALMConfig();
    let pathParams = getPathParams(communityBoardsPath, [BOARD_ID_STR]);
    return pathParams[BOARD_ID_STR];
  });
  const { item } = useBoard(boardId);
  const { formatMessage } = useIntl();
  const { fetchPosts } = usePosts();
  const [showLoader, setShowLoader] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResult, setSearchResult] = useState(0);

  const showLoaderHandler = (value: any) => {
    setShowLoader(value);
  };

  const searchCountHandler = (value: any) => {
    setSearchResult(
      value
        ? value.length
        : formatMessage({
            id: "prime.community.search.no.label",
            defaultMessage: "No",
          })
    );
  };

  const searchModeHandler = (value: any) => {
    setIsSearchMode(value);
  };

  const resetSearchHandler = async () => {
    setIsSearchMode(false);
    setSearchResult(0);
    setShowLoader(true);
    await fetchPosts(boardId);
    setShowLoader(false);
  };

  return (
    <>
      {/* Below 2 are seen only in mobile view */}
      <PrimeCommunityMobileBackBanner></PrimeCommunityMobileBackBanner>
      <PrimeCommunityMobileScrollToTop></PrimeCommunityMobileScrollToTop>

      <div className={styles.primeCommunitySearchContainer}>
        {item && (
          <PrimeCommunitySearch
            objectId={item.id}
            type="board"
            searchCountHandler={(value: any) => searchCountHandler(value)}
            showLoaderHandler={showLoaderHandler}
            searchModeHandler={searchModeHandler}
            resetSearchHandler={resetSearchHandler}
            placeHolderText={formatMessage({
              id: "prime.community.searchInBoard.placeholder",
              defaultMessage: "Search within board",
            })}
          ></PrimeCommunitySearch>
        )}
      </div>
      <div className={styles.primeBoardParent}>
        {item && <PrimeCommunityBoard board={item}></PrimeCommunityBoard>}
      </div>
      {item && (
        <PrimeCommunityAddPost boardId={item.id}></PrimeCommunityAddPost>
      )}
      {showLoader && (
        <div className={styles.primeLoaderWrapper}>
          <img
            className={styles.primeLoader}
            src={loadingImage}
            alt="loading"
          ></img>
        </div>
      )}
      {isSearchMode && !showLoader && (
        <div className={styles.primeCommunitySearchStatus}>
          <div className={styles.primeCommunitySearchCount}>
            {searchResult}{" "}
            {formatMessage({
              id: "prime.community.search.resultFound",
              defaultMessage: "result(s) found",
            })}
          </div>
          <button
            className={styles.primeCommunitySearchClear}
            onClick={resetSearchHandler}
          >
            (
            {formatMessage({
              id: "prime.community.search.clear.label",
              defaultMessage: "Clear",
            })}
            )
          </button>
        </div>
      )}
      {item && <PrimeCommunityPosts boardId={item.id}></PrimeCommunityPosts>}
    </>
  );
};

export default PrimeCommunityBoardPage;
