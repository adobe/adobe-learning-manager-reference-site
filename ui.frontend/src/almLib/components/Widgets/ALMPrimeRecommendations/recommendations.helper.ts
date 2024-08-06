import { PrimeRecommendationCriteriaStrip } from "../../../models";
import { GetTranslation, GetTranslationsReplaced } from "../../../utils/translationService";
import { GetPrlCatalogPageLink } from "../../../utils/widgets/base/EventHandlingBase";
import {
  Attributes,
  WIDGET_REF_TO_TYPE,
  WidgetLayoutAttributes,
} from "../../../utils/widgets/common";
export const STRIP_TYPES = {
  PRODUCT_STRIP: "PRODUCT_STRIP",
  ROLE_STRIP: "ROLE_STRIP",
  SUPER_RELEVANT_STRIP: "SUPER_RELEVANT_STRIP",
  SKILL_STRIP: "SKILL_STRIP",
  DISCOVERY_STRIP: "DISCOVERY_STRIP",
};

const makeBaseRecommendationStripConfig = (
  attributes: Attributes = {},
  layoutAttributes: WidgetLayoutAttributes = {},
  recommendationStrip: PrimeRecommendationCriteriaStrip
) => {
  return {
    widgetRef: "com.adobe.captivateprime.lostrip.reco",
    type: WIDGET_REF_TO_TYPE["com.adobe.captivateprime.lostrip.reco"],
    attributes: {
      ...attributes,
      recommendationConfig: recommendationStrip,
    },
    layoutAttributes: {
      flexibleWidth: false,
      width: 1540,
      isFullRow: true,
      ...layoutAttributes,
      id: recommendationStrip.id,
    },
  };
};

const getSeeAllLink = (recommendationStrip: PrimeRecommendationCriteriaStrip) => {
  let qp = "";
  const productsNameList: Array<string> = [],
    rolesNameList: Array<string> = [],
    skillsNameList: Array<string> = [];
  const levels: Set<string> = new Set();
  recommendationStrip.products?.forEach(product => {
    productsNameList.push(encodeURIComponent(product.name));
    if (product.levels?.length) {
      product.levels?.forEach(level => levels.add(level));
    }
  });

  recommendationStrip.skills?.forEach(skill => {
    skillsNameList.push(encodeURIComponent(skill.name));
    if (skill.levels?.length) {
      skill.levels?.forEach(level => levels.add(level));
    }
  });

  recommendationStrip.roles?.forEach(role => {
    rolesNameList.push(encodeURIComponent(role.name));
    if (role.levels?.length) {
      role.levels?.forEach(level => levels.add(level));
    }
  });
  const productsNameListqp = productsNameList.length > 0 ? `"${productsNameList.join('","')}"` : ``;
  const rolesNameListqp = rolesNameList.length > 0 ? `"${rolesNameList.join('","')}"` : ``;
  const skillsNameListqp = skillsNameList.length > 0 ? `"${skillsNameList.join('","')}"` : ``;
  const levelsqp = levels.size > 0 ? `"${Array.from(levels).join('","')}"` : ``;
  qp += `selectedRecommendationProducts=[${productsNameListqp}]`;
  qp += `&selectedRecommendationRoles=[${rolesNameListqp}]`;
  qp += `&selectedRecommendationSkills=[${skillsNameListqp}]`;
  qp += `&selectedPrlLevels=[${levelsqp}]`;
  return `${GetPrlCatalogPageLink()}?${qp}`;
};

const makeSuperReleventStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes,
  layoutAttributes: WidgetLayoutAttributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      heading: GetTranslation("text.based.on.your.interest"),
      link: getSeeAllLink(recommendationStrip),
    },
    layoutAttributes,
    recommendationStrip
  );
};
const makeProductStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes,
  layoutAttributes: WidgetLayoutAttributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      heading: GetTranslationsReplaced("text.recommended.for", {
        name: `<span>${recommendationStrip.products?.[0].name}</span>`,
      }),
      headerAriaLabel: GetTranslationsReplaced("text.recommended.for", {
        name: `${recommendationStrip.products?.[0].name}`,
      }),

      link: getSeeAllLink(recommendationStrip),
    },
    layoutAttributes,
    recommendationStrip
  );
};

const makeRoleStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes,
  layoutAttributes: WidgetLayoutAttributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      heading: GetTranslationsReplaced("text.recommended.for", {
        name: `<span>${recommendationStrip.roles?.[0].name}</span>`,
      }),
      headerAriaLabel: GetTranslationsReplaced("text.recommended.for", {
        name: `${recommendationStrip.roles?.[0].name}`,
      }),

      link: getSeeAllLink(recommendationStrip),
    },
    layoutAttributes,
    recommendationStrip
  );
};

const makeSkillStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes,
  layoutAttributes: WidgetLayoutAttributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      heading: GetTranslationsReplaced("text.recommended.for", {
        name: `<span>${recommendationStrip.skills?.[0].name}</span>`,
      }),
      headerAriaLabel: GetTranslationsReplaced("text.recommended.for", {
        name: `${recommendationStrip.skills?.[0].name}`,
      }),
      link: getSeeAllLink(recommendationStrip),
    },
    layoutAttributes,
    recommendationStrip
  );
};
const makeDiscoveryStripConfig = (
  recommendationStrip: PrimeRecommendationCriteriaStrip,
  attributes: Attributes,
  layoutAttributes: WidgetLayoutAttributes
) => {
  return makeBaseRecommendationStripConfig(
    {
      ...attributes,
      heading: GetTranslation("text.trending.in.your.network"),
      link: getSeeAllLink(recommendationStrip),
    },
    layoutAttributes,
    recommendationStrip
  );
};
export const makeStripsConfig = (
  recommendationStripList: Array<PrimeRecommendationCriteriaStrip>,
  attributes: Attributes = {},
  layoutAttributes: WidgetLayoutAttributes = {}
) => {
  if (!recommendationStripList) return [];
  return recommendationStripList.map((recommendationStrip: PrimeRecommendationCriteriaStrip) => {
    switch (recommendationStrip.stripType) {
      case STRIP_TYPES.SUPER_RELEVANT_STRIP:
        return makeSuperReleventStripConfig(recommendationStrip, attributes, layoutAttributes);
      case STRIP_TYPES.PRODUCT_STRIP:
        return makeProductStripConfig(recommendationStrip, attributes, layoutAttributes);
      case STRIP_TYPES.ROLE_STRIP:
        return makeRoleStripConfig(recommendationStrip, attributes, layoutAttributes);
      case STRIP_TYPES.SKILL_STRIP:
        return makeSkillStripConfig(recommendationStrip, attributes, layoutAttributes);
      case STRIP_TYPES.DISCOVERY_STRIP:
        return makeDiscoveryStripConfig(recommendationStrip, attributes, layoutAttributes);
    }
    return {};
  });
};
