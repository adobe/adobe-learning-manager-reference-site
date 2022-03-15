/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button } from "@adobe/react-spectrum";
import Calendar from "@spectrum-icons/workflow/Calendar";
import Location from "@spectrum-icons/workflow/Location";
import User from "@spectrum-icons/workflow/User";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { GetFormattedDate } from "../../../utils/dateTime";
import { GetTranslation } from "../../../utils/translationService";
import { formatMap } from "../../Catalog/PrimeTrainingCard/PrimeTrainingCard";
import styles from "./PrimeInstanceItem.module.css";

const PrimeInstanceItem = (props: any) => {
  const {
    id,
    name,
    format,
    date,
    location,
    instructorsName,
    selectInstanceHandler,
    locale,
  } = props;
  const { formatMessage } = useIntl();

  const selectHandler = () => {
    selectInstanceHandler(id);
  };
  const dateValue = GetFormattedDate(date, locale);
  const fomatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);

  return (
    <li className={styles.instanceListItem}>
      <div className={styles.instanceNameWrapper}>
        <a className={styles.instanceName} onClick={selectHandler} href={"#"}>
          {name}
        </a>
        <p className={styles.instanceLoFormat}>{fomatLabel}</p>
        {instructorsName && (
          <p className={styles.instructorsName}>
            <span className={styles.aboveMobile}>
              {formatMessage({
                id: "prime.instance.instructors",
                defaultMessage: "Instructors",
              })}
              {" : "}
            </span>
            <span
              className={`${styles.mobileOnly} ${styles.icon}`}
              aria-hidden="true"
            >
              <User />
            </span>
            {instructorsName}
          </p>
        )}
      </div>
      <div className={styles.dateWrapper}>
        {dateValue && (
          <p className={styles.startDate}>
            <span
              className={`${styles.mobileOnly} ${styles.icon}`}
              aria-hidden="true"
            >
              <Calendar />
            </span>
            {dateValue}
          </p>
        )}
      </div>

      <div className={styles.locationWrapper}>
        {location && (
          <p className={styles.startDate}>
            <span
              className={`${styles.mobileOnly} ${styles.icon}`}
              aria-hidden="true"
            >
              <Location />
            </span>
            {location}
          </p>
        )}
      </div>
      <div className={styles.actionWrapper}>
        <Button
          variant="primary"
          onPress={selectHandler}
          UNSAFE_className={styles.button}
        >
          {formatMessage({
            id: "prime.instance.see.details",
            defaultMessage: "See details",
          })}
        </Button>
      </div>
    </li>
  );
};

export default PrimeInstanceItem;
