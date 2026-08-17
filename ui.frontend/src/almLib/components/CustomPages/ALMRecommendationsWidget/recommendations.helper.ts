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

import { PrimeRecommendationCriteriaStrip } from '../../../models';
import { GetTranslation, GetTranslationsReplaced } from '../../../utils/translationService';
import {
  Attributes,
  WIDGET_REF_TO_TYPE,
  WidgetType,
  WidgetTypeNew,
  AOI_VIEW_TYPE_INDIVIDUAL,
} from '../../../utils/widgets/common';
import { BASE_AOI_STRIP_COUNT } from '../../../utils/widgets/utils';

export const STRIP_TYPES = {
  PRODUCT_STRIP: 'PRODUCT_STRIP',
  ROLE_STRIP: 'ROLE_STRIP',
  SUPER_RELEVANT_STRIP: 'SUPER_RELEVANT_STRIP',
  SKILL_STRIP: 'SKILL_STRIP',
  DISCOVERY_STRIP: 'DISCOVERY_STRIP',
};

/**
 * Creates base configuration for a recommendation strip widget
 */
const makeBaseRecommendationStripConfig = (
  attributes: Attributes = {},
  recommendationStrip: PrimeRecommendationCriteriaStrip
) => {
  return {
    widgetRef: 'com.adobe.captivateprime.lostrip.reco',
    type: WIDGET_REF_TO_TYPE['com.adobe.captivateprime.lostrip.reco'],
    id: recommendationStrip.id,
    attributes: {
      ...attributes,
      recommendationConfig: recommendationStrip,
    },
  };
};

/**
 * Creates configuration for Super Relevant strip
 */
const makeSuperRelevantStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      title: GetTranslation('text.based.on.your.interest'),
    },
    recommendationStrip
  );
};

/**
 * Creates configuration for Product strip
 */
const makeProductStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      title: GetTranslationsReplaced('text.recommended.for', {
        name: recommendationStrip.products?.[0].name || '',
      }),
    },
    recommendationStrip
  );
};

/**
 * Creates configuration for Role strip
 */
const makeRoleStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      title: GetTranslationsReplaced('text.recommended.for', {
        name: recommendationStrip.roles?.[0].name || '',
      }),
    },
    recommendationStrip
  );
};

/**
 * Creates configuration for Skill strip
 */
const makeSkillStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      title: GetTranslationsReplaced('text.recommended.for', {
        name: recommendationStrip.skills?.[0].name || '',
      }),
    },
    recommendationStrip
  );
};

/**
 * Creates configuration for Discovery strip
 */
const makeDiscoveryStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      title: GetTranslation('text.trending.in.your.network'),
    },
    recommendationStrip
  );
};

/**
 * Transforms recommendation strips into widget configurations
 * for use with ALMCoursePathWidget
 */
export const makeStripsConfig = (
  recommendationStripList: Array<PrimeRecommendationCriteriaStrip>,
  attributes: Attributes = {}
) => {
  if (!recommendationStripList) {
    return [];
  }

  return recommendationStripList.map((recommendationStrip: PrimeRecommendationCriteriaStrip) => {
    switch (recommendationStrip.stripType) {
      case STRIP_TYPES.SUPER_RELEVANT_STRIP:
        return makeSuperRelevantStripConfig(recommendationStrip, attributes);
      case STRIP_TYPES.PRODUCT_STRIP:
        return makeProductStripConfig(recommendationStrip, attributes);
      case STRIP_TYPES.ROLE_STRIP:
        return makeRoleStripConfig(recommendationStrip, attributes);
      case STRIP_TYPES.SKILL_STRIP:
        return makeSkillStripConfig(recommendationStrip, attributes);
      case STRIP_TYPES.DISCOVERY_STRIP:
        return makeDiscoveryStripConfig(recommendationStrip, attributes);
      default:
        return makeBaseRecommendationStripConfig(attributes, recommendationStrip);
    }
  });
};

/**
 * Checks if a widget is an AOI recommendation widget
 */
export const isAoiRecoWidget = (widget: any): boolean =>
  widget.widgetRef === WidgetType.AOI_RECO || widget.type === WidgetTypeNew.AOI_RECO;

/**
 * Creates a child AOI strip widget config for rendering by ALMCoursePathWidget
 */
export const createAoiStripWidget = (parentWidget: any, stripNum: number, view: string) => ({
  widgetRef: WidgetType.AOI_RECO,
  type: WidgetTypeNew.AOI_RECO,
  id: `${parentWidget.id}-aoi-strip-${stripNum}`,
  attributes: {
    ...parentWidget.attributes,
    view,
    stripNum,
  },
});

/**
 * Creates the initial set of individual AOI strip widgets
 */
export const createInitialAoiStrips = (parentWidget: any): any[] => {
  const strips: any[] = [];
  for (let i = 1; i <= BASE_AOI_STRIP_COUNT; i++) {
    strips.push(createAoiStripWidget(parentWidget, i, AOI_VIEW_TYPE_INDIVIDUAL));
  }
  return strips;
};
