import { PrimeLearningObjectInstance, PrimeLearningObjectResource, PrimeResource } from "../models/PrimeModels";

export const checkIfEnrollmentDeadlineNotPassed = (
    instance: PrimeLearningObjectInstance
) => {
    const enrollmentDeadlineStr = instance.enrollmentDeadline;
    return enrollmentDeadlineStr &&
        new Date(enrollmentDeadlineStr) < new Date()
        ? false
        : true;
};

export const getInstanceLocation = (loResources: PrimeLearningObjectResource[], locale: string): string[] => {
    let location: string[] = [];
    let instructorNames: string[] = [];
    loResources.forEach((loResource) => {
        const resource = getResourceBasedOnLocale(loResource, locale)

        if (resource.location) location.push(resource.location);
        if (resource.instructorNames?.length) instructorNames.push(resource.instructorNames.join(", "))
    })
    debugger;
    return [location.join(", "), instructorNames.join(", ")];
}


export const getResourceBasedOnLocale = (loResource: PrimeLearningObjectResource, locale: string): PrimeResource => {
    return loResource.resources.filter((item) => item.locale === locale)[0] ||
        loResource.resources.filter((item) => item.locale === "en-US")[0] ||
        loResource.resources[0]
}