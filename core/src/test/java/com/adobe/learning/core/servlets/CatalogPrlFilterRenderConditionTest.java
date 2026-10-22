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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.adobe.granite.ui.components.rendercondition.RenderCondition;
import com.adobe.granite.ui.components.rendercondition.SimpleRenderCondition;
import com.adobe.learning.core.entity.AccountResponse;
import com.adobe.learning.core.services.AccountService;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class CatalogPrlFilterRenderConditionTest {

  private final AemContext ctx = new AemContext();

  private CatalogPrlFilterRenderCondition servlet;

  @Mock private AccountService accountService;

  @Mock private AccountResponse accountResponse;

  @BeforeEach
  public void setUp() throws Exception {
    servlet = new CatalogPrlFilterRenderCondition();

    Field accountServiceField =
        CatalogPrlFilterRenderCondition.class.getDeclaredField("accountService");
    accountServiceField.setAccessible(true);
    accountServiceField.set(servlet, accountService);

    ctx.load().json("/files/catalogImplTest.json", "/content/learning");
    ctx.requestPathInfo().setSuffix("/content/learning/catalog");
  }

  private void setCurrentResourceWithPrlType(String prlType) {
    Map<String, Object> props = new HashMap<>();
    props.put("prlType", prlType);
    ValueMap vm = new ValueMapDecorator(props);
    ctx.currentResource(ctx.create().resource("/content/rc", vm));
  }

  private boolean getShowResult() throws Exception {
    return ((SimpleRenderCondition) ctx.request().getAttribute(RenderCondition.class.getName()))
        .check();
  }

  @Test
  public void testProductsEnabled() throws Exception {
    setCurrentResourceWithPrlType("products");
    when(accountService.getAccountDetails(
            ctx.pageManager().getContainingPage("/content/learning/catalog")))
        .thenReturn(accountResponse);
    when(accountResponse.isPrlProductsEnabled()).thenReturn(true);

    servlet.doGet(ctx.request(), ctx.response());

    assertTrue(getShowResult());
  }

  @Test
  public void testRolesDisabled() throws Exception {
    setCurrentResourceWithPrlType("roles");
    when(accountService.getAccountDetails(
            ctx.pageManager().getContainingPage("/content/learning/catalog")))
        .thenReturn(accountResponse);
    when(accountResponse.isPrlRolesEnabled()).thenReturn(false);

    servlet.doGet(ctx.request(), ctx.response());

    assertFalse(getShowResult());
  }

  @Test
  public void testPrlCriteriaDisabled() throws Exception {
    setCurrentResourceWithPrlType("products");
    when(accountService.getAccountDetails(
            ctx.pageManager().getContainingPage("/content/learning/catalog")))
        .thenReturn(accountResponse);
    when(accountResponse.isPrlProductsEnabled()).thenReturn(false);

    servlet.doGet(ctx.request(), ctx.response());

    assertFalse(getShowResult());
  }

  @Test
  public void testNullAccount() throws Exception {
    setCurrentResourceWithPrlType("products");
    when(accountService.getAccountDetails(
            ctx.pageManager().getContainingPage("/content/learning/catalog")))
        .thenReturn(null);

    servlet.doGet(ctx.request(), ctx.response());

    assertFalse(getShowResult());
  }

  @Test
  public void testNullSuffix() throws Exception {
    setCurrentResourceWithPrlType("products");
    ctx.requestPathInfo().setSuffix(null);

    servlet.doGet(ctx.request(), ctx.response());

    assertFalse(getShowResult());
  }

  @Test
  public void testNullPrlType() throws Exception {
    setCurrentResourceWithPrlType(null);

    servlet.doGet(ctx.request(), ctx.response());

    assertFalse(getShowResult());
  }
}
