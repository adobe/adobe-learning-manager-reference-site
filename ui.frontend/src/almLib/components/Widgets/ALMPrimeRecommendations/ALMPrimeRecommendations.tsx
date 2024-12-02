import { useState, useEffect, useCallback } from "react";
import { JsonApiParse } from "../../../utils/jsonAPIAdapter";

import { GetTranslation } from "../../../utils/translationService";
import { GetSkillsPageLink } from "../../../utils/widgets/base/EventHandlingBase";
import { Widget, WidgetType } from "../../../utils/widgets/common";
import styles from "./ALMPrimeRecommendations.module.css";
import { getALMConfig, getALMObject, getALMUser, getWidgetConfig } from "../../../utils/global";
import { PrimeAccount, PrimeRecommendationCriteriaStrip, PrimeUser } from "../../../models";
import { makeStripsConfig } from "./recommendations.helper";
import { DOWN_ARROW_FILLED } from "../../../utils/inline_svg";
import { ALMPrimeStrip } from "../ALMPrimeStrip";
import { RestAdapter } from "../../../utils/restAdapter";
import { CPENEW, update, VIEW } from "../../../utils/constants";

const FOOTER_MIN_WIDTH = 300;
const FOOTER_HEIGHT = 100;
const WIDGET_REF = "com.adobe.captivateprime.recommendations";
export const WIDGET_NAME = "prime-recommendations";
let MAX_STRIPS_TO_SHOW = 12;
let STRIPS_TO_LOAD_COUNT = 4;

const ALMPrimeRecommendations: React.FC<{
  widget: Widget;
  doRefresh: boolean;
}> = ({ widget, doRefresh }) => {
  const [user, setUser] = useState(null as PrimeUser | null);
  const [account, setAccount] = useState(null as PrimeAccount | null);
  const [recommendationCriteriaStripList, setRecommendationCriteriaStripList] = useState(
    [] as any[]
  );
  const [allRecommendationCriteriaStripList, setAllRecommendationCriteriaStripList] = useState([]);
  const [doRefreshState, setDoRefreshState] = useState(false);
  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      setAccount(response?.user?.account || ({} as PrimeAccount));
      setUser(response?.user || ({} as PrimeUser));
    })();
  }, []);

  useEffect(() => {
    recommendationCriteriaStripList.forEach(strip => {
      strip.layoutAttributes = {
        ...widget.layoutAttributes,
        id: strip.layoutAttributes.id,
      };
    });
    console.log(widget, recommendationCriteriaStripList);
    setDoRefreshState(prev => !prev);
  }, [doRefresh]);
  useEffect(() => {
    async function fetchData() {
      const response = await getRecommendationStrips(user?.id!);
      // const parsedResponse = JsonApiParse(response, WidgetType.RECOMMENDATIONS);
      const parsedResponse = JsonApiParse(response);
      // ... rest of your logic here

      let allRecommendationCriteriaStripList = [];
      if (account?.recommendationAccountType === CPENEW && !account.prlCriteria.enabled) {
        MAX_STRIPS_TO_SHOW = 5;
        STRIPS_TO_LOAD_COUNT = 2;
        const ignoreStrip = new Set(["DISCOVERY_STRIP"]);

        allRecommendationCriteriaStripList = (
          parsedResponse as any
        ).recommendationCriteriaStripList.filter(
          (response: any) => !ignoreStrip.has(response.stripType)
        );
        if (widget.attributes?.view === "consolidated") {
          allRecommendationCriteriaStripList = allRecommendationCriteriaStripList.filter(
            (response: any) => response.stripType == "SUPER_RELEVANT_STRIP"
          );
        } else if (widget.attributes?.view === "individual") {
          allRecommendationCriteriaStripList = allRecommendationCriteriaStripList.filter(
            (response: any) => response.stripType != "SUPER_RELEVANT_STRIP"
          );
        }
        allRecommendationCriteriaStripList = allRecommendationCriteriaStripList.slice(
          0,
          MAX_STRIPS_TO_SHOW
        );
      } else {
        allRecommendationCriteriaStripList = (
          parsedResponse as any
        ).recommendationCriteriaStripList.slice(0, MAX_STRIPS_TO_SHOW);
      }
      const nextStripsSet = allRecommendationCriteriaStripList.splice(0, STRIPS_TO_LOAD_COUNT);
      const configuresStrips = makeStripsConfig(
        nextStripsSet,
        widget.attributes,
        widget.layoutAttributes
      );
      setRecommendationCriteriaStripList(configuresStrips);
      setAllRecommendationCriteriaStripList(allRecommendationCriteriaStripList);
    }
    if (user && user.id && account) {
      fetchData();
    }
  }, [user, account]);

  const getRecommendationStrips = (userId: string) => {
    const url = `${getALMConfig().primeApiURL}/users/${userId}/recommendationStrips`;
    return RestAdapter.ajax({
      url,
      method: "GET",
    });
  };

  const handleLoadMore = useCallback(() => {
    let nextStripsSet: PrimeRecommendationCriteriaStrip[] = [];
    if (account?.recommendationAccountType === CPENEW && !account?.prlCriteria.enabled) {
      nextStripsSet = allRecommendationCriteriaStripList.splice(0, 3);
    } else {
      nextStripsSet = allRecommendationCriteriaStripList.splice(0, STRIPS_TO_LOAD_COUNT);
    }

    const configuresStrips = makeStripsConfig(nextStripsSet);
    setRecommendationCriteriaStripList(prev => [...prev, ...configuresStrips]);
  }, [allRecommendationCriteriaStripList.length, account, user]);

  const renderLoadMore = useCallback(() => {
    if (allRecommendationCriteriaStripList.length <= 0) {
      return "";
    }
    return (
      <button className={styles.loadMoreButton} onClick={handleLoadMore}>
        {GetTranslation("viewMore")}
        {DOWN_ARROW_FILLED()}
      </button>
    );
  }, [allRecommendationCriteriaStripList.length]);
  const showSkillInterestViewUpdate = useCallback(() => {
    let showSkillInterestViewUpdate = false;
    if (account?.recommendationAccountType === CPENEW && !account.prlCriteria.enabled) {
      widget.attributes?.view === "individual" &&
      !getWidgetConfig()?.isMobile &&
      account.exploreSkills
        ? (showSkillInterestViewUpdate = true)
        : (showSkillInterestViewUpdate = false);
    }

    return showSkillInterestViewUpdate && !getWidgetConfig()?.hideSkillInterestViewUpdate;
  }, [account, user, widget.attributes?.view]);

  return (
    <>
      {recommendationCriteriaStripList.map((strip: Widget, index: number) => {
        return (
          <div key={strip.layoutAttributes?.id} className={styles.recoStripContainer}>
            <ALMPrimeStrip
              widget={strip}
              doRefresh={doRefreshState}
              account={account!}
              user={user!}
            />
          </div>
        );
      })}
      <div className={styles.extraActionContainer}>
        {showSkillInterestViewUpdate() && (
          <span>
            <a
              href="javascript:void(0)"
              data-automationid="primelxp-view-skills"
              className={styles.skillLinkReco}
              onClick={() => {
                getALMObject().navigateToSkillsPage(VIEW);
              }}
            >
              {GetTranslation("lo.strip.view")}
            </a>
            /
            <a
              href="javascript:void(0)"
              data-automationid="primelxp-update-skills"
              className={styles.skillLinkReco}
              onClick={() => {
                getALMObject().navigateToSkillsPage(update);
              }}
            >
              {GetTranslation("lo.strip.update")}
            </a>
          </span>
        )}
        {allRecommendationCriteriaStripList.length > 0 && (
          <div className={styles.loadMoreButtonContainer}>{renderLoadMore()}</div>
        )}
      </div>
    </>
  );
};

export default ALMPrimeRecommendations;
