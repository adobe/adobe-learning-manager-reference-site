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

/**
 * Subset of the account's filterPanelSetting. The recommendationProduct / recommendationRole flags
 * are the account-level PRL signal available to the admin/author token (unlike prlCriteria, which
 * is only returned in a learner/user context).
 */
public class FilterPanelSetting {

  private Boolean recommendationProduct;
  private Boolean recommendationRole;

  public FilterPanelSetting() {}

  public Boolean getRecommendationProduct() {
    return recommendationProduct;
  }

  public void setRecommendationProduct(Boolean recommendationProduct) {
    this.recommendationProduct = recommendationProduct;
  }

  public Boolean getRecommendationRole() {
    return recommendationRole;
  }

  public void setRecommendationRole(Boolean recommendationRole) {
    this.recommendationRole = recommendationRole;
  }
}
