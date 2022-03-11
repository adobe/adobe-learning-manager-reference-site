import { Item, TabList, TabPanels, Tabs } from "@react-spectrum/tabs";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import { filterLoReourcesBasedOnResourceType } from "../../../utils/hooks";
import { PrimeModuleList } from "../PrimeModuleList";
import styles from "./PrimeCourseOverview.module.css";

const PrimeCourseOverview: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  showDuration?: boolean;
  showNotes?: boolean;
}> = (props: any) => {
  const {
    training,
    trainingInstance,
    showDuration = true,
    showNotes = true,
    launchPlayerHandler,
    isPartOfLP = false,
  } = props;

  const moduleReources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Content"
  );
  const testOutResources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Test Out"
  );
  const showTestout = testOutResources.length !== 0;
  const showTabs = showTestout || showNotes;
  const classNames = `${styles.tablist} ${showTabs ? "" : styles.hide}`;

  return (
    <Tabs
      aria-label="Module list"
      UNSAFE_className={isPartOfLP ? styles.isPartOfLP : ""}
    >
      <TabList id="tabList" UNSAFE_className={classNames}>
        <Item key="Modules">Modules</Item>
        {showTestout && <Item key="Testout">Testout</Item>}
        {showNotes && <Item key="Notes">Notes</Item>}
      </TabList>
      <TabPanels UNSAFE_className={styles.tabPanels}>
        <Item key="Modules">
          {showDuration && (
            <div className={styles.overviewcontainer}>
              <header role="heading" className={styles.header} aria-level={2}>
                <div className={styles.loResourceType}>Core Content</div>
                <div className={styles.time}>
                  {convertSecondsToTimeText(training.duration)}
                </div>
              </header>
            </div>
          )}
          <PrimeModuleList
            launchPlayerHandler={launchPlayerHandler}
            loResources={moduleReources}
            trainingId={training.id}
            isPartOfLP={isPartOfLP}
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
