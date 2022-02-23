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
  return (
    <li className={styles.instanceListItem}>
      <div className={styles.instanceNameDiv}>
        <a className={styles.instanceName} onClick={selectHandler} tabIndex={0}>
          {name}
        </a>
        <p className={styles.instanceLoFormat}>{format}</p>
        <p className={styles.instructorsName}>
          {formatMessage({
            id: "prime.instance.instructors",
            defaultMessage: "Instructors",
          })}
          : {instructorsName}
        </p>
      </div>
      <div className={styles.dateDiv}>
        <p className={styles.startDate}>{dateBasedOnLocale(date, locale)}</p>
      </div>

      <div className={styles.locationDiv}>
        <p className={styles.startDate}>{location}</p>
      </div>
      <div className={styles.actionDiv}>
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
