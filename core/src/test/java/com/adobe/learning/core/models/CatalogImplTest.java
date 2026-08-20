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

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.scripting.WCMBindingsConstants;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import org.apache.sling.api.scripting.SlingBindings;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.Rule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class CatalogImplTest {

  @Rule private final AemContext ctx = new AemContext(ResourceResolverType.JCR_MOCK);

  private Catalog catalogComponent;

  @Mock private Page currentPage;

  @BeforeEach
  void setUp() {
    ctx.addModelsForClasses(CatalogImpl.class);

    SlingBindings slingBindings =
        (SlingBindings) ctx.request().getAttribute(SlingBindings.class.getName());
    slingBindings.put(WCMBindingsConstants.NAME_CURRENT_PAGE, currentPage);
    ctx.request().setAttribute(SlingBindings.class.getName(), slingBindings);

    ctx.load().json("/files/catalogImplTest.json", "/content/learning");
    ctx.currentResource("/content/learning/catalog");
    catalogComponent = ctx.request().adaptTo(Catalog.class);
  }

  @Test
  void testCatalogComponentConfigs() {
    assertTrue("true".equals(catalogComponent.getShowFilters()));
    assertTrue("true".equals(catalogComponent.getShowCatalogFilter()));
    assertTrue("true".equals(catalogComponent.getSkillsFilter()));
    assertTrue("true".equals(catalogComponent.getDurationFilter()));
    assertTrue("true".equals(catalogComponent.getSkillsLevelFilter()));
    assertTrue("true".equals(catalogComponent.getStatusFilter()));

    assertTrue("false".equals(catalogComponent.getShowSearch()));
    assertTrue("false".equals(catalogComponent.getTypeFilter()));
    assertTrue("false".equals(catalogComponent.getFormatFilter()));
    assertTrue("false".equals(catalogComponent.getPriceFilter()));
    assertTrue("false".equals(catalogComponent.getTagsFilter()));
    assertTrue("false".equals(catalogComponent.getCitiesFilter()));
    assertTrue("true".equals(catalogComponent.getProductsFilter()));
    assertTrue("false".equals(catalogComponent.getRolesFilter()));
  }
}
