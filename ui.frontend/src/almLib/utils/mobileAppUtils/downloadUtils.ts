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
import { AppEvents } from '../../store/actions/appState';
import { State } from '../../store/state';
import {
  AppMode,
  ContentType,
  NATIVEAPPEVENTS,
  NetworkStatus,
  PLAYER_API_CONSTS,
  LO_DOWNLOAD_INCLUDES,
  CMI_ENFORCED_FIELDS_QP,
} from './appConstants';
import {
  CERTIFICATION,
  CONTENT,
  COURSE,
  EXPIRED,
  GET_ABSTRACT_COM,
  HMM,
  LINKED_IN_LEARNING,
  LO_TYPES,
  RETIRED,
} from '../constants';
// import { ElementAccessibility } from "../store/state";
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeResource,
  PrimeUser,
} from '../../models';
import store from '../../../store/APIStore';
import { getALMConfig, getALMObject } from '../global';
import { isLoadedInsideApp } from './appUtils';

import { sendEventsToApp } from './appUtils';
import { OfflineLink, OfflineResource } from '../../models/custom';
import { GetTranslation } from '../translationService';
import { QueryParams, RestAdapter } from '../restAdapter';
import { JsonApiParse } from '../jsonAPIAdapter';
import { checkIfEnrollmentDeadlineNotPassed, getInstanceIdsForOfflineDownload } from '../instance';
// import {
//   fetchSubLoChildrenForDownload,
//   forceDownload,
//   getAllQueryParamsFromUrl,
//   getAuthStringForIframes,
//   getDownloadStringsForNativeApp,
//   isLoadedInsideApp,
//   learningObjectIncludes,
//   learningObjectIncludesWithSubLO,
//   openExternalUrl,
// } from "./utils";
// import LOHelper from "../primeapihelper/lohelper";

const baseApiUrl = getALMConfig().primeApiURL;

export const LPDownloadurls = [
  `{hostName}/primeapi/v2/learningObjects/{loId}?enforcedFields%5BlearningObject%5D=products%2Croles&include=${encodeURIComponent(
    LO_DOWNLOAD_INCLUDES.LEARNING_OBJECT_INCLUDES_WITH_SUBLO
  )}`,
  '{hostName}/primeapi/v2/learningObjects/{loId}/instances/{instanceId}/summary',
];
export const CourseDownloadurls = [
  `{hostName}/primeapi/v2/learningObjects/{loId}?enforcedFields%5BlearningObject%5D=products%2Croles&include=${encodeURIComponent(
    LO_DOWNLOAD_INCLUDES.LEARNING_OBJECT_INCLUDES_WITH_SUBLO
  )}`,
  '{hostName}/primeapi/v2/learningObjects/{loId}/instances/{instanceId}/summary',
  '{hostName}/primeapi/v2/learningObjects/{loId}/note?include=loResource',
  '{hostName}/primeapi/v2/learningObjects/{loId}/enrollmentMeta',
];

export const LOPrerequisiteUrl = `{hostName}/primeapi/v2/learningObjects?page%5Blimit%5D=10&sort=effectiveness&filter.loTypes=course%2ClearningProgram%2CjobAid%2Ccertification&filter.learnerState=notenrolled%2Cenrolled%2Cstarted%2Ccompleted&filter.ignoreEnhancedLP=false&ids={loIds}&include=${encodeURIComponent(
  LO_DOWNLOAD_INCLUDES.LEARNING_OBJECT_INCLUDES
)}`;

export const SupplementaryLOUrl = `{hostName}/primeapi/v2/learningObjects?page%5Blimit%5D=10&sort=effectiveness&filter.loTypes=course%2ClearningProgram%2CjobAid%2Ccertification&filter.learnerState=notenrolled%2Cenrolled%2Cstarted%2Ccompleted&filter.ignoreEnhancedLP=false&ids={loIds}&include=${encodeURIComponent(
  LO_DOWNLOAD_INCLUDES.LEARNING_OBJECT_INCLUDES
)}`;

export const bcAPIUrl = `{hostName}/primeapi/v2/bcproxy/formal/video/{videoId}/metadata?asset_id={assetId}&asset_type={assetType}`;

export const otherUrls = [
  `{hostName}/primeapi/v2/data?filter.skillName=true`,
  `{hostName}/primeapi/v2/data?filter.tagName=true`,
  `{hostName}/primeapi/v2/data?filter.cityName=true`,
];

export function populateOtherUrls(): void {
  const prlCriteria = store.getState().account?.prlCriteria;
  if (prlCriteria?.products?.enabled) {
    otherUrls.push(
      `{hostName}/primeapi/v2/data?filter.recommendationCriteria=product&filter.showAllRecommendationCriteria=true`
    );
  }

  if (prlCriteria?.roles?.enabled) {
    otherUrls.push(
      `{hostName}/primeapi/v2/data?filter.recommendationCriteria=role&filter.showAllRecommendationCriteria=true`
    );
  }

  if (prlCriteria?.roles?.levelsEnabled || prlCriteria?.products?.levelsEnabled) {
    otherUrls.push(
      `{hostName}/primeapi/v2/data?filter.recommendationCriteria=level&filter.showAllRecommendationCriteria=true`
    );
  }
}

export function generateImageLinksForCourse(
  lo: PrimeLearningObject,
  instanceId: string | undefined
): Array<string> {
  const imageLinks: string[] = [];
  // banner image for lo
  if (lo.bannerUrl) {
    imageLinks.push(lo.bannerUrl);
  }

  // catalog card image for lo
  if (lo.imageUrl) {
    imageLinks.push(lo.imageUrl);
  }

  // badges image for lo
  const loInstance = lo.instances?.find(instance => instance.id === instanceId);
  if (loInstance?.badge?.imageUrl) {
    imageLinks.push(loInstance?.badge?.imageUrl);
  }
  return imageLinks;
}

export function generateImageLinksForLP(
  lo: PrimeLearningObject,
  instanceId: string | undefined
): Array<string> {
  let imageLinks: string[] = [];
  // banner image for lo
  if (lo.bannerUrl) {
    imageLinks.push(lo.bannerUrl);
  }

  // catalog card image for lo
  if (lo.imageUrl) {
    imageLinks.push(lo.imageUrl);
  }

  // badges image for lo
  const loInstance = lo.instances?.find(instance => instance.id === instanceId);
  if (loInstance?.badge?.imageUrl) {
    imageLinks.push(loInstance?.badge?.imageUrl);
  }

  // Get image links for subLOs
  const subLOs = lo.subLOs;
  if (subLOs?.length) {
    for (let i = 0; i < subLOs.length; i++) {
      const item = subLOs[i];
      if (item.loType === LO_TYPES.LEARNING_PROGRAM) {
        imageLinks = imageLinks.concat(
          generateImageLinksForLP(item, item.enrollment?.loInstance.id)
        );
      } else if (item.loType === LO_TYPES.COURSE) {
        imageLinks = imageLinks.concat(
          generateImageLinksForCourse(item, item.enrollment?.loInstance.id)
        );
      }
    }
  }
  return imageLinks;
}

export async function generateDownloadLinksForCourse(
  lo: PrimeLearningObject,
  instanceId: string | undefined
): Promise<string[]> {
  let downloadLinks = generateDownloadLinks(lo?.id, instanceId, CourseDownloadurls);
  downloadLinks = downloadLinks.concat(await generateLinksForPrerequisites(lo));
  downloadLinks = downloadLinks.concat(await generateLinksForSupplementaryLO(lo));

  // push image url link
  if (lo.imageUrl) {
    downloadLinks.push(lo.imageUrl);
  }
  // remove duplicate downloadLinks
  downloadLinks = downloadLinks.filter((item, index) => downloadLinks.indexOf(item) === index);
  return downloadLinks;
}

export function generateResourceLinkForVideo(
  lo: PrimeLearningObject,
  resource: PrimeResource
): string {
  const ContentType = {
    RESOURCE: 'resource',
    JOBAID: 'jobaid',
    ANNOUNCEMENT: 'announcement',
  };
  const hostName = getALMConfig().primeApiURL;
  const assetId =
    lo.loType === LO_TYPES.JOB_AID ? lo.id : resource.internalResourceId?.toString() || '';
  const assetType = lo.loType === LO_TYPES.JOB_AID ? ContentType.JOBAID : ContentType.RESOURCE;
  const videoId = resource.location;
  const videoUrl = `${hostName}${PLAYER_API_CONSTS.CONTENT_URL_VIDEO}`
    .replace('{videoId}', videoId)
    .replace('{assetId}', assetId)
    .replace('{assetType}', assetType);

  return videoUrl;
}

export function generateResourceLinksForCourse(
  lo: PrimeLearningObject,
  instanceId: string | undefined
): Array<OfflineResource> {
  const resourceLinks: OfflineResource[] = [];
  const loInstance = lo.instances?.find(instance => instance.id === instanceId);
  loInstance?.loResources?.forEach(loResource => {
    loResource.resources?.forEach(resource => {
      if ([ContentType.VIDEO, ContentType.AUDIO].includes(resource.contentType)) {
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: generateResourceLinkForVideo(lo, resource),
        });
      } else if ([ContentType.CP, ContentType.PR].includes(resource.contentType)) {
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: resource.location || '',
        });
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: resource.contentZipUrl || '',
        });
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: resource.contentStructureInfoUrl || '',
        });
        // For AICC contentType === ContentType.AICC and for SCORM we are checking includes because SCORM can be SCORM1.2 or SCORM2004
      } else if (
        resource.contentType === ContentType.AICC ||
        resource.contentType === ContentType.QUIZ ||
        resource.contentType.includes(ContentType.SCORM)
      ) {
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: resource.location || '',
        });
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: resource.contentZipUrl || '',
        });
      } else if (
        [ContentType.ACTIVITY, ContentType.CR, ContentType.VCR].includes(resource.contentType)
      ) {
        // Don't do Anything
      } else {
        resourceLinks.push({
          id: resource.id,
          contentType: resource.contentType,
          resourceLink: resource.location,
        });
      }
    });
  });
  return resourceLinks;
}

export function generateResourceLinksForLP(
  lo: PrimeLearningObject,
  instanceId: string
): Array<OfflineResource> {
  let resourceLinks: OfflineResource[] = [];
  const subLOs = lo.subLOs;
  if (subLOs) {
    for (let i = 0; i < subLOs.length; i++) {
      const subLo = subLOs[i];
      if (subLo.loType === LO_TYPES.LEARNING_PROGRAM || subLo.loType === LO_TYPES.CERTIFICATION) {
        resourceLinks = resourceLinks.concat(generateResourceLinksForLP(subLo, instanceId));
      } else if (subLo.loType === LO_TYPES.COURSE) {
        resourceLinks = resourceLinks.concat(
          generateResourceLinksForCourse(subLo, subLo.enrollment?.loInstance?.id)
        );
      }
    }
  }
  // remove duplicate resourceLinks
  resourceLinks.filter((item, index) => resourceLinks.indexOf(item) === index);
  return resourceLinks;
}

export function generatePlayerLinksForCourse(
  lo: PrimeLearningObject,
  instanceId: string | undefined,
  userId: string,
  accountId: string,
  courseEnrollmentId?: string
): Array<string> {
  const loInstance = lo.instances?.find(instance => instance.id === instanceId);
  const loId = lo.id;
  let courseId = '';
  if (lo.loType === LO_TYPES.COURSE) {
    courseId = loId;
  }
  const enrollmentId = courseEnrollmentId ?? lo.enrollment?.id ?? '';
  const loResources = loInstance?.loResources;
  //   TODO: notes
  //   const notes = state.learningObject.notes;
  const hostName = getALMConfig().primeApiURL;
  let playerLinks: string[] = [];
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO}?${CMI_ENFORCED_FIELDS_QP}`.replace('{loId}', loId)
  ); // 5
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_INFO_PREVIEW}`.replace('{loId}', loId)); // 6
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO_MULTI_ENROLLMENT}`.replace('{loId}', loId)
  ); // 7
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_ENROLLMENT}`.replace('{enrollmentId}', enrollmentId)
  ); // 8
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_INFO_WITH_GRADES}`.replace('{loId}', loId)); // 9
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_INFO_WITH_ROOM}`.replace('{loId}', loId)); // 10
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO_WITH_SOURCE}`
      .replace('{loId}', loId)
      .replace('{showLoContentSource}', 'true')
  ); // 11
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO_WITH_ROOM_SOURCE}${CMI_ENFORCED_FIELDS_QP}`.replace(
      '{loId}',
      loId
    )
  ); // 12
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_INFO_NEW}`.replace('{loId}', loId)); // 13
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.COURSE_NOTES}`.replace('{courseId}', courseId)); // 14
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.COURSE_INSTANCE_NOTES}`
      .replace('{courseId}', loId)
      .replace('{instanceId}', instanceId || '')
  ); // 15
  // playerLinks.push(
  //   `${hostName}${PLAYER_API_CONSTS.LO_STATE}`.replace('{userId}', userId).replace('{loId}', loId)
  // ); // 16
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_STATE_WITH_INSTANCE_ID}`
      .replace('{userId}', userId)
      .replace('{loId}', loId)
      .replace('{instanceId}', instanceId || '')
  ); // 17
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_CONTROL_SETTINGS}`.replace('{loId}', loId)); // 18
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.COURSE_CONTROL_SETTINGS}`.replace('{courseId}', courseId)
  ); // 19

  loResources?.forEach(loResource => {
    playerLinks.push(
      `${hostName}${PLAYER_API_CONSTS.LO_RESOURCE_NOTES}`
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
    ); // 20

    playerLinks.push(
      `${hostName}${PLAYER_API_CONSTS.LO_RESOURCE_STATE}`
        .replace('{userId}', userId)
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
    ); // 21

    playerLinks.push(
      `${hostName}${PLAYER_API_CONSTS.LO_RESOURCE_LO_STATE}`
        .replace('{userId}', userId)
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
    ); // 22

    playerLinks.push(
      `${hostName}${PLAYER_API_CONSTS.LO_RESOURCE_LO_STATE_WITH_INSTANCE_ID}`
        .replace('{userId}', userId)
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
        .replace('{instanceId}', instanceId || '')
    ); // 23

    playerLinks.push(
      `${hostName}${PLAYER_API_CONSTS.CAN_START}`
        .replace('{accountId}', accountId)
        .replace('{courseId}', courseId.split(':')[1])
        .replace('{i_qp_root_lp_id}', '')
        .replace('{courseInstanceId}', instanceId?.split('_')[1] || '')
        .replace('{i_qp_lp_id}', '')
        .replace('{i_qp_cert_id}', '')
    ); // 25

    playerLinks.push(
      `${hostName}${PLAYER_API_CONSTS.MODULE_RESET}`
        .replace('{userId}', userId)
        .replace('{courseId}', courseId)
        .replace('{loResourceId}', loResource.id)
        .replace('{i_qp_reset}', 'false')
        .replace('{i_qp_started_time}', ((Date.now() / 1000) | 0).toString())
        .replace('{close}', 'false')
    ); // 26

    // TODO: notes
    // notes?.forEach(note => {
    //   playerLinks.push(
    //     `${hostName}${PLAYER_API_CONSTS.LO_RESOURCE_NOTE}`
    //       .replace("{loId}", loId)
    //       .replace("{loResourceId}", loResource.id)
    //       .replace("{noteId}", note.id)
    //   ); // 27
    // });

    const gradesSource =
      loInstance?.enrollment?.loResourceGrades ?? lo.enrollment?.loResourceGrades;
    const resourceGrade = gradesSource?.find(grade => grade.loResource?.id === loResource.id);

    if (resourceGrade?.id) {
      playerLinks.push(
        `${hostName}${PLAYER_API_CONSTS.LO_RESOURCE_GRADES}`.replace(
          '{loResourceGradeId}',
          resourceGrade?.id
        )
      ); // 28
    }

    const resources = loResource.resources;
    resources?.forEach(resource => {
      playerLinks.push(
        `${hostName}${PLAYER_API_CONSTS.EXTERNAL_SESSION}`
          .replace('{loId}', loId)
          .replace('{loResourceId}', loResource.id)
          .replace('{resourceId}', resource.id)
      ); // 30
    });
  });

  // remove duplicate playerLinks
  playerLinks = playerLinks.filter((item, index) => playerLinks.indexOf(item) === index);
  return playerLinks;
}

export function generatePlayerLinksForLP(
  lo: PrimeLearningObject,
  userId: string,
  accountId: string
): Array<string> {
  const loId = lo.id;
  const hostName = getALMConfig().primeApiURL;
  let playerLinks: string[] = [];
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_INFO_FOR_LP}`.replace('{loId}', loId)); // 1
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO_WITH_GRADES_FOR_LP}${CMI_ENFORCED_FIELDS_QP}`.replace(
      '{loId}',
      loId
    )
  ); // 2
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO_PREVIEW_FOR_LP}`.replace('{loId}', loId)
  ); // 3
  playerLinks.push(
    `${hostName}${PLAYER_API_CONSTS.LO_INFO_TOC_PREVIEW_FOR_LP}`.replace('{loId}', loId)
  ); // 4
  playerLinks.push(`${hostName}${PLAYER_API_CONSTS.LO_INFO_NEW_FOR_LP}`.replace('{loId}', loId)); // 5

  const subLOs = lo.subLOs;
  if (subLOs) {
    for (let i = 0; i < subLOs.length; i++) {
      const subLo = subLOs[i];
      if (subLo.loType === LO_TYPES.LEARNING_PROGRAM || subLo.loType === LO_TYPES.CERTIFICATION) {
        playerLinks = playerLinks.concat(generatePlayerLinksForLP(subLo, userId, accountId));
      } else if (subLo.loType === LO_TYPES.COURSE) {
        playerLinks = playerLinks.concat(
          generatePlayerLinksForCourse(
            subLo,
            subLo.enrollment?.loInstance?.id,
            userId,
            accountId,
            subLo.enrollment?.id
          )
        );
      }
    }
  }
  // Filter out duplicate playerLinks
  playerLinks = playerLinks.filter((item, index) => playerLinks.indexOf(item) === index);
  return playerLinks;
}

export function generateDownloadLinks(
  loId: string,
  loInstanceId = '',
  urls: string[]
): Array<string> {
  return urls.map((item: string) => {
    return item
      .replace('{loId}', encodeURIComponent(loId))
      .replace('{instanceId}', encodeURIComponent(loInstanceId))
      .replace('{hostName}', getALMConfig().almBaseURL);
  });
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function validateUrls(urls: string[]): Promise<boolean> {
  //   const { accessToken } = getAllQueryParamsFromUrl(window.location.search);
  const accessToken = getALMObject().getAccessToken();
  // rate is a patch url so excluding it (Its working fine)
  urls = urls.filter(url => !url.includes('rate'));
  return Promise.all(
    urls.map((url, index) =>
      delay(index * 100).then(() =>
        fetch(
          `${url}${
            url.includes('?') ? `&access_token=${accessToken}` : `?access_token=${accessToken}`
          }`
        )
      )
    )
  )
    .then(responses => {
      for (let i = 0; i < responses.length; i++) {
        if (!(responses[i].status >= 200 && responses[i].status < 300)) {
          console.log('Invalid URL: ', urls[i]);
          return false;
        }
      }
      return true;
    })
    .catch(err => {
      console.log('Error while validating urls: ', err);
      return false;
    });
}

function dedupeStringList(urls: string[]): string[] {
  return urls.filter((item, index) => urls.indexOf(item) === index);
}

function mergeOfflineLinks(links: OfflineLink[], loId: string): OfflineLink {
  const mergedLoLinks: string[] = [];
  const mergedPlayer: string[] = [];
  const mergedImages: string[] = [];
  const mergedResources: OfflineResource[] = [];
  for (const l of links) {
    mergedLoLinks.push(...(l.loLinks ?? []));
    mergedPlayer.push(...(l.playerLinks ?? []));
    mergedImages.push(...(l.imageLinks ?? []));
    mergedResources.push(...(l.resources ?? []));
  }
  const seenResource = new Set<string>();
  const dedupedResources = mergedResources.filter(r => {
    const key = `${r.id}|${r.resourceLink}|${r.contentType}`;
    if (seenResource.has(key)) {
      return false;
    }
    seenResource.add(key);
    return true;
  });
  return {
    id: loId,
    overviewLink: links[0]?.overviewLink ?? '',
    loLinks: dedupeStringList(mergedLoLinks),
    playerLinks: dedupeStringList(mergedPlayer),
    resources: dedupedResources,
    imageLinks: dedupeStringList(mergedImages),
  };
}

async function buildOfflineLinkPayload(
  lo: PrimeLearningObject,
  instanceId: string,
  user: PrimeUser
): Promise<OfflineLink> {
  let downloadLinks: string[] = [];
  let resourceLinks: OfflineResource[] = [];
  let playerLinks: string[] = [];
  let imageLinks: string[] = [];
  const courseEnrollmentId =
    lo.instances?.find(i => i.id === instanceId)?.enrollment?.id ?? lo.enrollment?.id;
  if (lo.loType === LO_TYPES.LEARNING_PROGRAM || lo.loType === LO_TYPES.CERTIFICATION) {
    downloadLinks = await generateDownloadLinksForLP(lo, instanceId);
    resourceLinks = generateResourceLinksForLP(lo, instanceId);
    playerLinks = generatePlayerLinksForLP(lo, user.id, user.account.id);
    imageLinks = generateImageLinksForLP(lo, instanceId);
  } else if (lo.loType === LO_TYPES.COURSE) {
    downloadLinks = await generateDownloadLinksForCourse(lo, instanceId);
    resourceLinks = generateResourceLinksForCourse(lo, instanceId);
    playerLinks = generatePlayerLinksForCourse(
      lo,
      instanceId,
      user.id,
      user.account.id,
      courseEnrollmentId
    );
    imageLinks = generateImageLinksForCourse(lo, instanceId);
  }

  console.groupCollapsed('Download Links:');
  console.log('Download Links:', downloadLinks);
  console.log('Resource Links:', resourceLinks);
  console.log('Player Links:', playerLinks);
  console.log('Image Links:', imageLinks);
  console.groupEnd();

  return {
    id: lo.id,
    overviewLink: downloadLinks[0],
    loLinks: downloadLinks,
    playerLinks: playerLinks,
    resources: resourceLinks,
    imageLinks: imageLinks,
  };
}

export async function getDownloadLinks(
  lo: PrimeLearningObject,
  instanceId: string,
  user: PrimeUser
): Promise<OfflineLink[]> {
  const instanceIds = getInstanceIdsForOfflineDownload(lo, instanceId || undefined);
  if (instanceIds.length === 0) {
    return [
      {
        id: lo.id,
        overviewLink: '',
        loLinks: [],
        playerLinks: [],
        resources: [],
        imageLinks: [],
      },
    ];
  }
  if (instanceIds.length === 1) {
    return [await buildOfflineLinkPayload(lo, instanceIds[0], user)];
  }
  const builtLinks = await Promise.all(
    instanceIds.map(id => buildOfflineLinkPayload(lo, id, user))
  );
  return [mergeOfflineLinks(builtLinks, lo.id)];
}

export function sendDownloadContentEvent(offlineLinks: OfflineLink[]): void {
  sendEventsToApp(NATIVEAPPEVENTS.DOWNLOAD_CONTENT, {
    offlineLinks,
  });
}

export function sendDeleteContentEvent(offlineLinks: OfflineLink[]): void {
  sendEventsToApp(NATIVEAPPEVENTS.DELETE_CONTENT, {
    offlineLinks,
  });
}

export function deleteDownloadedContentForTraining(
  training: PrimeLearningObject,
  instanceId: string,
  user: PrimeUser | undefined,
  requireInOfflineCatalog = false
): Promise<void> {
  if (!user) {
    return Promise.resolve();
  }
  const s = store.getState() as State;
  if (s.appState.appMode !== AppMode.INSIDEAPP) {
    return Promise.resolve();
  }
  if (requireInOfflineCatalog) {
    const inOfflineList =
      s.catalog.offlineTrainings?.some(item => item.id === training.id) ?? false;
    if (!inOfflineList) {
      return Promise.resolve();
    }
  }
  return getDownloadLinks(training, instanceId || '', user).then(offlineLinks => {
    sendDeleteContentEvent(offlineLinks);
    store.dispatch({
      type: AppEvents.DELETE_DOWNLOAD,
      value: { loId: training.id },
    });
  });
}

export function sendUpdateContentEvent(offlineLinks: OfflineLink[]): void {
  offlineLinks = offlineLinks.map(item => {
    item.resources = [];
    return item;
  });
  sendEventsToApp(NATIVEAPPEVENTS.UPDATE_CONTENT, {
    offlineLinks,
  });
}

export function generateLinksForPrereqOrSupplementaryLO(url: string, loIds = ''): string {
  return url
    .replace('{loIds}', encodeURIComponent(loIds))
    .replace('{hostName}', getALMConfig().almBaseURL);
}

export async function generateLinksForPrerequisites(lo: PrimeLearningObject): Promise<string[]> {
  let prerequisiteLinks: string[] = [];
  const prerequisiteLOs = lo.prerequisiteLOs;
  if (prerequisiteLOs?.length) {
    // Get concatenated ids of prerequisite LOs in a group of 10
    for (let i = 0; i < prerequisiteLOs.length; i += 10) {
      const prerequisiteLOsTemp = prerequisiteLOs.slice(i, i + 10);
      const concatenatedIds = prerequisiteLOsTemp.map(item => item.id).join(',');
      prerequisiteLinks.push(
        generateLinksForPrereqOrSupplementaryLO(LOPrerequisiteUrl, concatenatedIds)
      );
    }
    for (let i = 0; i < prerequisiteLOs.length; i++) {
      const item = prerequisiteLOs[i];
      if (item.loType === LO_TYPES.LEARNING_PROGRAM) {
        prerequisiteLinks = prerequisiteLinks.concat(
          await generateDownloadLinksForLP(item, item.enrollment?.loInstance.id)
        );
      } else if (item.loType === LO_TYPES.COURSE) {
        prerequisiteLinks = prerequisiteLinks.concat(
          await generateDownloadLinksForCourse(item, item.enrollment?.loInstance.id)
        );
      }
    }
  }
  // remove duplicate prerequisiteLinks
  prerequisiteLinks = prerequisiteLinks.filter(
    (item, index) => prerequisiteLinks.indexOf(item) === index
  );
  return prerequisiteLinks;
}

export async function generateLinksForSupplementaryLO(lo: PrimeLearningObject): Promise<string[]> {
  const links: string[] = [];
  const supplementaryLOs = lo.supplementaryLOs;
  if (supplementaryLOs?.length) {
    // Get concatenated ids of supplementary LOs in a group of 10
    for (let i = 0; i < supplementaryLOs.length; i += 10) {
      const supplementaryLOsTemp = supplementaryLOs.slice(i, i + 10);
      const concatenatedIds = supplementaryLOsTemp.map(item => item.id).join(',');
      links.push(generateLinksForPrereqOrSupplementaryLO(SupplementaryLOUrl, concatenatedIds));
    }
  }
  return links;
}

export async function generateDownloadLinksForLP(
  lo: PrimeLearningObject,
  instanceId: string | undefined
): Promise<string[]> {
  let downloadLinks = generateDownloadLinks(lo?.id, instanceId, LPDownloadurls);
  downloadLinks = downloadLinks.concat(await generateLinksForPrerequisites(lo));
  downloadLinks = downloadLinks.concat(await generateLinksForSupplementaryLO(lo));

  const subLOs = lo.subLOs;
  if (
    (lo.loType === LO_TYPES.LEARNING_PROGRAM || lo.loType === LO_TYPES.CERTIFICATION) &&
    !subLOs
  ) {
    // await fetchSubLoChildrenForDownload(lo, store);
    lo = await fetchLoWithSubLos(lo.id);
  }
  if (subLOs?.length) {
    for (let i = 0; i < subLOs.length; i++) {
      const item = subLOs[i];
      if (item.loType === LO_TYPES.LEARNING_PROGRAM) {
        downloadLinks = downloadLinks.concat(
          await generateDownloadLinksForLP(item, item.enrollment?.loInstance.id)
        );
      } else if (item.loType === LO_TYPES.COURSE) {
        downloadLinks = downloadLinks.concat(
          await generateDownloadLinksForCourse(item, item.enrollment?.loInstance.id)
        );
      }
    }
  }
  // remove duplicate downloadLinks
  downloadLinks = downloadLinks.filter((item, index) => downloadLinks.indexOf(item) === index);
  return downloadLinks;
}

// export function checkToDisplayContentUpdateDialog(): void {
//   const state = store.getState();
//   store.dispatch({
//     type: AppEvents.NATIVE_APP_SHOW_CONTENT_UPDATE_DIALOG,
//     isFullScreen: true,
//     elementName: ElementAccessibility.DIALOG,
//     title: i18n(getALMConfig().locale).NATIVE_APP_UPDATE_CONTENT,
//   });
// }

export function getOfflineSyncUrls(
  lo: PrimeLearningObject,
  instanceId: string | undefined
): string[] {
  const state = store.getState();
  const hostName = getALMConfig().almBaseURL;
  const loId = lo.id;
  const userId = state.user.id;
  const loInstance = lo.instances?.find(instance => instance.id === instanceId);
  const loResources = loInstance?.loResources;
  let offlineSyncLinks: string[] = [];
  let courseId = '';
  if (lo.loType === LO_TYPES.COURSE) {
    courseId = loId;
  }

  offlineSyncLinks.push(
    `${hostName}/${PLAYER_API_CONSTS.LO_STATE_WITH_INSTANCE_ID}`
      .replace('{userId}', userId)
      .replace('{loId}', loId)
      .replace('{instanceId}', instanceId || '')
  );

  loResources?.forEach(loResource => {
    offlineSyncLinks.push(
      `${hostName}/${PLAYER_API_CONSTS.LO_RESOURCE_LO_STATE}`
        .replace('{userId}', userId)
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
    );

    offlineSyncLinks.push(
      `${hostName}/${PLAYER_API_CONSTS.LO_RESOURCE_LO_STATE_WITH_INSTANCE_ID}`
        .replace('{userId}', userId)
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
        .replace('{instanceId}', instanceId || '')
    );

    offlineSyncLinks.push(
      `${hostName}/${PLAYER_API_CONSTS.LO_RESOURCE_STATE}`
        .replace('{userId}', userId)
        .replace('{loId}', loId)
        .replace('{loResourceId}', loResource.id)
    );

    offlineSyncLinks.push(
      `${hostName}/${PLAYER_API_CONSTS.MODULE_RESET}`
        .replace('{userId}', userId)
        .replace('{courseId}', courseId)
        .replace('{loResourceId}', loResource.id)
        .replace('{i_qp_reset}', 'false')
        .replace('{i_qp_started_time}', ((Date.now() / 1000) | 0).toString())
        .replace('{close}', 'false')
    );
  });
  // remove duplicate offlineSyncLinks
  offlineSyncLinks = offlineSyncLinks.filter(
    (item, index) => offlineSyncLinks.indexOf(item) === index
  );
  console.log('OfflineSyncLinks: ', offlineSyncLinks);
  return offlineSyncLinks;
}

export async function generateDownloadLinksForLO(
  lo: PrimeLearningObject,
  loInstanceId: string
): Promise<string[]> {
  const state = store.getState();
  let downloadLinks: string[] = [];
  if (!lo) return [];
  if (lo.loType === LO_TYPES.LEARNING_PROGRAM || lo.loType === LO_TYPES.CERTIFICATION) {
    downloadLinks = await generateDownloadLinksForLP(lo, loInstanceId);
  } else {
    downloadLinks = await generateDownloadLinksForCourse(lo, loInstanceId);
  }
  return downloadLinks;
}

// make the above function recursive to get all the overview links LO and subLOs
export function generateAllOverviewLinksForLO(
  lo: PrimeLearningObject,
  loInstanceId: string
): string[] {
  const overviewLinks: string[] = [];
  const state = store.getState();
  if (!lo) return [];
  function generateOverviewLinks(lo: PrimeLearningObject, loInstanceId: string) {
    if (lo.loType === LO_TYPES.LEARNING_PROGRAM || lo.loType === LO_TYPES.CERTIFICATION) {
      overviewLinks.push(
        LPDownloadurls[0]
          .replace('{loId}', encodeURIComponent(lo.id))
          .replace('{instanceId}', encodeURIComponent(loInstanceId))
          .replace('{hostName}', getALMConfig().almBaseURL)
      );
      lo.subLOs?.forEach(item => {
        // find loInstanceId for subLO
        const subLOInstance = item.instances?.[0];
        generateOverviewLinks(item, subLOInstance?.id || '');
      });
    } else {
      overviewLinks.push(
        CourseDownloadurls[0]
          .replace('{loId}', encodeURIComponent(lo.id))
          .replace('{instanceId}', encodeURIComponent(loInstanceId))
          .replace('{hostName}', getALMConfig().almBaseURL)
      );
    }
  }
  generateOverviewLinks(lo, loInstanceId);
  console.log('OverviewLinks: ', overviewLinks);
  return overviewLinks;
}

// TODO: Launch Native Player on Offline
// /**
//  * Helper function to launch player for a course
//  * @param lo - Learning Object for which player is to be launched
//  */
// export function launchPlayerForCourse(lo: PrimeLearningObject): void {
//   const state = store.getState();
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   // const lo = state.learningObject.lo!;
//   const playerUrl = `${getALMConfig().almBaseURL}/app/player?lo_id=${
//     lo.id
//   }&is_native=true&isInsideApp=${isLoadedInsideApp(state.appState.appMode)}${getAuthStringForIframes(
//     state
//   )}`;
//   console.log("Player Url:", playerUrl);
//   const loInstanceId =
//     state.learningObject.instanceIdx !== null
//       ? lo.instances![state.learningObject.instanceIdx].id
//       : "";
//   const { networkStatus } = getAllQueryParamsFromUrl(window.location.search);
//   if (state.isOnline) {
//     const iframe: HTMLIFrameElement = document.createElement("iframe");
//     iframe.frameBorder = "0";
//     iframe.classList.add("playeriframe");
//     iframe.src = playerUrl;
//     iframe.allowFullscreen = true;
//     document.body.appendChild(iframe);
//     // this.iframe_opened = true;
//   } else if (!state.isOnline && networkStatus === NetworkStatus.OFFLINE) {
//     // Raise Event to Native for Player
//     const parentLO = state.nestedLearningObjects[0];
//     const overviewLinks = generateAllOverviewLinksForLO(parentLO, loInstanceId);
//     sendEventsToApp(NATIVEAPPEVENTS.LAUNCH_OFFLINE_PLAYER, {
//       loOverviewLink: overviewLinks[0] || "",
//       offlinePlayerUrl: playerUrl,
//       offlineSyncLinks: getOfflineSyncUrls(lo, loInstanceId),
//       subLoOverviewLinks: overviewLinks.slice(1),
//     });
//   } else {
//     store.dispatch({
//       type: AppEvents.LOAD_OFFLINE_PAGE,
//     });
//   }
// }

// /**
//  * Helper function to download JobAid
//  * @param lo Learning Object for which JobAid is to be downloaded
//  * @returns nothing
//  */
// export async function downloadJobAid(lo: PrimeLearningObject): Promise<void> {
//   if (LOHelper.isJobaid(lo)) {
//     const state = store.getState();
//     const url = LOHelper.getJobaidUrl(lo);
//     if (isLoadedInsideApp(state.appMode)) {
//       sendEventsToApp(NATIVEAPPEVENTS.DOWNLOAD_JOB_AID, {
//         url,
//         ...getDownloadStringsForNativeApp(getALMConfig().locale),
//       });
//     } else {
//       forceDownload(url!);
//     }
//   }
//   store.dispatch({
//     type: AppEvents.HIDE_CONFIRMATION_DIALOG,
//   });
//   return;
// }

// /**
//  * Helper function to open JobAid
//  * @param lo Learning Object for which JobAid is to be opened
//  * @returns nothing
//  */
// export async function openJobAid(lo: PrimeLearningObject): Promise<void> {
//   const state = store.getState();
//   if (LOHelper.isJobaid(lo)) {
//     if (LOHelper.isJobaidContentTypeUrl(lo)) {
//       const jobaidUrl = LOHelper.getJobaidUrl(lo);
//       if (isLoadedInsideApp(state.appMode)) {
//         openExternalUrl(
//           store.getState(),
//           NATIVEAPPEVENTS.OPEN_EXTERNAL_URL,
//           { url: jobaidUrl } || ""
//         );
//       } else {
//         window.open(jobaidUrl, "_blank");
//       }
//     } else {
//       launchPlayerForCourse(lo);
//     }
//   }
//   store.dispatch({
//     type: AppEvents.HIDE_CONFIRMATION_DIALOG,
//   });
//   return;
// }

/**
 *
 * @param resource PrimeResource to be downloaded
 * @returns nothing
 */
export async function downloadResource(resource: PrimeResource): Promise<void> {
  const state = store.getState();
  const url = resource.location;
  if (isLoadedInsideApp()) {
    sendEventsToApp(NATIVEAPPEVENTS.DOWNLOAD_JOB_AID, {
      url,
      ...getDownloadStringsForNativeApp(),
    });
    //   } else {
    //     forceDownload(url);
  }
  // store.dispatch({
  //   type: AppEvents.HIDE_CONFIRMATION_DIALOG,
  // });
  return;
}

export function getDownloadStringsForNativeApp(): {
  completedText: string;
  extraText: string;
  progressText: string;
  downloadFailedText: string;
  cancelText: string;
  cancel: string;
} {
  return {
    completedText: GetTranslation('app.download.completedText'),
    extraText: GetTranslation('app.download.openFileText'),
    progressText: GetTranslation('app.download.progressText'),
    downloadFailedText: GetTranslation('app.download.failedText'),
    cancelText: GetTranslation('app.download.cancelledText'),
    cancel: GetTranslation('text.cancel'),
  };
}

export const fetchLoWithSubLos = async (trainingId: string) => {
  const params: QueryParams = {};
  params['include'] = LO_DOWNLOAD_INCLUDES.LEARNING_OBJECT_INCLUDES_WITH_SUBLO;

  const response = await RestAdapter.get({
    url: `${baseApiUrl}/learningObjects/${trainingId}`,
    params: params,
  }).catch(e => {});
  const parsedResponse = JsonApiParse(response);
  return parsedResponse.learningObject;
};

// /**
//  *
//  * @param resource PrimeResource to be opened
//  * @returns nothing
//  */
// export async function openResource(resource: PrimeResource): Promise<void> {
//   openExternalUrl(
//     store.getState(),
//     NATIVEAPPEVENTS.OPEN_EXTERNAL_URL,
//     {url: resource.location} || ''
//   );
//   store.dispatch({
//     type: ActionTypes.HIDE_CONFIRMATION_DIALOG,
//   });
//   return;
// }

const checkIfThirdPartyCourse = (training: PrimeLearningObject) => {
  const lowerCaseLinkedInLearning = LINKED_IN_LEARNING.toLowerCase();
  const lowerCaseGetAbstractCom = GET_ABSTRACT_COM;
  const lowerCaseHMM = HMM;
  const externalAuthors = new Set([
    lowerCaseLinkedInLearning,
    lowerCaseGetAbstractCom,
    lowerCaseHMM,
  ]);
  return training?.authorNames?.some(authorName => externalAuthors.has(authorName.toLowerCase()));
};

export function showDownloadButton(
  account: PrimeAccount,
  lo: PrimeLearningObject,
  loInstance?: PrimeLearningObjectInstance
): boolean {
  if (!loInstance) {
    loInstance = lo.instances[0];
  }
  if (
    lo.prerequisiteLOs?.length ||
    (account.enableECommerce && lo?.price) ||
    lo.state === RETIRED ||
    lo.state === EXPIRED ||
    lo.isMqaEnabled ||
    checkIfThirdPartyCourse(lo) ||
    !checkIfEnrollmentDeadlineNotPassed(loInstance)
  ) {
    return false;
  }

  // Check if any loResources don't have resources (No Content Modules)
  if (loInstance.loResources?.some(loResources => !loResources.resources)) {
    return false;
  }

  // Check if any loResources have quiz type resources
  if (
    loInstance.loResources?.some(loResource =>
      loResource.resources?.some(resource => resource.contentType === ContentType.QUIZ)
    )
  ) {
    return false;
  }

  // Check if any loResources have lti type resources
  if (
    loInstance.loResources?.some(loResource =>
      loResource.resources?.some(resource => resource.contentType === ContentType.LTI)
    )
  ) {
    return false;
  }

  if (lo.loType === COURSE || lo.loType === CERTIFICATION) {
    if (lo.isEnhancedLP || loInstance.isFlexible || lo.isExternal) {
      return false;
    }
    if (lo.subLOs?.length) {
      for (let i = 0; i < lo.subLOs.length; i++) {
        const subLo = lo.subLOs[i];
        if (subLo.prerequisiteLOs?.length) {
          return false;
        }
        if (
          subLo.instances![0].loResources?.some(loResource =>
            loResource.resources?.some(resource => resource.contentType === ContentType.LTI)
          )
        ) {
          return false;
        }
        if (
          subLo.instances![0].loResources?.some(loResource =>
            loResource.resources?.some(resource => resource.contentType === ContentType.QUIZ)
          )
        ) {
          return false;
        }
      }
    }
  } else if (lo.loType === COURSE) {
    const contentModules =
      loInstance.loResources?.filter(res => res.loResourceType === CONTENT) || [];
    if (contentModules?.length === 0) {
      return false;
    }
  }
  return true;
}
