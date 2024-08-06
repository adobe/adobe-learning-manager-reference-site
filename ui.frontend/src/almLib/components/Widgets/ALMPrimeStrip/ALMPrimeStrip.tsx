/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CATALOG_CARD_HEIGHT,
  DEFAULT_MAX_CARDS,
  PrimeEvent,
  Widget,
  WidgetType,
  WidgetTypeNew,
} from "../../../utils/widgets/common";
import {
  BASE_AOI_STRIP_COUNT,
  IPrimeStripHeading,
  MAX_AOI_STRIP_COUNT,
  getHeading,
  handleKeyDownEvent,
  handleLinkClick,
  isPrimeLearningObject,
  isSkillInterestViewUpdate,
  sliceArrayIntoChunks,
} from "../../../utils/widgets/utils";

import { usePrimeStrip } from "../../../hooks";
import {
  DOWN_ARROW_FILLED,
  EMPTY_CARD_SVG,
  LEFT_ARROW_SVG,
  SEARCH_ICON_SVG,
} from "../../../utils/inline_svg";
import { PrimeAccount, PrimeLearningObject, PrimeUser } from "../../../models";
import {
  GetSkillsPageLink,
  PrimeDispatchEvent,
} from "../../../utils/widgets/base/EventHandlingBase";
import {
  IsFlexibleWidth,
  getALMConfig,
  getALMObject,
  getWidgetConfig,
  getWindowObject,
} from "../../../utils/global";
import styles from "./ALMPrimeStrip.module.css";
import { GetTranslation } from "../../../utils/translationService";
import PrimeTrainingCardV2 from "../../Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2";
import {
  getEmptyActionCardDetails,
  isAnnouncementRecoUGWLinkEnable,
  showAuthorInfo,
  showBookmark,
  showDontRecommend,
  showEffectivenessIndex,
  showPRLInfo,
  showProgressBar,
  showRating,
  showRecommendedReason,
  showSkills,
} from "./ALMPrimeStrip.helper";
import { INDIVIDUAL, JOBAID, MODE, update, VIEW } from "../../../utils/constants";
import { ALMBrowseCatalog } from "../ALMBrowseCatalog";
import {
  handleLinkCLick,
  canShowPrice,
  launchPlayerHandler,
  openJobAid,
} from "../../Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { PrimeFeedbackWrapper } from "../../ALMFeedback";
import { useFeedback } from "../../../hooks/feedback";

export const EXTRA_PADDING = 36;
const ROLL_SCROLL_TIME = 1000;

export interface IPrimeStripElementMeta {
  numRows?: number;
  itemsPerRow: number;
  heightPerRow: number;
}

const nameId = "cb-name";
const leftArrowId = "cb-leftNav";
const rightArrowId = "cb-rightNav";
const cardContainerId = "cb-cardHolder";

const ALMPrimeStrip: React.FC<{
  widget: Widget;
  doRefresh: boolean;
  aoiStripCount?: number;
  account: PrimeAccount;
  user: PrimeUser;
}> = ({ widget, doRefresh, aoiStripCount, account, user }) => {
  const rollContainer = useRef<HTMLDivElement>(null);
  const {
    fetchedAll,
    fetchingData,
    items,
    maxStripCount,
    skillName,
    fetchMore,
    firstFetchDone,
    addBookmarkHandler,
    removeBookmarkHandler,
    removeItemFromList,
    blockLORecommendationHandler,
    unblockLORecommendationHandler,
    enrollmentHandler,
    updateLearningObject,
  } = usePrimeStrip(widget, account);
  const [state, setState] = useState({
    heading: undefined as IPrimeStripHeading | undefined,
    containerWidth: "",
    containerHeight: "",
    numRows: 1,
    itemsPerPage: 1,
    enableArrows: true,
    cardContainerWidth: "",
    searchString: "",
    firstVisibleItemPosition: 0,
    loadingItemsNeeded: 0, //at max = itemsPerPage
    noResultsItemsNeeded: getWidgetConfig()?.isMobile ? 2 : 5,
    hideList: false,
    isSmoothScrolling: false,
    maxScrollWidthAvailable: Number.POSITIVE_INFINITY, //caching this instead of querying dom
    disableRightNavIcon: false,
    disableLeftNavIcon: false,
  });
  const {
    heading,
    containerWidth,
    containerHeight,
    numRows,
    itemsPerPage,
    enableArrows,
    cardContainerWidth,
    searchString,
    firstVisibleItemPosition,
    hideList,
    disableRightNavIcon,
    disableLeftNavIcon,
  } = state;
  const {
    feedbackTrainingId,
    trainingInstanceId,
    playerLaunchTimeStamp,
    shouldLaunchFeedback,
    handleL1FeedbackLaunch,
    fetchCurrentLo,
    getFilteredNotificationForFeedback,
    submitL1Feedback,
    closeFeedbackWrapper,
  } = useFeedback();

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    fetchMore();
  }, []);
  useEffect(() => {
    if (
      firstFetchDone &&
      items.length === 0 &&
      (widget.type == WidgetTypeNew.ADMIN_RECO ||
        widget.type == WidgetTypeNew.RECOMMENDATIONS_STRIP ||
        widget.type == WidgetTypeNew.BOOKMARKS ||
        widget.type == WidgetTypeNew.AOI_RECO ||
        widget.type === WidgetTypeNew.CATALOG_BROWSER)
    ) {
      setState(prevState => {
        return { ...prevState, hideList: true };
      });
      widget.attributes!.isStripHidden = true;
    }
  }, [firstFetchDone, items.length]);

  useEffect(() => {
    if (!account) {
      return;
    }
    let stripMetaInfo: any;
    if (!heading || skillName) {
      stripMetaInfo = getHeading(widget, account, searchString, {
        skillName: skillName,
      });
      if (stripMetaInfo && widget.attributes!.disableLinks) {
        stripMetaInfo.link = undefined;
        stripMetaInfo.seeAllLink = undefined;
      }
    }
    const lastUpdated = new Date();
    widget.attributes!.heading = stripMetaInfo.name;
    setState(prevState => ({
      ...prevState,
      heading: stripMetaInfo,
      lastUpdated: lastUpdated,
    }));
  }, [widget, skillName, account]);
  const onResizeInternal = useCallback(() => {
    //for now taking the entire width, but this should change
    const stripMetaInfo = getStripMetaInfo(widget);
    const numRows = stripMetaInfo.numRows || 1;

    let numCardsToConsider = (widget?.layoutAttributes as any)?.cardsToShow || DEFAULT_MAX_CARDS;

    if (IsFlexibleWidth()) {
      const isMobile = getWidgetConfig()?.isMobile;
      if (isMobile && widget?.layoutAttributes?.isFullRow) {
        numCardsToConsider = 2;
      }
    }
    const itemsPerPage = numCardsToConsider * numRows;

    const containerWidth =
      Math.min(getWindowObject().innerWidth, numCardsToConsider * CARD_WIDTH) + "px";
    const cardContainerWidth = numCardsToConsider * CARD_WIDTH + "px";
    const containerHeight = numRows * stripMetaInfo.heightPerRow;
    const containerHeightPx = containerHeight + (numRows - 1) * EXTRA_PADDING + "px";

    setState(prevState => ({
      ...prevState,
      numRows,
      itemsPerPage,
      containerWidth,
      cardContainerWidth,
      containerHeight: containerHeightPx,
      enableArrows,
    }));
    // updateTotalItems();
  }, [numRows, itemsPerPage, containerWidth, cardContainerWidth, containerHeight, enableArrows]);
  useEffect(() => {
    onResizeInternal();
  }, [doRefresh]);

  const getLoadingCards = useCallback(() => {
    const arr = getRowArrsByPageArr(Array.from({ length: itemsPerPage * numRows }));

    return arr.map((rowArrs, _pageIdx) => {
      return (
        <div
          className={styles.stripCardContainerPage}
          style={{
            width: cardContainerWidth,
            height: containerHeight,
          }}
          data-page-index={_pageIdx}
        >
          {rowArrs.map((rowArr, _rowIdx) => {
            return (
              <div
                className={styles.stripCardContainerPageRow}
                style={{ paddingTop: `${_rowIdx > 0 ? 20 : 0}px` }}
                key={_pageIdx + "_" + _rowIdx}
              >
                <ul>
                  {rowArr.map((element, idx) => {
                    return (
                      <li
                        key={_pageIdx + "_" + _rowIdx + "_" + idx}
                        data-index={_pageIdx + "_" + _rowIdx + "_" + idx}
                      >
                        <div className={styles.loadingCard}>
                          {getALMConfig()._cardProperties.cardLoadingImage}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      );
    });
  }, [itemsPerPage, numRows]);
  const pageTemplate = useCallback(
    (rowsArrByPage: any[][], _pageIdx: number, widgetType: WidgetTypeNew) => {
      const isBrowseCatalogWidget = widget.type === WidgetTypeNew.CATALOG_BROWSER;
      return (
        <div
          className={styles.stripCardContainerPage}
          style={{
            width: cardContainerWidth,
            height: containerHeight,
          }}
          data-page-index={_pageIdx}
          key={_pageIdx}
        >
          {rowsArrByPage.map((rowArr, _rowIdx) => {
            return (
              <div
                className={styles.stripCardContainerPageRow}
                style={{ paddingTop: `${_rowIdx > 0 ? EXTRA_PADDING : 0}px` }}
                key={_pageIdx + "_" + _rowIdx}
              >
                <ul>
                  {rowArr.map((element, idx) => {
                    const item = isPrimeLearningObject(element.learningObject)
                      ? (element.learningObject as PrimeLearningObject)
                      : element;
                    return (
                      <li
                        key={`${item.id}_${widgetType}`}
                        data-index={_pageIdx + "_" + _rowIdx + "_" + idx}
                      >
                        <div
                          className={`${styles.loCard} ${
                            isBrowseCatalogWidget ? styles.catalogCard : ""
                          }`}
                        >
                          {getItemTemplate(widget, item, idx, element)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      );
    },
    [items.length, cardContainerWidth, containerHeight]
  );
  const getRowArrsByPageArr = useCallback(
    items => {
      const rowArrsByPageArr: any[][][] = [];
      const itemsPerRow = itemsPerPage / numRows;
      const pageSlicedElementsArr: any[][] = sliceArrayIntoChunks(items, itemsPerPage);
      for (let ii = 0; ii < pageSlicedElementsArr.length; ii++) {
        const rowSlicedElementsArrPerPage: any[] = sliceArrayIntoChunks(
          pageSlicedElementsArr[ii],
          itemsPerRow
        );
        rowArrsByPageArr.push(rowSlicedElementsArrPerPage);
      }
      return rowArrsByPageArr;
    },
    [itemsPerPage, numRows, items.length]
  );

  const getStripMetaInfo = (widget: Widget): IPrimeStripElementMeta => {
    let numRows = widget.attributes?.numStrips;
    if (!numRows) {
      if (
        widget.widgetRef == WidgetType.TRENDING_RECO ||
        widget.widgetRef == WidgetType.DISCOVERY_RECO
      )
        numRows = 2;
      else numRows = 1;

      numRows = 1;
    }

    const retval: IPrimeStripElementMeta = {
      numRows: numRows,
      itemsPerRow:
        widget.attributes?.numCards || widget.layoutAttributes?.cardsToShow || DEFAULT_MAX_CARDS,
      heightPerRow:
        WidgetTypeNew.CATALOG_BROWSER === widget.type
          ? CATALOG_CARD_HEIGHT
          : getALMConfig()?._cardProperties?.height || CARD_HEIGHT,
    };
    return retval;
  };

  const fetchIfNeeded = useCallback(
    (firstVisibleItemPosition: number) => {
      if (
        !fetchingData &&
        items.length &&
        items.length - firstVisibleItemPosition < itemsPerPage * 2
      ) {
        fetchMore();
      }
    },
    [itemsPerPage, items.length, fetchingData]
  );

  useEffect(() => {
    fetchIfNeeded(firstVisibleItemPosition);
  }, [items.length, firstVisibleItemPosition]);
  const resetSearch = () => {
    // (this.shadowRoot?.getElementById('search-input') as HTMLInputElement).value = '';
    // this.onInit();
  };

  const getFirstVisibleItemAfterSwipe = useCallback(
    (offsetLeftToUse: number): number => {
      //get the page which contains it
      const itemsPerRow = itemsPerPage / numRows;
      const oneItemWidth = CARD_WIDTH;
      const numItems = Math.round(offsetLeftToUse / oneItemWidth);
      const numPages = Math.floor(numItems / itemsPerRow);
      const retval = numPages * itemsPerPage + (numItems % itemsPerRow);
      //console.log("getFirstVisibleItemAfterSwipe offsetLeftToUse: ", offsetLeftToUse, "numItems: ", numItems, " firstVisibleReturned:", retval);
      return retval;
    },
    [itemsPerPage, numRows]
  );
  const rollAPage = useCallback(
    (right: boolean) => {
      let firstVisibleItemPosition_local = firstVisibleItemPosition;
      if (right) {
        firstVisibleItemPosition_local += itemsPerPage;
        fetchIfNeeded(firstVisibleItemPosition);
      } else {
        firstVisibleItemPosition_local -= itemsPerPage;
      }
      if (firstVisibleItemPosition < 0) {
        firstVisibleItemPosition_local = 0;
      }
      scrollTo(firstVisibleItemPosition_local, false, ROLL_SCROLL_TIME);
    },
    [firstVisibleItemPosition, itemsPerPage, items.length, fetchIfNeeded]
  );
  const scrollTo = useCallback(
    (firstVisibleItemPosition: number, smoothScrolling: boolean, scrollTime: number) => {
      const positionToUse = getItemOffsetLeft(
        firstVisibleItemPosition,
        smoothScrolling,
        itemsPerPage,
        numRows
      );
      if (positionToUse != rollContainer.current?.scrollLeft) {
        rollContainer.current?.scrollTo({
          left: positionToUse,
          behavior: "smooth",
        });
      }
      setState(prevState => ({
        ...prevState,
        firstVisibleItemPosition,
      }));
    },
    [itemsPerPage, numRows]
  );

  const getItemOffsetLeft = useCallback(
    (
      firstVisibleItemPosition: number,
      smoothScrolling: boolean,
      itemsPerPage: number,
      numRows: number
    ): number => {
      //get the page which contains it
      const itemsPerRow = itemsPerPage / numRows;
      const pageIdx = Math.floor(firstVisibleItemPosition / itemsPerPage);
      let smoothScrollingPartialCards = 0;
      if (smoothScrolling) {
        //find the nearest card
        smoothScrollingPartialCards = firstVisibleItemPosition % itemsPerRow;
        //console.log("smoothScrollingPartialCards", smoothScrollingPartialCards);
      }
      return (pageIdx * itemsPerRow + smoothScrollingPartialCards) * CARD_WIDTH;
    },
    [itemsPerPage, numRows]
  );
  const onScroll = useCallback(
    (event: any) => {
      if (fetchingData) return;
      const { target } = event;
      if ((items.length - (itemsPerPage + 5)) * CARD_WIDTH < target.scrollLeft) {
        fetchMore();
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      //this will be exexuted once the scrolls stops
      scrollTimeout.current = setTimeout(() => {
        setState(prevState => {
          const { scrollLeft, offsetWidth, scrollWidth } = target;
          const disableLeftNavIcon = scrollLeft === 0;
          const disableRightNavIcon = scrollLeft + offsetWidth === scrollWidth;
          const firstVisibleItemPosition = disableLeftNavIcon
            ? 0
            : getFirstVisibleItemAfterSwipe(scrollLeft);
          //NOTE: THis is to handle HAlf visible cards
          if (scrollLeft !== firstVisibleItemPosition * CARD_WIDTH) {
            const positionToScroll = getFirstVisibleItemAfterSwipe(target.scrollLeft);
            scrollTo(positionToScroll, true, ROLL_SCROLL_TIME);
          }
          return {
            ...prevState,
            disableRightNavIcon,
            firstVisibleItemPosition,
            disableLeftNavIcon,
          };
        });
      }, 500);
    },
    [
      itemsPerPage,
      items.length,
      fetchingData,
      firstVisibleItemPosition,
      fetchMore,
      getFirstVisibleItemAfterSwipe,
    ]
  );

  const isLeftNavIconDisabled = useCallback((): boolean => {
    return firstVisibleItemPosition === 0 || disableLeftNavIcon;
  }, [firstVisibleItemPosition, disableLeftNavIcon]);

  const isRightNavIconDisabled = useCallback((): boolean => {
    //if the list contains less items than itemsper page * numRows, then disable
    return (
      items.length <= itemsPerPage ||
      (firstVisibleItemPosition + itemsPerPage >= items.length && fetchedAll) ||
      disableRightNavIcon
    );
  }, [
    firstVisibleItemPosition,
    items.length,
    itemsPerPage,
    numRows,
    disableRightNavIcon,
    doRefresh,
  ]);

  const getStripLink = (
    id: string,
    automationdid: string,
    classToApply: string,
    labelKey: string,
    link: string
  ) => {
    return (
      <a
        className={classToApply}
        tabIndex={0}
        id={id}
        data-automationdid={automationdid}
        aria-label={GetTranslation(labelKey)}
        onClick={event => handleLinkClick(event, link)}
        onKeyDown={event => handleKeyDownEvent(event, link)}
      >
        {GetTranslation(labelKey)}
      </a>
    );
  };

  const containerHeadWithIconsHtml = () => {
    const headerAriaLabel = heading?.headerAriaLabel || heading?.name;
    return (
      <>
        {/* This is for Search */}
        {heading?.automationid === "primelxp-search" ? (
          <div className={styles.searchField}>
            {SEARCH_ICON_SVG()}
            <input
              className={styles.searchInput}
              id="search-input"
              data-automationid="search-input"
              placeholder={GetTranslation("catalog.search", true)}
            />
            <button className={styles.searchClear} onClick={resetSearch}></button>
          </div>
        ) : null}
        {heading?.name ? (
          <div className={styles.stripHeader}>
            <div className={styles.stripHeaderLeft}>
              <h2>
                <a
                  href="#"
                  className={`${styles.stripContainerName} ${heading?.headingClass}`}
                  role="heading"
                  id={nameId}
                  data-automationid={headerAriaLabel}
                  title={headerAriaLabel}
                  style={{
                    cursor: heading?.link ? "pointer" : "",
                  }}
                  dangerouslySetInnerHTML={{ __html: heading?.name! }}
                  onClick={event => handleLinkClick(event, heading?.link)}
                  data-skip-link-target={widget.layoutAttributes?.id}
                />
              </h2>
            </div>
            <div className={styles.stripHeaderRight}>
              {heading?.showAOIExploreLinks &&
                isSkillInterestViewUpdate() &&
                (!widget.attributes?.view || widget.attributes?.view !== INDIVIDUAL) && (
                  <>
                    {getStripLink(
                      "primelxp-view-skills",
                      "primelxp-view-skills",
                      `${styles.seeAll} ${styles.view}`,
                      "lo.strip.view",
                      `${GetSkillsPageLink()}?${MODE}=${VIEW}`
                    )}
                    <span className={`${styles.seeAll} ${styles.view}`}>/</span>
                    {getStripLink(
                      "primelxp-update-skills",
                      "primelxp-update-skills",
                      styles.seeAll,
                      "lo.strip.update",
                      `${GetSkillsPageLink()}?${MODE}=${update}`
                    )}
                  </>
                )}
              {heading?.seeAllLink &&
                getStripLink(
                  `${nameId}-see-all`,
                  `${nameId}-see-all`,
                  styles.seeAll,
                  "text.viewAll",
                  heading?.seeAllLink
                )}
              {getNavIcons()}
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const getNavIcons = () => {
    const rightNavIconDisabled = isRightNavIconDisabled();
    const leftNavIconDisabled = isLeftNavIconDisabled();
    if (rightNavIconDisabled && leftNavIconDisabled) return null;
    return (
      <div>
        <button
          id={leftArrowId}
          data-automationid={leftArrowId}
          disabled={leftNavIconDisabled}
          aria-label={GetTranslation("text.leftNavigation")}
          aria-disabled={leftNavIconDisabled}
          onClick={() => rollAPage(false)}
          className={`${styles.navIcon} ${styles.left}`}
        >
          {LEFT_ARROW_SVG()}
        </button>
        <button
          id={rightArrowId}
          data-automationid={rightArrowId}
          disabled={rightNavIconDisabled}
          aria-label={GetTranslation("text.rightNavigation")}
          aria-disabled={rightNavIconDisabled}
          onClick={() => rollAPage(true)}
          className={`${styles.navIcon}`}
        >
          {LEFT_ARROW_SVG()}
        </button>
      </div>
    );
  };

  const getFooterTemplate = useCallback(() => {
    const stripNum = widget.attributes?.stripNum;
    const stipCount = maxStripCount;
    const config = getALMObject();
    if (
      stripNum &&
      (stripNum == BASE_AOI_STRIP_COUNT || (stripNum == 1 && stipCount == 1)) &&
      aoiStripCount === 0
    ) {
      return (
        <div id="primelxp-container-footer-strip2" className={styles.extraActionContainer}>
          {heading?.showAOIExploreLinks && isSkillInterestViewUpdate() ? (
            <span>
              <a
                href="javascript:void(0)"
                data-automationid="primelxp-view-skills"
                onClick={() => {
                  config.navigateToSkillsPage(VIEW);
                }}
                className={styles.skillLinkReco}
              >
                {GetTranslation("lo.strip.view")}
              </a>
              /
              <a
                href="javascript:void(0)"
                data-automationid="primelxp-update-skills"
                onClick={() => {
                  config.navigateToSkillsPage(update);
                }}
                className={styles.skillLinkReco}
              >
                {GetTranslation("lo.strip.update")}
              </a>
            </span>
          ) : (
            ""
          )}
          {stipCount > 2 ? (
            <div className={styles.loadMoreButtonContainer}>
              <button
                className={styles.loadMoreButton}
                id="primelxp-aoi-strip-showmore-button"
                data-automationid="primelxp-aoi-strip-showmore-button"
                onClick={loadMoreAoiStrips}
              >
                <span>{GetTranslation("viewMore")}</span>
                {DOWN_ARROW_FILLED()}
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      );
    }
    if (
      stripNum &&
      stripNum > 2 &&
      (stripNum == stipCount || stripNum == MAX_AOI_STRIP_COUNT) &&
      aoiStripCount &&
      aoiStripCount > 0
    ) {
      return (
        <div className={styles.extraActionContainer}>
          {isSkillInterestViewUpdate() ? (
            <span>
              <a
                href="javascript:void(0)"
                data-automationid="primelxp-view-skills"
                className={styles.skillLinkReco}
                onClick={() => {
                  config.navigateToSkillsPage(VIEW);
                }}
              >
                {GetTranslation("lo.strip.view")}
              </a>
              /
              <a
                href="javascript:void(0)"
                data-automationid="primelxp-update-skills"
                // data-reflink={`${GetSkillsPageLink()}?mode=update`}
                className={styles.skillLinkReco}
                onClick={() => {
                  config.navigateToSkillsPage(update);
                }}
              >
                {GetTranslation("lo.strip.update")}
              </a>
            </span>
          ) : (
            ""
          )}
        </div>
      );
    }
  }, [maxStripCount, heading, aoiStripCount]);

  const loadMoreAoiStrips = useCallback(() => {
    const stripCount = maxStripCount || 0;
    const eventDetail = {
      maxStripCount: stripCount,
    };
    PrimeDispatchEvent(document, PrimeEvent.LOAD_EXTRA_STRIPS, false, eventDetail);
  }, [maxStripCount]);

  const handleAddBookmark = async (loId: string) => {
    return addBookmarkHandler && (await addBookmarkHandler(loId));
  };
  const handleRemoveBookmark = async (loId: string) => {
    return removeBookmarkHandler && (await removeBookmarkHandler(loId));
  };

  const handleBlockLORecommendation = async (loId: string) => {
    return blockLORecommendationHandler && (await blockLORecommendationHandler(loId));
  };
  const handleUnblockLORecommendation = async (loId: string) => {
    return unblockLORecommendationHandler && (await unblockLORecommendationHandler(loId));
  };
  const handleLoEnrollment = async (loId: string, loInstanceId: string) => {
    return enrollmentHandler && (await enrollmentHandler(loId, loInstanceId));
  };

  const getEmptyCardTemplate = useCallback(() => {
    const { actionLink, actionHelpText, actionText, actionLinkHeading } = getEmptyActionCardDetails(
      widget,
      items
    );
    return (
      <div className={styles.emptyCard}>
        <div className={styles.emptyCardImageContainer}>{EMPTY_CARD_SVG()}</div>
        <div className={styles.emptyCardMessageContainer}>
          <h2 className={`${styles.emptyCardHeading} ${styles.ellipsis}`}>{actionLinkHeading}</h2>
          <p className={`${styles.emptyCardHelper} ${styles.ellipsis}`}>{actionHelpText}</p>
          <a
            className={`${styles.emptyCardLink} ${styles.ellipsis}`}
            data-automationid="primelxp-lo-link"
            href="javascript:void(0)"
            onClick={event => handleLinkClick(event, actionLink)}
          >
            {actionText}
          </a>
        </div>
      </div>
    );
  }, [items.length, widget, account]);
  const getItemTemplate = (widget: Widget, item: any, index: number, arrayItem: any) => {
    const isBrowseCatalogWidget = widget.type === WidgetTypeNew.CATALOG_BROWSER;
    if (isBrowseCatalogWidget) {
      return (
        <ALMBrowseCatalog
          widget={widget}
          catalog={item}
          account={account}
          user={user}
          index={index}
        ></ALMBrowseCatalog>
      );
    }
    if (item.actionElement) {
      return getEmptyCardTemplate();
    }
    return (
      <PrimeTrainingCardV2
        widget={widget}
        training={item}
        showProgressBar={showProgressBar(item)}
        showDontRecommend={showDontRecommend(widget, account)}
        showBookmark={showBookmark(widget)}
        showSkills={showSkills(widget)}
        showPRLInfo={showPRLInfo(widget)}
        showRating={showRating(item, account)}
        showEffectivenessIndex={showEffectivenessIndex(item, account)}
        showRecommendedReason={showRecommendedReason(widget, item)}
        showAuthorInfo={showAuthorInfo(item)}
        showPrice={canShowPrice(item, account)}
        enableAnnouncementRecoUGWLink={isAnnouncementRecoUGWLinkEnable(widget, account)}
        recoReason={arrayItem?.reason}
        recoReasonModel={arrayItem?.reasonModel}
        account={account}
        user={user}
        handleAddBookmark={handleAddBookmark}
        handleRemoveBookmark={handleRemoveBookmark}
        removeItemFromList={removeItemFromList}
        handleBlockLORecommendation={handleBlockLORecommendation}
        handleUnblockLORecommendation={handleUnblockLORecommendation}
        handleLoEnrollment={handleLoEnrollment}
        updateLearningObject={updateLearningObject}
        handleLoNameClick={handleLoNameClick}
        handleActionClick={handleActionClick}
        handlePlayerLaunch={launchPlayerHandler}
        handleL1FeedbackLaunch={handleL1FeedbackLaunch}
      ></PrimeTrainingCardV2>
    );
  };

  const handleLoNameClick = (training: PrimeLearningObject, resourceLocation?: string) => {
    if (training.loType === JOBAID) {
      openJobAid(training, resourceLocation);
      return;
    }
    handleLinkCLick(training, widget);
  };
  const handleActionClick = (training: PrimeLearningObject) => {
    handleLinkCLick(training, widget);
  };
  return (
    <>
      {shouldLaunchFeedback && (
        <PrimeFeedbackWrapper
          trainingId={feedbackTrainingId}
          trainingInstanceId={trainingInstanceId}
          playerLaunchTimeStamp={playerLaunchTimeStamp}
          fetchCurrentLo={fetchCurrentLo}
          getFilteredNotificationForFeedback={getFilteredNotificationForFeedback}
          submitL1Feedback={submitL1Feedback}
          closeFeedbackWrapper={closeFeedbackWrapper}
        />
      )}
      <section
        style={{
          display: hideList ? "none" : "",
        }}
        role="region"
        aria-labelledby={nameId}
        className={styles.stripContainer}
      >
        {containerHeadWithIconsHtml()}
        <div
          id={cardContainerId}
          data-automationid={cardContainerId}
          className={styles.stripCardContainer}
          ref={rollContainer}
          onScroll={onScroll}
          style={{
            height: containerHeight,
          }}
        >
          {getRowArrsByPageArr(items).map((rowArrs, _pageIdx) =>
            pageTemplate(rowArrs, _pageIdx, widget.type!)
          )}
          {fetchingData && getLoadingCards()}
        </div>
        {getFooterTemplate()}
      </section>
    </>
  );
};

export default ALMPrimeStrip;
