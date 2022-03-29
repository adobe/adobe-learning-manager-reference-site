import React from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from "../../../models/PrimeModels";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResources: PrimeLearningObjectResource[];
  isPartOfLP?: boolean;
  isContent?: boolean;
}> = (props) => {
  const {
    loResources,
    launchPlayerHandler,
    training,
    trainingInstance,
    isPartOfLP,
    isContent,
  } = props;

  // chkIfPriorModulesAreStarted() {
  //   var z = this.get("course.moduleIndexOfFirstContentModule");
  //   const courseId = this.get("model.courseId");
  //   var course = this.get("store").peekRecord("course", courseId);
  //   var modulesArray = course.get("courseModule").slice();
  //   var currModuleOrderInCourse = this.get("module.moduleOrderInCourse");
  //   if (modulesArray) {
  //       for (var x = z; x < modulesArray.length; x++){
  //           if (modulesArray[x].get("moduleOrderInCourse") < currModuleOrderInCourse)
  //               return false;
  //       }
  //   }
  //   return true;
  // },
  // isLocked : Ember.computed("course.moduleIndexOfFirstContentModule","course.sequential","model.modulesDataArray","module.moduleOrderInCourse", function(){
  //   var course = this.get("course.model");
  //   var sequenceEnforced = course.get("sequential");
  //   if (sequenceEnforced == "true" && !this.chkIfPriorModulesAreStarted())
  //      return true;
  //   return false;
  // }),

  return (
    <ul
      className={`${styles.moduleListContainer} ${
        isPartOfLP ? styles.isPartOfLP : ""
      }`}
    >
      {loResources.map((loResource, index) => (
        <PrimeModuleItem
          loResource={loResource}
          key={loResource.id}
          launchPlayerHandler={launchPlayerHandler}
          training={training}
          trainingInstance={trainingInstance}
          isPartOfLP={isPartOfLP}
          isContent={isContent}
        ></PrimeModuleItem>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
