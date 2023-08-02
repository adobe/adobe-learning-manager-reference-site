package com.adobe.learning.core.servlets;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;

import com.adobe.granite.ui.components.ds.DataSource;
import com.adobe.granite.ui.components.ds.SimpleDataSource;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.google.gson.JsonObject;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class EmbeddableLrngWidgetListDSTest {

  private final AemContext ctx = new AemContext();

  private EmbeddableLrngWidgetListDS dsServlet;

  @Mock private GlobalConfigurationService configService;

  @BeforeEach
  public void setUp() throws Exception {
    dsServlet = new EmbeddableLrngWidgetListDS();

    JsonObject adminConfigs = new JsonObject();
    adminConfigs.addProperty("almBaseURL", "https://learningmanagerstage1.adobe.com");
    adminConfigs.addProperty("theme.background", "transparent");
    lenient().when(configService.getAdminConfigs(isNull())).thenReturn(adminConfigs);

    Field replicatorField = EmbeddableLrngWidgetListDS.class.getDeclaredField("configService");
    replicatorField.setAccessible(true);
    replicatorField.set(dsServlet, configService);

    ctx.registerService(
        GlobalConfigurationService.class,
        configService,
        org.osgi.framework.Constants.SERVICE_RANKING,
        Integer.MAX_VALUE);

    ctx.create().page("/content/mypage");
    ctx.create().page("/content/mypage/widgetSelect");
    ctx.currentResource("/content/mypage");

    ctx.requestPathInfo().setSuffix("/widget/page");
    ctx.load().json("/files/AdminConfigRsrc.json", "/widget/page");
  }

  @Test
  public void testGet() {
    dsServlet.doGet(ctx.request(), ctx.response());
    SimpleDataSource sds =
        (SimpleDataSource) ctx.request().getAttribute(DataSource.class.getName());
    Iterator<Resource> rsrcs = sds.iterator();
    List<String> resourcesValues = new ArrayList<>();
    while (rsrcs.hasNext()) {
      Resource rsc = rsrcs.next();
      ValueMap map = rsc.getValueMap();
      if (map.get("value") != null && !map.get("value").toString().isEmpty()) {
        resourcesValues.add(map.get("value").toString());
      }
    }
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.lostrip.adminreco"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.lostrip.mylearning"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.lostrip.trending"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.lostrip.myinterest"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.lostrip.catalog"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.calendar"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.lostrip.browsecatalog"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.social"));
    assertTrue(resourcesValues.contains("com.adobe.captivateprime.leaderboard"));
  }
}
