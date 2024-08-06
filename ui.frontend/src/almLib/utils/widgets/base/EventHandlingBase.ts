import {
  BADGE_PAGE_LINK,
  CATALOG_PAGE_LINKS,
  COURSE,
  COURSE_INSTANCE,
  LEADERBOARD_PAGE_LINKS,
  LEARNING_PROGRAM,
  LO_INSTANCE_PAGE_LINKS,
  LO_OVERVIEW_PAGE_LINKS,
  LO_PREVIEW_PAGE_LINKS,
  MODE,
  SKILL_PAGE_LINKS,
  SOCIAL,
  SOCIAL_ALL_BOARDS_PATH,
  SOCIAL_LINKS,
  SOCIAL_POST_LINK,
} from "../../constants";
import {
  GetPrimeEmitEventLinks,
  ShouldEmitEventLinks,
  containsElement,
  containsSubstr,
  getALMObject,
  getALMUser,
  getWindowObject,
  isEmptyArrString,
  isStringAnArray,
} from "../../global";
import { PrimeEvent, Dimensions } from "../common";
import { interpolateTemplate, getTemplateVariables } from "../utils";

let _parentWindow: Window;
let _widgetParentEl: Element;

interface PrimeLink {
  refLink_lxpv: string;
  desktopLink_lxpv: string;
  primeLinkParams_lxpv?: Set<string>;
}

export function PrimeDispatchEvent(
  element: EventTarget,
  evt: PrimeEvent,
  sync?: boolean,
  eventDetail?: unknown
) {
  const eventArgs: CustomEventInit<unknown> = {};
  eventArgs.bubbles = true;
  eventArgs.detail = eventDetail;
  const ce = new CustomEvent(evt, eventArgs);
  if (sync) {
    element.dispatchEvent(ce);
  } else {
    setTimeout(() => {
      element.dispatchEvent(ce);
    }, 10);
  }
}

export function PrimeLogEvent(eventName: string, eventProps?: any) {
  try {
    const lepClientLog = (window as any)["lepclientlog"];
    if (lepClientLog && lepClientLog.logEvent) {
      lepClientLog.logEvent(eventName, eventProps);
    }
  } catch (ex) {
    //ensuring that it will not create an issue when cors iframe localstorage is accessed
    console.log("lepEx", ex);
  }
}

const __primeLinks: Record<string, PrimeLink> = {};
function addToPrimeLinksMap(primeLink: PrimeLink): string {
  if (__primeLinks[primeLink.refLink_lxpv]) {
    return primeLink.refLink_lxpv;
  }

  primeLink.primeLinkParams_lxpv = new Set(getTemplateVariables(primeLink.desktopLink_lxpv));
  __primeLinks[primeLink.refLink_lxpv] = primeLink;

  // const queryString: string[] = [];
  // primeLink.primeLinkParams_lxpv.forEach((param) => {
  //     queryString.push(`${param}=\${${param}}`);
  // });
  //let queryStringStr = queryString.join("&");
  //if (queryStringStr.length > 0) queryStringStr = "?" + queryStringStr;
  //console.log(PrimeLink.refLink_lxpv + queryStringStr);

  return primeLink.refLink_lxpv;
}

// export function SetUpLinkHooks(parentWindow: Window, widgetParentEl: Element) {
//   _parentWindow = parentWindow;
//   _widgetParentEl = widgetParentEl;

//   _widgetParentEl.addEventListener('click', onLinkClick);
// }

export async function SendLinkEvent(refLink_lxpv: string | null) {
  if (refLink_lxpv) {
    const url = new URL(refLink_lxpv);
    const primeLink = __primeLinks[url.protocol + url.pathname];
    const searchParams = url.searchParams;
    const keys = new Set(searchParams.keys());
    keys.add("accountId");
    keys.add("userId");
    let values = Array.from(searchParams.values());
    for (let ii = 0; ii < values.length; ++ii) {
      values[ii] = values[ii].replace(/course:|certification:|learningProgram:/, "");
    }
    const userResponse = await getALMUser();
    values.push(userResponse?.user?.account.id!);
    values.push(userResponse?.user.id!);

    // Have to encode the values because the desktopLink_lxpv is encoded
    values = values.map(v => {
      if (!isStringAnArray(v)) {
        return encodeURIComponent(v);
      } else {
        return isEmptyArrString(v) ? "" : v.replaceAll('"', "");
      }
    });

    const interpolatedPath = interpolateTemplate(primeLink.desktopLink_lxpv, keys, values);

    const link = interpolatedPath.split("#/")[1];
    const linkType = refLink_lxpv.split("?")[0];

    const config = getALMObject();
    if (containsElement(CATALOG_PAGE_LINKS, linkType)) {
      const paramsArr = containsSubstr(link, "?") ? link.split("?")[1].split("&") : [];
      const paramObj = {} as any;
      (paramsArr as any).forEach((param: string) => {
        const keyValue = param.split("=");
        paramObj[keyValue[0]] = keyValue[1];
      });
      config.navigateToCatalogPage(paramObj);
    } else if (containsSubstr(SKILL_PAGE_LINKS, linkType)) {
      const mode = link.split(`${MODE}=`)[1];
      config.navigateToSkillsPage(mode);
    } else if (containsSubstr(LEADERBOARD_PAGE_LINKS, linkType)) {
      config.navigateToLeaderboardPage();
    } else if (containsSubstr(BADGE_PAGE_LINK, linkType)) {
      config.navigateToBadgesPage();
    } else if (containsElement(SOCIAL_LINKS, linkType)) {
      config.navigateToSocial(
        linkType === SOCIAL_POST_LINK ? link.replace(SOCIAL, "") : SOCIAL_ALL_BOARDS_PATH
      );
    } else if (containsElement(LO_OVERVIEW_PAGE_LINKS, linkType)) {
      const loDetails = link.split("/");
      config.navigateToTrainingOverviewPage(`${loDetails[0]}:${loDetails[1]}`);
    } else if (containsElement(LO_INSTANCE_PAGE_LINKS, linkType)) {
      const loDetails = link.split("/");
      const loType = loDetails[0] === COURSE_INSTANCE ? COURSE : LEARNING_PROGRAM;
      config.navigateToInstancePage(`${loType}:${loDetails[1]}`);
    } else if (containsElement(LO_PREVIEW_PAGE_LINKS, linkType)) {
      const loDetails = link.split("/");
      const loId = `${loDetails[0]}:${loDetails[1]}`;
      let instanceId = loDetails.length > 2 ? `${loId}_${loDetails[3]}` : undefined;
      if (instanceId) {
        config.navigateToTrainingOverviewPage(loId, instanceId);
      } else {
        config.navigateToTrainingOverviewPage(loId);
      }
    }
  }
}
export function SendMessageToParent(msg: any, target: string) {
  //TODO:r do we have to secure it?
  let wndToUse = getWindowObject();
  // if (target == 'top') {
  //   wndToUse = wndToUse.top;
  // }
  if (wndToUse) {
    console.log("sending message", msg);
    wndToUse.postMessage(msg, "*");
  } else {
    console.log("cant send message", msg);
  }
}

export function SendDimensionsToParent(dimensions: Dimensions | undefined) {
  if (!dimensions) {
    return;
  }
  dimensions.height = dimensions.height || document.body.scrollHeight;
  SendMessageToParent(
    { type: "acapDimensions", width: dimensions.width, height: dimensions.height },
    GetPrimeEmitEventLinks()
  );
}

function onLinkClick(evt: Event) {
  if ("composed" in evt && typeof evt.composedPath === "function") {
    const path = evt.composedPath();
    if (path && path.length > 1) {
      for (let ii = 0; ii < path.length; ii++) {
        const targetElement = path[ii] as Element;
        if (targetElement.nodeName == "A") {
          const refLink_lxpv = targetElement.getAttribute("data-reflink");
          if (refLink_lxpv) {
            evt.preventDefault();
            // SendLinkEvent(refLink_lxpv);
            break;
          }
        }
      }
    }
  }

  if (ShouldEmitEventLinks()) {
    SendMessageToParent({ type: "acapClicked" }, GetPrimeEmitEventLinks());
  }
}

const LEARNER_PREFIX = "/app/learner?accountId=${accountId}&i_qp_user_id=${userId}";

const COURSE_PAGE_LINK = {
  refLink_lxpv: "primelink:coursePageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/course/${courseId}/overview",
};
export function GetCoursePageLink() {
  return addToPrimeLinksMap(COURSE_PAGE_LINK);
}

const CERT_PAGE_LINK = {
  refLink_lxpv: "primelink:certPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/certification/${certId}/overview",
};
export function GetCertPageLink() {
  return addToPrimeLinksMap(CERT_PAGE_LINK);
}

const LP_PAGE_LINK = {
  refLink_lxpv: "primelink:lpPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/learningProgram/${lpId}/overview",
};
export function GetLPPageLink() {
  return addToPrimeLinksMap(LP_PAGE_LINK);
}

const COURSE_INSTANCE_PAGE_LINK = {
  refLink_lxpv: "primelink:ciPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/courseInstance/${courseId}",
};
export function GetCourseInstancePageLink() {
  return addToPrimeLinksMap(COURSE_INSTANCE_PAGE_LINK);
}

const LP_INSTANCE_PAGE_LINK = {
  refLink_lxpv: "primelink:lpiPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/lpInstance/${lpId}",
};
export function GetLPInstancePageLink() {
  return addToPrimeLinksMap(LP_INSTANCE_PAGE_LINK);
}

const HOME_PAGE_LINK = {
  refLink_lxpv: "primelink:homePageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "",
};
export function GetHomePageLink() {
  return addToPrimeLinksMap(HOME_PAGE_LINK);
}

const SKILLS_PAGE_LINK = {
  refLink_lxpv: "primelink:skillsPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/newLearnerSkillPage?mode=${mode}",
};
export function GetSkillsPageLink() {
  return addToPrimeLinksMap(SKILLS_PAGE_LINK);
}

const ALL_BOARDS_PAGE_LINK = {
  refLink_lxpv: "primelink:allboardsPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + `#/social${SOCIAL_ALL_BOARDS_PATH}`,
};
export function GetAllBoardsPageLink() {
  return addToPrimeLinksMap(ALL_BOARDS_PAGE_LINK);
}

const LEADERBOARD_PAGE_LINK = {
  refLink_lxpv: "primelink:leaderboardPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/leaderboard",
};
export function GetLeaderBoardPageLink() {
  return addToPrimeLinksMap(LEADERBOARD_PAGE_LINK);
}

const CATALOG_PAGE_LINK = {
  refLink_lxpv: "primelink:catalogPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/catalog/index",
};
export function GetCatalogPageLink() {
  return addToPrimeLinksMap(CATALOG_PAGE_LINK);
}
const PRL_CATALOG_PAGE_LINK = {
  refLink_lxpv: "primelink:catalogPrlPageLink",
  desktopLink_lxpv:
    LEARNER_PREFIX +
    "#/catalog/index?selectedRecommendationProducts=${selectedRecommendationProducts}&selectedRecommendationRoles=${selectedRecommendationRoles}&selectedPrlLevels=${selectedPrlLevels}",
};
export function GetPrlCatalogPageLink() {
  return addToPrimeLinksMap(PRL_CATALOG_PAGE_LINK);
}

const CATALOG_OVERVIEW_PAGE_LINK = {
  refLink_lxpv: "primelink:catalogOverviewPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/catalog/index?selectedListableCatalogIds=${catalogId}",
};
export function GetCatalogOverviewPageLink() {
  return addToPrimeLinksMap(CATALOG_OVERVIEW_PAGE_LINK);
}

const CATALOG_GROUP_FILTER_LINK = {
  refLink_lxpv: "primelink:catalogGroupFilterLink",
  desktopLink_lxpv: LEARNER_PREFIX + '#/catalog/index?selectedGroups=["${userGroupId}"]',
};
export function GetCatalogGroupFilterLink() {
  return addToPrimeLinksMap(CATALOG_GROUP_FILTER_LINK);
}

const CATALOG_ALL_GROUP_FILTER_LINK = {
  refLink_lxpv: "primelink:catalogAllGroupFilterLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/catalog/index?allGroupsSelected=true",
};
export function GetAllCatalogGroupFilterLink() {
  return addToPrimeLinksMap(CATALOG_ALL_GROUP_FILTER_LINK);
}

const MY_LEARNING_PAGE_LINK = {
  refLink_lxpv: "primelink:myLearningPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/catalog/index?myLearning=true&selectedSortOption=dueDate",
};
export function GetMyLearningPageLink() {
  return addToPrimeLinksMap(MY_LEARNING_PAGE_LINK);
}

const BADGES_PAGE_LINK = {
  refLink_lxpv: "primelink:badgesPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/badges",
};
export function GetBadgesPageLink() {
  return addToPrimeLinksMap(BADGES_PAGE_LINK);
}

const PLAYER_OPEN_LINK = {
  refLink_lxpv: "primelink:playerOpenLink",
  desktopLink_lxpv: "/app/player?accountId=${accountId}&i_qp_user_id=${userId}&lo_id=${loId}",
};
export function GetPlayerOpenLink() {
  return addToPrimeLinksMap(PLAYER_OPEN_LINK);
}

const POSTS_LINK = {
  refLink_lxpv: "primelink:postsLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/social/board/${boardId}?postId=${postId}",
};
export function GetPostsLink() {
  return addToPrimeLinksMap(POSTS_LINK);
}

const COURSE_INSTANCE_PREVIEW_LINK = {
  refLink_lxpv: "primelink:courseInstancePreviewPageLink",
  desktopLink_lxpv: LEARNER_PREFIX + "#/course/${courseId}/instance/${instanceId}/preview",
};
export function GetCourseInstancePreviewPageLink() {
  return addToPrimeLinksMap(COURSE_INSTANCE_PREVIEW_LINK);
}

const COURSE_INSTANCE_PREVIEW_SHOW_LINK = {
  refLink_lxpv: "primelink:courseInstancePreviewPageShowLink",
  desktopLink_lxpv:
    LEARNER_PREFIX + "#/course/${courseId}/instance/${instanceId}/preview?show_preview=true",
};
export function GetShowCourseInstancePreviewPageLink() {
  return addToPrimeLinksMap(COURSE_INSTANCE_PREVIEW_SHOW_LINK);
}
