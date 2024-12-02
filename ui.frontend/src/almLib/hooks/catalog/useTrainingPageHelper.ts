import { PrimeLearningObject } from "../../models";
import { COURSE } from "../../utils/constants";

export function findPrimaryEnrolledInstance(
  training: PrimeLearningObject,
  childCourseId: string
): string | undefined {
  if (!training.subLOs) {
    return "";
  }

  for (const subLo of training.subLOs) {
    const isCourse = subLo.loType === COURSE;
    if (isCourse && subLo.id === childCourseId) {
      return subLo.enrollment.loInstance.id;
    } else if (!isCourse) {
      const instanceId = findPrimaryEnrolledInstance(subLo, childCourseId);
      if (instanceId) {
        return instanceId;
      }
    }
  }

  return "";
}
