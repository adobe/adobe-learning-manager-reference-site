import { useState } from "react";
import { useIntl } from "react-intl";
import loadingImage from "../../assets/images/LoadingButton.gif";
import { useBoard, usePosts } from "../../hooks/community";
import { PrimeCommunityAddPost } from "../PrimeCommunityAddPost";
import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { PrimeCommunityPosts } from "../PrimeCommunityPosts";
import { PrimeCommunitySearch } from "../PrimeCommunitySearch";
import styles from "./PrimeCommunityBoardPage.module.css";

const PrimeCommunityBoardPage = () => {
  // const boardId = "10285";
  const boardId = "9709"; //to-do remove hardcoded value
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
