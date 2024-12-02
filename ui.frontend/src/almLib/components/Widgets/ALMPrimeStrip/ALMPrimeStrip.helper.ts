import { PrimeAccount, PrimeLearningObject, PrimeRecommendation } from "../../../models";
import { COURSE, CPE, CPENEW, LEARNING_PROGRAM, LMS } from "../../../utils/constants";
import { GetPrimeEmitEventLinks, getALMConfig } from "../../../utils/global";
import { GetTranslation } from "../../../utils/translationService";
import {
  GetAllCatalogGroupFilterLink,
  GetCatalogPageLink,
  GetMyLearningPageLink,
  SendMessageToParent,
} from "../../../utils/widgets/base/EventHandlingBase";
import { PrimeEvent, Widget, WidgetType, WidgetTypeNew } from "../../../utils/widgets/common";
import {
  ShuffleArray,
  SpliceArrayIntoChunks,
  getRoundedHourMillis,
} from "../../../utils/widgets/utils";

export function showProgressBar(lo: PrimeLearningObject): boolean {
  return !!lo.enrollment;
}

export function showDontRecommend(widget: Widget, account: PrimeAccount): boolean {
  const {
    recommendationAccountType,
    prlCriteria: { enabled },
  } = account;
  const accountTypes = [CPENEW, CPE, LMS];

  if (
    [WidgetTypeNew.MYLEARNING, WidgetTypeNew.BOOKMARKS, WidgetTypeNew.ADMIN_RECO].includes(
      widget.type!
    ) ||
    (accountTypes.includes(recommendationAccountType) && !enabled)
  ) {
    return false;
  }
  return true;
}

export function showBookmark(widget: Widget): boolean {
  if (widget.type === WidgetTypeNew.MYLEARNING) {
    return false;
  }
  return true;
}

export function showSkills(widget: Widget): boolean {
  return [
    WidgetTypeNew.MYLEARNING,
    WidgetTypeNew.BOOKMARKS,
    WidgetTypeNew.ADMIN_RECO,
    WidgetTypeNew.DISCOVERY_RECO,
    WidgetTypeNew.AOI_RECO,
    WidgetTypeNew.TRENDING_RECO,
  ].includes(widget.type!);
}

export function showPRLInfo(widget: Widget): boolean {
  return [
    WidgetTypeNew.RECOMMENDATIONS,
    WidgetTypeNew.RECOMMENDATIONS_STRIP,
    WidgetTypeNew.DISCOVERY_RECO,
  ].includes(widget.type!);
}

export function showRating(lo: PrimeLearningObject, account: PrimeAccount): boolean {
  const { loType } = lo;
  const { showRating } = account;

  return (loType === LEARNING_PROGRAM || loType === COURSE) && showRating;
}
export function showEffectivenessIndex(lo: PrimeLearningObject, account: PrimeAccount): boolean {
  const { showEffectiveness } = account;
  return showEffectiveness && lo.effectivenessIndex != undefined;
}
export function showRecommendedReason(widget: Widget, lo: PrimeLearningObject): boolean {
  return [WidgetTypeNew.ADMIN_RECO, WidgetTypeNew.AOI_RECO, WidgetTypeNew.TRENDING_RECO].includes(
    widget.type!
  );
}

export function showAuthorInfo(lo: PrimeLearningObject): boolean {
  return lo.authorNames?.length > 0;
}

export function isAnnouncementRecoUGWLinkEnable(widget: Widget, account: PrimeAccount): boolean {
  return (
    (widget.attributes?.enableAnnouncementRecoUGWLink && account.filterPanelSetting!.groups) ||
    false
  );
}

export function getEmptyActionCardDetails(
  widget: Widget,
  items: PrimeLearningObject[] | PrimeRecommendation[]
): {
  actionLink: string;
  actionText: string;
  actionHelpText: string;
  actionLinkHeading: string;
} {
  let gotoMyLearningPage = false;
  let gotoCatalogAllUserGroups = false;
  switch (widget.type) {
    case WidgetTypeNew.MYLEARNING:
      gotoMyLearningPage = items.length > 0;
      break;
    case WidgetTypeNew.TRENDING_RECO:
    case WidgetTypeNew.DISCOVERY_RECO:
      gotoMyLearningPage = true;
      break;
    case WidgetTypeNew.ADMIN_RECO:
      gotoCatalogAllUserGroups = !!widget.attributes?.enableAnnouncementRecoUGWLink;
      break;
  }

  let actionLink = gotoCatalogAllUserGroups ? GetAllCatalogGroupFilterLink() : GetCatalogPageLink();
  let actionText = GetTranslation("go.to.catalog", true);
  let actionHelpText = GetTranslation("go.to.catalog.help.text");
  let actionLinkHeading = GetTranslation("alm.keep.going");
  if (gotoMyLearningPage) {
    actionLink = `${GetMyLearningPageLink()}?myLearning=true&selectedSortOption=dueDate`;
    actionText = GetTranslation("go.to.myLearningList", true);
    actionHelpText = GetTranslation("go.to.myLearningList.help.text");
    actionLinkHeading = GetTranslation("alm.start.learning");
  }

  return {
    actionLink,
    actionText,
    actionHelpText,
    actionLinkHeading,
  };
}

export function showActionElement(widget: Widget, account: PrimeAccount): boolean {
  const isPrlEnabled = account.prlCriteria?.enabled;
  const widgetTypes = [
    WidgetTypeNew.ADMIN_RECO,
    WidgetTypeNew.BOOKMARKS,
    WidgetTypeNew.CATALOG_BROWSER,
    WidgetTypeNew.AOI_RECO,
  ];
  if (
    widget.attributes?.disableLinks ||
    (widget.type === WidgetTypeNew.RECOMMENDATIONS_STRIP && isPrlEnabled) ||
    widgetTypes.includes(widget.type!)
  ) {
    return false;
  }
  return getALMConfig()?._cardProperties.showActionElement;
}

export function getMaxItemsToFetchForWidget(widget: Widget): number | undefined {
  return [WidgetTypeNew.RECOMMENDATIONS_STRIP, WidgetTypeNew.DISCOVERY_RECO].includes(widget.type!)
    ? 15
    : undefined;
}

export function getPageLimitForWidget(widget: Widget): number {
  return [WidgetTypeNew.RECOMMENDATIONS_STRIP, WidgetTypeNew.DISCOVERY_RECO].includes(widget.type!)
    ? 5
    : 10;
}

export const updateLOBookmark = (
  items: any[],
  loId: string,
  bookmarkValue: boolean,
  isPrimeLearningObjectList: boolean
) => {
  const list = [...items];
  const index = getItemIndexFromList(list, loId, isPrimeLearningObjectList);
  if (isPrimeLearningObjectList) {
    (list[index] as PrimeLearningObject).isBookmarked = bookmarkValue;
  } else {
    (list[index] as PrimeRecommendation).learningObject.isBookmarked = bookmarkValue;
  }

  return list;
};

export const getItemIndexFromList = (
  items: any[],
  loId: string,
  isPrimeLearningObjectList: boolean
): number => {
  return items.findIndex(item => {
    return isPrimeLearningObjectList
      ? item.id === loId
      : (item as PrimeRecommendation).learningObject.id === loId;
  });
};

export const shouldShuffleResults = (widget: Widget, account: PrimeAccount): boolean => {
  const { recommendationAccountType } = account;
  return recommendationAccountType === LMS && isAOIOrTrending_lxpv(widget);
};

export const isAOIOrTrending_lxpv = (widget: Widget): boolean => {
  return widget.widgetRef === WidgetType.AOI_RECO || widget.widgetRef === WidgetType.TRENDING_RECO;
};

export const shuffleResults = <T>(entries: T[]): T[] => {
  //This is for re-ranking step
  //Shuffling will be done on a hourly basis
  const seed = getRoundedHourMillis();
  const chunks = SpliceArrayIntoChunks(entries, 5);
  const retval: T[] = [];
  for (let ii = 0; ii < chunks.length; ++ii) {
    retval.push(...ShuffleArray(chunks[ii], seed));
  }
  return retval;
};

export const sendSkipLinksEvent = (widgets: Widget[]) => {
  const skipLinks: { elementId: string; label: string; widgetRef: string }[] = [];
  widgets.forEach((item: any) => {
    if (item.widgets && item.widgets.length > 0) {
      item.widgets.forEach((widget: Widget) => {
        const { attributes, layoutAttributes } = widget;
        if (attributes?.heading && attributes?.isStripHidden !== true && layoutAttributes?.id) {
          skipLinks.push({
            elementId: layoutAttributes.id,
            label: attributes.heading,
            widgetRef: widget.widgetRef,
          });
        }
      });
    }
  });
  SendMessageToParent(
    { type: PrimeEvent.ALM_SKIP_LINKS, widgets: skipLinks },
    GetPrimeEmitEventLinks()
  );
};
