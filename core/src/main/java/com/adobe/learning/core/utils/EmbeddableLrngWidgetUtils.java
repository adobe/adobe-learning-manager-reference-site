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

import static java.lang.System.currentTimeMillis;

import com.adobe.learning.core.entity.EmbeddableLrngWidgetConfig;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.apache.http.HttpStatus;
import org.apache.http.ParseException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class EmbeddableLrngWidgetUtils {
  private static Logger LOGGER = LoggerFactory.getLogger(EmbeddableLrngWidgetUtils.class);

  private static long UPDATE_EVERY_MILLI = 86400000;

  private static long lastUpdated = 0;
  private static String widgetsConfigResponse = "";

  public static List<EmbeddableLrngWidgetConfig> getEmbeddableWidgetsConfig(
      String hostName, HttpClientBuilderFactory clientBuilderFactory) {
    String url = hostName + Constants.CPUrl.CONFIG_URL;
    String configs = getWidgetsConfig(url, clientBuilderFactory);
    LOGGER.trace(
        "EmbeddableWidgetConfigUtils getEmbeddableWidgetsConfig:: Configs from CP {}", configs);
    if (configs != null && configs.length() > 0) {
      Gson gson = new Gson();
      return Arrays.asList(gson.fromJson(configs, EmbeddableLrngWidgetConfig[].class));
    }
    return null;
  }

  public static JsonObject getWidgetConfig(final Map<String, Object> configMap) {
    JsonObject widgetConfigObject = new JsonObject();

    for (Entry<String, Object> e : configMap.entrySet()) {
      String[] keys = e.getKey().split("\\.");

      if (keys.length == 1) {
        addPropertyWithType(widgetConfigObject, keys[0], e.getValue());

      } else {
        JsonObject parentObject = widgetConfigObject;
        for (int i = 0; i < keys.length; i++) {
          String key = keys[i];
          JsonElement element = parentObject.get(key);
          if (element == null) {
            if (i == keys.length - 1) {
              addPropertyWithType(parentObject, key, e.getValue());

            } else {
              JsonObject jObject = new JsonObject();
              parentObject.add(key, jObject);
              parentObject = parentObject.get(key).getAsJsonObject();
            }
          } else {
            JsonObject obj = element.getAsJsonObject();
            if (i == keys.length - 1) {
              addPropertyWithType(obj, key, e.getValue());

            } else {
              parentObject = obj;
            }
          }
        }
      }
    }

    return widgetConfigObject;
  }

  private static String getWidgetsConfig(
      String url, HttpClientBuilderFactory clientBuilderFactory) {
    long currentTime = currentTimeMillis();
    LOGGER.trace(
        "EmbeddableWidgetConfigUtils getWidgetsConfig:: lastUpdated {} currentTime {} ",
        lastUpdated,
        currentTime);
    if (currentTime > lastUpdated) {
      HttpGet getCall = new HttpGet(url);

      try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
          CloseableHttpResponse response = httpClient.execute(getCall)) {
        if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
          String configResponse = EntityUtils.toString(response.getEntity());
          setLastUpdated(currentTime + UPDATE_EVERY_MILLI);
          setResponse(configResponse);
          return configResponse;
        }
      } catch (ParseException pe) {
        LOGGER.error("ParseException while fetching widget config", pe);
      } catch (IOException ioe) {
        LOGGER.error("IOException while fetching widget config", ioe);
      }
    }
    return widgetsConfigResponse;
  }

  private static void addPropertyWithType(JsonObject obj, String key, Object value) {
    String objectType = value.getClass().getSimpleName();
    if ("Boolean".equalsIgnoreCase(objectType)) {
      obj.addProperty(key, (Boolean) value);
    } else {
      obj.addProperty(key, value.toString());
    }
  }

  private static void setLastUpdated(long timestamp) {
    lastUpdated = timestamp;
  }

  private static void setResponse(String response) {
    widgetsConfigResponse = response;
  }
}
