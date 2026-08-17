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

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

public class AccountResponseTest {

  @Test
  public void testGetEffectiveAccountType() {
    AccountResponse response = new AccountResponse();

    // PRL enabled → "PRL"
    PrlCriteria prlEnabled = new PrlCriteria();
    prlEnabled.setEnabled(true);
    response.setPrlCriteria(prlEnabled);
    response.setRecommendationAccountType("CPE");
    assertEquals("PRL", response.getEffectiveAccountType());

    // PRL disabled → falls back to recommendationAccountType
    PrlCriteria prlDisabled = new PrlCriteria();
    prlDisabled.setEnabled(false);
    response.setPrlCriteria(prlDisabled);
    assertEquals("CPE", response.getEffectiveAccountType());

    // PRL null → falls back to recommendationAccountType
    response.setPrlCriteria(null);
    assertEquals("CPE", response.getEffectiveAccountType());

    // Both PRL null + recommendationAccountType null → null
    response.setRecommendationAccountType(null);
    assertNull(response.getEffectiveAccountType());
  }

  @Test
  public void testIsPrlProductsEnabled() {
    AccountResponse response = new AccountResponse();

    // prlCriteria null → false
    assertFalse(response.isPrlProductsEnabled());

    // prlCriteria.enabled=false → false
    PrlCriteria prl = new PrlCriteria();
    prl.setEnabled(false);
    response.setPrlCriteria(prl);
    assertFalse(response.isPrlProductsEnabled());

    // prlCriteria enabled but products null → false
    prl.setEnabled(true);
    assertFalse(response.isPrlProductsEnabled());

    // products exists but enabled=false → false
    PrlCriteriaAttributes products = new PrlCriteriaAttributes();
    products.setEnabled(false);
    prl.setProducts(products);
    assertFalse(response.isPrlProductsEnabled());

    // All conditions true → true
    products.setEnabled(true);
    assertTrue(response.isPrlProductsEnabled());
  }

  @Test
  public void testIsPrlRolesEnabled() {
    AccountResponse response = new AccountResponse();

    // prlCriteria null → false
    assertFalse(response.isPrlRolesEnabled());

    PrlCriteria prl = new PrlCriteria();
    prl.setEnabled(true);
    response.setPrlCriteria(prl);

    // roles null → false
    assertFalse(response.isPrlRolesEnabled());

    // roles.enabled=false → false
    PrlCriteriaAttributes roles = new PrlCriteriaAttributes();
    roles.setEnabled(false);
    prl.setRoles(roles);
    assertFalse(response.isPrlRolesEnabled());

    // All conditions true → true
    roles.setEnabled(true);
    assertTrue(response.isPrlRolesEnabled());
  }

  @Test
  public void testIsPrlEnabled_FilterPanelSettingFallback() {
    // When prlCriteria is absent (admin/author token never receives it), the account API still
    // returns filterPanelSetting.recommendationProduct/Role — that drives the catalog dialog.
    AccountResponse response = new AccountResponse();

    FilterPanelSetting fps = new FilterPanelSetting();
    fps.setRecommendationProduct(true);
    fps.setRecommendationRole(false);
    response.setFilterPanelSetting(fps);

    assertTrue(response.isPrlProductsEnabled());
    assertFalse(response.isPrlRolesEnabled());

    fps.setRecommendationProduct(false);
    fps.setRecommendationRole(true);
    assertFalse(response.isPrlProductsEnabled());
    assertTrue(response.isPrlRolesEnabled());

    // prlCriteria, when present, takes precedence over filterPanelSetting
    fps.setRecommendationProduct(true);
    fps.setRecommendationRole(true);
    PrlCriteria prl = new PrlCriteria();
    prl.setEnabled(false);
    response.setPrlCriteria(prl);
    assertFalse(response.isPrlProductsEnabled());
    assertFalse(response.isPrlRolesEnabled());
  }

  @Test
  public void testAccountTerminologiesDefensiveCopying() {
    AccountResponse response = new AccountResponse();

    // Unset → empty list (not null)
    assertNotNull(response.getAccountTerminologies());
    assertTrue(response.getAccountTerminologies().isEmpty());

    // Set with null → returns empty list
    response.setAccountTerminologies(null);
    assertNotNull(response.getAccountTerminologies());
    assertTrue(response.getAccountTerminologies().isEmpty());

    // Set with real list → returned list is unmodifiable
    List<AccountTerminology> terminologies = new ArrayList<>();
    AccountTerminology term = new AccountTerminology();
    term.setEntityType("course");
    term.setName("Course");
    terminologies.add(term);
    response.setAccountTerminologies(terminologies);

    assertEquals(1, response.getAccountTerminologies().size());
    assertEquals("course", response.getAccountTerminologies().get(0).getEntityType());
    assertThrows(
        UnsupportedOperationException.class,
        () -> response.getAccountTerminologies().add(new AccountTerminology()));
  }
}
