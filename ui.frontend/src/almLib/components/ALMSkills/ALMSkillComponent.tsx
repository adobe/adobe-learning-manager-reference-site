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
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSkills } from "../../hooks/profile/useSkills";
import { useUserSkillInterest } from "../../hooks/profile/useUserSkillInterest";
import { GetTranslation } from "../../utils/translationService";
import { getALMAccount, isEmptyJson } from "../../utils/global";
import {
  ADMIN_ASSIGN,
  update,
  EXTERNAL,
  GENERAL,
  INTERNAL,
  LO_ENROLL,
  SKILL,
  USER_SELECTED,
  VIEW,
  MODE,
} from "../../utils/constants";
import { ExternalSkillGraphComponent } from "./ExternalSkillGraph";
import { ALMLoader } from "../Common/ALMLoader";
import Search from "@spectrum-icons/workflow/Search";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";

import styles from "./ALMSkillComponent.module.css";
import { PrimeSkill, PrimeUserSkillInterest } from "../../models";
import { PrlPreferenceSection } from "../PrlPreferenceSection";

const ALMSkillComponent = () => {
  const { formatMessage } = useIntl();
  const {
    items,
    fetchUserSkillInterest,
    saveUserSkillInterest,
    removeUserSkillInterest,
    loadMoreUserSkillInterest,
    hasMoreItems,
  } = useUserSkillInterest();
  const { skills, fetchSkills, searchSkill, hasMoreSkills, loadMoreSkills } = useSkills();
  const urlSearchParams = window.location.hash.split("?")[1];
  const initialMode = urlSearchParams ? urlSearchParams.split(`${MODE}=`)[1] : VIEW;
  const [mode, setMode] = useState(initialMode);
  const [selectedInterest, setSelectedInterest] = useState([] as string[]);
  const [isPrlEnabled, setIsPrlEnabled] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState(INTERNAL);
  const [selectedExternalInterest, setSelectedExternalInterest] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [internalSkillInterestIds, setInternalSkillInterestIds] = useState([] as string[]);
  const [filteredSkills, setFilteredSkills] = useState([] as PrimeSkill[]);
  const [collapseInterests, setCollapseInterests] = useState(false);
  const [searchString, setSearchString] = useState("");

  const ALM_BUTTON = "almButton";
  const PRIMARY = "primary";
  const SECONDARY = "secondary";
  const SKILL_NAME = "skillName";
  const SKILL_INPUT = "skillInput";
  const ENTER = "Enter";
  const skillsRef = useRef([]);

  useEffect(() => {
    const getAccount = async () => {
      const account = await getALMAccount();
      if (account) {
        setIsPrlEnabled(account.prlCriteria?.enabled);
        setCollapseInterests(account.prlCriteria?.enabled);
        setShowTabs(!account.prlCriteria?.enabled && account.enableExternalSkills);
      }
    };
    getAccount();
  }, []);

  useEffect(() => {
    if (!isEmptyJson(items) && isInternalTab()) {
      const internalSkillInterestIds: string[] = [];
      items.map(item => {
        internalSkillInterestIds.push(item.skill.id);
      });
      setInternalSkillInterestIds(internalSkillInterestIds);
    }
  }, [items]);

  useEffect(() => {
    clearSkillRefs();
    if (!isEmptyJson(skills)) {
      let filteredSkills = skills?.filter(skill => {
        return internalSkillInterestIds.indexOf(skill.id) === -1;
      });
      setFilteredSkills(filteredSkills);
    }
  }, [skills]);

  const highlightAllSelectedSkills = () => {
    const skills = skillsRef.current as any;
    selectedInterest.forEach(interest => {
      const index = skills.findIndex((element: any) => element.id === `skill-${interest}`);
      if (index > -1) {
        highlightSelectedSkill(skills[index]);
      }
    });
  };

  useEffect(() => {
    highlightAllSelectedSkills();
  }, [filteredSkills]);

  useEffect(() => {
    if (isInternalTab()) {
      highlightAllSelectedSkills();
    } else {
      clearSkillRefs();
    }
  }, [selectedTab]);

  const clearSkillRefs = () => {
    skillsRef.current = [];
  };

  const removeFocus = (event: Event) => {
    const currentSkill = event.target as HTMLElement;
    if (currentSkill) {
      currentSkill.blur();
    }
  };

  const clearSelectedSkills = () => {
    setSelectedInterest([]);
  };

  const loadMoreSkillsHandler = async () => {
    await loadMoreSkills();
  };

  const highlightSelectedSkill = (skillBox: any) => {
    skillBox.className += ` ${styles.selectedSkillBox}`;
    skillBox.ariaPressed = true;
  };

  const removeHighlight = (skillBox: any) => {
    skillBox.className = styles.skillBoxSelectable;
    skillBox.ariaPressed = false;
  };

  const toggleSkillSelection = (index: number) => {
    let skillBox = skillsRef.current[index] as any;
    const skillId = skillBox.id.split("skill-")[1];
    let selectedSkills = selectedInterest;
    const skillIndex = selectedSkills.indexOf(skillId);
    if (skillIndex > -1) {
      selectedSkills.splice(skillIndex, 1);
      removeHighlight(skillBox);
    } else {
      selectedSkills.push(skillId);
      highlightSelectedSkill(skillBox);
    }
    setSelectedInterest(selectedSkills);
  };

  const scrollToSkillsSection = () => {
    document.getElementById("skills-section")?.scrollIntoView();
  };

  const editSkillInterest = async () => {
    await fetchSkills();
    if (mode !== update) {
      setMode(update);
    }
    setSelectedTab(INTERNAL);
    scrollToSkillsSection();
  };

  useEffect(() => {
    if (initialMode === update) {
      editSkillInterest();
    }
  }, []);

  const saveSkillInterest = async () => {
    const selectedInterestArr = [...selectedInterest];
    selectedExternalInterest.map(externalInterest => {
      selectedInterestArr.push(`${EXTERNAL}:${externalInterest}`);
    });
    if (selectedInterestArr.length !== 0) {
      await saveUserSkillInterest(selectedInterestArr);
    }
    loadDefaultState(true);
  };

  const loadDefaultState = async (apiReload = false) => {
    if (apiReload) {
      await fetchUserSkillInterest(INTERNAL);
    }
    clearSelectedSkills();
    setMode(VIEW);
    setSelectedTab(INTERNAL);
    scrollToSkillsSection();
    setSearchString("");
  };

  const noSkillInterestPresent = () => {
    return (
      items?.length === 0 || (items?.length === 1 && items[0].skill.name.toLowerCase() === GENERAL)
    );
  };

  const noSkillPresent = () => {
    return (
      filteredSkills?.length === 0 ||
      (filteredSkills?.length === 1 && filteredSkills[0].name.toLowerCase() === GENERAL)
    );
  };

  const removeSkillInterest = async (skillId: string) => {
    await removeUserSkillInterest(skillId);
  };

  const getSkillLevelName = (levelId: string) => {
    switch (levelId) {
      case "1":
        return formatMessage({
          id: "alm.profile.skillLevel.beginner",
          defaultMessage: "Beginner",
        });
      case "2":
        return formatMessage({
          id: "alm.profile.skillLevel.intermediate",
          defaultMessage: "Intermediate",
        });
      case "3":
        return formatMessage({
          id: "alm.profile.skillLevel.advanced",
          defaultMessage: "Advanced",
        });
      default:
        return "";
    }
  };

  const getFormattedSourceString = (source: string) => {
    switch (source) {
      case ADMIN_ASSIGN:
        return formatMessage({
          id: "alm.profile.skills.adminAssign",
          defaultMessage: "Added by Admin",
        });
      case LO_ENROLL:
        return formatMessage({
          id: "alm.profile.skills.loEnroll",
          defaultMessage: "Added based on your learnings",
        });
      case USER_SELECTED:
        return formatMessage({
          id: "alm.profile.skills.selfAssigned",
          defaultMessage: "Self Assigned",
        });
      default:
        return "";
    }
  };
  const getCreditsPercent = (a: number, b: number) => {
    const percent = (a * 100) / b > 100 ? 100 : (a * 100) / b;
    return " " + Math.round((percent + Number.EPSILON) * 100) / 100;
  };

  const populateUserSkillInterestLevelData = (userSkillInterest: PrimeUserSkillInterest) => {
    let pointsObject = {};
    let pointsArray = [];
    if (userSkillInterest.userSkills) {
      for (let i = 0; i < userSkillInterest.userSkills.length; i++) {
        const skillEnrollmentDetails = userSkillInterest.userSkills[i].id.split("_");
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

  const isViewMode = () => {
    return mode === VIEW;
  };

  const isUpdateMode = () => {
    return mode === update;
  };

  const isInternalTab = () => {
    return selectedTab === INTERNAL;
  };

  const isExternalTab = () => {
    return selectedTab === EXTERNAL;
  };

  const clearSelectedInterest = () => {
    setSelectedInterest([]);
    setSelectedExternalInterest([]);
  };
  const handleClickOnTab = async (tab: string) => {
    if (selectedTab === tab) {
      // dont do anything is click on same tab
      return;
    }
    setSelectedTab(tab);
    if (mode === update) {
      if (tab === INTERNAL && filteredSkills.length === 0) {
        await fetchSkills();
      }
    } else {
      clearSelectedInterest();
      await fetchUserSkillInterest(tab);
    }
  };

  const getTabMenu = () => {
    return (
      <>
        <ul role="tablist" className={styles.skillsTabRow}>
          <li
            tabIndex={0}
            role="tab"
            aria-selected="true"
            id="internal-skills-tab"
            // automationid="internal-skills-tab"
            className={isInternalTab() ? styles.activeSkillTab : styles.skillTab}
            onClick={() => handleClickOnTab(INTERNAL)}
          >
            {GetTranslation("alm.adminDefinedSkills", true)}
          </li>
          <li
            tabIndex={-1}
            role="tab"
            aria-selected="false"
            id="external-skills-tab"
            // automationid="external-skills-tab"
            className={isExternalTab() ? styles.activeSkillTab : styles.skillTab}
            onClick={() => handleClickOnTab(EXTERNAL)}
          >
            {GetTranslation("alm.industryAlignedSkills", true)}
          </li>
        </ul>
      </>
    );
  };

  const getHeaderSection = () => {
    return (
      <>
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
      </>
    );
  };

  const addToSkillsRef = (ref: never) => {
    if (ref && !skillsRef.current.includes(ref)) {
      skillsRef.current.push(ref);
    }
  };

  const getViewModeSection = () => {
    return (
      <>
        {items?.length > 0 && (
          <div className={styles.skillsContainer}>
            {items
              .filter(skillInterest => skillInterest.skill.name.toLowerCase() !== GENERAL)
              .map(skillInterest => {
                const id = skillInterest.skill.id;

                return (
                  <div
                    key={id}
                    className={styles.skillBox}
                    tabIndex={0}
                    id={"skill-" + id}
                    aria-labelledby={"skillName-" + id}
                    role="group"
                    onMouseLeave={(event: any) => {
                      removeFocus(event);
                    }}
                  >
                    <span className={styles.skillName}>{skillInterest.skill.name}</span>
                    <button
                      onClick={() => {
                        removeSkillInterest(id);
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
                        <div>{getFormattedSourceString(skillInterest.source)}</div>
                      )}
                      {populateUserSkillInterestLevelData(skillInterest).map((level: any) => {
                        return (
                          <div key={`${level.levelId}_${skillInterest.skill.id}`}>
                            <strong>{getSkillLevelName(level.levelId)}</strong>:
                            {getCreditsPercent(level.pointsAchieved, level.totalPoints)}%
                            {formatMessage({
                              id: "alm.profile.skills.achieved",
                              defaultMessage: " Achieved",
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        {hasMoreItems && (
          <button className={styles.showMoreButton} onClick={loadMoreUserSkillInterest}>
            {formatMessage({
              id: "alm.profile.skills.viewMore",
              defaultMessage: "View more",
            })}
          </button>
        )}
        {noSkillInterestPresent() && getNoSkillSection("alm.profile.skills.noSkillInterest")}
      </>
    );
  };

  const getNoSkillSection = (key: string) => {
    return (
      <>
        <div className={styles.skillsContainer}>
          <span>{GetTranslation(key, true)}</span>
        </div>
      </>
    );
  };

  const enterKeyPressed = (event: any) => {
    return event.key === ENTER || event.keyCode === 13;
  };

  const onChangeHandler = (event: any) => {
    setSearchString(event.target.value);
  };

  const handleSearchInput = async (event: any) => {
    if (enterKeyPressed(event)) {
      if (searchString) {
        setShowLoader(true);
        await searchSkill(searchString);
        setShowLoader(false);
      } else {
        fetchSkills();
      }
    }
  };

  const getLoader = () => {
    return showLoader && <ALMLoader classes={styles.primeLoaderWrapper} />;
  };
  const getSkillSearchSection = () => {
    return (
      <>
        <span
          className={styles.search}
          id="searchBox"
          role="search"
          aria-label={GetTranslation("alm.skillSearchPlaceholder", true)}
        >
          <input
            id={SKILL_INPUT}
            automation-id={SKILL_INPUT}
            className={styles.skillInput}
            autoComplete="off"
            onKeyUp={handleSearchInput}
            onChange={onChangeHandler}
            placeholder={GetTranslation("alm.skillSearchPlaceholder", true)}
            value={searchString}
          />
          <span className={styles.searchIcon}>
            <Search />
          </span>
        </span>
        {getLoader()}
      </>
    );
  };

  const getUpdateModeSection = () => {
    return (
      <>
        {isInternalTab() && (
          <>
            {filteredSkills?.length > 0 && (
              <>
                {getSkillSearchSection()}
                <div className={styles.skillsContainer}>
                  {filteredSkills
                    .filter(skill => skill.name.toLowerCase() !== GENERAL)
                    .map((skill: PrimeSkill, index: number) => (
                      <button
                        key={skill.id}
                        className={styles.skillBoxSelectable}
                        tabIndex={0}
                        id={`${SKILL.toLowerCase()}-${skill.id}`}
                        aria-labelledby={`${SKILL_NAME}-${skill.id}`}
                        onClick={(event: any) => {
                          toggleSkillSelection(index);
                        }}
                        onMouseLeave={(event: any) => {
                          removeFocus(event);
                        }}
                        ref={addToSkillsRef}
                        aria-pressed={false}
                      >
                        <span className={styles.skillNameSelectable}>{skill.name}</span>
                      </button>
                    ))}
                </div>
              </>
            )}
            {hasMoreSkills &&
              getButton(
                styles.showMoreButton,
                "alm.profile.skills.viewMore",
                "View more",
                loadMoreSkillsHandler
              )}
            {noSkillPresent() && getNoSkillSection("alm.profile.skills.noSkill")}
          </>
        )}
        {isExternalTab() && (
          <ExternalSkillGraphComponent setSelectedExternalInterest={setSelectedExternalInterest} />
        )}
      </>
    );
  };

  const getButton = (className: string, key: string, value: string, handler: any) => {
    return (
      <>
        <button className={className} onClick={handler}>
          {formatMessage({
            id: key,
            defaultMessage: value,
          })}
        </button>
      </>
    );
  };

  const getActionButtons = () => {
    return (
      <>
        <div className={styles.modifyInterest}>
          {isViewMode() &&
            !isPrlEnabled &&
            getButton(
              `${ALM_BUTTON} ${PRIMARY} ${styles.actionButton}`,
              "alm.profile.skills.modifyInterest",
              "Modify Interest",
              editSkillInterest
            )}
          {isUpdateMode() && (
            <>
              {getButton(
                `${ALM_BUTTON} ${PRIMARY} ${styles.actionButton}`,
                "alm.profile.skills.addInterest",
                "Add Interest",
                saveSkillInterest
              )}
              {getButton(
                `${ALM_BUTTON} ${SECONDARY} ${styles.actionButton}`,
                "alm.profile.skills.cancel",
                "Cancel",
                () => loadDefaultState()
              )}
            </>
          )}
        </div>
      </>
    );
  };

  const showInterestHeader = () => {
    return (
      <div className={styles.skillHeading}>
        {GetTranslation("alm.community.board.skills", true)}
        <div className={styles.skillIcons}>
          {collapseInterests && (
            <span
              onClick={() => {
                setCollapseInterests(false);
              }}
            >
              <ChevronDown />
            </span>
          )}
          {!collapseInterests && (
            <span
              onClick={() => {
                setCollapseInterests(true);
              }}
            >
              <ChevronUp />
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <section id="skills-section" className={styles.skillsArea}>
        {getHeaderSection()}
        <PrlPreferenceSection />
        <section id="interests-section" className={styles.interestsArea}>
          {isPrlEnabled && showInterestHeader()}
          {!collapseInterests && (
            <>
              {showTabs && getTabMenu()}
              {isViewMode() && getViewModeSection()}
              {isUpdateMode() && getUpdateModeSection()}
              {getActionButtons()}
            </>
          )}
        </section>
      </section>
    </>
  );
};

export default ALMSkillComponent;
