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

import com.adobe.learning.core.utils.Constants;
import com.google.gson.JsonObject;
import javax.servlet.Servlet;
import javax.servlet.http.HttpServletResponse;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(
    service = Servlet.class,
    property = {
      "sling.servlet.methods=POST",
      "sling.servlet.resourceTypes="
          + com.adobe.learning.core.servlets.AlmAdminRefreshTokenLoginServlet.RESOURCE_TYPE,
      "sling.servlet.selectors=" + "adminRefreshToken",
      "sling.servlet.extensions=html"
    })
public class AlmAdminRefreshTokenLoginServlet extends SlingAllMethodsServlet {

  private static final long serialVersionUID = 492465267362222327L;

  static final String RESOURCE_TYPE = "sling/servlet/default";

  private static final Logger LOGGER =
      LoggerFactory.getLogger(
          com.adobe.learning.core.servlets.AlmAdminRefreshTokenLoginServlet.class);

  @Override
  protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) {
    try {
      JsonObject responseObject = new JsonObject();
      responseObject.addProperty(Constants.Config.PRIME_LOGIN_IMPLEMENTATION, true);
      response.getWriter().write(responseObject.toString());
      response.setStatus(HttpServletResponse.SC_OK);
    } catch (Exception e) {
      LOGGER.error(
          "CPPrime::AlmAdminRefreshTokenLoginServlet Exception on redirecting to ALM Login page",
          e);
    }
  }
}
