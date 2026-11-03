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

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.adobe.learning.core.services.CPTokenService;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.HttpClientBuilderFactoryMock;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class FetchCpAccessTokenServletTest {
  private final AemContext ctx = new AemContext();

  private FetchCpAccessTokenServlet cpServlet;

  @Mock private GlobalConfigurationService configService;

  @Mock private CPTokenService tokenService;

  @BeforeEach
  public void setUp()
      throws IllegalArgumentException,
          IllegalAccessException,
          NoSuchFieldException,
          SecurityException {
    cpServlet = new FetchCpAccessTokenServlet();

    lenient()
        .when(
            tokenService.fetchLearnerToken(
                any(String.class),
                any(String.class),
                any(String.class),
                any(String.class),
                any(String.class)))
        .thenReturn(
            "{\"access_token\":\"token1234\", \"refresh_token\":\"token5678\", \"expires_in\":3600}");
    lenient()
        .when(
            tokenService.getAccessToken(
                any(String.class), any(String.class), any(String.class), any(String.class)))
        .thenReturn(new ImmutablePair<String, Integer>("token1234", 3600));
    lenient()
        .when(
            tokenService.getAccessTokenFromCode(
                any(String.class), any(String.class), any(String.class), any(String.class)))
        .thenReturn(new ImmutablePair<String, Integer>("token1234", 3600));
    Field tokenField = FetchCpAccessTokenServlet.class.getDeclaredField("tokenService");
    tokenField.setAccessible(true);
    tokenField.set(cpServlet, tokenService);
    ctx.registerService(
        CPTokenService.class,
        tokenService,
        org.osgi.framework.Constants.SERVICE_RANKING,
        Integer.MAX_VALUE);

    HttpClientBuilderFactory clientBuilderFactory = new HttpClientBuilderFactoryMock();
    Field tokenField1 = FetchCpAccessTokenServlet.class.getDeclaredField("clientBuilderFactory");
    tokenField1.setAccessible(true);
    tokenField1.set(cpServlet, clientBuilderFactory);
    ctx.registerService(HttpClientBuilderFactory.class, clientBuilderFactory);

    ctx.create().page("/content/mypage");
    ctx.create().page("/content/mypage/widgetSelect");
    ctx.currentResource("/content/mypage");

    ctx.load().json("/files/AdminConfigRsrc.json", "/widget/page");
  }

  @Test
  public void testDoPostAuthorModeCommerceUsage()
      throws IllegalArgumentException,
          IllegalAccessException,
          NoSuchFieldException,
          SecurityException {
    // Since code, clientId, clientSecret info is invalid, we'll get error in response
    // status received in response will be 500.
    setUpCommerceUsage();
    ctx.request().addRequestParameter("mode", "author");
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    cpServlet.doPost(ctx.request(), ctx.response());
    assertTrue(ctx.response().getStatus() == 500);
  }

  @Test
  public void testDoPostAuthorModeNonCommerceUsage()
      throws IllegalArgumentException,
          IllegalAccessException,
          NoSuchFieldException,
          SecurityException {
    setUpNonCommerceUsage();
    ctx.request().addRequestParameter("mode", "author");
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    cpServlet.doPost(ctx.request(), ctx.response());
    assertTrue("alm_cp_token".equals(ctx.response().getCookie("alm_cp_token").getName()));
  }

  @Test
  public void testDoPostPublishMode()
      throws IllegalArgumentException,
          IllegalAccessException,
          NoSuchFieldException,
          SecurityException {
    setUpNonCommerceUsage();
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    ctx.request().addRequestParameter("code", "xxxxx");
    cpServlet.doPost(ctx.request(), ctx.response());
    assertTrue("alm_cp_token".equals(ctx.response().getCookie("alm_cp_token").getName()));
  }

  @Test
  public void testDoPostAuthorModeEsUsageWithAdminRefreshToken() throws Exception {
    // ES uses ./adminRefreshToken and exchanges it for a learner token, like commerce.
    // Email lookup fails against the mock HTTP client, so the response is 500 as in commerce.
    JsonObject adminConfigs = getEsAdminConfigs();
    adminConfigs.addProperty("useAdminRefreshToken", "true");
    setUpConfigService(adminConfigs);
    ctx.request().addRequestParameter("mode", "author");
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    cpServlet.doPost(ctx.request(), ctx.response());
    verify(tokenService)
        .getAccessToken(any(String.class), any(String.class), any(String.class), eq("admin-rt"));
    assertTrue(ctx.response().getStatus() == 500);
  }

  @Test
  public void testDoPostAuthorModeEsUsageWithoutAdminRefreshToken() throws Exception {
    setUpConfigService(getEsAdminConfigs());
    ctx.request().addRequestParameter("mode", "author");
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    cpServlet.doPost(ctx.request(), ctx.response());
    verify(tokenService)
        .getAccessToken(any(String.class), any(String.class), any(String.class), eq("es-rt"));
    verify(tokenService, never())
        .fetchLearnerToken(
            any(String.class),
            any(String.class),
            any(String.class),
            any(String.class),
            any(String.class));
    assertTrue("alm_cp_token".equals(ctx.response().getCookie("alm_cp_token").getName()));
  }

  private JsonObject getEsAdminConfigs() {
    JsonObject adminConfigs = getAdminConfigs();
    adminConfigs.addProperty("usageType", "aem-es");
    adminConfigs.addProperty("authorRefreshToken", "es-rt");
    adminConfigs.addProperty("adminRefreshToken", "admin-rt");
    return adminConfigs;
  }

  private JsonObject getAdminConfigs() {
    JsonObject adminConfigs = new JsonObject();
    adminConfigs.addProperty("almBaseURL", "https://learningmanagerstage1.adobe.com");
    adminConfigs.addProperty("clientSecret", "xxxxx");
    adminConfigs.addProperty("clientId", "xxxxx");
    adminConfigs.addProperty("refreshToken", "xxxxx");
    adminConfigs.addProperty("commerceURL", "https://learningmanagerstage1.adobe.com");
    adminConfigs.addProperty("customerTokenLifetime", "3600");
    adminConfigs.addProperty("authorRefreshToken", "xxxxxx");
    adminConfigs.addProperty("adminRefreshToken", "xxxxxx");
    adminConfigs.addProperty("useAdminRefreshToken", "false");
    return adminConfigs;
  }

  private void setUpCommerceUsage()
      throws IllegalArgumentException,
          IllegalAccessException,
          NoSuchFieldException,
          SecurityException {
    JsonObject adminConfigs = getAdminConfigs();
    adminConfigs.addProperty("usageType", "aem-commerce");
    setUpConfigService(adminConfigs);
  }

  private void setUpNonCommerceUsage()
      throws IllegalArgumentException,
          IllegalAccessException,
          NoSuchFieldException,
          SecurityException {
    JsonObject adminConfigs = getAdminConfigs();
    adminConfigs.addProperty("usageType", "aem-sites");
    setUpConfigService(adminConfigs);
  }

  private void setUpConfigService(JsonObject adminConfigs)
      throws NoSuchFieldException,
          SecurityException,
          IllegalArgumentException,
          IllegalAccessException {
    lenient().when(configService.getAdminConfigs(any(Page.class))).thenReturn(adminConfigs);
    Field configField = FetchCpAccessTokenServlet.class.getDeclaredField("configService");
    configField.setAccessible(true);
    configField.set(cpServlet, configService);
    ctx.registerService(
        GlobalConfigurationService.class,
        configService,
        org.osgi.framework.Constants.SERVICE_RANKING,
        Integer.MAX_VALUE);
  }
}
