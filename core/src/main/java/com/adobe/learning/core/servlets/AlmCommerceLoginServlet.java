package com.adobe.learning.core.servlets;

import com.adobe.learning.core.utils.Constants;
import com.google.gson.JsonObject;
import java.io.IOException;
import javax.servlet.Servlet;
import javax.servlet.http.Cookie;
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
      "sling.servlet.resourceTypes=" + AlmCommerceLoginServlet.RESOURCE_TYPE,
      "sling.servlet.selectors=" + "almCommerceLogin",
      "sling.servlet.extensions=html"
    })
public class AlmCommerceLoginServlet extends SlingAllMethodsServlet {

  private static final long serialVersionUID = 1286868845813794502L;

  static final String RESOURCE_TYPE = "sling/servlet/default";

  private static final Logger LOGGER = LoggerFactory.getLogger(AlmCommerceLoginServlet.class);

  @Override
  protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
      throws IOException {

    String almCommerceToken = "";
    try {
      Cookie almCommerceTokenCookie =
          request.getCookie(Constants.Config.CUSTOMER_TOKEN_COOKIE_NAME);
      if (almCommerceTokenCookie != null) {
        almCommerceToken = almCommerceTokenCookie.getValue();
        response.setStatus(SlingHttpServletResponse.SC_OK);
        response.setContentType("application/json");
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("access_token", almCommerceToken);
        response.getWriter().write(jsonObject.toString());
      } else {
        response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      }
    } catch (Exception e) {
      LOGGER.error("AlmLoginServlet::doPost:: Exception in almLogin", e);
      response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  }
}
