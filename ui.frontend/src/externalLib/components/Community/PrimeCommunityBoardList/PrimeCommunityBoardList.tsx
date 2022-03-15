import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { PrimeCommunityBoardFilters } from "../PrimeCommunityBoardFilters";
import { PrimeCommunityMobileBackBanner } from "../PrimeCommunityMobileBackBanner";
import { PrimeCommunityMobileScrollToTop } from "../PrimeCommunityMobileScrollToTop";
import { useBoards, usePosts } from "../../../hooks/community";
import { useEffect, useState } from "react";
import { PrimeCommunitySearch } from "../PrimeCommunitySearch";
import { PrimeCommunityPost } from "../PrimeCommunityPost";
import { getQueryParamsIObjectFromUrl } from "../../../utils/global"
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityBoardList.module.css";
import loadingImage from "../../../assets/images/LoadingButton.gif";

const PrimeCommunityBoardList = () => {
  const queryParams = getQueryParamsIObjectFromUrl();
  const DEFAULT_SORT_VALUE = "dateUpdated";
  const DEFAULT_SKILL = queryParams ? queryParams.skill : "";
  const { items, fetchBoards, skills, currentSkill } = useBoards(DEFAULT_SORT_VALUE, DEFAULT_SKILL);
  const { posts } = usePosts();
  const { formatMessage } = useIntl();
  const [selectedSortFilter, setSelectedSortFilter] =
    useState(DEFAULT_SORT_VALUE);
  const [selectedSkill, setSelectedSkill] = useState(currentSkill);
  const [showLoader, setShowLoader] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResult, setSearchResult] = useState(0);

  useEffect(() => {
    if(items) {
      setShowLoader(false);
    }
  }, [items])

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
    await fetchBoards(selectedSortFilter, selectedSkill);
    setShowLoader(false);
  };

  const sortFilterChangeHandler = (sortValue: any) => {
    setSelectedSortFilter(sortValue);
    fetchBoards(sortValue, selectedSkill);
  };

  const skillFilterChangeHandler = (skill: any) => {
    setSelectedSkill(skill);
    fetchBoards(selectedSortFilter, skill);
  };

  return (
    <>
      <div>
        {/* Below 2 are seen only in mobile view */}
        <PrimeCommunityMobileBackBanner></PrimeCommunityMobileBackBanner>
        <PrimeCommunityMobileScrollToTop></PrimeCommunityMobileScrollToTop>

        <div className={styles.primeCommunityHeaderRow}>
          <PrimeCommunityBoardFilters
            skills={skills}
            selectedSkill={currentSkill}
            sortFilterChangeHandler={sortFilterChangeHandler}
            skillFilterChangeHandler={skillFilterChangeHandler}
          ></PrimeCommunityBoardFilters>
          <div className={styles.primeCommunitySearchContainer}>
            <PrimeCommunitySearch
              objectId={selectedSkill}
              type="skill"
              searchCountHandler={(value: any) => searchCountHandler(value)}
              showLoaderHandler={showLoaderHandler}
              searchModeHandler={searchModeHandler}
              resetSearchHandler={resetSearchHandler}
              placeHolderText={formatMessage({
                id: "prime.community.search.placeholder",
                defaultMessage: "Search within community",
              })}
            ></PrimeCommunitySearch>
          </div>
        </div>
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
        {isSearchMode &&
          posts?.length > 0 &&
          posts.map((post) => (
            <PrimeCommunityPost post={post} key={post.id}></PrimeCommunityPost>
          ))}
        {!isSearchMode && items?.length > 0 &&
          items?.map((board) => (
            <PrimeCommunityBoard
              board={board}
              key={board.id}
            ></PrimeCommunityBoard>
          ))
        }
        {!isSearchMode && items?.length === 0 &&
          <div className={styles.primeCommunityNoBoardFound}>
            {formatMessage({
                id: "prime.community.noBoardMessage",
                defaultMessage: "No boards found",
            })}
          </div>
        }
      </div>
    </>
  );
};

export default PrimeCommunityBoardList;
