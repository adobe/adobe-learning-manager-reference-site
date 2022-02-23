/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from "react";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import { useInstancePage } from "../../hooks/instance/useInstancePage";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { SORT_ORDER_SVG } from "../../utils/inline_svg";
import { getResourceBasedOnLocale } from "../../utils/instance";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { useIntl } from "react-intl";
import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { Provider, lightTheme } from "@adobe/react-spectrum";
import { PrimeInstanceItem } from "../PrimeInstanceItem";

import styles from "./PrimeInstancePage.module.css";

const PrimeInstancePage = (props: any) => {
  //To Do: needs to get form URL
  const trainingId = "course:5813667";
  const { formatMessage } = useIntl();
  const [list, setList] = useState([] as any[]);
  const [isAscendingOrder, setIsAscendingOrder] = useState(true);
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

  useEffect(() => {
    if (activeInstances && activeInstances.length) {
      let list: any = [];
      activeInstances.forEach((instance) => {
        let item: any = {};
        item.id = instance.id;
        item.name = getPreferredLocalizedMetadata(
          instance.localizedMetadata,
          locale
        )?.name;
        item.format = training.loFormat;

        let [location, instructorsName] = getInstanceLocationAndInstructorsName(
          instance.loResources,
          locale
        );
        item.location = location;
        item.instructorsName = instructorsName;
        item.date = getStartDateforInstance(instance.loResources, locale);
        list.push(item);
      });
      setList(list);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, training.loFormat]);

  const applySort = (sortParam: string) => {
    const sortedList = sortList(list, sortParam, isAscendingOrder);
    setList(sortedList as any[]);
    setIsAscendingOrder((prevState) => !prevState);
  };

  if (isLoading) {
    return <span>Getting data. Please wait...</span>;
  }

  const headerLabel = formatMessage(
    {
      id: "prime.instance.header.label",
    },
    {
      0: name,
    }
  );

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
        bannerUrl={bannerUrl}
      />
      <section className={styles.pageContainer}>
        <h2 className={styles.courseInfoHeader}>{headerLabel}</h2>
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
                  {formatMessage({
                    id: "prime.instance.name",
                    defaultMessage: "Instance Name",
                  })}
                  <span
                    onClick={() => applySort("name")}
                    className={styles.sortIcon}
                  >
                    {SORT_ORDER_SVG()}
                  </span>
                </div>
                <div className={`${styles.dateDiv} ${styles.commonHeader} `}>
                  {formatMessage({
                    id: "prime.instance.start.date",
                    defaultMessage: "Start Date",
                  })}

                  <span
                    onClick={() => applySort("date")}
                    className={styles.sortIcon}
                  >
                    {SORT_ORDER_SVG()}
                  </span>
                </div>
                <div className={`${styles.locationDiv} ${styles.commonHeader}`}>
                  {formatMessage({
                    id: "prime.instance.location",
                    defaultMessage: "Location",
                  })}

                  <span
                    onClick={() => applySort("location")}
                    className={styles.sortIcon}
                  >
                    {SORT_ORDER_SVG()}
                  </span>
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
                  date={item.date}
                  location={item.location}
                  instructorsName={item.instructorsName}
                  id={item.id}
                  selectInstanceHandler={selectInstanceHandler}
                  locale={locale}
                />
              ))}
            </ul>
          </>
        )}
      </section>
    </Provider>
  );
};
export default PrimeInstancePage;

const getStartDateforInstance = (
  loResources: PrimeLearningObjectResource[],
  locale: string
): Date => {
  let dateArray: any[] = [];
  loResources.forEach((loResource) => {
    const resource = getResourceBasedOnLocale(loResource, locale);
    if (resource.dateStart) dateArray.push(new Date(resource.dateStart));
  });
  return dateArray.sort((a, b) => a - b)[0];
};

const getInstanceLocationAndInstructorsName = (
  loResources: PrimeLearningObjectResource[],
  locale: string
): string[] => {
  let location: string[] = [];
  let instructorNames: string[] = [];
  loResources.forEach((loResource) => {
    const resource = getResourceBasedOnLocale(loResource, locale);

    if (resource.location) location.push(resource.location);
    if (resource.instructorNames?.length)
      instructorNames.push(resource.instructorNames.join(", "));
  });
  return [location.join(", "), instructorNames.join(", ")];
};

const sortList = (list: any[], sortParam: string, sortOrder: any) => {
  let listCopy = [...list];
  if (sortParam === "name" || sortParam === "location") {
    return sortOrder
      ? listCopy.sort((a: any, b: any) =>
          b[sortParam].localeCompare(a[sortParam])
        )
      : listCopy.sort((a: any, b: any) =>
          a[sortParam].localeCompare(b[sortParam])
        );
  }

  if (sortParam === "date") {
    return sortOrder
      ? listCopy.sort((a: any, b: any) => a.date - b.date)
      : listCopy.sort((a: any, b: any) => b.date - a.date);
  }
};
