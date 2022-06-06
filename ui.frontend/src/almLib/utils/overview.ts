import { PrimeLearningObjectInstanceEnrollment } from "../models";
import { PENDING_ACCEPTANCE, PENDING_APPROVAL, WAITING } from "./constants";
import { getALMObject, updateURLParams } from "./global";

export function checkIsEnrolled(
  enrollment: PrimeLearningObjectInstanceEnrollment
): boolean {
  return (
    enrollment &&
    enrollment?.state !== PENDING_APPROVAL &&
    enrollment?.state !== PENDING_ACCEPTANCE &&
    enrollment?.state !== WAITING
  );
}

export const storeActionInNonLoggedMode = (actionType: string) => {
  if (!getALMObject().isPrimeUserLoggedIn()) {
    updateURLParams({ action: actionType });
  }
};
