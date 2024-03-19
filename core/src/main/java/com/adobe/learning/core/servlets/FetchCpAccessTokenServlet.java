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

package com.adobe.learning.core.servlets;

import com.adobe.learning.core.services.CPTokenService;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.adobe.learning.core.utils.RequestUtils;
import com.day.cq.wcm.api.Page;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.HttpStatus;
import org.apache.http.ParseException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(
    service = Servlet.class,
    property = {
      "sling.servlet.methods=POST",
      "sling.servlet.resourceTypes=" + FetchCpAccessTokenServlet.RESOURCE_TYPE,
      "sling.servlet.selectors=" + "cpAccessToken",
      "sling.servlet.extensions=html"
    })
public class FetchCpAccessTokenServlet extends SlingAllMethodsServlet {

  private static final long serialVersionUID = 492465267362222317L;

  static final String RESOURCE_TYPE = "sling/servlet/default";

  private static final Logger LOGGER = LoggerFactory.getLogger(FetchCpAccessTokenServlet.class);

  private static final String AUTHOR_MODE = "author";

  private static final Integer TOKEN_BUFFER_SECS = 60;

  @Reference private transient GlobalConfigurationService configService;

  @Reference private transient CPTokenService tokenService;

  @Reference private transient HttpClientBuilderFactory clientBuilderFactory;

  @Override
  protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) {
    try {
      String pagePath = request.getParameter("pagePath");
      Page currentPage = getCurrentPage(request, pagePath);
      if (currentPage == null) {
        LOGGER.error("CPPrime:: Unable to get current page");
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }

      JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);
      String almURL = jsonConfigs.get(Constants.Config.ALM_BASE_URL).getAsString(),
          clientId = jsonConfigs.get(Constants.Config.CLIENT_ID).getAsString(),
          clientSecret = jsonConfigs.get(Constants.Config.CLIENT_SECRET).getAsString();

      boolean storeTokenInCookie =
          jsonConfigs.get(Constants.Config.NOT_STORE_TOKEN_IN_COOKIE) != null
              ? "false"
                  .equals(jsonConfigs.get(Constants.Config.NOT_STORE_TOKEN_IN_COOKIE).getAsString())
              : true;
      boolean useAdminRefreshToken =
          jsonConfigs.get(Constants.Config.USE_ADMIN_RT_TO_LEARNER_AT) != null
              && jsonConfigs.get(Constants.Config.USE_ADMIN_RT_TO_LEARNER_AT).getAsBoolean();
      String mode = request.getParameter("mode");

      if (AUTHOR_MODE.equals(mode)) {
        String refreshToken = "";
        String usageType = jsonConfigs.get(Constants.Config.USAGE_TYPE_NAME).getAsString();
        if (Constants.Config.SITES_USAGE.equals(usageType)) {
          refreshToken =
              useAdminRefreshToken
                  ? jsonConfigs.get(Constants.Config.ADMIN_REFRESH_TOKEN).getAsString()
                  : jsonConfigs.get(Constants.Config.SITES_AUTHOR_REFRESH_TOKEN_NAME).getAsString();
        } else {
          refreshToken =
              jsonConfigs.get(Constants.Config.COMMERCE_ADMIN_REFRESH_TOKEN).getAsString();
        }

        Pair<String, Integer> accessTokenResp =
            tokenService.getAccessToken(almURL, clientId, clientSecret, refreshToken);

        if (Constants.Config.COMMERCE_USAGE.equals(usageType) || useAdminRefreshToken) {
          String email = getALMUserEmail(almURL, accessTokenResp.getLeft());
          if (StringUtils.isBlank(email)) {
            LOGGER.error("CPPrime:: Exception in fetching ALM User");
            response.sendError(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Exception in fetching ALM User");
            return;
          }
          String learnerTokenResponse =
              tokenService.fetchLearnerToken(almURL, clientId, clientSecret, refreshToken, email);
          if (!containValidAccessToken(learnerTokenResponse)) {
            LOGGER.error("CPPrime:: Exception in fetching Learner Token");
            response.sendError(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Exception in fetching Learner Token");
            return;
          } else {
            JsonObject jsonObject = new Gson().fromJson(learnerTokenResponse, JsonObject.class);
            accessTokenResp =
                new ImmutablePair<String, Integer>(
                    jsonObject.get("access_token").getAsString(),
                    jsonObject.get("expires_in").getAsInt());
          }
        }

        if (accessTokenResp == null) {
          LOGGER.error("CPPrime:: Exception in fetching access_token");
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          return;
        }
        setAccessTokenCookie(
            request,
            response,
            accessTokenResp.getLeft(),
            accessTokenResp.getRight(),
            storeTokenInCookie);
      } else {
        String code = request.getParameter("code");

        Pair<String, Integer> accessTokenResp =
            tokenService.getAccessTokenFromCode(almURL, clientId, clientSecret, code);

        if (accessTokenResp == null) {
          LOGGER.error("CPPrime:: Exception in fetching access_token");
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          return;
        }

        setAccessTokenCookie(
            request,
            response,
            accessTokenResp.getLeft(),
            accessTokenResp.getRight(),
            storeTokenInCookie);
      }
    } catch (IOException ioe) {
      LOGGER.error("CPPrime:: IOException while fetching access_token", ioe);
    }
  }

  private boolean containValidAccessToken(String accessTokenResp) {
    if (StringUtils.isNotBlank(accessTokenResp)
        && accessTokenResp.contains("access_token")
        && accessTokenResp.contains("expires_in")) return true;
    else return false;
  }

  private String getALMUserEmail(String almURL, String accessToken) {
    String getUserURL = almURL + "/primeapi/v2/user";
    HttpGet getCall = new HttpGet(getUserURL);
    getCall.setHeader("Authorization", "oauth " + accessToken);

    try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
        CloseableHttpResponse response = httpClient.execute(getCall)) {
      if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
        String configResponse = EntityUtils.toString(response.getEntity());
        JsonObject jsonObj = new Gson().fromJson(configResponse, JsonObject.class);
        return jsonObj
            .getAsJsonObject("data")
            .getAsJsonObject("attributes")
            .get("email")
            .getAsString();
      }
    } catch (ParseException | IOException e) {
      LOGGER.error(
          "CPPrime::FetchCommerceAccessTokenServlet::createALMUser Exception in http call while creating ALM User",
          e);
    }
    return null;
  }

  private void setAccessTokenCookie(
      SlingHttpServletRequest request,
      SlingHttpServletResponse response,
      String accessToken,
      Integer maxAge,
      boolean storeTokenInCookie) {
    final Cookie tokenCookie = new Cookie(Constants.Config.ACCESS_TOKEN_COOKIE_NAME, accessToken);
    tokenCookie.setSecure(request.isSecure());
    tokenCookie.setMaxAge(maxAge - TOKEN_BUFFER_SECS);
    tokenCookie.setPath("/");
    if (!storeTokenInCookie) {
      tokenCookie.setHttpOnly(true);
    }
    response.addCookie(tokenCookie);
  }

  private Page getCurrentPage(SlingHttpServletRequest request, String pagePath) {
    Resource pageRsc = request.getResourceResolver().resolve(pagePath);
    Page page = null;
    if (pageRsc != null) {
      page = pageRsc.adaptTo(Page.class);
    }
    return page;
  }
}
