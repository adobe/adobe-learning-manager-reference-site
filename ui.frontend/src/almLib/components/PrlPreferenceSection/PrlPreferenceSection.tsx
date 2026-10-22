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
import { GetTranslation } from '../../utils/translationService';
import { getALMAccount, isEmptyJson } from '../../utils/global';
import {
  RECOMMENDATION_PRODUCTS,
  RECOMMENDATION_ROLES,
  USER_RECOMMENDATION_PREFERENCE,
} from '../../utils/constants';
import PrlPreference from './PrlPreference/PrlPreference';
import { useRecommendations } from '../../hooks/profile/useRecommendations';
import { PRLCriteria } from '../../models';
import styles from './PrlPreferenceSection.module.css';
import { ALMLoader } from '../Common/ALMLoader';
import { ALMDialog, ALMDialogHeader, ALMDialogFooter } from '../ALMDialog';
import { useDialog } from '../../contextProviders/ALMDialogContextProvider';

const DIALOG_ID = 'alm-prl-section-dialog';

const PrlPreferenceSection = () => {
  const {
    items,
    products,
    roles,
    levels,
    getUserRecommendationPreferences,
    getRecommendationsForType,
    getRecommendationLevels,
    saveUserRecommedations,
  } = useRecommendations();

  const { isOpen, openDialog, closeDialog } = useDialog();

  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [prlCriteria, setPrlCriteria] = useState({} as PRLCriteria);
  const [userRecommendationPreference, setUserRecommendationPreference] = useState(items);
  const [showLoader, setShowLoader] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const account = await getALMAccount();
      if (account) {
        if (account.prlCriteria?.enabled) {
          setPrlCriteria(account.prlCriteria);
        }
      }
    };
    getAccount();
  }, []);

  useEffect(() => {
    if (!isEmptyJson(prlCriteria)) {
      getData();
    }
  }, [prlCriteria]);

  useEffect(() => {
    setUserRecommendationPreference(items);
    setSelectedProducts(items?.products || []);
    setSelectedRoles(items?.roles || []);
  }, [items]);

  const getData = async () => {
    await getUserRecommendationPreferences();
    if (prlCriteria?.products?.enabled) {
      getRecommendationsForType(RECOMMENDATION_PRODUCTS);
    }
    if (prlCriteria?.roles?.enabled) {
      getRecommendationsForType(RECOMMENDATION_ROLES);
    }
    if (prlCriteria.roles?.levelsEnabled || prlCriteria.products?.levelsEnabled) {
      getRecommendationLevels();
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    if (isMobile) openDialog(DIALOG_ID);
  };

  const handleCancel = () => {
    setSelectedProducts(userRecommendationPreference?.products || []);
    setSelectedRoles(userRecommendationPreference?.roles || []);
    setIsEditMode(false);
    if (isMobile) closeDialog(DIALOG_ID);
  };

  const isSaveEnabled = () => {
    const productsEnabled = prlCriteria?.products?.enabled;
    const rolesEnabled = prlCriteria?.roles?.enabled;
    if (productsEnabled && rolesEnabled) {
      return selectedProducts.length > 0 && selectedRoles.length > 0;
    }
    if (productsEnabled) return selectedProducts.length > 0;
    if (rolesEnabled) return selectedRoles.length > 0;
    return false;
  };

  const handleSave = () => {
    if (!userRecommendationPreference?.id) return;
    const requestObj = {
      id: userRecommendationPreference.id,
      type: userRecommendationPreference.type,
      attributes: {
        products: selectedProducts,
        roles: selectedRoles,
      },
    };
    setIsSaving(true);
    setShowLoader(true);
    saveUserRecommedations(requestObj)
      .then(() => {
        setUserRecommendationPreference({
          ...userRecommendationPreference,
          products: requestObj.attributes.products,
          roles: requestObj.attributes.roles,
        });
        setIsEditMode(false);
        if (isMobile) closeDialog(DIALOG_ID);
      })
      .catch((err: any) => {
        console.log('Error while saving preference: ', err);
      })
      .finally(() => {
        setIsSaving(false);
        setShowLoader(false);
      });
  };

  const renderProductPreference = (isProductCriteriaEnabled: boolean) => {
    if (isProductCriteriaEnabled) {
      return (
        <PrlPreference
          heading={GetTranslation('text.preferedProducts', true)}
          isLevelsEnabled={prlCriteria.products?.levelsEnabled}
          allCriteria={products}
          selectedCriteria={selectedProducts}
          levels={levels}
          isEditMode={isEditMode}
          onSelectionChange={setSelectedProducts}
        />
      );
    }
  };

  const renderRolePreference = (isRolesCriteriaEnabled: boolean) => {
    if (isRolesCriteriaEnabled) {
      return (
        <PrlPreference
          heading={GetTranslation('text.preferedRoles', true)}
          isLevelsEnabled={prlCriteria.roles?.levelsEnabled}
          allCriteria={roles}
          selectedCriteria={selectedRoles}
          levels={levels}
          isEditMode={isEditMode}
          onSelectionChange={setSelectedRoles}
        />
      );
    }
  };

  const getHeading = () => {
    if (prlCriteria?.products?.enabled && prlCriteria?.roles?.enabled) {
      return GetTranslation('alm.text.productsAndRoles', true);
    }
    if (prlCriteria?.products?.enabled) {
      return GetTranslation('alm.prl.products.text', true);
    }
    if (prlCriteria?.roles?.enabled) {
      return GetTranslation('alm.prl.roles.text', true);
    }
    return '';
  };

  const isRecommendationEnabled = () => {
    return !isEmptyJson(prlCriteria) && items.type === USER_RECOMMENDATION_PREFERENCE;
  };

  const renderActionButtons = () => (
    <div className={styles.prlPsHeadingActions}>
      <button className={styles.prlPsTextButton} onClick={handleCancel}>
        {GetTranslation('alm.text.cancel', true)}
      </button>
      <button
        className={styles.prlPsSaveButton}
        onClick={handleSave}
        disabled={!isSaveEnabled() || isSaving}
      >
        {GetTranslation('alm.text.save', true)}
      </button>
    </div>
  );

  return (
    <>
      {isRecommendationEnabled() && (
        <div className={styles.prlPsContainer}>
          {showLoader && <ALMLoader classes={styles.primeLoaderWrapper} />}

          {/* Mobile: full-screen dialog for editing */}
          {isMobile && isOpen(DIALOG_ID) && (
            <ALMDialog id={DIALOG_ID} overlayClose={false} borderRadius="top">
              <ALMDialogHeader>
                <div className={styles.prlPsHeading}>{getHeading()}</div>
              </ALMDialogHeader>
              {renderProductPreference(prlCriteria?.products?.enabled)}
              {renderRolePreference(prlCriteria?.roles?.enabled)}
              <ALMDialogFooter>{renderActionButtons()}</ALMDialogFooter>
            </ALMDialog>
          )}

          {/* Heading row — always visible */}
          <div className={styles.prlPsHeadingRow}>
            <div
              role="heading"
              aria-level={1}
              className={styles.prlPsHeading}
              automation-id="skills-heading"
            >
              {getHeading()}
            </div>
            {isEditMode ? (
              !isMobile && renderActionButtons()
            ) : (
              <button className={styles.prlPsTextButton} onClick={handleEdit}>
                {GetTranslation('alm.text.edit', true)}
              </button>
            )}
          </div>

          <div className={styles.prlPsSubHeading} automation-id="skills-sub-heading">
            {GetTranslation('alm.prl.preferenceSubHeading')}
          </div>

          {/* Desktop: always shown. Mobile: view mode only (edit mode uses dialog). */}
          {(!isMobile || !isEditMode) && (
            <>
              {renderProductPreference(prlCriteria?.products?.enabled)}
              {renderRolePreference(prlCriteria?.roles?.enabled)}
            </>
          )}
        </div>
      )}
    </>
  );
};
export default PrlPreferenceSection;
