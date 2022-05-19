import { PrimeLearningObjectInstanceEnrollment } from "../models";
import { PENDING_ACCEPTANCE, PENDING_APPROVAL } from "./constants";

export function checkIsEnrolled(enrollment: PrimeLearningObjectInstanceEnrollment): boolean {
    return enrollment &&
        enrollment?.state !== PENDING_APPROVAL &&
        enrollment?.state !== PENDING_ACCEPTANCE;
}