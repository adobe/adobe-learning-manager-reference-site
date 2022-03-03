import { Item, TabList, TabPanels, Tabs } from "@react-spectrum/tabs";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeModuleList } from "../PrimeModuleList";
import styles from "./PrimeCourseOverview.module.css";

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
    showDuration = true,
    showNotes = true,
  } = props;

  const filterLoReources = (
    loResourceType: string
  ): PrimeLearningObjectResource[] => {
    return trainingInstance.loResources.filter(
      (loResource: PrimeLearningObjectResource) =>
        loResource.loResourceType == loResourceType
    );
  };

  const moduleReources = filterLoReources("Content");
  const testOutResources = filterLoReources("Test Out");
  const showTestout = testOutResources.length != 0;
  const showTabs = showTestout || showNotes;
  const classNames = `${styles.tablist} ${showTabs ? "" : styles.hide}`;
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
        <TabList id="tabList" UNSAFE_className={classNames}>
          <Item key="Modules">Modules</Item>
          {showTestout && <Item key="Testout">Testout</Item>}
          {showNotes && <Item key="Notes">Notes</Item>}
        </TabList>
        <TabPanels>
          <Item key="Modules">
            {showDuration && (
              <div className={styles.overviewcontainer}>
                <header role="heading" className={styles.header}>
                  <div className={styles.loResourceType}>Core Content</div>
                  <div>{convertSecondsToTimeText(training.duration)}</div>
                </header>
              </div>
            )}
            <PrimeModuleList loResources={moduleReources}></PrimeModuleList>
          </Item>
          {showTestout && (
            <Item key="Testout">
              <PrimeModuleList loResources={testOutResources}></PrimeModuleList>
            </Item>
          )}
          {showNotes && <Item key="Notes">You have no notes.</Item>}
        </TabPanels>
      </Tabs>

      {/* <PrimeModuleList loResources={moduleReources}></PrimeModuleList>  */}
    </>
  );
};

export default PrimeCourseOverview;
