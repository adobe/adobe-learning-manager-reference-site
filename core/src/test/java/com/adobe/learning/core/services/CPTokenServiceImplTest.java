package com.adobe.learning.core.services;

import static org.junit.Assert.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.adobe.learning.core.utils.HttpClientBuilderFactoryMock;
import io.wcm.testing.mock.aem.junit5.AemContext;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class CPTokenServiceImplTest {

  private CPTokenServiceImpl cpTokenService;

  private String almURL, clientId, clientSecret, refreshToken, code, email;

  private final AemContext ctx = new AemContext();

  @BeforeEach
  public void setUp() throws Exception {
    cpTokenService = new CPTokenServiceImpl();
    almURL = "https://learningmanagerstage1.adobe.com";
    clientId = clientSecret = refreshToken = code = "xxxxxxxxxx";
    email = "praful@adobetest.com";

    HttpClientBuilderFactory clientBuilderFactory = new HttpClientBuilderFactoryMock();
    Field tokenField = CPTokenServiceImpl.class.getDeclaredField("clientBuilderFactory");
    tokenField.setAccessible(true);
    tokenField.set(cpTokenService, clientBuilderFactory);
    ctx.registerService(HttpClientBuilderFactory.class, clientBuilderFactory);
  }

  @Test
  public void testGetAccessTokenFromCode() {
    Pair<String, Integer> token =
        cpTokenService.getAccessTokenFromCode(almURL, clientId, clientSecret, code);
    assertNull(token);
  }

  @Test
  public void testGetAccessToken() {
    Pair<String, Integer> token =
        cpTokenService.getAccessToken(almURL, clientId, clientSecret, refreshToken);
    assertNull(token);
  }

  @Test
  public void testFetchLearnerToken() {
    String response =
        cpTokenService.fetchLearnerToken(almURL, clientId, clientSecret, refreshToken, email);
    assertTrue(response.contains("UNAUTHORIZED") || response.contains("BAD_REQUEST"));
  }

  @Test
  public void testGetTokenAndExpiry()
      throws NoSuchMethodException, SecurityException, IllegalAccessException,
          IllegalArgumentException, InvocationTargetException {
    Class[] args = new Class[1];
    args[0] = String.class;
    Method method = CPTokenServiceImpl.class.getDeclaredMethod("getTokenAndExpiry", args);
    method.setAccessible(true);
    ImmutablePair<String, Integer> o =
        (ImmutablePair<String, Integer>)
            method.invoke(
                cpTokenService,
                "{\"access_token\":\"token1234\", \"expires_in\":1000, \"refresh_token\":\"refresh1234\"}");
    assertTrue("token1234".equals(o.getLeft()));
    assertTrue(1000 == o.getRight());
  }
}
