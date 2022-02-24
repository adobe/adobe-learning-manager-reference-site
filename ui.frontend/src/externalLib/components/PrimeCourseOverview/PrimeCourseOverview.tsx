import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from "../../models/PrimeModels";
import styles from "./PrimeCourseOverview.module.css";

import { Item, TabList, TabPanels, Tabs } from "@react-spectrum/tabs";
import { Certificate } from "crypto";

const COURSE = "course";

const PrimeCourseOverview = (props: any) => {
  const {
    name,
    description,
    overview,
    richTextOverview,
    skills,
    training,
    trainingInstance,
    instanceBadge,
  } = props;

  const filterLoReources = (loResourceType: string) => {
    return trainingInstance.loResources.filter(
      (loResource: PrimeLearningObjectResource) =>
        loResource.loResourceType == loResourceType
    );
  };

  const moduleReources = filterLoReources("Content");
  const testOutResources = filterLoReources("Test Out");

  return (
    <>
      {/* <div style={{ display: "flex" }}>
          {instanceBadge.badgeName},
     </div> */}
      {/* <div>
         Enrollment :
         {training.enrollment ? training.enrollment.id : "NOT_enrolled"}
     </div> */}
      {/* <div>Authors: {training.authorNames.join(",")}</div>
     <div>Skills : {skills.map((skill: { name: any; }) => skill.name).join(",")}</div> */}

      <Tabs aria-label="Module list">
        <TabList id="tabList" UNSAFE_className={styles.tablist}>
          <Item key="Modules">Modules</Item>
          <Item key="Testout">Testout</Item>
        </TabList>
        <TabPanels>
          <Item key="Modules">
            <div className={styles.overviewcontainer}>
              <header role="heading" className={styles.header}>
                <div className={styles.loResourceType}>Core Content</div>
                <div>{convertSecondsToTimeText(training.duration)}</div>
              </header>
            </div>
            <PrimeModuleList loResources={moduleReources}></PrimeModuleList>
          </Item>
          <Item key="Testout">
            <PrimeModuleList loResources={testOutResources}></PrimeModuleList>
          </Item>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default PrimeCourseOverview;
