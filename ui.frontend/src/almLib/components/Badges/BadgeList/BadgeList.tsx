/***
 *
 * Please Do not use this Component.
 */
import styles from "./BadgeList.module.css";
import { BadgeElement } from "../BadgeElement";
import { useIntl } from "react-intl";
import { SKILL_LEVEL } from "../../../utils/constants";
import { Badgr } from "../Badgr";
import { useState } from "react";

const BadgeList = (props: any) => {
  const { badges, handleDownloadPdfClick, handleDownloadImgClick } = props;
  const { formatMessage } = useIntl();
  const [downloadNum, setDownloadNum] = useState(0);

  return (
    <>
      <div className={styles.rightaligned}>
        <Badgr />
        <div className={styles.downloadicons}>
          {!downloadNum
            ? formatMessage({ id: "alm.text.downloadAll" })
            : formatMessage({ id: "alm.text.download" })}
          :
          <div className={styles.downloadoptions}>
            <div className={styles.downloadlink}>
              <a
                className={styles.pdf}
                tabIndex={0}
                aria-label={
                  downloadNum
                    ? formatMessage(
                        { id: "alm.badge.downloadNumPdf" },
                        { downloadNum }
                      )
                    : formatMessage({ id: "alm.badge.downloadAllPdf" })
                }
              >
                {downloadNum
                  ? formatMessage(
                      { id: "alm.text.pdfNum" },
                      { num: downloadNum }
                    )
                  : formatMessage({ id: "alm.text.pdf" })}
              </a>
            </div>
            <div className={styles.downloadlink}>
              <span>| </span>
              <a
                className={styles.alignRight}
                tabIndex={0}
                aria-label={
                  downloadNum
                    ? formatMessage(
                        { id: "alm.badge.downloadNumImg" },
                        { downloadNum }
                      )
                    : formatMessage({ id: "alm.badge.downloadAllImg" })
                }
              >
                {downloadNum
                  ? formatMessage(
                      { id: "alm.text.badgeNum" },
                      { num: downloadNum }
                    )
                  : formatMessage({ id: "alm.text.badge" })}
              </a>
            </div>
            {downloadNum > 0 && (
              <a
                className={styles.alignRight}
                tabIndex={0}
                aria-label={formatMessage({ id: "alm.badge.update" })}
              >
                {formatMessage({ id: "alm.text.update" })}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className={styles.badgelist}>
        <ul className={styles.list}>
          {badges?.map((el: any) => (
            <BadgeElement
              key={el.id}
              id={el.id}
              loDetails={el.model.id}
              badge={el.badge}
              dateAchieved={el.dateAchieved}
              badgeAquiredForType={
                el.model.loType
                  ? formatMessage({ id: `alm.text.${el.model.loType}` })
                  : formatMessage({ id: "alm.text.skill" })
              }
              badgeTypeName={
                el.model.type === SKILL_LEVEL
                  ? el.model.skill.name
                  : el.model.localizedMetadata[0].name
              }
              num={downloadNum}
              setNum={setDownloadNum}
              handleDownloadPdfClick={handleDownloadPdfClick}
              handleDownloadImgClick={handleDownloadImgClick}
            />
          ))}
          <div className={styles.new}></div>
        </ul>
      </div>
    </>
  );
};

export default BadgeList;
