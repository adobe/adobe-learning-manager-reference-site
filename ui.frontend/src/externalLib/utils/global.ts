export function getWindowObject() {
    return (window as any);
}

export function getALMObject() {
    return getWindowObject().alm;
}


export function setALMKeyValue(key: string, value: any) {
    if (!getWindowObject().alm) { initGLobalALMObject() }
    getWindowObject().alm[key] = value
}


export function getALMKeyValue(key: string) {
    return getWindowObject().alm[key];
}

function redirectToTrainingOverview(trainingId: string, trainingInstanceId: string) {
    let { pagePaths } = getALMKeyValue("config");
    getWindowObject().location = `${pagePaths.trainingOverview}/trainingId=${trainingId}&trainingInstanceId=${trainingInstanceId}`
}

function redirectToInstancePage(trainingId: string) {
    let { pagePaths } = getALMKeyValue("config");
    getWindowObject().location = `${pagePaths.instance}/trainingId=${trainingId}`
}
function initGLobalALMObject() {
    getWindowObject().alm = {
        config: {},
        catalogAttributes: {},
        redirectToTrainingOverview,
        redirectToInstancePage
    };
}
