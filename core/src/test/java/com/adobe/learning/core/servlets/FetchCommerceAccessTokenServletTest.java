package com.adobe.learning.core.servlets;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

import com.adobe.learning.core.entity.CustomerCommerceEntity;
import com.adobe.learning.core.services.CPTokenService;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.HttpClientBuilderFactoryMock;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * To test complete workflow with valid response, provide valid clientSecret, clientId,
 * refreshToken, token (commerce customer token) and commerceURL
 */
@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class FetchCommerceAccessTokenServletTest {
  private final AemContext ctx = new AemContext();

  private FetchCommerceAccessTokenServlet commerceServlet;

  @Mock private GlobalConfigurationService configService;

  @Mock private CPTokenService tokenService;

  @BeforeEach
  public void setUp() throws Exception {

    commerceServlet = new FetchCommerceAccessTokenServlet();

    JsonObject adminConfigs = getAdminConfigs();
    lenient().when(configService.getAdminConfigs(any(Page.class))).thenReturn(adminConfigs);
    Field configField = FetchCommerceAccessTokenServlet.class.getDeclaredField("configService");
    configField.setAccessible(true);
    configField.set(commerceServlet, configService);
    ctx.registerService(
        GlobalConfigurationService.class,
        configService,
        org.osgi.framework.Constants.SERVICE_RANKING,
        Integer.MAX_VALUE);

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
    Field tokenField = FetchCommerceAccessTokenServlet.class.getDeclaredField("tokenService");
    tokenField.setAccessible(true);
    tokenField.set(commerceServlet, tokenService);
    ctx.registerService(
        CPTokenService.class,
        tokenService,
        org.osgi.framework.Constants.SERVICE_RANKING,
        Integer.MAX_VALUE);

    HttpClientBuilderFactory clientBuilderFactory = new HttpClientBuilderFactoryMock();
    Field tokenField1 =
        FetchCommerceAccessTokenServlet.class.getDeclaredField("clientBuilderFactory");
    tokenField1.setAccessible(true);
    tokenField1.set(commerceServlet, clientBuilderFactory);
    ctx.registerService(HttpClientBuilderFactory.class, clientBuilderFactory);

    ctx.create().page("/content/mypage");
    ctx.create().page("/content/mypage/widgetSelect");
    ctx.currentResource("/content/mypage");

    ctx.load().json("/files/AdminConfigRsrc.json", "/widget/page");
  }

  @Test
  public void testDoGet() {
    // since commerceURL, token, clientId, clientSecret info is invalid,
    // status received in response will be 500.
    ctx.request().addRequestParameter("token", "token");
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    commerceServlet.doGet(ctx.request(), ctx.response());
    assertTrue(500 == ctx.response().getStatus());
  }

  // Due to invalid tokens, app client info present, need to test private method separately.

  @Test
  public void testGetAccessTokenWithExpiry()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[1];
    args[0] = String.class;
    Method method =
        FetchCommerceAccessTokenServlet.class.getDeclaredMethod("getAccessTokenWithExpiry", args);
    method.setAccessible(true);
    ImmutablePair<String, Integer> o =
        (ImmutablePair<String, Integer>)
            method.invoke(
                commerceServlet,
                "{\"access_token\":\"token1234\", \"expires_in\":1000, \"refresh_token\":\"refresh1234\"}");
    assertTrue("token1234".equals(o.getLeft()));
    assertTrue(1000 == o.getRight());
  }

  @Test
  public void testContainValidAccessToken()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[1];
    args[0] = String.class;
    Method method =
        FetchCommerceAccessTokenServlet.class.getDeclaredMethod("containValidAccessToken", args);
    method.setAccessible(true);
    Boolean result =
        (Boolean)
            method.invoke(
                commerceServlet,
                "{\"access_token\":\"token1234\", \"expires_in\":1000, \"refresh_token\":\"refresh1234\"}");
    assertTrue(result);

    result = (Boolean) method.invoke(commerceServlet, "{\"refresh_token\":\"refresh1234\"}");
    assertFalse(result);
  }

  @Test
  public void testCreateALMUser()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[7];
    args[0] = args[1] = args[2] = args[3] = args[4] = args[5] = args[6] = String.class;
    Method method = FetchCommerceAccessTokenServlet.class.getDeclaredMethod("createALMUser", args);
    method.setAccessible(true);
    JsonObject configs = getAdminConfigs();
    Boolean result =
        (Boolean)
            method.invoke(
                commerceServlet,
                configs.get("almBaseURL").getAsString(),
                configs.get("clientId").getAsString(),
                configs.get("clientSecret").getAsString(),
                configs.get("refreshToken").getAsString(),
                "vaishnav@adobetest.com",
                "Praful",
                "vaishnav");
    assertFalse(result);
  }

  @Test
  public void testUserNotPresent()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[1];
    args[0] = String.class;
    Method method = FetchCommerceAccessTokenServlet.class.getDeclaredMethod("userNotPresent", args);
    method.setAccessible(true);
    Boolean result =
        (Boolean)
            method.invoke(
                commerceServlet,
                "{\"source\":{\"info\":\"User not found\"}, \"status\":\"not-found\"}");
    assertTrue(result);

    result =
        (Boolean)
            method.invoke(
                commerceServlet,
                "{\"source\":{\"info\":\"User not present\"}, \"status\":\"not-found\"}");
    assertFalse(result);
  }

  @Test
  public void testGetCustomerFromCommerce()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[2];
    args[0] = args[1] = String.class;
    Method method =
        FetchCommerceAccessTokenServlet.class.getDeclaredMethod("getCustomerFromCommerce", args);
    method.setAccessible(true);
    // token and commerce_url is invalid, so response will be null.
    CustomerCommerceEntity result =
        (CustomerCommerceEntity)
            method.invoke(commerceServlet, "token1234", "https://learningmanagerstage1.adobe.com");
    assertNull(result);
  }

  @Test
  public void testSetAccessTokenCookie()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[7];
    args[0] = SlingHttpServletRequest.class;
    args[1] = SlingHttpServletResponse.class;
    args[2] = args[4] = String.class;
    args[3] = args[5] = Integer.class;
    args[6] = Boolean.class;
    Method method =
        FetchCommerceAccessTokenServlet.class.getDeclaredMethod("setAccessTokenCookie", args);
    method.setAccessible(true);
    method.invoke(
        commerceServlet,
        (SlingHttpServletRequest) ctx.request(),
        (SlingHttpServletResponse) ctx.response(),
        "token1",
        1000,
        "token2",
        1000,
        true);
    int bufferAgeSec = 60;
    assertTrue("alm_cp_token".equals(ctx.response().getCookie("alm_cp_token").getName()));
    assertTrue((1000 - bufferAgeSec) == ctx.response().getCookie("alm_cp_token").getMaxAge());
    assertFalse(ctx.response().getCookie("alm_cp_token").getSecure());
    assertTrue("/".equals(ctx.response().getCookie("alm_cp_token").getPath()));

    assertTrue(
        "alm_commerce_token".equals(ctx.response().getCookie("alm_commerce_token").getName()));
    assertTrue((1000 - bufferAgeSec) == ctx.response().getCookie("alm_commerce_token").getMaxAge());
    assertFalse(ctx.response().getCookie("alm_commerce_token").getSecure());
    assertTrue("/".equals(ctx.response().getCookie("alm_commerce_token").getPath()));

    // age of both cookie should be min of age of two tokens expiry
    method.invoke(
        commerceServlet,
        (SlingHttpServletRequest) ctx.request(),
        (SlingHttpServletResponse) ctx.response(),
        "token1",
        2000,
        "token2",
        3000,
        true);
    assertTrue((2000 - bufferAgeSec) == ctx.response().getCookie("alm_cp_token").getMaxAge());
    assertTrue((2000 - bufferAgeSec) == ctx.response().getCookie("alm_commerce_token").getMaxAge());
  }

  private JsonObject getAdminConfigs() {
    JsonObject adminConfigs = new JsonObject();
    adminConfigs.addProperty("almBaseURL", "https://learningmanagerstage1.adobe.com");
    adminConfigs.addProperty("clientSecret", "xxxxx");
    adminConfigs.addProperty("clientId", "xxxxx");
    adminConfigs.addProperty("refreshToken", "xxxxx");
    adminConfigs.addProperty("commerceURL", "https://learningmanagerstage1.adobe.com");
    adminConfigs.addProperty("customerTokenLifetime", "3600");
    return adminConfigs;
  }
}
