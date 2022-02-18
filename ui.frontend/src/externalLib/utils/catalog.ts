import { PrimeLearningObject } from "../models/PrimeModels";

export function shouldRedirectToInstanceScreen(
    training: PrimeLearningObject
): boolean {
    //only 1 instance / if only 1 active instance / Or user is already enrolled
    if (
        (training.instances &&
            (training.instances.length === 1 ||
                training.instances?.filter((i) => i && i.state === "Active").length === 1)) ||
        training.enrollment
    ) {
        return false;
    }
    return true;
}


export function isJobaid(training: PrimeLearningObject): boolean {
    return training.loType.toLowerCase() === "jobaid" ? true : false;
}

export function isJobaidContentTypeUrl(training: PrimeLearningObject): boolean {
    const trainingInstance = training.instances[0];
    const contentType = trainingInstance.loResources[0]?.resources[0]?.contentType
    return contentType === "OTHER" ? true : false;

}

export function getJobaidUrl(training: PrimeLearningObject): string {
    //TO-DO : Check with Yogesh on this logic
    return training.instances[0]?.loResources[0]?.resources[0]?.location;
}



export function locationUpdate(params: any) {
    const location = (window as any).location;
    const existingQueryParams = new URLSearchParams(decodeURI(location.search));
    for (let key in params) {
        if (params[key]) {
            existingQueryParams.set(key, params[key]);
        }
        else {
            existingQueryParams.delete(key)
        }

    }
    const newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        encodeURI(existingQueryParams.toString()) +
        window.location.hash;
    window.history.replaceState({ path: newurl }, "", newurl);
}


export function getQueryParamsIObjectFromUrl() {
    const location = (window as any).location;
    const params: URLSearchParams = new URLSearchParams(decodeURI(location.search));
    return Object.fromEntries(params.entries());
}

export function debounce(fn: Function, time = 250) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), time);
    };
};