package com.adobe.learning.core.utils;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.google.gson.JsonObject;
import org.junit.jupiter.api.Test;

public class GlobalConfigurationUtilsTest {

  @Test
  public void testFilterAdminConfigs() {
    JsonObject globalConfig = getAdminConfigs();
    GlobalConfigurationUtils.filterAdminConfigs(globalConfig);
    assertNull(globalConfig.get("clientSecret"));
    assertNull(globalConfig.get("authorRefreshToken"));
    assertNull(globalConfig.get("refreshToken"));
    assertNotNull(globalConfig.get("almBaseURL"));
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
    return adminConfigs;
  }
}
