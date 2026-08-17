/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useState, useEffect, useCallback } from 'react';
import { JsonApiParse } from '../../../utils/jsonAPIAdapter';
import { GetTranslation } from '../../../utils/translationService';
import { getALMObject, getALMConfig } from '../../../utils/global';
import { PrimeAccount } from '../../../models';
import {
  makeStripsConfig,
  isAoiRecoWidget,
  createAoiStripWidget,
  createInitialAoiStrips,
} from './recommendations.helper';
import { DOWN_ARROW_FILLED } from '../../../utils/inline_svg';
import { RestAdapter } from '../../../utils/restAdapter';
import { CPENEW, update, VIEW } from '../../../utils/constants';
import { useUserContext } from '../../../contextProviders/userContextProvider';
import ALMCoursePathWidget from '../ALMCoursePathWidget/ALMCoursePathWidget';
import styles from './ALMRecommendationsWidget.module.css';
import {
  AOI_VIEW_TYPE_CONSOLIDATED,
  AOI_VIEW_TYPE_INDIVIDUAL,
} from '../../../utils/widgets/common';
import {
  BASE_AOI_STRIP_COUNT,
  MAX_AOI_STRIP_COUNT,
  getHeading,
} from '../../../utils/widgets/utils';

export const WIDGET_NAME = 'recommendations';
let MAX_STRIPS_TO_SHOW = 12;
let STRIPS_TO_LOAD_COUNT = 4;

const ALMRecommendationsWidget: React.FC<{
  widget: any;
  disableLinks?: boolean;
  isInspectMode?: boolean;
}> = ({ widget, disableLinks = false, isInspectMode = false }) => {
  const { user } = useUserContext() || {};
  const account = user?.account as PrimeAccount;

  const isAoiWidget = isAoiRecoWidget(widget);

  // --- AOI Reco state ---
  const [aoiStripWidgets, setAoiStripWidgets] = useState<any[]>([]);
  const [maxStripCount, setMaxStripCount] = useState(BASE_AOI_STRIP_COUNT);

  // --- Recommendation strips state (existing flow) ---
  const [recommendationCriteriaStripList, setRecommendationCriteriaStripList] = useState<any[]>([]);
  const [allRecommendationCriteriaStripList, setAllRecommendationCriteriaStripList] = useState<
    any[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- AOI Reco effect ---
  useEffect(() => {
    if (!isAoiWidget) return;

    const view = widget.attributes?.view || AOI_VIEW_TYPE_CONSOLIDATED;

    if (view === AOI_VIEW_TYPE_CONSOLIDATED) {
      setAoiStripWidgets([createAoiStripWidget(widget, 1, AOI_VIEW_TYPE_CONSOLIDATED)]);
    } else {
      setAoiStripWidgets(createInitialAoiStrips(widget));
    }
  }, [isAoiWidget, widget.attributes?.view]);

  const handleAoiStripMeta = useCallback(
    (stripNum: number, meta: any) => {
      // Update maxStripCount from first strip's response
      if (meta?.stripCount && stripNum === 1) {
        setMaxStripCount(Math.min(meta.stripCount, MAX_AOI_STRIP_COUNT));
      }

      // Update strip title using existing getHeading logic
      if (meta?.skillName) {
        setAoiStripWidgets(prev =>
          prev.map(strip => {
            if (strip.attributes?.stripNum !== stripNum) return strip;
            const headingInfo = getHeading(strip, account, '', { skillName: meta.skillName });
            return {
              ...strip,
              attributes: { ...strip.attributes, title: headingInfo?.name },
            };
          })
        );
      }
    },
    [account]
  );

  const handleAoiLoadMore = useCallback(() => {
    const currentCount = aoiStripWidgets.length;
    const newStrips: any[] = [];
    for (let i = currentCount + 1; i <= Math.min(currentCount + 3, maxStripCount); i++) {
      newStrips.push(createAoiStripWidget(widget, i, AOI_VIEW_TYPE_INDIVIDUAL));
    }
    setAoiStripWidgets(prev => [...prev, ...newStrips]);
  }, [aoiStripWidgets.length, maxStripCount, widget]);

  // --- Existing recommendation strips effect ---
  useEffect(() => {
    if (isAoiWidget) return;

    const fetchData = async () => {
      if (!user?.id || !account || isLoading) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await getRecommendationStrips(user.id);
        const parsedResponse = JsonApiParse(response);

        let allRecommendationCriteriaStripList = [];

        if (account?.recommendationAccountType === CPENEW && !account.prlCriteria.enabled) {
          MAX_STRIPS_TO_SHOW = 5;
          STRIPS_TO_LOAD_COUNT = 2;
          const ignoreStrip = new Set(['DISCOVERY_STRIP']);

          allRecommendationCriteriaStripList = (
            parsedResponse as any
          ).recommendationCriteriaStripList.filter(
            (response: any) => !ignoreStrip.has(response.stripType)
          );

          if (widget.attributes?.view === 'consolidated') {
            allRecommendationCriteriaStripList = allRecommendationCriteriaStripList.filter(
              (response: any) => response.stripType === 'SUPER_RELEVANT_STRIP'
            );
          } else if (widget.attributes?.view === 'individual') {
            allRecommendationCriteriaStripList = allRecommendationCriteriaStripList.filter(
              (response: any) => response.stripType !== 'SUPER_RELEVANT_STRIP'
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
        const configuredStrips = makeStripsConfig(nextStripsSet, widget.attributes);

        setRecommendationCriteriaStripList(configuredStrips);
        setAllRecommendationCriteriaStripList(allRecommendationCriteriaStripList);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, account?.id]);

  const getRecommendationStrips = (userId: string) => {
    const url = `${getALMConfig().primeApiURL}/users/${userId}/recommendationStrips`;
    return RestAdapter.ajax({
      url,
      method: 'GET',
    });
  };

  const handleLoadMore = useCallback(() => {
    const loadCount =
      account?.recommendationAccountType === CPENEW && !account?.prlCriteria.enabled
        ? 3
        : STRIPS_TO_LOAD_COUNT;

    const nextStripsSet = allRecommendationCriteriaStripList.slice(0, loadCount);
    const remainingStrips = allRecommendationCriteriaStripList.slice(loadCount);

    const configuredStrips = makeStripsConfig(nextStripsSet, widget.attributes);

    setRecommendationCriteriaStripList(prev => [...prev, ...configuredStrips]);
    setAllRecommendationCriteriaStripList(remainingStrips);
  }, [allRecommendationCriteriaStripList, account, widget.attributes]);

  const renderLoadMore = useCallback(() => {
    if (allRecommendationCriteriaStripList.length <= 0) {
      return null;
    }

    return (
      <button className={styles.loadMoreButton} onClick={handleLoadMore}>
        {GetTranslation('viewMore')}
        {DOWN_ARROW_FILLED()}
      </button>
    );
  }, [allRecommendationCriteriaStripList.length, handleLoadMore]);

  const showSkillInterestViewUpdate = useCallback(() => {
    let showSkillInterestViewUpdate = false;

    if (account?.recommendationAccountType === CPENEW && !account.prlCriteria.enabled) {
      widget.attributes?.view === 'individual' && account.exploreSkills
        ? (showSkillInterestViewUpdate = true)
        : (showSkillInterestViewUpdate = false);
    }

    return showSkillInterestViewUpdate;
  }, [account, widget.attributes?.view]);

  // --- AOI Reco render path ---
  if (isAoiWidget) {
    return (
      <>
        {aoiStripWidgets.map((strip: any) => (
          <div key={strip.id} className={styles.recoStripContainer}>
            <ALMCoursePathWidget
              widget={strip}
              disableLinks={disableLinks}
              isInspectMode={isInspectMode}
              onMetaReceived={meta => handleAoiStripMeta(strip.attributes?.stripNum, meta)}
            />
          </div>
        ))}
        {widget.attributes?.view === AOI_VIEW_TYPE_INDIVIDUAL &&
          aoiStripWidgets.length < maxStripCount && (
            <div className={styles.extraActionContainer}>
              <div className={styles.loadMoreButtonContainer}>
                <button className={styles.loadMoreButton} onClick={handleAoiLoadMore}>
                  {GetTranslation('viewMore')}
                  {DOWN_ARROW_FILLED()}
                </button>
              </div>
            </div>
          )}
      </>
    );
  }

  // --- Recommendation strips render path ---
  return (
    <>
      {recommendationCriteriaStripList.map((strip: any) => {
        return (
          <div key={strip.id || strip.layoutAttributes?.id} className={styles.recoStripContainer}>
            <ALMCoursePathWidget
              widget={strip}
              disableLinks={disableLinks}
              isInspectMode={isInspectMode}
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
              {GetTranslation('lo.strip.view')}
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
              {GetTranslation('lo.strip.update')}
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

export default ALMRecommendationsWidget;
