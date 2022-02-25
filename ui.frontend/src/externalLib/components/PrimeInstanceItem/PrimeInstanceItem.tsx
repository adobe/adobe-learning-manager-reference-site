/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { dateBasedOnLocale } from "../../utils/dateTime";
import { useIntl } from "react-intl";

import { Button } from "@adobe/react-spectrum";
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
  const dateValue = dateBasedOnLocale(date, locale);

  return (
    <li className={styles.instanceListItem}>
      <div className={styles.instanceNameWrapper}>
        <a className={styles.instanceName} onClick={selectHandler} href={"#"}>
          {name}
        </a>
        <p className={styles.instanceLoFormat}>{format}</p>
        {instructorsName && (
          <p className={styles.instructorsName}>
            {formatMessage({
              id: "prime.instance.instructors",
              defaultMessage: "Instructors",
            })}
            : {instructorsName}
          </p>
        )}
      </div>
      <div className={styles.dateWrapper}>
        {dateValue && <p className={styles.startDate}>{dateValue}</p>}
      </div>

      <div className={styles.locationWrapper}>
        {location && <p className={styles.startDate}>{location}</p>}
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
