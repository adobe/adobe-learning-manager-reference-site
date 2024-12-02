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
import { GetTranslation } from "../../utils/translationService";
import { getALMAccount, isEmptyJson } from "../../utils/global";
import {
  RECOMMENDATION_PRODUCTS,
  RECOMMENDATION_ROLES,
  USER_RECOMMENDATION_PREFERENCE,
} from "../../utils/constants";
import PrlPreference from "./PrlPreference/PrlPreference";
import { useRecommendations } from "../../hooks/profile/useRecommendations";
import { PRLCriteria } from "../../models";
import styles from "./PrlPreferenceSection.module.css";

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

  const [isSavingObj, setIsSavingObj] = useState({} as any);
  const [prlCriteria, setPrlCriteria] = useState({} as PRLCriteria);
  const [userRecommendationPreference, setUserRecommendationPreference] = useState(items);

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

  const updatePreference = (criteria: string, data: any) => {
    const requestObj = {
      id: userRecommendationPreference.id!,
      type: userRecommendationPreference.type,
      attributes: {
        roles: userRecommendationPreference.roles,
        products: userRecommendationPreference.products,
        [criteria]: data.detail.criteria,
      },
    };
    setIsSavingObj({ ...isSavingObj, [criteria]: true });
    saveUserRecommedations(requestObj)
      .then(() => {
        userRecommendationPreference.roles = requestObj.attributes.roles;
        userRecommendationPreference.products = requestObj.attributes.products;
      })
      .catch((err: any) => {
        console.log("Error while saving preference: ", err);
      })
      .finally(() => {
        setIsSavingObj({ ...isSavingObj, [criteria]: false });
      });
  };

  const renderProductPreference = (isProductCriteriaEnabled: boolean) => {
    if (isProductCriteriaEnabled) {
      return (
        <PrlPreference
          heading={GetTranslation("alm.text.preferedProducts", true)}
          isLevelsEnabled={prlCriteria.products?.levelsEnabled}
          allCriteria={products}
          isSaving={isSavingObj["products"]}
          selectedCriteria={userRecommendationPreference.products}
          levels={levels}
          onUpdate={(data: any) => updatePreference("products", data)}
        />
      );
    }
  };

  const renderRolePreference = (isRolesCriteriaEnabled: boolean) => {
    if (isRolesCriteriaEnabled) {
      return (
        <PrlPreference
          heading={GetTranslation("alm.text.preferedRoles", true)}
          isLevelsEnabled={prlCriteria.roles?.levelsEnabled}
          allCriteria={roles}
          isSaving={isSavingObj["roles"]}
          selectedCriteria={userRecommendationPreference.roles}
          levels={levels}
          onUpdate={(data: any) => updatePreference("roles", data)}
        />
      );
    }
  };

  const getHeading = () => {
    if (prlCriteria?.products?.enabled && prlCriteria?.roles?.enabled) {
      return GetTranslation("alm.text.productsAndRoles", true);
    }
    if (prlCriteria?.products?.enabled) {
      return GetTranslation("alm.prl.products.text", true);
    }
    if (prlCriteria?.roles?.enabled) {
      return GetTranslation("alm.prl.roles.text", true);
    }
    return "";
  };

  const isRecommendationEnabled = () => {
    return !isEmptyJson(prlCriteria) && items.type === USER_RECOMMENDATION_PREFERENCE;
  };

  return (
    <>
      {isRecommendationEnabled() && (
        <div className={styles.prlPsContainer}>
          <div
            role="heading"
            aria-level={1}
            className={styles.prlPsHeading}
            automation-id="skills-heading"
          >
            {getHeading()}
          </div>
          <div className={styles.prlPsSubHeading} automation-id="skills-sub-heading">
            {GetTranslation("alm.prl.preferenceSubHeading")}
          </div>

          {renderProductPreference(prlCriteria?.products?.enabled)}
          {renderRolePreference(prlCriteria?.roles?.enabled)}
        </div>
      )}
    </>
  );
};
export default PrlPreferenceSection;
