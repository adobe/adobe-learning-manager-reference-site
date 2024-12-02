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
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { PrimeUserRecommendationCriteria } from "../../../models";
import { ADVANCED } from "../../../utils/widgets/common";
import { PrlChips } from "../PrlChips";
import { PrlLevelSelector } from "../PrlLevelSelector";

import styles from "./PrlPreference.module.css";

const PrlPreference = (props: any) => {
  const { formatMessage } = useIntl();
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedSelectedCriteria, setUpdatedSelectedCriteria] = useState([props.selectedCriteria]);

  useEffect(() => {
    if (props.selectedCriteria) {
      setUpdatedSelectedCriteria(props.selectedCriteria);
    }
  }, [props]);

  const addSelected = (item: PrimeUserRecommendationCriteria) => {
    setUpdatedSelectedCriteria([
      ...updatedSelectedCriteria,
      {
        id: item.id,
        name: item.name,
        levels: props.isLevelsEnabled ? [ADVANCED] : undefined,
      },
    ]);
  };
  const removeSelected = (item: PrimeUserRecommendationCriteria) => {
    setUpdatedSelectedCriteria(
      updatedSelectedCriteria.filter((criteria: any) => criteria.id !== item.id)
    );
  };

  const toggleEditMode = () => {
    setIsEditMode(isEditMode => !isEditMode);
    setUpdatedSelectedCriteria(props.selectedCriteria);
  };

  const handleCritiaSave = () => {
    if (typeof props.onUpdate === "function") {
      props.onUpdate({
        detail: {
          criteria: updatedSelectedCriteria,
        },
      });
      toggleEditMode();
    }
  };

  const updateLevel = (event: CustomEvent) => {
    const item = event.detail?.item;
    if (!item?.id) {
      console.error("NO data in custom event : ", JSON.stringify(event.detail));
      return;
    }
    const index = updatedSelectedCriteria.findIndex((criteria: any) => criteria.id === item.id);
    if (index > -1) {
      updatedSelectedCriteria[index] = item;
      setUpdatedSelectedCriteria([...updatedSelectedCriteria]);
    }
  };

  const renderCriteria = () => {
    if (isEditMode) {
      return (
        <>
          <div className={styles.prlPCriteriaSection}>
            <PrlChips
              className={styles.prlPPrlChips}
              options={props.allCriteria}
              selectedOptions={
                new Map(
                  updatedSelectedCriteria.map((obj: PrimeUserRecommendationCriteria) => [
                    obj.id,
                    obj.name,
                  ])
                )
              }
              onAdd={addSelected}
              onRemove={removeSelected}
            />
            {props.isLevelsEnabled && (
              <PrlLevelSelector
                options={updatedSelectedCriteria}
                levels={props.levels}
                onChangeHandler={updateLevel}
              />
            )}
          </div>
        </>
      );
    }
    return (
      <div className={styles.prlPCriteria}>
        {props.selectedCriteria?.map((item: any) => item.name).join(", ")}
      </div>
    );
  };

  const renderActionButtons = () => {
    const shouldDisableSave = updatedSelectedCriteria?.length === 0 || props.isSaving;
    if (isEditMode) {
      return (
        <div>
          <button className={styles.prlPSecondaryButton} onClick={toggleEditMode}>
            {formatMessage({
              id: "alm.text.cancel",
              defaultMessage: "Cancel",
            })}
          </button>
          <button
            className={styles.prlPPrimaryButton}
            onClick={handleCritiaSave}
            disabled={shouldDisableSave}
          >
            {formatMessage({
              id: "alm.text.save",
              defaultMessage: "Save",
            })}
          </button>
        </div>
      );
    }
    return (
      <button className={styles.prlPSecondaryButton} onClick={toggleEditMode}>
        {formatMessage({
          id: "alm.text.edit",
          defaultMessage: "Edit",
        })}
      </button>
    );
  };

  return (
    <>
      <div className={styles.prlPContainer}>
        <div className={styles.prlPHeader}>
          <div className={styles.prlPHeading}>{props.heading}</div>
          {renderActionButtons()}
        </div>
        {renderCriteria()}
      </div>
    </>
  );
};
export default PrlPreference;
