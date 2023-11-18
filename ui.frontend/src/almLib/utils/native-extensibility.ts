import { PrimeExtension, PrimeExtensionOverride, PrimeLearningObject, PrimeLearningObjectInstance } from "../models";
import { CERTIFICATION, COURSE, LEARNING_PROGRAM, SELF_ENROLL } from "./constants";
import { getWindowObject } from "./global";

export enum EXTENSION_LAUNCH_TYPE {
    NEW_TAB = 'NEW_TAB',
    IN_APP = 'IN_APP',
    SAME_TAB = 'SAME_TAB'
}
export enum EXTENSION_SCOPE_TYPE {
    ALL = 'ALL',
    SELECTED = 'SELECTED'
}

export function openExtensionInSameTab(
    url: string,
    params: any = {}
) {
    const appUrl = getExtensionAppUrl(url, params);
    window.open(appUrl.href, '_self');
    return;
}

export function openExtensionInNewTab(
    url: string,
    params: any = {}
) {
    const appUrl = getExtensionAppUrl(url, params);
    window.open(appUrl.href, '_blank');
    return;
}

export function getExtensionAppUrl(url: string,
    params: any = {}): URL {
    const urlObject = new URL(url);
    Object.keys(params).forEach((key) => {
        urlObject.searchParams.append(key, params[key]);
    });
    return urlObject;
}
export function removeExtraQPFromExtension() {
    let a = new URL(window.location.href);
    a.searchParams.delete('extToken');
    window.history.replaceState({}, '', a.href);
    return;
}


export enum InvocationType {
    LEARNER_ENROLL = 'LEARNER_ENROLL',
    LEARNER_OVERVIEW = 'LEARNER_OVERVIEW',
    LEARNER_INSTANCE_ROW = 'LEARNER_INSTANCE_ROW',
    LEARNER_MAIN_MENU = 'LEARNER_MAIN_MENU',
    LEARNER_FOOTER = 'LEARNER_FOOTER',
    ADMIN_AUTHOR_INSTANCE_ROW = 'ADMIN_AUTHOR_INSTANCE_ROW',
    PREVIEW_AS_LEARNER = 'PREVIEW_AS_LEARNER',
    SCHEDULING_ASSISTANT = 'SCHEDULING_ASSISTANT',
    ADMIN_MAIN_MENU = 'ADMIN_MAIN_MENU',
    ADMIN_REPORTS = 'ADMIN_REPORTS',
    ADMIN_USERS_ROW = 'ADMIN_USERS_ROW',
    AUTHOR_OVERVIEW = 'AUTHOR_OVERVIEW',
    AUTHOR_MAIN_MENU = 'AUTHOR_MAIN_MENU',
    MANAGER_MAIN_MENU = 'MANAGER_MAIN_MENU',
    INSTRUCTOR_MAIN_MENU = 'INSTRUCTOR_MAIN_MENU',
}

export function getParsedJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
        return undefined
    }
}


export function getExtensionWithinvocationType(
    extensions: PrimeExtension[] = [],
    invocationType: string,
    scope = EXTENSION_SCOPE_TYPE.ALL,
) {
    if (extensions && extensions.length === 0) {
        return;
    }
    return extensions.find((extension: PrimeExtension) => {
        return extension.invocationType === invocationType
            && extension.defaultScope === scope;
    });
}

export function getExtension(
    extensions: PrimeExtension[] = [],
    overrideExtensions: PrimeExtensionOverride[] | undefined = [],
    invocationType: string,
    scope = EXTENSION_SCOPE_TYPE.ALL,
) {
    if (extensions.length === 0) {
        return;
    }

    //if there is no associated Extension, then get enabled,IP and scope = ALL extension from Account
    if (overrideExtensions.length === 0) {
        return getExtensionWithinvocationType(extensions, invocationType, scope);
    }

    //creating Map for extensions array for IP
    const extensionMap = new Map<string, PrimeExtension>();
    extensions.forEach((extension: PrimeExtension) => {
        extension.invocationType === invocationType && extensionMap.set(extension.id, extension);
    });


    const filteredOverrideExtensions = overrideExtensions.filter((extension: PrimeExtensionOverride) => extensionMap.get(extension.id));
    // This case will handle if nothing is overridden in author settings for LO.
    if (filteredOverrideExtensions.length === 0) {
        return getExtensionWithinvocationType(extensions, invocationType, scope);
    }

    const enabledExtensions = filteredOverrideExtensions.find((extension: PrimeExtensionOverride) => extension.enabled === 'true');

    //LO override extenstion not present with scope as true, return nothing
    if (!enabledExtensions) {
        return;
    }
    return extensions.find((extension: PrimeExtension) => (enabledExtensions.id === extension.id && extension.invocationType === invocationType));
}

export function getExtensionWithId(
    extensions: PrimeExtension[] = [],
    extensionId: string
) {
    if (extensions && extensions.length === 0) {
        return;
    }
    return extensions.find((extension: any) => {
        return extension.invocationType === extensionId;
    });
}

export function isExtensionAllowedForLO(
    lo: PrimeLearningObject,
    loInstance: PrimeLearningObjectInstance
): boolean {
    if (
        (lo.loType === COURSE && lo.enrollmentType !== SELF_ENROLL)
        || (lo.loType === CERTIFICATION && loInstance?.validity)
        || lo.loType === LEARNING_PROGRAM && lo.enrollmentType !== SELF_ENROLL) {
        return false;
    }

    return true;
}
