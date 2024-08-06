import React, { useEffect, useState } from "react";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import styles from "./PrimeTrainingRelatedLO.module.css";
import { GetTranslation } from "../../../utils/translationService";
import { BOOKMARK_ICON, BOOKMARKED_ICON } from "../../../utils/inline_svg";
import { Skill } from "../../../models";
import { getALMObject } from "../../../utils/global";
import { GetTileImageFromId, GetTileColor } from "../../../utils/themes";
import { clearBreadcrumbPathDetails } from "../../../utils/hooks";

const PrimeTrainingRelatedLO: React.FC<{
  relatedLO: PrimeLearningObject;
  skills: Skill[];
  updateBookMark: (isBookmarked: boolean, loId: string) => Promise<void | undefined>;
}> = props => {
  const { relatedLO, skills, updateBookMark } = props;
  const [isBookMarked, setIsBookMarked] = useState(relatedLO.isBookmarked);
  const toggle = () => {
    setIsBookMarked(prevState => !prevState);
    updateBookMark(!isBookMarked, relatedLO.id);
  };
  const getBookMarkIcon = (
    <span className={styles.bookMarkIcon}>
      {isBookMarked ? BOOKMARKED_ICON() : BOOKMARK_ICON()}
    </span>
  );
  const navigateToLoOverview = () => {
    clearBreadcrumbPathDetails();
    const alm = getALMObject();
    alm.navigateToTrainingOverviewPage(relatedLO.id);
  };
  const relatedLOName = relatedLO.localizedMetadata[0].name;
  const imageUrl = relatedLO.imageUrl || GetTileImageFromId(relatedLO.id);
  const relatedLoSkill = relatedLO.skills?.[0].skillLevel?.skill.name;
  return (
    <div>
      <div className={styles.borderContainer}>
        <div className={styles.detailsContainer} data-automation="related-lo-card">
          <img
            className={styles.loImage}
            style={{
              backgroundColor: GetTileColor(relatedLO.id),
            }}
            src={imageUrl}
            alt={relatedLOName}
            data-automationid={relatedLOName}
          />

          <div className={styles.loDetails}>
            <a
              className={styles.loName}
              onClick={navigateToLoOverview}
              role="button"
              aria-label={relatedLOName}
              data-automationid={relatedLOName}
            >
              {relatedLOName}
            </a>
            <div className={styles.skillsText} data-automationid="skills">
              {relatedLoSkill && (
                <div className={styles.skillsInfo}>
                  {GetTranslation("alm.related.lo.skills", true)}
                  <span className={styles.skillName} data-automationid={relatedLoSkill}>
                    {relatedLoSkill}
                  </span>
                </div>
              )}
              <button className={styles.bookMark} onClick={toggle} data-automationid="bookmark">
                {getBookMarkIcon}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrimeTrainingRelatedLO;
