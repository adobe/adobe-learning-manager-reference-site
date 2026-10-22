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

import com.adobe.granite.ui.components.rendercondition.RenderCondition;
import com.adobe.granite.ui.components.rendercondition.SimpleRenderCondition;
import com.adobe.learning.core.entity.AccountResponse;
import com.adobe.learning.core.services.AccountService;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import javax.servlet.Servlet;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

@Component(
    service = Servlet.class,
    property = {
      "sling.servlet.methods=GET",
      "sling.servlet.resourceTypes=learning/components/catalog/prlfilter/rendercondition"
    })
public class CatalogPrlFilterRenderCondition extends SlingSafeMethodsServlet {

  private static final long serialVersionUID = 1L;

  @Reference private transient AccountService accountService;

  @Override
  protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) {
    boolean show = false;
    try {
      String prlType = request.getResource().getValueMap().get("prlType", String.class);
      String suffix = request.getRequestPathInfo().getSuffix();
      if (prlType != null && suffix != null) {
        ResourceResolver resolver = request.getResourceResolver();
        PageManager pageManager = resolver.adaptTo(PageManager.class);
        Page page = pageManager.getContainingPage(suffix);
        AccountResponse account = accountService.getAccountDetails(page);
        if (account != null) {
          show =
              "products".equals(prlType)
                  ? account.isPrlProductsEnabled()
                  : account.isPrlRolesEnabled();
        }
      }
    } catch (Exception e) {
      // fail-closed: show stays false
    }
    request.setAttribute(RenderCondition.class.getName(), new SimpleRenderCondition(show));
  }
}
