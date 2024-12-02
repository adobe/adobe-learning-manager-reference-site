/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import styles from "./ALMSocialLearning.module.css";
import { DEFAULT_USER_AVATAR_SVG } from "../../../utils/inline_svg";
import SOCIAL_EMPTY_STATE from "../../../assets/images/social_empty_state.svg";
import {
  CARD_HEIGHT,
  CARD_WIDTH_EXCLUDING_PADDING,
  WIDGET_HEIGHT,
  Widget,
} from "../../../utils/widgets/common";
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import { GetFormattedDate } from "../../../utils/widgets/utils";

import { useSocialLearning } from "../../../hooks/widgets/socialLearning/useSocialLearning";
import { useIntl } from "react-intl";
import { getALMObject, getWidgetConfig } from "../../../utils/global";
import { DEFAULT_USER_AVATAR, DELETED } from "../../../utils/constants";
import { useEffect } from "react";
import { ALMImage } from "../../Common/ALMImage";

const secondsInSevenDays = 604800;
const HEADER_WIDTH_WITHOUT_EXPLORE_BTN = 230;

const ALMSocialLearning: React.FC<{
  widget: Widget;
}> = ({ widget }) => {
  const { posts, showExploreBox, emptyView } = useSocialLearning();
  useEffect(() => {
    widget.attributes!.heading = GetTranslation("text.skipToSocial", true);
  }, []);

  const { locale } = useIntl();
  const hideExploreButton = emptyView || showExploreBox;
  const headerWidth = hideExploreButton
    ? CARD_WIDTH_EXCLUDING_PADDING
    : HEADER_WIDTH_WITHOUT_EXPLORE_BTN;

  function isSocialLinkDisabled() {
    const config = getWidgetConfig();
    return config?.disableLinks || config?.disableSocialWidgetLink;
  }

  function onExploreClick() {
    if (!isSocialLinkDisabled()) {
      getALMObject().navigateToSocial();
    }
  }

  function getTimeAgoString(_postUpdatedDate: string) {
    const seconds = (new Date().getTime() - new Date(_postUpdatedDate).getTime()) / 1000;
    if (seconds > secondsInSevenDays) {
      return GetTranslation("social.week.ago");
    } else {
      return GetFormattedDate(_postUpdatedDate, locale);
    }
  }

  function renderEmptyCard() {
    return (
      <figure className={styles.emptyBody}>
        <img
          src={SOCIAL_EMPTY_STATE}
          alt={GetTranslation("social.empty", true)}
          data-automationid="social-empty-state-image"
        />
        <div className={styles.emptyContent}>
          <p className={styles.emptyCardConnectPeers}>
            {GetTranslation(`social.explore.message1`)}
          </p>
          <button
            onClick={onExploreClick}
            className={styles.emptyCardExplore}
            data-automationid={`social-explore-button`}
          >
            {GetTranslation(`social.explore.message2`, true)}
          </button>
        </div>
      </figure>
    );
  }

  return (
    <div
      className={styles.widget}
      style={{
        width: `${CARD_WIDTH_EXCLUDING_PADDING}px`,
        height: `${WIDGET_HEIGHT}px`,
      }}
      data-automationid="social-container"
    >
      <h2
        id="header"
        data-automationid="social-header"
        title={GetTranslation("socialFeed", true)}
        className={`${styles.header} ${emptyView ? styles.headerCenter : ""}`}
        style={{ width: `${headerWidth}px` }}
        data-skip-link-target={widget.layoutAttributes?.id}
        tabIndex={0}
      >
        {GetTranslation("socialFeed", true)}
      </h2>
      <section
        id="socialContainer"
        style={{ height: `${CARD_HEIGHT}px` }}
        role="complementary"
        aria-labelledby="header"
        data-automationid="social-card"
      >
        {!emptyView ? (
          <section className={styles.posts} data-automationid="posts-section">
            <div className={styles.postsList} data-automationid="social-posts-list">
              {posts.map((post, index) => {
                let postText = post.text;
                if (!postText) {
                  postText = GetTranslation("sharedAFile");
                }
                const avatarUrl = post.createdBy.avatarUrl;
                let showDefaultImg = false;
                if (!avatarUrl || avatarUrl.includes("default_user_avatar.svg")) {
                  showDefaultImg = true;
                }
                const dateUpdatedStr = getTimeAgoString(post.dateUpdated);
                const isPostDeleted = post.createdBy.state === DELETED;
                const createdBy = isPostDeleted
                  ? GetTranslation("user.name.anonymous")
                  : post.createdBy.name;
                return (
                  <a
                    href="#"
                    className={styles.postContainer}
                    key={index}
                    data-automationid={`social-post-${index.toString()}`}
                    style={{
                      pointerEvents: isSocialLinkDisabled() ? "none" : "auto",
                    }}
                    onClick={() =>
                      getALMObject().navigateToSocial(`/board/${post.parent.id}?postId=${post.id}`)
                    }
                    aria-label={GetTranslationsReplaced("text.viewPost", {
                      postNum: index + 1,
                      postedBy: createdBy,
                    })}
                  >
                    <div className={styles.post}>
                      <div className={styles.metadata}>
                        <div
                          className={styles.profile}
                          data-automationid={`user-profile-${index.toString()}`}
                        >
                          {showDefaultImg || isPostDeleted ? (
                            DEFAULT_USER_AVATAR_SVG(GetTranslation("profilePic"))
                          ) : (
                            <ALMImage
                              altText={GetTranslation("profilePic")}
                              UNSAFE_className={styles.profileImage}
                              src={avatarUrl}
                              defaultImageSrc={DEFAULT_USER_AVATAR}
                            />
                          )}
                        </div>

                        <div className={styles.userInfo}>
                          <div className={styles.srOnly}>
                            {GetTranslationReplaced("text.postedBy", createdBy)}
                          </div>
                          <div
                            aria-hidden="true"
                            data-automationid={`userName-${index.toString()}`}
                            className={styles.userName}
                          >
                            {createdBy ? createdBy : GetTranslation("user.name.anonymous")}
                          </div>
                          <div className={styles.srOnly}>
                            {GetTranslationReplaced("text.posted", dateUpdatedStr)}
                          </div>
                          <div
                            aria-hidden="true"
                            className={styles.datePosted}
                            data-automationid={`updatedOn-${index.toString()}`}
                          >
                            {dateUpdatedStr}
                          </div>
                        </div>
                      </div>

                      <div
                        aria-hidden="true"
                        data-automationid={`post-text-${index.toString()}`}
                        title={postText}
                        className={styles.textBox}
                      >
                        {postText}
                      </div>
                      <div className={styles.srOnly}>{postText}</div>
                    </div>
                  </a>
                );
              })}
              {showExploreBox && (
                <div className={styles.explore} data-automationid={`social-explore`}>
                  <p
                    className={styles.exploreBoxConnectPeers}
                    data-automationid="social-explore-message"
                  >
                    {GetTranslation(`social.explore.message1`)}
                  </p>
                  <button
                    onClick={onExploreClick}
                    className={styles.exploreBoxExplore}
                    data-automationid="social-explore-button"
                  >
                    {GetTranslation(`social.explore.message2`, true)}
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          renderEmptyCard()
        )}
      </section>
      {isSocialLinkDisabled()
        ? ""
        : !hideExploreButton && (
            <button
              className={styles.actionText}
              onClick={onExploreClick}
              data-automationid={`social-explore-button`}
            >
              {GetTranslation("alm.text.explore")}
            </button>
          )}
    </div>
  );
};

export default ALMSocialLearning;
