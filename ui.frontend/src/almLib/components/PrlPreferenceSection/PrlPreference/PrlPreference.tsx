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
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { PrimeUserRecommendationCriteria } from '../../../models';
import { ADVANCED } from '../../../utils/widgets/common';
import { PrlChips } from '../PrlChips';
import { PrlLevelSelector } from '../PrlLevelSelector';

import styles from './PrlPreference.module.css';

const PrlPreference = (props: any) => {
  const { formatMessage } = useIntl();
  const [updatedSelectedCriteria, setUpdatedSelectedCriteria] = useState<any[]>(
    props.selectedCriteria || []
  );
  const [isLevelsScreen, setIsLevelsScreen] = useState(false);

  useEffect(() => {
    setUpdatedSelectedCriteria(props.selectedCriteria || []);
  }, [props.selectedCriteria]);

  // Reset levels screen whenever the section exits edit mode
  useEffect(() => {
    if (!props.isEditMode) {
      setIsLevelsScreen(false);
    }
  }, [props.isEditMode]);

  const addSelected = (item: PrimeUserRecommendationCriteria) => {
    const newCriteria = [
      ...updatedSelectedCriteria,
      {
        id: item.id,
        name: item.name,
        levels: props.isLevelsEnabled ? [ADVANCED] : undefined,
      },
    ];
    setUpdatedSelectedCriteria(newCriteria);
    props.onSelectionChange?.(newCriteria);
  };

  const removeSelected = (item: PrimeUserRecommendationCriteria) => {
    const newCriteria = updatedSelectedCriteria.filter((criteria: any) => criteria.id !== item.id);
    setUpdatedSelectedCriteria(newCriteria);
    props.onSelectionChange?.(newCriteria);
  };

  const showMobileView = () => window.innerWidth < 768;

  const updateLevel = (event: CustomEvent) => {
    const item = event.detail?.item;
    if (!item?.id) {
      console.error('NO data in custom event : ', JSON.stringify(event.detail));
      return;
    }
    const index = updatedSelectedCriteria.findIndex((criteria: any) => criteria.id === item.id);
    if (index > -1) {
      const newCriteria = [...updatedSelectedCriteria];
      newCriteria[index] = item;
      setUpdatedSelectedCriteria(newCriteria);
      props.onSelectionChange?.(newCriteria);
    }
  };

  const getPrlChips = () => {
    return (
      <div className={styles.prlPCriteriaSection}>
        {(!showMobileView() || !isLevelsScreen) && (
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
        )}
        {props.isLevelsEnabled && (!showMobileView() || isLevelsScreen) && (
          <div className={styles.levelSelectorContainer}>
            <PrlLevelSelector
              options={updatedSelectedCriteria}
              levels={props.levels}
              onChangeHandler={updateLevel}
            />
          </div>
        )}
      </div>
    );
  };

  const getMobileLevelsNavigation = () => {
    if (!showMobileView() || !props.isLevelsEnabled) return null;
    return (
      <div className={styles.updateActionsButton}>
        {!isLevelsScreen ? (
          <button
            className={styles.prlPPrimaryButton}
            onClick={() => setIsLevelsScreen(true)}
            disabled={updatedSelectedCriteria.length === 0}
          >
            {formatMessage({ id: 'prl.next.text', defaultMessage: 'Next' })}
          </button>
        ) : (
          <button className={styles.prlPSecondaryButton} onClick={() => setIsLevelsScreen(false)}>
            {formatMessage({ id: 'alm.author.back.label', defaultMessage: 'Back' })}
          </button>
        )}
      </div>
    );
  };

  if (!props.isEditMode) {
    return (
      <div className={styles.prlPContainer}>
        <div className={styles.prlPHeading}>{props.heading}</div>
        <div className={styles.prlPCriteria}>
          {(props.selectedCriteria || []).map((item: any) => item.name).join(', ')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.prlPContainer}>
      <div className={styles.prlPHeading}>{props.heading}</div>
      {getPrlChips()}
      {getMobileLevelsNavigation()}
    </div>
  );
};
export default PrlPreference;
