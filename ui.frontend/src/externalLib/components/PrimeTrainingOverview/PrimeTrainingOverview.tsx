import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeLearningObject } from "../../models/PrimeModels";
import styles from "./PrimeTrainingOverview.module.css";

import { Item, TabList, TabPanels, Tabs } from "@react-spectrum/tabs";

const PrimeTrainingPage = (props: any) => {
  const {
    description,
    overview,
    richTextOverview,
    skills,
    training,
    trainingInstance,
    instanceBadge,
  } = props;

  const moduleReources = trainingInstance.loResources.filter(
    (loResource: any) => loResource.loResourceType == "Content"
  );
  const testOutResources = trainingInstance.loResources.filter(
    (loResource: any) => loResource.loResourceType == "Test Out"
  );

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


     
        <Tabs aria-label="Chat log quiet example">
          <TabList id="tabList" UNSAFE_className={styles.custom}>
            <Item key="Modules">Modules</Item>
            <Item key="Testout">Testout</Item>
          </TabList>
          <TabPanels>
            <Item key="Modules">
              <div role="tabpanel" className={styles.overviewcontainer}>
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

export default PrimeTrainingPage;
