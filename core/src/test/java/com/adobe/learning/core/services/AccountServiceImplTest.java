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
package com.adobe.learning.core.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

import com.adobe.learning.core.entity.AccountResponse;
import com.adobe.learning.core.entity.AccountTerminology;
import com.adobe.learning.core.utils.HttpClientBuilderFactoryMock;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class AccountServiceImplTest {

  private final AemContext ctx = new AemContext();

  private AccountServiceImpl accountService;

  @Mock private GlobalConfigurationService configService;

  @Mock private CPTokenService tokenService;

  @Mock private Page currentPage;

  @BeforeEach
  public void setUp() throws Exception {
    accountService = new AccountServiceImpl();

    HttpClientBuilderFactory clientBuilderFactory = new HttpClientBuilderFactoryMock();

    Field configField = AccountServiceImpl.class.getDeclaredField("configService");
    configField.setAccessible(true);
    configField.set(accountService, configService);

    Field tokenField = AccountServiceImpl.class.getDeclaredField("tokenService");
    tokenField.setAccessible(true);
    tokenField.set(accountService, tokenService);

    Field clientField = AccountServiceImpl.class.getDeclaredField("clientBuilderFactory");
    clientField.setAccessible(true);
    clientField.set(accountService, clientBuilderFactory);

    ctx.registerService(HttpClientBuilderFactory.class, clientBuilderFactory);
  }

  // --- buildNomenclatureMap tests ---

  @Test
  public void testBuildNomenclatureMap_NullAndEmpty() {
    // null response → empty map
    Map<String, String> result = accountService.buildNomenclatureMap(null);
    assertTrue(result.isEmpty());

    // empty terminologies → empty map
    AccountResponse response = new AccountResponse();
    result = accountService.buildNomenclatureMap(response);
    assertTrue(result.isEmpty());
  }

  @Test
  public void testBuildNomenclatureMap_LocalePriority() {
    // Account locale fr-FR preferred over en-US when both exist
    AccountResponse response = new AccountResponse();
    response.setLocale("fr-FR");

    List<AccountTerminology> terminologies = new ArrayList<>();
    terminologies.add(createTerminology("course", "en-US", "Course", "Courses"));
    terminologies.add(createTerminology("course", "fr-FR", "Cours", "Les Cours"));
    response.setAccountTerminologies(terminologies);

    Map<String, String> result = accountService.buildNomenclatureMap(response);
    assertEquals("Cours", result.get("nomenclature.course.singular"));
    assertEquals("Les Cours", result.get("nomenclature.course.plural"));

    // No account locale match → falls back to en-US
    response.setLocale("ja-JP");
    result = accountService.buildNomenclatureMap(response);
    assertEquals("Course", result.get("nomenclature.course.singular"));

    // No en-US match → falls back to first available
    AccountResponse response2 = new AccountResponse();
    response2.setLocale("ja-JP");
    List<AccountTerminology> noEnUs = new ArrayList<>();
    noEnUs.add(createTerminology("course", "de-DE", "Kurs", "Kurse"));
    noEnUs.add(createTerminology("course", "fr-FR", "Cours", "Les Cours"));
    response2.setAccountTerminologies(noEnUs);

    result = accountService.buildNomenclatureMap(response2);
    assertEquals("Kurs", result.get("nomenclature.course.singular"));
  }

  @Test
  public void testBuildNomenclatureMap_MultipleEntityTypes() {
    AccountResponse response = new AccountResponse();
    response.setLocale("en-US");

    List<AccountTerminology> terminologies = new ArrayList<>();
    terminologies.add(createTerminology("course", "en-US", "Course", "Courses"));
    terminologies.add(
        createTerminology("learningProgram", "en-US", "Learning Path", "Learning Paths"));
    // null entityType → should be skipped
    terminologies.add(createTerminology(null, "en-US", "Orphan", "Orphans"));
    // null name → no singular key added
    terminologies.add(createTerminology("jobAid", "en-US", null, "Job Aids"));
    response.setAccountTerminologies(terminologies);

    Map<String, String> result = accountService.buildNomenclatureMap(response);

    // Multiple entity types → correct keys for each
    assertEquals("Course", result.get("nomenclature.course.singular"));
    assertEquals("Courses", result.get("nomenclature.course.plural"));
    assertEquals("Learning Path", result.get("nomenclature.learningProgram.singular"));
    assertEquals("Learning Paths", result.get("nomenclature.learningProgram.plural"));

    // null entityType skipped
    assertFalse(result.containsKey("nomenclature.null.singular"));

    // null name → no singular key, but plural key exists
    assertFalse(result.containsKey("nomenclature.jobAid.singular"));
    assertEquals("Job Aids", result.get("nomenclature.jobAid.plural"));
  }

  // --- getAccountDetails(Page) tests ---

  @Test
  public void testGetAccountDetails_NullGuards() {
    // null page → null
    assertNull(accountService.getAccountDetails((Page) null));

    // configService returns null → null
    lenient().when(configService.getAdminConfigs(any(Page.class))).thenReturn(null);
    assertNull(accountService.getAccountDetails(currentPage));

    // tokenService returns null → null
    JsonObject configs = createMinimalConfig();
    lenient().when(configService.getAdminConfigs(any(Page.class))).thenReturn(configs);
    lenient().when(tokenService.getAccessToken(any(), any(), any(), any())).thenReturn(null);
    assertNull(accountService.getAccountDetails(currentPage));
  }

  // --- parseAccountResponse tests (private) ---

  @Test
  public void testParseAccountResponse_ValidJson() throws Exception {
    String json = loadResourceAsString("/files/accountApiResponse.json");

    Method method =
        AccountServiceImpl.class.getDeclaredMethod("parseAccountResponse", String.class);
    method.setAccessible(true);
    AccountResponse result = (AccountResponse) method.invoke(accountService, json);

    assertNotNull(result);
    assertEquals("12345", result.getId());
    assertEquals("account", result.getType());
    assertEquals("en-US", result.getLocale());
    assertEquals("CPE", result.getRecommendationAccountType());
    assertEquals(3, result.getAccountTerminologies().size());
    assertNotNull(result.getPrlCriteria());
    assertTrue(result.getPrlCriteria().getEnabled());
    assertTrue(result.isPrlProductsEnabled());
    assertFalse(result.isPrlRolesEnabled());
  }

  @Test
  public void testParseAccountResponse_InvalidInputs() throws Exception {
    Method method =
        AccountServiceImpl.class.getDeclaredMethod("parseAccountResponse", String.class);
    method.setAccessible(true);

    // Blank input → null
    assertNull(method.invoke(accountService, ""));
    assertNull(method.invoke(accountService, (String) null));

    // Missing "data" field → null
    assertNull(method.invoke(accountService, "{\"error\": \"not found\"}"));

    // JsonNull prlCriteria → null in result
    String jsonNullPrl =
        "{\"data\":{\"id\":\"1\",\"type\":\"account\",\"attributes\":"
            + "{\"locale\":\"en-US\",\"prlCriteria\":null,\"recommendationAccountType\":null}}}";
    AccountResponse result = (AccountResponse) method.invoke(accountService, jsonNullPrl);
    assertNotNull(result);
    assertNull(result.getPrlCriteria());
    assertNull(result.getRecommendationAccountType());
  }

  @Test
  public void testParseAccountResponse_FilterPanelSettingFallback() throws Exception {
    Method method =
        AccountServiceImpl.class.getDeclaredMethod("parseAccountResponse", String.class);
    method.setAccessible(true);

    // CPENEW account: no prlCriteria, but filterPanelSetting has the PRL flags (real 69745 shape)
    String json =
        "{\"data\":{\"id\":\"69745\",\"type\":\"account\",\"attributes\":{"
            + "\"locale\":\"en-US\",\"recommendationAccountType\":\"CPENEW\","
            + "\"filterPanelSetting\":{\"recommendationProduct\":true,\"recommendationRole\":true}"
            + "}}}";
    AccountResponse result = (AccountResponse) method.invoke(accountService, json);

    assertNotNull(result);
    assertNull(result.getPrlCriteria());
    assertNotNull(result.getFilterPanelSetting());
    assertTrue(result.getFilterPanelSetting().getRecommendationProduct());
    assertTrue(result.getFilterPanelSetting().getRecommendationRole());
    assertTrue(result.isPrlProductsEnabled());
    assertTrue(result.isPrlRolesEnabled());

    // recommendationProduct/Role false → both gated off
    String jsonFalse =
        "{\"data\":{\"id\":\"11043\",\"type\":\"account\",\"attributes\":{\"locale\":\"en-US\","
            + "\"filterPanelSetting\":{\"recommendationProduct\":false,\"recommendationRole\":false}"
            + "}}}";
    AccountResponse resultFalse = (AccountResponse) method.invoke(accountService, jsonFalse);
    assertFalse(resultFalse.isPrlProductsEnabled());
    assertFalse(resultFalse.isPrlRolesEnabled());
  }

  // --- getRefreshToken tests (private) ---

  @Test
  public void testGetRefreshToken_AllBranches() throws Exception {
    Method method = AccountServiceImpl.class.getDeclaredMethod("getRefreshToken", JsonObject.class);
    method.setAccessible(true);

    // Sites usage + adminRT=true → returns adminRefreshToken
    JsonObject sitesAdminConfig = createMinimalConfig();
    sitesAdminConfig.addProperty("useAdminRefreshToken", true);
    String result = (String) method.invoke(accountService, sitesAdminConfig);
    assertEquals("admin-rt-value", result);

    // Sites usage + adminRT=false → returns authorRefreshToken
    JsonObject sitesAuthorConfig = createMinimalConfig();
    sitesAuthorConfig.addProperty("useAdminRefreshToken", false);
    result = (String) method.invoke(accountService, sitesAuthorConfig);
    assertEquals("author-rt-value", result);

    // Commerce usage → returns refreshToken
    JsonObject commerceConfig = createMinimalConfig();
    commerceConfig.addProperty("usageType", "aem-commerce");
    result = (String) method.invoke(accountService, commerceConfig);
    assertEquals("commerce-rt-value", result);
  }

  // --- Helper methods ---

  private AccountTerminology createTerminology(
      String entityType, String locale, String name, String pluralName) {
    AccountTerminology term = new AccountTerminology();
    term.setEntityType(entityType);
    term.setLocale(locale);
    term.setName(name);
    term.setPluralName(pluralName);
    return term;
  }

  private JsonObject createMinimalConfig() {
    JsonObject config = new JsonObject();
    config.addProperty("almBaseURL", "https://learningmanager.adobe.com");
    config.addProperty("clientId", "test-client-id");
    config.addProperty("clientSecret", "test-client-secret");
    config.addProperty("usageType", "aem-sites");
    config.addProperty("authorRefreshToken", "author-rt-value");
    config.addProperty("adminRefreshToken", "admin-rt-value");
    config.addProperty("refreshToken", "commerce-rt-value");
    return config;
  }

  private String loadResourceAsString(String resourcePath) throws Exception {
    try (InputStream is = getClass().getResourceAsStream(resourcePath);
        BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
      StringBuilder sb = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        sb.append(line);
      }
      return sb.toString();
    }
  }
}
