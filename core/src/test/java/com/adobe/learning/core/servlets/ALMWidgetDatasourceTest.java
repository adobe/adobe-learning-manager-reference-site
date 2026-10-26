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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;

import com.adobe.granite.ui.components.ds.DataSource;
import com.adobe.granite.ui.components.ds.SimpleDataSource;
import com.adobe.learning.core.entity.ALMWidgetConfig;
import com.adobe.learning.core.entity.ALMWidgetOptions;
import com.adobe.learning.core.services.ALMWidgetConfigService;
import com.adobe.learning.core.services.AccountService;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class ALMWidgetDatasourceTest {

  private final AemContext ctx = new AemContext();

  private ALMWidgetDatasource dsServlet;

  @Mock private AccountService accountService;

  @Mock private ALMWidgetConfigService widgetConfigService;

  @BeforeEach
  public void setUp() throws Exception {
    dsServlet = new ALMWidgetDatasource();

    Field accountServiceField = ALMWidgetDatasource.class.getDeclaredField("accountService");
    accountServiceField.setAccessible(true);
    accountServiceField.set(dsServlet, accountService);

    Field widgetConfigServiceField =
        ALMWidgetDatasource.class.getDeclaredField("widgetConfigService");
    widgetConfigServiceField.setAccessible(true);
    widgetConfigServiceField.set(dsServlet, widgetConfigService);

    // Build widget configs matching testReactWidgetsConfig.json
    ALMWidgetOptions titleOption = new ALMWidgetOptions();
    titleOption.setName("Title");
    titleOption.setRef("widgetConfig.attributes.title");
    titleOption.setType("string");
    titleOption.setDefaultValue("My Learning");

    ALMWidgetConfig myLearning = new ALMWidgetConfig();
    myLearning.setName("My Learning Widget");
    myLearning.setRef("com.adobe.learning.mylearning");
    myLearning.setType("widget");
    myLearning.setOptions(Collections.singletonList(titleOption));

    ALMWidgetConfig catalog = new ALMWidgetConfig();
    catalog.setName("Catalog Widget");
    catalog.setRef("com.adobe.learning.catalog");
    catalog.setType("widget");
    catalog.setOptions(Collections.emptyList());

    ALMWidgetConfig commonConfig = new ALMWidgetConfig();
    commonConfig.setName("Common Config");
    commonConfig.setRef("com.adobe.learning.commonConfig");
    commonConfig.setType("acapConfig");
    commonConfig.setOptions(Collections.emptyList());

    lenient()
        .when(widgetConfigService.getWidgetConfigs())
        .thenReturn(Arrays.asList(myLearning, catalog, commonConfig));

    // Create a page and set it as current resource (for request.getResource())
    ctx.create().page("/content/mypage");
    ctx.currentResource("/content/mypage");

    // Load JCR content at the suffix path (separate from page)
    ctx.load().json("/files/almWidgetDatasourceRsrc.json", "/widget/page");
  }

  @Test
  public void testDoGet_NullSuffix() {
    // No suffix set → DataSource set but empty
    dsServlet.doGet(ctx.request(), ctx.response());

    SimpleDataSource sds =
        (SimpleDataSource) ctx.request().getAttribute(DataSource.class.getName());
    assertNotNull(sds);
    assertFalse(sds.iterator().hasNext());
  }

  @Test
  public void testDoGet_AllWidgetsShown() {
    // Set suffix to a valid resource path
    ctx.requestPathInfo().setSuffix("/widget/page/jcr:content");

    dsServlet.doGet(ctx.request(), ctx.response());

    SimpleDataSource sds =
        (SimpleDataSource) ctx.request().getAttribute(DataSource.class.getName());
    assertNotNull(sds);

    // Collect all resource names from the datasource
    List<String> resourceNames = new ArrayList<>();
    Iterator<Resource> rsrcs = sds.iterator();
    while (rsrcs.hasNext()) {
      Resource rsc = rsrcs.next();
      ValueMap map = rsc.getValueMap();
      Object name = map.get("name");
      if (name != null && !name.toString().isEmpty()) {
        resourceNames.add(name.toString());
      }
    }

    // Should have resources from the widget options (My Learning Widget has "Title" option)
    assertTrue(resourceNames.contains("./widgetConfig.attributes.title"));
  }

  private String autocompleteValue(Object storedPropertyValue) {
    ALMWidgetOptions multiOption = new ALMWidgetOptions();
    multiOption.setName("Source details");
    multiOption.setRef("widgetConfig.attributes.sourceDetails");
    multiOption.setType("autocomplete");
    multiOption.setDataSource("coursesandpaths-source");
    multiOption.setMultiSelect(true);

    ALMWidgetConfig multiWidget = new ALMWidgetConfig();
    multiWidget.setName("Multi Widget");
    multiWidget.setRef("com.adobe.learning.multi");
    multiWidget.setType("widget");
    multiWidget.setOptions(Collections.singletonList(multiOption));
    lenient().when(widgetConfigService.getWidgetConfigs()).thenReturn(Arrays.asList(multiWidget));

    Map<String, Object> props = new HashMap<>();
    props.put("sling:resourceType", "learning/components/ALMWidget");
    props.put("widgetRefSelected", "com.adobe.learning.multi");
    props.put("widgetConfig.attributes.sourceDetails", storedPropertyValue);
    ctx.create().resource("/widget/multi/jcr:content", props);
    ctx.requestPathInfo().setSuffix("/widget/multi/jcr:content");

    dsServlet.doGet(ctx.request(), ctx.response());

    SimpleDataSource sds =
        (SimpleDataSource) ctx.request().getAttribute(DataSource.class.getName());
    Iterator<Resource> rsrcs = sds.iterator();
    while (rsrcs.hasNext()) {
      ValueMap map = rsrcs.next().getValueMap();
      if ("./widgetConfig.attributes.sourceDetails".equals(map.get("name", String.class))) {
        return map.get("value", String.class);
      }
    }
    return null;
  }

  @Test
  public void testMultiSelectAutocomplete_savedCommaSeparatedString_isPrefilled() {
    assertEquals("Sales, Ops", autocompleteValue("Sales, Ops"));
  }

  @Test
  public void testMultiSelectAutocomplete_savedSingleValue_isPrefilled() {
    assertEquals("catalog:1", autocompleteValue("catalog:1"));
  }

  @Test
  public void testMultiSelectAutocomplete_savedStringArray_isJoined() {
    assertEquals("Sales, Ops", autocompleteValue(new String[] {"Sales", "Ops"}));
  }

  @Test
  public void testMultiSelectAutocomplete_savedEscapedString_isNotEscapedAgain() {
    assertEquals("Sales\\, Marketing, Ops", autocompleteValue("Sales\\, Marketing, Ops"));
  }

  @Test
  public void testMultiSelectAutocomplete_savedStringArray_escapesCommasInValues() {
    assertEquals(
        "Sales\\, Marketing, Ops", autocompleteValue(new String[] {"Sales, Marketing", "Ops"}));
  }

  @Test
  public void testMultiSelectAutocomplete_savedSingleItemArray_escapesCommas() {
    assertEquals("Sales\\, Marketing", autocompleteValue(new String[] {"Sales, Marketing"}));
  }

  @Test
  public void testEscapeListValue() {
    assertEquals("plain", ALMWidgetDatasource.escapeListValue("plain"));
    assertEquals("catalog:123", ALMWidgetDatasource.escapeListValue("catalog:123"));
    assertEquals("a\\, b", ALMWidgetDatasource.escapeListValue("a, b"));
    assertEquals("a\\\\b", ALMWidgetDatasource.escapeListValue("a\\b"));
    assertEquals("a\\\\\\, b", ALMWidgetDatasource.escapeListValue("a\\, b"));
  }

  @Test
  public void testJoinListValues() {
    assertEquals("a, b", ALMWidgetDatasource.joinListValues(new String[] {"a", "b"}));
    assertEquals(
        "Sales\\, Marketing, Ops",
        ALMWidgetDatasource.joinListValues(new String[] {"Sales, Marketing", "Ops"}));
    assertEquals("a, b", ALMWidgetDatasource.joinListValues(new String[] {"a", null, "b"}));
    assertEquals("", ALMWidgetDatasource.joinListValues(new String[] {}));
  }

  // --- filterWidgetsByAccountType tests (via reflection) ---

  @Test
  @SuppressWarnings("unchecked")
  public void testFilterWidgetsByAccountType() throws Exception {
    Method method =
        ALMWidgetDatasource.class.getDeclaredMethod(
            "filterWidgetsByAccountType", List.class, String.class);
    method.setAccessible(true);

    ALMWidgetConfig widgetCPE = createWidgetConfig("Widget CPE", "ref1", Arrays.asList("CPE"));
    ALMWidgetConfig widgetAll = createWidgetConfig("Widget All", "ref2", null);
    ALMWidgetConfig widgetEmpty =
        createWidgetConfig("Widget Empty", "ref3", Collections.emptyList());
    ALMWidgetConfig widgetLMS = createWidgetConfig("Widget LMS", "ref4", Arrays.asList("LMS"));
    List<ALMWidgetConfig> allWidgets = Arrays.asList(widgetCPE, widgetAll, widgetEmpty, widgetLMS);

    // null type → all widgets returned (fail-open)
    List<ALMWidgetConfig> result =
        (List<ALMWidgetConfig>) method.invoke(dsServlet, allWidgets, null);
    assertEquals(4, result.size());

    // "CPE" → includes matching + null/empty allowedAccountTypes
    result = (List<ALMWidgetConfig>) method.invoke(dsServlet, allWidgets, "CPE");
    assertEquals(3, result.size());
    assertTrue(result.stream().anyMatch(w -> "ref1".equals(w.getRef())));
    assertTrue(result.stream().anyMatch(w -> "ref2".equals(w.getRef())));
    assertTrue(result.stream().anyMatch(w -> "ref3".equals(w.getRef())));
    assertFalse(result.stream().anyMatch(w -> "ref4".equals(w.getRef())));
  }

  // --- replaceNomenclatureKeys tests (via reflection) ---

  @Test
  public void testReplaceNomenclatureKeys() throws Exception {
    Method method =
        ALMWidgetDatasource.class.getDeclaredMethod(
            "replaceNomenclatureKeys", String.class, Map.class);
    method.setAccessible(true);

    Map<String, String> nomenclatureMap = new HashMap<>();
    nomenclatureMap.put("nomenclature.course.singular", "Course");
    nomenclatureMap.put("nomenclature.course.plural", "Courses");

    // null text → null
    assertNull(method.invoke(dsServlet, null, nomenclatureMap));

    // empty map → original text
    assertEquals(
        "Browse nomenclature.course.plural",
        method.invoke(dsServlet, "Browse nomenclature.course.plural", Collections.emptyMap()));

    // matching key → replaced
    assertEquals(
        "Browse Courses",
        method.invoke(dsServlet, "Browse nomenclature.course.plural", nomenclatureMap));

    // no match → unchanged
    assertEquals("No keys here", method.invoke(dsServlet, "No keys here", nomenclatureMap));
  }

  // --- Helper ---

  private ALMWidgetConfig createWidgetConfig(
      String name, String ref, List<String> allowedAccountTypes) {
    ALMWidgetConfig config = new ALMWidgetConfig();
    config.setName(name);
    config.setRef(ref);
    config.setType("widget");
    config.setOptions(Collections.emptyList());
    config.setAllowedAccountTypes(allowedAccountTypes);
    return config;
  }
}
