import { PrimeLearningObject } from "../models/PrimeModels";

const DEFAULT_LOCALE = "en-US";

export function getPreferredLocalizedMetadata<T>(localizedMetadata: T[], locale: string): T {

    if (!localizedMetadata) {
        //TO DO: need to hanlde this 
        return {} as T
    }
    let data = localizedMetadata.find(
        (item: any) => item.locale === locale
    );

    return (
        data ||
        localizedMetadata.find(
            (item: any) => item.locale === DEFAULT_LOCALE
        )! ||
        localizedMetadata[0]
    );
}



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