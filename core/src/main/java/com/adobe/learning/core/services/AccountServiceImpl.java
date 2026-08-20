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

import com.adobe.learning.core.entity.AccountResponse;
import com.adobe.learning.core.entity.AccountTerminology;
import com.adobe.learning.core.entity.FilterPanelSetting;
import com.adobe.learning.core.entity.PrlCriteria;
import com.adobe.learning.core.utils.Constants;
import com.adobe.learning.core.utils.RequestUtils;
import com.day.cq.wcm.api.Page;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.HttpStatus;
import org.apache.http.ParseException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.http.util.EntityUtils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Implementation of AccountService for fetching ALM account details. */
@Component(service = AccountService.class)
public class AccountServiceImpl implements AccountService {

  private static final Logger LOGGER = LoggerFactory.getLogger(AccountServiceImpl.class);

  private static final String ACCOUNT_API_PATH = "/primeapi/v2/account";

  private static final String NOMENCLATURE_PREFIX = "nomenclature.";
  private static final String SINGULAR_SUFFIX = ".singular";
  private static final String PLURAL_SUFFIX = ".plural";
  private static final String DEFAULT_LOCALE = "en-US";

  @Reference private GlobalConfigurationService configService;

  @Reference private CPTokenService tokenService;

  @Reference private HttpClientBuilderFactory clientBuilderFactory;

  @Override
  public AccountResponse getAccountDetails(Page currentPage) {
    if (currentPage == null) {
      LOGGER.error("CPPrime::AccountService:: Current page is null");
      return null;
    }

    try {
      JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);
      if (jsonConfigs == null) {
        LOGGER.error("CPPrime::AccountService:: Unable to get admin configs");
        return null;
      }

      String almURL = jsonConfigs.get(Constants.Config.ALM_BASE_URL).getAsString();
      String clientId = jsonConfigs.get(Constants.Config.CLIENT_ID).getAsString();
      String clientSecret = jsonConfigs.get(Constants.Config.CLIENT_SECRET).getAsString();

      String refreshToken = getRefreshToken(jsonConfigs);
      if (StringUtils.isBlank(refreshToken)) {
        LOGGER.error("CPPrime::AccountService:: Unable to get refresh token");
        return null;
      }

      Pair<String, Integer> accessTokenResp =
          tokenService.getAccessToken(almURL, clientId, clientSecret, refreshToken);

      if (accessTokenResp == null || StringUtils.isBlank(accessTokenResp.getLeft())) {
        LOGGER.error("CPPrime::AccountService:: Unable to get access token");
        return null;
      }

      return getAccountDetails(almURL, accessTokenResp.getLeft());

    } catch (Exception e) {
      LOGGER.error("CPPrime::AccountService:: Exception while fetching account details", e);
      return null;
    }
  }

  @Override
  public AccountResponse getAccountDetails(String almURL, String accessToken) {
    if (StringUtils.isAnyBlank(almURL, accessToken)) {
      LOGGER.error(
          "CPPrime::AccountService:: Invalid parameters - almURL: {}, accessToken: {}",
          almURL,
          StringUtils.isNotBlank(accessToken) ? "[REDACTED]" : "null");
      return null;
    }

    String accountApiUrl = almURL + ACCOUNT_API_PATH;
    HttpGet getCall = new HttpGet(accountApiUrl);
    getCall.setHeader("Authorization", "oauth " + accessToken);

    try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
        CloseableHttpResponse response = httpClient.execute(getCall)) {

      if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
        String responseStr = EntityUtils.toString(response.getEntity());
        return parseAccountResponse(responseStr);
      } else {
        LOGGER.error(
            "CPPrime::AccountService:: Error response from account API - Status: {}",
            response.getStatusLine().getStatusCode());
      }
    } catch (ParseException | IOException e) {
      LOGGER.error(
          "CPPrime::AccountService:: Exception in http call while fetching account details", e);
    }

    return null;
  }

  @Override
  public Map<String, String> buildNomenclatureMap(AccountResponse accountResponse) {
    Map<String, String> nomenclatureMap = new HashMap<>();

    if (accountResponse == null) {
      LOGGER.debug("CPPrime::AccountService:: Account response is null, returning empty map");
      return nomenclatureMap;
    }

    List<AccountTerminology> terminologies = accountResponse.getAccountTerminologies();
    if (terminologies == null || terminologies.isEmpty()) {
      LOGGER.debug("CPPrime::AccountService:: No terminologies found, returning empty map");
      return nomenclatureMap;
    }

    String accountLocale = accountResponse.getLocale();

    // Group terminologies by entity type
    Map<String, List<AccountTerminology>> terminologiesByEntityType = new HashMap<>();
    for (AccountTerminology terminology : terminologies) {
      String entityType = terminology.getEntityType();
      if (entityType != null) {
        terminologiesByEntityType
            .computeIfAbsent(entityType, k -> new ArrayList<>())
            .add(terminology);
      }
    }

    // For each entity type, find the best matching terminology based on locale priority
    for (Map.Entry<String, List<AccountTerminology>> entry : terminologiesByEntityType.entrySet()) {
      String entityType = entry.getKey();
      List<AccountTerminology> entityTerminologies = entry.getValue();

      AccountTerminology selectedTerminology =
          selectTerminologyByLocale(entityTerminologies, accountLocale);

      if (selectedTerminology != null) {
        String singularKey = NOMENCLATURE_PREFIX + entityType + SINGULAR_SUFFIX;
        String pluralKey = NOMENCLATURE_PREFIX + entityType + PLURAL_SUFFIX;

        if (selectedTerminology.getName() != null) {
          nomenclatureMap.put(singularKey, selectedTerminology.getName());
        }
        if (selectedTerminology.getPluralName() != null) {
          nomenclatureMap.put(pluralKey, selectedTerminology.getPluralName());
        }
      }
    }

    return nomenclatureMap;
  }

  /**
   * Selects the best matching terminology based on locale priority.
   *
   * <p>Priority:
   *
   * <ol>
   *   <li>Account locale (if present)
   *   <li>en-US locale
   *   <li>First available terminology
   * </ol>
   *
   * @param terminologies List of terminologies for an entity type
   * @param accountLocale The account's locale
   * @return The best matching terminology or null if list is empty
   */
  private AccountTerminology selectTerminologyByLocale(
      List<AccountTerminology> terminologies, String accountLocale) {
    if (terminologies == null || terminologies.isEmpty()) {
      return null;
    }

    AccountTerminology accountLocaleMatch = null;
    AccountTerminology defaultLocaleMatch = null;
    AccountTerminology firstMatch = terminologies.get(0);

    for (AccountTerminology terminology : terminologies) {
      String terminologyLocale = terminology.getLocale();

      // Check for account locale match
      if (StringUtils.isNotBlank(accountLocale)
          && accountLocale.equals(terminologyLocale)
          && accountLocaleMatch == null) {
        accountLocaleMatch = terminology;
      }

      // Check for default match
      if (DEFAULT_LOCALE.equals(terminologyLocale) && defaultLocaleMatch == null) {
        defaultLocaleMatch = terminology;
      }
    }

    // Return based on priority
    if (accountLocaleMatch != null) {
      return accountLocaleMatch;
    }
    if (defaultLocaleMatch != null) {
      return defaultLocaleMatch;
    }
    return firstMatch;
  }

  /**
   * Parses the JSON response string into an AccountResponse object.
   *
   * @param responseStr The JSON response string from the API
   * @return AccountResponse object or null if parsing fails
   */
  private AccountResponse parseAccountResponse(String responseStr) {
    if (StringUtils.isBlank(responseStr)) {
      LOGGER.error("CPPrime::AccountService:: Empty response from account API");
      return null;
    }

    try {
      Gson gson = new Gson();
      JsonObject jsonResponse = gson.fromJson(responseStr, JsonObject.class);

      if (!jsonResponse.has("data")) {
        LOGGER.error("CPPrime::AccountService:: Response does not contain 'data' field");
        return null;
      }

      JsonObject dataObj = jsonResponse.getAsJsonObject("data");
      AccountResponse accountResponse = new AccountResponse();

      // Set id and type
      if (dataObj.has("id")) {
        accountResponse.setId(dataObj.get("id").getAsString());
      }
      if (dataObj.has("type")) {
        accountResponse.setType(dataObj.get("type").getAsString());
      }

      // Parse attributes
      if (dataObj.has("attributes")) {
        JsonObject attributesObj = dataObj.getAsJsonObject("attributes");

        if (attributesObj.has("locale")) {
          accountResponse.setLocale(attributesObj.get("locale").getAsString());
        }

        if (attributesObj.has("accountTerminologies")) {
          List<AccountTerminology> terminologies = parseAccountTerminologies(attributesObj);
          accountResponse.setAccountTerminologies(terminologies);
        }

        if (attributesObj.has("recommendationAccountType")
            && !attributesObj.get("recommendationAccountType").isJsonNull()) {
          accountResponse.setRecommendationAccountType(
              attributesObj.get("recommendationAccountType").getAsString());
        }

        if (attributesObj.has("prlCriteria") && !attributesObj.get("prlCriteria").isJsonNull()) {
          PrlCriteria prlCriteria =
              gson.fromJson(attributesObj.getAsJsonObject("prlCriteria"), PrlCriteria.class);
          accountResponse.setPrlCriteria(prlCriteria);
        }

        if (attributesObj.has("filterPanelSetting")
            && !attributesObj.get("filterPanelSetting").isJsonNull()) {
          FilterPanelSetting filterPanelSetting =
              gson.fromJson(
                  attributesObj.getAsJsonObject("filterPanelSetting"), FilterPanelSetting.class);
          accountResponse.setFilterPanelSetting(filterPanelSetting);
        }
      }

      return accountResponse;

    } catch (Exception e) {
      LOGGER.error("CPPrime::AccountService:: Exception while parsing account response", e);
      return null;
    }
  }

  /**
   * Parses the accountTerminologies array from the attributes object.
   *
   * @param attributesObj The attributes JSON object
   * @return List of AccountTerminology objects
   */
  private List<AccountTerminology> parseAccountTerminologies(JsonObject attributesObj) {
    List<AccountTerminology> terminologies = new ArrayList<>();
    Gson gson = new Gson();

    JsonArray terminologiesArray = attributesObj.getAsJsonArray("accountTerminologies");
    for (JsonElement element : terminologiesArray) {
      AccountTerminology terminology = gson.fromJson(element, AccountTerminology.class);
      terminologies.add(terminology);
    }

    return terminologies;
  }

  /**
   * Gets the appropriate refresh token from the configuration.
   *
   * @param jsonConfigs The admin configuration JSON object
   * @return The refresh token string
   */
  private String getRefreshToken(JsonObject jsonConfigs) {
    String usageType = jsonConfigs.get(Constants.Config.USAGE_TYPE_NAME).getAsString();

    if (Constants.Config.SITES_USAGE.equals(usageType)) {
      // Check if we should use admin refresh token
      boolean useAdminRefreshToken =
          jsonConfigs.get(Constants.Config.USE_ADMIN_RT_TO_LEARNER_AT) != null
              && jsonConfigs.get(Constants.Config.USE_ADMIN_RT_TO_LEARNER_AT).getAsBoolean();

      if (useAdminRefreshToken) {
        return jsonConfigs.get(Constants.Config.ADMIN_REFRESH_TOKEN).getAsString();
      } else {
        return jsonConfigs.get(Constants.Config.SITES_AUTHOR_REFRESH_TOKEN_NAME).getAsString();
      }
    } else {
      return jsonConfigs.get(Constants.Config.COMMERCE_ADMIN_REFRESH_TOKEN).getAsString();
    }
  }
}
