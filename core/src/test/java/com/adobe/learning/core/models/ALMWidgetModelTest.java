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
package com.adobe.learning.core.models;

import static org.junit.jupiter.api.Assertions.*;

import com.adobe.learning.core.entity.ALMWidgetConfig;
import com.adobe.learning.core.entity.ALMWidgetOptions;
import com.adobe.learning.core.services.ALMWidgetConfigServiceImpl;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(AemContextExtension.class)
public class ALMWidgetModelTest {

  private final AemContext ctx = new AemContext(ResourceResolverType.JCR_MOCK);

  private ALMWidgetModel model;

  @BeforeEach
  public void setUp() throws Exception {
    ctx.load().json("/files/almWidgetModelTest.json", "/content/alm");
    // Create a model instance using the constructor (without triggering init)
    model = new ALMWidgetModel(ctx.request());
  }

  // --- flattenPropertyName tests ---

  @Test
  public void testFlattenPropertyName() throws Exception {
    Method method = ALMWidgetModel.class.getDeclaredMethod("flattenPropertyName", String.class);
    method.setAccessible(true);

    // Dotted path → last segment
    assertEquals("showFilters", method.invoke(model, "widgetConfig.attributes.showFilters"));
    // Two-level
    assertEquals("primaryColor", method.invoke(model, "theme.primaryColor"));
    // No dot → returns as-is
    assertEquals("noDot", method.invoke(model, "noDot"));
    // Null → empty string
    assertEquals("", method.invoke(model, (String) null));
  }

  // --- parseDefaultValue tests ---

  @Test
  public void testParseDefaultValue() throws Exception {
    Method method =
        ALMWidgetModel.class.getDeclaredMethod("parseDefaultValue", String.class, String.class);
    method.setAccessible(true);

    // Boolean type
    assertEquals(Boolean.TRUE, method.invoke(model, "true", "boolean"));
    assertEquals(Boolean.FALSE, method.invoke(model, "false", "boolean"));

    // Number type - valid integer
    assertEquals(42, method.invoke(model, "42", "number"));
    // Number type - invalid falls back to string
    assertEquals("abc", method.invoke(model, "abc", "number"));

    // Integer type alias
    assertEquals(10, method.invoke(model, "10", "integer"));

    // String type → returns string as-is
    assertEquals("hello", method.invoke(model, "hello", "string"));

    // Null type → returns string as-is
    assertEquals("value", method.invoke(model, "value", (String) null));
  }

  // --- generateWidgetId tests ---

  @Test
  public void testGenerateWidgetId() throws Exception {
    Method method = ALMWidgetModel.class.getDeclaredMethod("generateWidgetId");
    method.setAccessible(true);

    // With stored widgetId → returns stored value
    ctx.currentResource("/content/alm/widgetModelWithId");
    Resource resourceWithId = ctx.currentResource();
    setPrivateField(model, "resource", resourceWithId);
    setPrivateField(model, "properties", resourceWithId.getValueMap());

    String storedResult = (String) method.invoke(model);
    assertEquals("alm-widget-123456", storedResult);

    // Without stored widgetId → generates "alm-widget-NNNNNN" format
    ctx.currentResource("/content/alm/widgetModelNoSelection");
    Resource resourceNoId = ctx.currentResource();
    setPrivateField(model, "resource", resourceNoId);
    setPrivateField(model, "properties", resourceNoId.getValueMap());

    String generatedResult = (String) method.invoke(model);
    assertTrue(generatedResult.startsWith("alm-widget-"));
    // The numeric part should be 6 digits
    String numericPart = generatedResult.substring("alm-widget-".length());
    assertEquals(6, numericPart.length());
    // Should be parseable as integer
    assertDoesNotThrow(() -> Integer.parseInt(numericPart));
  }

  // --- hasWidgetConfig tests ---

  @Test
  public void testHasWidgetConfig() throws Exception {
    // Empty ref → false (default value is "")
    assertFalse(model.hasWidgetConfig());

    // Set ref → true
    setPrivateField(model, "selectedWidgetRef", "com.adobe.learning.mylearning");
    assertTrue(model.hasWidgetConfig());

    // Null ref → false
    setPrivateField(model, "selectedWidgetRef", null);
    assertFalse(model.hasWidgetConfig());
  }

  // --- getWidgetConfig tests ---

  @Test
  public void testGetWidgetConfigRoundTripsSpecialCharacters() throws Exception {
    String skillName = "Dunkin' Food Safety* \"Q&A\" <b>, level\\1";
    String title = "Dunkin's widget";

    ALMWidgetOptions sourceDetails = new ALMWidgetOptions();
    sourceDetails.setRef("widgetConfig.attributes.sourceDetails");
    sourceDetails.setType("string");
    ALMWidgetOptions titleOption = new ALMWidgetOptions();
    titleOption.setRef("widgetConfig.attributes.title");
    titleOption.setType("string");
    ALMWidgetConfig widgetConfig = new ALMWidgetConfig();
    widgetConfig.setOptions(Arrays.asList(sourceDetails, titleOption));

    Map<String, Object> valueMap = new HashMap<>();
    valueMap.put("widgetConfig.attributes.sourceDetails", skillName);
    valueMap.put("widgetConfig.attributes.title", title);

    setPrivateField(model, "widgetId", "alm-widget-123456");
    Method method =
        ALMWidgetModel.class.getDeclaredMethod(
            "getWidgetConfig", Map.class, String.class, ALMWidgetConfig.class);
    method.setAccessible(true);

    String json = (String) method.invoke(model, valueMap, "com.adobe.learning.test", widgetConfig);

    JsonObject parsed = JsonParser.parseString(json).getAsJsonObject();
    JsonObject params = parsed.getAsJsonObject("params");
    assertEquals("alm-widget-123456", parsed.get("widgetId").getAsString());
    assertEquals(skillName, params.get("sourceDetails").getAsString());
    assertEquals(title, params.get("title").getAsString());
  }

  @Test
  public void testGetWidgetConfigIsValidJsonForEveryWidget() throws Exception {
    String nasty = "O'Neil \"Q&A\" <b>, a\\b";
    List<ALMWidgetConfig> widgets = new ALMWidgetConfigServiceImpl().getWidgetConfigs();
    assertFalse(widgets.isEmpty());

    Method method =
        ALMWidgetModel.class.getDeclaredMethod(
            "getWidgetConfig", Map.class, String.class, ALMWidgetConfig.class);
    method.setAccessible(true);
    setPrivateField(model, "widgetId", "alm-widget-123456");

    for (ALMWidgetConfig widget : widgets) {
      // Defaults only: nothing saved by the author yet
      String defaultsJson = (String) method.invoke(model, new HashMap<>(), widget.getRef(), widget);
      JsonObject defaults = JsonParser.parseString(defaultsJson).getAsJsonObject();
      assertEquals(widget.getRef(), defaults.get("widgetRef").getAsString(), widget.getRef());

      // Every text option saved with special characters
      Map<String, Object> saved = new HashMap<>();
      List<String> textKeys = new ArrayList<>();
      for (ALMWidgetOptions option : widget.getOptions()) {
        if (!"boolean".equalsIgnoreCase(option.getType())) {
          saved.put(option.getRef(), nasty);
          textKeys.add(option.getRef().substring(option.getRef().lastIndexOf('.') + 1));
        }
      }
      String json = (String) method.invoke(model, saved, widget.getRef(), widget);
      JsonObject params = JsonParser.parseString(json).getAsJsonObject().getAsJsonObject("params");
      for (String key : textKeys) {
        assertEquals(nasty, params.get(key).getAsString(), widget.getRef() + " / " + key);
      }
    }
  }

  private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
    Field field = target.getClass().getDeclaredField(fieldName);
    field.setAccessible(true);
    field.set(target, value);
  }
}
