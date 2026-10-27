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

import com.adobe.learning.core.entity.ALMWidgetConfig;
import com.adobe.learning.core.entity.ALMWidgetOptions;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ALMWidgetConfigServiceImplTest {

  private ALMWidgetConfigServiceImpl service;

  @BeforeEach
  public void setUp() {
    service = new ALMWidgetConfigServiceImpl();
    service.activate();
  }

  @Test
  public void testActivateLoadsConfigs() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();
    assertNotNull(configs);
    assertFalse(configs.isEmpty());
  }

  @Test
  public void testGetWidgetConfigsReturnsUnmodifiableList() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();
    assertThrows(UnsupportedOperationException.class, () -> configs.add(new ALMWidgetConfig()));
  }

  @Test
  public void testAllWidgetsHaveRequiredFields() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();
    for (ALMWidgetConfig config : configs) {
      assertNotNull(config.getName(), "Widget name should not be null");
      assertNotNull(config.getRef(), "Widget ref should not be null");
      assertNotNull(config.getType(), "Widget type should not be null");
      assertNotNull(config.getOptions(), "Widget options should not be null");
    }
  }

  @Test
  public void testWidgetTypesPresent() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();
    List<String> types =
        configs.stream().map(ALMWidgetConfig::getType).distinct().collect(Collectors.toList());
    assertTrue(types.contains("widget"), "Should contain 'widget' type configs");
  }

  @Test
  public void testAllowedAccountTypesOnRestrictedWidgets() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    // Trending recommendations is restricted to CPE
    ALMWidgetConfig trending =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.lostrip.trending".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(trending, "Trending recommendations widget should exist");
    assertNotNull(trending.getAllowedAccountTypes());
    assertTrue(trending.getAllowedAccountTypes().contains("CPE"));
    assertFalse(trending.getAllowedAccountTypes().contains("LMS"));

    // Recommendations is restricted to LMS, CPENEW, PRL
    ALMWidgetConfig recommendations =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.recommendations".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(recommendations, "Recommendations widget should exist");
    assertNotNull(recommendations.getAllowedAccountTypes());
    assertTrue(recommendations.getAllowedAccountTypes().contains("LMS"));
    assertTrue(recommendations.getAllowedAccountTypes().contains("CPENEW"));
    assertTrue(recommendations.getAllowedAccountTypes().contains("PRL"));
  }

  @Test
  public void testUnrestrictedWidgetsHaveNoAllowedAccountTypes() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    // Calendar widget has no account type restriction
    ALMWidgetConfig calendar =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.calendar".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(calendar, "Calendar widget should exist");
    assertNull(calendar.getAllowedAccountTypes());
  }

  private ALMWidgetOptions coursesAndPathsOption(String attribute) {
    ALMWidgetConfig coursesAndPaths =
        service.getWidgetConfigs().stream()
            .filter(c -> "com.adobe.captivateprime.courses.and.paths".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(coursesAndPaths, "Courses and Paths widget should exist");
    return coursesAndPaths.getOptions().stream()
        .filter(o -> ("widgetConfig.attributes." + attribute).equals(o.getRef()))
        .findFirst()
        .orElse(null);
  }

  @Test
  public void testCoursesAndPathsSourceDetailsIsMultiSelect() {
    ALMWidgetOptions sourceDetails = coursesAndPathsOption("sourceDetails");
    assertNotNull(sourceDetails);
    assertTrue(sourceDetails.getMultiSelect());
    assertFalse(sourceDetails.getDraggable());
  }

  @Test
  public void testCoursesAndPathsFilterOptions() {
    ALMWidgetOptions learnerState = coursesAndPathsOption("learnerState");
    assertNotNull(learnerState);
    assertEquals("autocomplete", learnerState.getType());
    assertTrue(learnerState.getMultiSelect());
    assertTrue(learnerState.getDefaultValue() == null || learnerState.getDefaultValue().isEmpty());

    ALMWidgetOptions tagName = coursesAndPathsOption("tagName");
    assertNotNull(tagName);
    assertTrue(tagName.getMultiSelect());
    assertEquals("tagName", tagName.getDataSource());

    ALMWidgetOptions partitionOrder = coursesAndPathsOption("preferredSortPartitionOrder");
    assertNotNull(partitionOrder);
    assertTrue(partitionOrder.getMultiSelect());
    assertTrue(partitionOrder.getDraggable(), "Order matters for sort on progress");
  }

  @Test
  public void testCoursesAndPathsSortDefaultKeepsExistingBehaviour() {
    ALMWidgetOptions sort = coursesAndPathsOption("sort");
    assertNotNull(sort);
    assertEquals("select", sort.getType());
    assertEquals("-recommendationScore", sort.getDefaultValue());
    List<String> values =
        sort.getOptions().stream().map(o -> o.get("value")).collect(Collectors.toList());
    assertEquals(14, values.size());
    assertEquals("-recommendationScore", values.get(0));
    for (String legacy :
        new String[] {
          "name", "date", "dateCreated", "dateEnrolled", "-name", "-date", "dueDate",
          "-dateCreated", "-dateEnrolled", "effectiveness", "rating", "-rating", "progress"
        }) {
      assertTrue(values.contains(legacy), "Missing sort option " + legacy);
    }
  }

  @Test
  public void testWidgetOptionsTypes() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    // Category widget has string, boolean, select, radio, and autocomplete option types
    ALMWidgetConfig category =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.category".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(category);

    List<String> optionTypes =
        category.getOptions().stream().map(ALMWidgetOptions::getType).collect(Collectors.toList());
    assertTrue(optionTypes.contains("string"));
    assertTrue(optionTypes.contains("boolean"));
    assertTrue(optionTypes.contains("select"));
    assertTrue(optionTypes.contains("radio"));
    assertTrue(optionTypes.contains("autocomplete"));
  }

  @Test
  public void testSelectOptionWithFeatureFlag() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    ALMWidgetConfig category =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.category".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(category);

    // Find the "Category source" select option
    ALMWidgetOptions sourceOption =
        category.getOptions().stream()
            .filter(o -> "select".equals(o.getType()))
            .findFirst()
            .orElse(null);
    assertNotNull(sourceOption);

    List<Map<String, String>> options = sourceOption.getOptions();
    assertNotNull(options);
    assertFalse(options.isEmpty());

    // PRODUCTS option requires prlProductsEnabled feature
    Map<String, String> productsOption =
        options.stream().filter(o -> "PRODUCTS".equals(o.get("value"))).findFirst().orElse(null);
    assertNotNull(productsOption);
    assertEquals("prlProductsEnabled", productsOption.get("requiresFeature"));

    // CATALOGS option has no feature restriction
    Map<String, String> catalogsOption =
        options.stream().filter(o -> "CATALOGS".equals(o.get("value"))).findFirst().orElse(null);
    assertNotNull(catalogsOption);
    assertNull(catalogsOption.get("requiresFeature"));
  }

  @Test
  public void testAutocompleteOptionProperties() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    ALMWidgetConfig category =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.category".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(category);

    ALMWidgetOptions autocompleteOption =
        category.getOptions().stream()
            .filter(o -> "autocomplete".equals(o.getType()))
            .findFirst()
            .orElse(null);
    assertNotNull(autocompleteOption);
    assertEquals("category", autocompleteOption.getDataSource());
    assertTrue(autocompleteOption.getMultiSelect());
    assertNotNull(autocompleteOption.getEmptyText());
  }

  @Test
  public void testHiddenOption() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    // Leaderboard has a hidden "disableLinks" option
    ALMWidgetConfig leaderboard =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.leaderboard".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(leaderboard);

    ALMWidgetOptions hiddenOption =
        leaderboard.getOptions().stream()
            .filter(ALMWidgetOptions::getHidden)
            .findFirst()
            .orElse(null);
    assertNotNull(hiddenOption, "Leaderboard should have a hidden option");
    assertEquals("widgetConfig.attributes.disableLinks", hiddenOption.getRef());
  }

  @Test
  public void testMandatoryOption() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();

    ALMWidgetConfig myLearning =
        configs.stream()
            .filter(c -> "com.adobe.captivateprime.lostrip.mylearning".equals(c.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(myLearning);

    // Widget title is mandatory
    ALMWidgetOptions titleOption =
        myLearning.getOptions().stream()
            .filter(o -> "widgetConfig.attributes.title".equals(o.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(titleOption);
    assertTrue(titleOption.getMandatory());

    // Widget description is not mandatory
    ALMWidgetOptions descOption =
        myLearning.getOptions().stream()
            .filter(o -> "widgetConfig.attributes.description".equals(o.getRef()))
            .findFirst()
            .orElse(null);
    assertNotNull(descOption);
    assertFalse(descOption.getMandatory());
  }

  @Test
  public void testGetWidgetConfigsReturnsSameInstanceOnSubsequentCalls() {
    List<ALMWidgetConfig> first = service.getWidgetConfigs();
    List<ALMWidgetConfig> second = service.getWidgetConfigs();
    assertSame(first, second, "Should return cached instance");
  }

  @Test
  public void testWidgetRefsAreUnique() {
    List<ALMWidgetConfig> configs = service.getWidgetConfigs();
    List<String> refs = configs.stream().map(ALMWidgetConfig::getRef).collect(Collectors.toList());
    long distinctCount = refs.stream().distinct().count();
    assertEquals(refs.size(), distinctCount, "All widget refs should be unique");
  }
}
