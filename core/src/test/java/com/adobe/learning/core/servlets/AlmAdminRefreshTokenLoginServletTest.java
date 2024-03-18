package com.adobe.learning.core.servlets;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class AlmAdminRefreshTokenLoginServletTest {
  private final AemContext ctx = new AemContext();

  private AlmAdminRefreshTokenLoginServlet adminRefreshTokenLoginServlet;

  @BeforeEach
  public void setUp()
      throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException,
          SecurityException {
    adminRefreshTokenLoginServlet = new AlmAdminRefreshTokenLoginServlet();
    ctx.create().page("/content/mypage");
    ctx.create().page("/content/mypage/widgetSelect");
    ctx.currentResource("/content/mypage");
    ctx.load().json("/files/AdminConfigRsrc.json", "/widget/page");
  }

  @Test
  public void testDoPostPublishMode()
      throws IllegalArgumentException, IllegalAccessException, NoSuchFieldException,
          SecurityException {
    ctx.request().addRequestParameter("pagePath", "/content/mypage");
    ctx.request().addRequestParameter("code", "xxxxx");
    adminRefreshTokenLoginServlet.doPost(ctx.request(), ctx.response());
    JsonObject jsonObject =
        JsonParser.parseString(ctx.response().getOutputAsString()).getAsJsonObject();
    assertTrue(jsonObject.get("isALMLoginImplementation").getAsBoolean());
  }
}
