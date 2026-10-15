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
    assertNull(globalConfig.get("adminRefreshToken"));
    assertNotNull(globalConfig.get("almBaseURL"));
    assertNotNull(globalConfig.get("useAdminRefreshToken"));
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
    adminConfigs.addProperty("useAdminRefreshToken", "true");
    return adminConfigs;
  }
}
