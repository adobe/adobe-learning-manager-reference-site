import { Item, TabList, TabPanels, Tabs } from "@react-spectrum/tabs";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../utils/dateTime";
import { PrimeModuleList } from "../PrimeModuleList";
import styles from "./PrimeCourseOverview.module.css";

const PrimeCourseOverview = (props: any) => {
  const {
    training,
    trainingInstance,
    showDuration = true,
    showNotes = true,
    launchPlayerHandler,
  } = props;

  const filterLoReources = (
    loResourceType: string
  ): PrimeLearningObjectResource[] => {
    return trainingInstance.loResources.filter(
      (loResource: PrimeLearningObjectResource) =>
        loResource.loResourceType === loResourceType
    );
  };

  const moduleReources = filterLoReources("Content");
  const testOutResources = filterLoReources("Test Out");
  const showTestout = testOutResources.length !== 0;
  const showTabs = showTestout || showNotes;
  const classNames = `${styles.tablist} ${showTabs ? "" : styles.hide}`;
  return (
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
              <header role="heading" className={styles.header} aria-level={2}>
                <div className={styles.loResourceType}>Core Content</div>
                <div>{convertSecondsToTimeText(training.duration)}</div>
              </header>
            </div>
          )}
          <PrimeModuleList
            launchPlayerHandler={launchPlayerHandler}
            loResources={moduleReources}
            trainingId={training.id}
          ></PrimeModuleList>
        </Item>
        {showTestout && (
          <Item key="Testout">
            <PrimeModuleList
              launchPlayerHandler={launchPlayerHandler}
              loResources={testOutResources}
              trainingId={training.id}
            ></PrimeModuleList>
          </Item>
        )}
        {showNotes && <Item key="Notes">You have no notes.</Item>}
      </TabPanels>
    </Tabs>
  );
};

export default PrimeCourseOverview;
