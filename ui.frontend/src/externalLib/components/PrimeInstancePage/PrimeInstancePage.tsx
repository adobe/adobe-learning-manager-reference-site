/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMemo } from "react";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import { useInstancePage } from "../../hooks/instance/useInstancePage";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import styles from "./PrimeInstancePage.module.css";
import { getInstanceLocation } from "../../utils/instance";

const PrimeInstancePage = (props: any) => {
  //To Do: needs to get form URL
  // const [list, setList] = useState([]);
  const trainingId = "course:5813667";
  const { locale } = useConfigContext();
  const {
    isLoading,
    training,
    name,
    color,
    bannerUrl,
    cardBgStyle,
    activeInstances,
    selectInstanceHandler,
  } = useInstancePage(trainingId);

  const list = useMemo(() => {
    if (!activeInstances || !activeInstances.length) return [];
    let list: any = [];
    for (let instance of activeInstances) {
      let item: any = {};
      item.id = instance.id;
      item.name = getPreferredLocalizedMetadata(
        instance.localizedMetadata,
        locale
      )?.name;
      item.format = training.loFormat;

      let [location, instructorsName] = getInstanceLocation(
        instance.loResources,
        locale
      );
      item.location = location;
      item.instructorsName = instructorsName;

      list.push(item);
    }

    return list;
  }, [activeInstances, locale, training.loFormat]);

  if (isLoading) {
    return <span>Getting data. Please wait...</span>;
  }

  return (
    <>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
        bannerUrl={bannerUrl}
      />
      <section className={styles.pageContainer}>
        <h2 className={styles.courseInfoHeader}>
          The Course <span>{name}</span>, has the following Course variations.
          Select one to see further details.
        </h2>
        <div className={styles.courseDetailsContainer}>
          <div className={styles.card} style={{ ...cardBgStyle }}>
            <div className={styles.band}></div>
          </div>
          <div className={styles.courseDetials}>
            <h3 className={styles.title}>{name}</h3>
            <p className={styles.type}>{training?.type}</p>
          </div>
        </div>

        {list!?.length > 0 && (
          <>
            <div className={styles.instancesContainer}>
              <div className={styles.instancesHeaderSection}>
                <div
                  className={`${styles.instanceNameDiv} ${styles.commonHeader}`}
                >
                  Instance Name
                </div>
                <div className={`${styles.dateDiv} ${styles.commonHeader}`}>
                  Start Date
                </div>
                <div className={`${styles.location} ${styles.commonHeader}`}>
                  Location
                </div>
                <div
                  className={`${styles.action} ${styles.commonHeader}`}
                ></div>
              </div>
            </div>
            <ul className={styles.instanceList}>
              {list!.map((item: any) => (
                <PrimeInstanceItem
                  key={item.id}
                  name={item.name}
                  format={item.format}
                  date={"date"}
                  location={item.location}
                  instructorsName={item.instructorsName}
                  id={list.id}
                  selectInstanceHandler={selectInstanceHandler}
                />
              ))}
            </ul>
          </>
        )}
      </section>
      {/* <img style={{ ...cardBgStyle }} alt="" /> */}
    </>
  );
};
export default PrimeInstancePage;

// one for location
// one for earliest date

const PrimeInstanceItem = (props: any) => {
  const {
    id,
    name,
    format,
    date,
    location,
    instructorsName,
    selectInstanceHandler,
  } = props;
  const selectHandler = () => {
    selectInstanceHandler(id);
  };
  return (
    <li className={styles.instanceListItem}>
      <div className={styles.instanceNameDiv}>
        <a className={styles.instanceName} onClick={selectHandler} tabIndex={0}>
          {name}
        </a>
        <p className={styles.instanceLoFormat}>{format}</p>
        <p style={{ margin: 0 }}>instructors: {instructorsName}</p>
      </div>
      <div className={styles.dateDiv}>
        <p className={styles.startDate}>{date}</p>
      </div>

      <div className={styles.locationDiv}>
        <p className={styles.startDate}>{location}</p>
      </div>
      <div className={styles.actionDiv}>
        <button className={styles.button} onClick={selectHandler}>
          See details
        </button>
      </div>
    </li>
  );
};
