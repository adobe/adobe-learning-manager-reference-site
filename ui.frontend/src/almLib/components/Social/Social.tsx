/***
 *
 * Please Do not use this Component.
 */
import { PrimeCommunityBoardList, useSocial } from "../..";
import styles from "./styles/Social.module.css";

import LeftSideBar from "./LeftSideBar";
import RightSideBar from "./RightSideBar";
import { useEffect, useState } from "react";

import { ALMLoader } from "../Common/ALMLoader";
import { useBoards } from "../../hooks/community";
import { Grid, View } from "@adobe/react-spectrum";
import { useSkills } from "../../hooks/profile/useSkills";
import { useIntl } from "react-intl";

const SocialLearningPage = () => {
  const { formatMessage } = useIntl();
  const { userFavBoards, isLoading, fetchFollowers, fetchFavouriteBoards } = useSocial();
  const { skills, fetchSkills } = useSkills();
  const DEFAULT_SORT_VALUE = "-dateUpdated";
  const DEFAULT_SKILL = "";

  const { fetchBoards } = useBoards(DEFAULT_SORT_VALUE, DEFAULT_SKILL);
  useEffect(() => {
    fetchSkills();
    fetchFollowers();
    fetchFavouriteBoards();
  }, [fetchSkills, fetchFollowers, fetchFavouriteBoards]);

  const loadMyBoards = (status: boolean) => {
    fetchBoards(DEFAULT_SORT_VALUE, DEFAULT_SKILL, status);
  };
  const infoClickHandler = () => {
    const new_window = window.open(
      "https://helpx.adobe.com/learning-manager/learners/feature-summary/social-learning-web-user.html",
      "_BLANK"
    );
    new_window?.open();
  };
  return (
    <>
      {
        <Grid
          areas={[
            "header header header header ",
            "empty left centre right ",
            "footer footer footer footer ",
          ]}
          columns={[".8fr", "1fr", "2fr", "1.5fr", ".8fr"]}
          height="size-6000"
          flex
        >
          <View gridArea="header" UNSAFE_className={styles.bannerbg}>
            <div className={styles.bannerbg}>
              <div className={styles.bannerItems}>
                <h1 className={styles.socialLearningHeading}>
                  {formatMessage({
                    id: "alm.social.socialLearning",
                    defaultMessage: "Social Learning",
                  })}
                </h1>
                <h4 className={styles.socialLearningMoto}>
                  {formatMessage({
                    id: "alm.social.socialLearningMotto",
                    defaultMessage:
                      "Where learning becomes social.  Learn anywhere and share it here with your peers.",
                  })}
                </h4>
                <button className={styles.infoButton} onClick={infoClickHandler}>
                  {formatMessage({ id: "alm.social.text.knowMore", defaultMessage: "Know More" })}
                </button>
              </div>
            </div>
          </View>

          <View gridArea="left">
            <div className={styles.left}>
              {userFavBoards.length > 0 ? (
                <LeftSideBar favBoards={userFavBoards} loadMyBoards={loadMyBoards} />
              ) : (
                <ALMLoader classes={styles.leftLoader} />
              )}
            </div>
          </View>
          <View gridArea="centre" UNSAFE_className={styles.mainContainer}>
            <PrimeCommunityBoardList />
          </View>
          <View gridArea="right">
            <>
              {skills.length > 0 ? (
                <RightSideBar skillsData={skills} />
              ) : (
                <ALMLoader classes={styles.rightLoader} />
              )}
            </>
          </View>
        </Grid>
      }
    </>
  );
};
export default SocialLearningPage;
