package com.adobe.learning.core.servlets;

import com.adobe.learning.core.utils.Constants;
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
      "sling.servlet.resourceTypes=" + AlmLogoutServlet.RESOURCE_TYPE,
      "sling.servlet.selectors=" + "almLogout",
      "sling.servlet.extensions=html"
    })
public class AlmLogoutServlet extends SlingAllMethodsServlet {

  private static final long serialVersionUID = -3322056901242528979L;

  static final String RESOURCE_TYPE = "sling/servlet/default";

  private static final Logger LOGGER = LoggerFactory.getLogger(AlmLogoutServlet.class);

  @Override
  protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
      throws IOException {

    try {

      final Cookie tokenCookie = new Cookie(Constants.Config.ACCESS_TOKEN_COOKIE_NAME, "");
      tokenCookie.setMaxAge(0);
      tokenCookie.setPath("/");
      response.addCookie(tokenCookie);

      final Cookie commerceTokenCookie =
          new Cookie(Constants.Config.CUSTOMER_TOKEN_COOKIE_NAME, "");
      commerceTokenCookie.setMaxAge(0);
      commerceTokenCookie.setPath("/");
      response.addCookie(commerceTokenCookie);

      response.setStatus(SlingHttpServletResponse.SC_OK);
    } catch (Exception e) {
      LOGGER.error("AlmLogoutServlet::doPost:: Exception in almLogout", e);
      response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  }
}
