import {
  PrimeLearningObject,
  PrimeLearningObjectInstanceEnrollment,
} from "../models";
import {
  COMPLETED,
  PENDING_ACCEPTANCE,
  PENDING_APPROVAL,
  WAITING,
} from "./constants";
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

export const arePrerequisiteEnforcedAndCompleted = (
  training: PrimeLearningObject
) => {
  if (
    training.prerequisiteLOs &&
    training.isPrerequisiteEnforced &&
    training.prerequisiteLOs.some(
      (l) => !l.enrollment || l.enrollment.state !== COMPLETED
    )
  ) {
    // prerequisite enforced and not completed
    return false;
  }
  return true;
};
