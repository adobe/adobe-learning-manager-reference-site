/***
 *
 * Please Do not use this Component.
 */

import styles from "./BadgeElement.module.css";
import { GetFormattedDate } from "../../../utils/dateTime";
import { useIntl } from "react-intl";
import { getALMObject } from "../../../utils/global";
import { Checkbox } from "@adobe/react-spectrum";
import { useState } from "react";

const BadgeElement = (props: any) => {
  const { locale, formatMessage } = useIntl();
  const {
    id,
    loDetails,
    badge,
    dateAchieved,
    badgeAquiredForType,
    badgeTypeName,
    num,
    setNum,
    handleDownloadPdfClick,
    handleDownloadImgClick,
  } = props;
  const status = dateAchieved ? true : false;
  const formattedDate = dateAchieved && GetFormattedDate(dateAchieved, locale);
  const [selected, setSelected] = useState(false);

  const BadgeTypeName = (
    <a
      className={styles.inline}
      tabIndex={0}
      onClick={() => getALMObject().navigateToTrainingOverviewPage(loDetails)}
      aria-label={
        status
          ? badgeTypeName
          : formatMessage(
              { id: "alm.badge.type.notCompleted.label" },
              { badgeTypeName }
            )
      }
    >
      {badgeTypeName}
    </a>
  );

  const handleSelect = () => {
    setSelected(!selected);
    if (selected) {
      setNum(num - 1);
    } else {
      setNum(num + 1);
    }
  };

  return (
    <div className={styles.itemview}>
      <div className={styles.badgebox}>
        <Checkbox
          UNSAFE_className={styles.checkbox}
          isDisabled={!status}
          excludeFromTabOrder={!status}
          aria-label={formatMessage(
            { id: "alm.badge.checkbox" },
            { badgeName: badge.name }
          )}
          aria-hidden={status ? false : true}
          isSelected={selected}
          onChange={handleSelect}
        />
        <div className={styles.imagecontainer}>
          <img className={styles.image} src={badge.imageUrl} alt="" />
        </div>
        <div className={styles.containertext}>
          <div className={styles.badgename}>{badge.name}</div>
          <div className={styles.badgestatus}>
            {formatMessage({ id: "alm.badge.status" })}
            {status ? (
              <span className={styles.achieved}>
                {formatMessage({ id: "alm.badge.status.achieved" })}
              </span>
            ) : (
              <span className={styles.inprogress}>
                {formatMessage({ id: "alm.badge.status.inProgress" })}
              </span>
            )}
          </div>
          <div className={styles.para}>
            {status
              ? formatMessage(
                  { id: "alm.badge.type.completed" },
                  {
                    badgeAquiredForType,
                    badgeTypeName: BadgeTypeName,
                    formattedDate,
                  }
                )
              : formatMessage(
                  { id: "alm.badge.type.notCompleted" },
                  {
                    badgeAquiredForType,
                    badgeTypeName: BadgeTypeName,
                  }
                )}
          </div>
        </div>
        <div
          className={
            status ? styles.downloadicons : styles.downloadiconsdisabled
          }
        >
          <div className={styles.downloadoptions}>
            <div className={styles.downloadlink}>
              <a
                className={styles.blue}
                tabIndex={status ? 0 : -1}
                onClick={status ? () => handleDownloadPdfClick(id) : undefined}
                aria-label={formatMessage(
                  { id: "alm.badge.downloadPdf" },
                  { badgeName: badge.name }
                )}
                aria-hidden={status ? false : true}
              >
                {formatMessage({ id: "alm.text.pdf" })}
              </a>
            </div>
            <span>| </span>
            <a
              className={styles.margin}
              tabIndex={status ? 0 : -1}
              onClick={
                status
                  ? () => handleDownloadImgClick(badge.imageUrl)
                  : undefined
              }
              aria-label={formatMessage(
                { id: "alm.badge.downloadImg" },
                { badgeName: badge.name }
              )}
              aria-hidden={status ? false : true}
            >
              {formatMessage({ id: "alm.text.badge" })}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeElement;
