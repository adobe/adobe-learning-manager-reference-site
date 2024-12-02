import React, { useEffect, useState } from "react";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import styles from "./PrimeTrainingRelatedLO.module.css";
import { GetTranslation } from "../../../utils/translationService";
import { BOOKMARK_ICON, BOOKMARKED_ICON } from "../../../utils/inline_svg";
import { Skill } from "../../../models";
import { getALMObject } from "../../../utils/global";
import { GetTileImageFromId, GetTileColor } from "../../../utils/themes";
import { clearBreadcrumbPathDetails } from "../../../utils/breadcrumbUtils";
import { getTraining } from "../../../utils/lo-utils";
import {
  handleRedirectionForLoggedIn,
  handleRedirectionForNonLoggedIn,
} from "../../Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { getActiveInstances } from "../../../utils/catalog";
import { useCardIcon } from "../../../utils/hooks";
import { TRAINING_CARD_ICON_SIZE_OVERVIEW_PAGE } from "../../../utils/constants";

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
  const navigateToLoOverview = async () => {
    try {
      const trainingResponse = await getTraining(relatedLO.id);
      if (!trainingResponse) {
        return;
      }

      // Navigating to a new training
      clearBreadcrumbPathDetails(trainingResponse.id);

      const alm = getALMObject();
      const activeInstances = getActiveInstances(trainingResponse);
      if (!alm.isPrimeUserLoggedIn()) {
        handleRedirectionForNonLoggedIn(trainingResponse, activeInstances);
        return;
      }
      handleRedirectionForLoggedIn(trainingResponse, activeInstances);
    } catch (e) {
      throw new Error();
    }
  };
  const relatedLOName = relatedLO.localizedMetadata[0].name;
  const relatedLoSkill = relatedLO.skills?.[0].skillLevel?.skill.name;
  const { listThumbnailBgStyle } = useCardIcon(relatedLO, TRAINING_CARD_ICON_SIZE_OVERVIEW_PAGE);
  return (
    <div>
      <div className={styles.borderContainer}>
        <div className={styles.detailsContainer} data-automation="related-lo-card">
          <div
            className={styles.loImage}
            style={{
              backgroundColor: GetTileColor(relatedLO.id),
              ...listThumbnailBgStyle,
            }}
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
