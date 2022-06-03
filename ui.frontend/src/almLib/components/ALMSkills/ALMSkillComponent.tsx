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
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { useSkills } from "../../hooks/community/useSkills";
import { useUserSkillInterest } from "../../hooks/community/useUserSkillInterest";
import styles from "./ALMSkillComponent.module.css";

const ALMSkillComponent = (props: any) => {
  const { formatMessage } = useIntl();
  const {
    items,
    fetchUserSkillInterest,
    saveUserSkillInterest,
    removeUserSkillInterest,
    loadMoreUserSkillInterest,
    hasMoreItems,
  } = useUserSkillInterest();
  const { skills, fetchSkills, hasMoreSkills, loadMoreSkills } = useSkills();
  const [mode, setMode] = useState("view");
  let selectedSkills = [] as any;
  const generalSkill = "general";

  const removeFocus_lxpv = (event: Event) => {
    const currentSkill = event.target as HTMLElement;
    if (currentSkill) {
      currentSkill.blur();
    }
  };

  const toggleSkillSelection = (node: any) => {
    const skillId = node.id.split("skill-")[1];
    if (selectedSkills.indexOf(skillId) > -1) {
      selectedSkills.splice(selectedSkills.indexOf(skillId), 1);
      node.style.boxShadow = "none";
      node.setAttribute("aria-pressed", "false");
    } else {
      selectedSkills.push(skillId);
      node.style.boxShadow = "0 0 3pt 3pt #4283d0";
      node.setAttribute("aria-pressed", "true");
    }
  };

  const handleClickOnSkillBox = (event: any) => {
    let node = event.target as HTMLElement;
    if (
      node.className.indexOf("skillBoxSelectable") > -1 ||
      node.className.indexOf("skillNameSelectable") > -1
    ) {
      if (node.className.indexOf("skillName") > -1) {
        node = node.parentNode as HTMLElement;
      }
      toggleSkillSelection(node);
    }
  };

  const scrollToSkillsSection = () => {
    document.getElementById("skills-section")?.scrollIntoView();
  };

  const editSkillInterest = async () => {
    await fetchSkills();
    setMode("edit");
    scrollToSkillsSection();
  };

  const saveSkillInterest = async () => {
    if (selectedSkills.length !== 0) {
      await saveUserSkillInterest(selectedSkills);
      await fetchUserSkillInterest();
    }
    setMode("view");
    scrollToSkillsSection();
  };

  const discardSelection = () => {
    selectedSkills = [];
    setMode("view");
    scrollToSkillsSection();
  };

  const noSkillInterestPresent = () => {
    return (
      !items ||
      !items.length ||
      items.length === 0 ||
      (items.length === 1 && items[0].skill.name.toLowerCase() === generalSkill)
    );
  };

  const noSkillPresent = () => {
    return (
      !skills ||
      !skills.length ||
      skills.length === 0 ||
      (skills.length === 1 && skills[0].name.toLowerCase() === generalSkill)
    );
  };

  const removeSkillInterest = async (skillId: any) => {
    await removeUserSkillInterest(skillId);
  };

  const getSkillLevelName = (levelId: any) => {
    if (levelId === "1")
      return formatMessage({
        id: "alm.profile.skillLevel.beginner",
        defaultMessage: "Beginner",
      });
    else if (levelId === "2")
      return formatMessage({
        id: "alm.profile.skillLevel.intermediate",
        defaultMessage: "Intermediate",
      });
    else if (levelId === "3")
      return formatMessage({
        id: "alm.profile.skillLevel.advanced",
        defaultMessage: "Advanced",
      });
    else return "";
  };

  const getFormattedSourceString = (source: any) => {
    if (source === "ADMIN_ASSIGN")
      return formatMessage({
        id: "alm.profile.skills.adminAssign",
        defaultMessage: "Added by Admin",
      });
    else if (source === "LO_ENROLL")
      return formatMessage({
        id: "alm.profile.skills.loEnroll",
        defaultMessage: "Added based on trainings taken",
      });
    else if (source === "USER_SELECTED")
      return formatMessage({
        id: "alm.profile.skills.selfAssigned",
        defaultMessage: "Self Assigned",
      });
    else return "";
  };
  const getCreditsPercent = (a: any, b: any) => {
    const percent = (a * 100) / b > 100 ? 100 : (a * 100) / b;
    return " " + Math.round((percent + Number.EPSILON) * 100) / 100;
  };

  const populateUserSkillInterestLevelData = (userSkillInterest: any) => {
    let pointsObject = {};
    let pointsArray = [];
    if (userSkillInterest.userSkills) {
      for (let i = 0; i < userSkillInterest.userSkills.length; i++) {
        const skillEnrollmentDetails = userSkillInterest.userSkills[i].id.split(
          "_"
        );
        const levelId = skillEnrollmentDetails[2];

        if (levelId) {
          pointsObject = {
            levelId: levelId,
            pointsAchieved: userSkillInterest.userSkills[i].pointsEarned,
            totalPoints: userSkillInterest.userSkills[i].skillLevel.maxCredits,
          };
          pointsArray.push(pointsObject);
        }
      }
    }
    return pointsArray;
  };

  return (
    <>
      <section id="skills-section" className={styles.skillsArea}>
        <div className={styles.skillsHeading}>
          {formatMessage({
            id: "alm.profile.skills.areasOfInterest",
            defaultMessage: "Your Areas of Interest",
          })}
        </div>
        <hr />
        <div className={styles.skillsDescription}>
          {formatMessage({
            id: "alm.profile.skills.description",
            defaultMessage:
              "Select areas of interest. You will see recommendations based on your interest.",
          })}
        </div>
        {/* {!items &&
                    <ALMLoader></ALMLoader>
                } */}
        {mode === "view" && items?.length > 0 && (
          <div className={styles.skillsContainer}>
            {items
              .filter(
                (skillInterest) =>
                  skillInterest.skill.name.toLowerCase() !== generalSkill
              )
              .map((skillInterest: any) => (
                <div
                  className={styles.skillBox}
                  tabIndex={0}
                  id={"skill-" + skillInterest.skill.id}
                  aria-labelledby={"skillName-" + skillInterest.skill.id}
                  role="group"
                  onMouseDown={(event: any) => {
                    handleClickOnSkillBox(event);
                  }}
                  onMouseLeave={(event: any) => {
                    removeFocus_lxpv(event);
                  }}
                >
                  <span className={styles.skillName}>
                    {skillInterest.skill.name}
                  </span>
                  <button
                    onClick={() => {
                      removeSkillInterest(skillInterest.skill.id);
                    }}
                    className={styles.removeInterestButton}
                    aria-label={formatMessage({
                      id: "alm.profile.skills.removeInterest",
                      defaultMessage: "Remove from My interests",
                    })}
                    title={formatMessage({
                      id: "alm.profile.skills.removeInterest",
                      defaultMessage: "Remove from My interests",
                    })}
                  ></button>
                  <div className={styles.arrowUp}></div>
                  <div className={styles.skillDataTooltip} aria-hidden="true">
                    {skillInterest.skill.name}
                    <br />
                    {skillInterest.source === "USER_SELECTED" ? (
                      ``
                    ) : (
                      <div>
                        {getFormattedSourceString(skillInterest.source)}
                      </div>
                    )}
                    {populateUserSkillInterestLevelData(skillInterest).map(
                      (level: any) => {
                        return (
                          <div>
                            <strong>{getSkillLevelName(level.levelId)}</strong>:
                            {getCreditsPercent(
                              level.pointsAchieved,
                              level.totalPoints
                            )}
                            %
                            {formatMessage({
                              id: "alm.profile.skills.achieved",
                              defaultMessage: " Achieved",
                            })}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
        {mode === "view" && hasMoreItems && (
          <button
            className={styles.showMoreButton}
            onClick={loadMoreUserSkillInterest}
          >
            {formatMessage({
              id: "alm.profile.skills.viewMore",
              defaultMessage: "View more",
            })}
          </button>
        )}
        {mode === "view" && noSkillInterestPresent() && (
          <div className={styles.skillsContainer}>
            <span>
              {formatMessage({
                id: "alm.profile.skills.noSkillInterest",
                defaultMessage: "You have not expressed interest in any Skill",
              })}
            </span>
          </div>
        )}
        {mode === "view" && (
          <div className={styles.modifyInterest}>
            <button className={styles.actionButton} onClick={editSkillInterest}>
              {formatMessage({
                id: "alm.profile.skills.modifyInterest",
                defaultMessage: "Modify Interest",
              })}
            </button>
          </div>
        )}
        {mode === "edit" && skills?.length > 0 && (
          <div className={styles.skillsContainer}>
            {skills
              .filter((skill) => skill.name.toLowerCase() !== generalSkill)
              .map((skill: any) => (
                <button
                  className={styles.skillBoxSelectable}
                  tabIndex={0}
                  id={"skill-" + skill.id}
                  aria-labelledby={"skillName-" + skill.id}
                  onClick={(event: any) => {
                    handleClickOnSkillBox(event);
                  }}
                  onMouseLeave={(event: any) => {
                    removeFocus_lxpv(event);
                  }}
                  aria-pressed={false}
                >
                  <span className={styles.skillNameSelectable}>
                    {skill.name}
                  </span>
                </button>
              ))}
          </div>
        )}
        {mode === "edit" && hasMoreSkills && (
          <button className={styles.showMoreButton} onClick={loadMoreSkills}>
            {formatMessage({
              id: "alm.profile.skills.viewMore",
              defaultMessage: "View more",
            })}
          </button>
        )}
        {mode === "edit" && noSkillPresent() && (
          <div className={styles.skillsContainer}>
            <span>
              {formatMessage({
                id: "alm.profile.skills.noSkill",
                defaultMessage: "No skill found",
              })}
            </span>
          </div>
        )}
        {mode === "edit" && (
          <div className={styles.modifyInterest}>
            <button className={styles.actionButton} onClick={saveSkillInterest}>
              {formatMessage({
                id: "alm.profile.skills.addInterest",
                defaultMessage: "Add Interest",
              })}
            </button>
            <button className={styles.actionButton} onClick={discardSelection}>
              {formatMessage({
                id: "alm.profile.skills.cancel",
                defaultMessage: "Cancel",
              })}
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default ALMSkillComponent;
