/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

package com.adobe.learning.core.entity;

import java.util.Collections;
import java.util.List;

/** Entity class representing the account API response from ALM. */
public class AccountResponse {

  private String id;
  private String type;
  private String locale;
  private List<AccountTerminology> accountTerminologies;
  private String recommendationAccountType;
  private PrlCriteria prlCriteria;
  private FilterPanelSetting filterPanelSetting;

  public AccountResponse() {}

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getLocale() {
    return locale;
  }

  public void setLocale(String locale) {
    this.locale = locale;
  }

  public List<AccountTerminology> getAccountTerminologies() {
    return accountTerminologies != null
        ? Collections.unmodifiableList(accountTerminologies)
        : Collections.emptyList();
  }

  public void setAccountTerminologies(List<AccountTerminology> accountTerminologies) {
    this.accountTerminologies =
        accountTerminologies != null
            ? Collections.unmodifiableList(accountTerminologies)
            : Collections.emptyList();
  }

  public String getRecommendationAccountType() {
    return recommendationAccountType;
  }

  public void setRecommendationAccountType(String recommendationAccountType) {
    this.recommendationAccountType = recommendationAccountType;
  }

  public PrlCriteria getPrlCriteria() {
    return prlCriteria;
  }

  public void setPrlCriteria(PrlCriteria prlCriteria) {
    this.prlCriteria = prlCriteria;
  }

  public FilterPanelSetting getFilterPanelSetting() {
    return filterPanelSetting;
  }

  public void setFilterPanelSetting(FilterPanelSetting filterPanelSetting) {
    this.filterPanelSetting = filterPanelSetting;
  }

  /**
   * Determines the effective account type based on prlCriteria and recommendationAccountType. If
   * prlCriteria.enabled is true, returns "PRL". Otherwise, returns the recommendationAccountType
   * value (CPE, CPENEW, or LMS). Returns null if account type cannot be determined.
   */
  public String getEffectiveAccountType() {
    if (prlCriteria != null && Boolean.TRUE.equals(prlCriteria.getEnabled())) {
      return "PRL";
    }
    return recommendationAccountType;
  }

  /**
   * Returns true if the products PRL filter is enabled. Prefers prlCriteria (learner/user context);
   * falls back to filterPanelSetting.recommendationProduct, which is the only PRL signal the
   * admin/author token receives on the account API (used by the catalog dialog render condition).
   */
  public boolean isPrlProductsEnabled() {
    if (prlCriteria != null) {
      return Boolean.TRUE.equals(prlCriteria.getEnabled())
          && prlCriteria.getProducts() != null
          && Boolean.TRUE.equals(prlCriteria.getProducts().getEnabled());
    }
    return filterPanelSetting != null
        && Boolean.TRUE.equals(filterPanelSetting.getRecommendationProduct());
  }

  /**
   * Returns true if the roles PRL filter is enabled. Prefers prlCriteria (learner/user context);
   * falls back to filterPanelSetting.recommendationRole, which is the only PRL signal the
   * admin/author token receives on the account API (used by the catalog dialog render condition).
   */
  public boolean isPrlRolesEnabled() {
    if (prlCriteria != null) {
      return Boolean.TRUE.equals(prlCriteria.getEnabled())
          && prlCriteria.getRoles() != null
          && Boolean.TRUE.equals(prlCriteria.getRoles().getEnabled());
    }
    return filterPanelSetting != null
        && Boolean.TRUE.equals(filterPanelSetting.getRecommendationRole());
  }
}
