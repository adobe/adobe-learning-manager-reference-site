package com.adobe.learning.core.servlets;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;

import com.adobe.granite.ui.components.ds.DataSource;
import com.adobe.granite.ui.components.ds.SimpleDataSource;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.HttpClientBuilderFactoryMock;
import com.google.gson.JsonObject;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class EmbeddableLrngWidgetDatasourceTest {

  private final AemContext ctx = new AemContext();

  private EmbeddableLrngWidgetDatasource dsServlet;

  @Mock private GlobalConfigurationService configService;

  @BeforeEach
  public void setUp() throws Exception {

    HttpClientBuilderFactory clientBuilderFactory = new HttpClientBuilderFactoryMock();
    dsServlet = new EmbeddableLrngWidgetDatasource();

    JsonObject adminConfigs = new JsonObject();
    adminConfigs.addProperty("almBaseURL", "https://learningmanagerstage1.adobe.com");
    adminConfigs.addProperty("theme.background", "transparent");
    lenient().when(configService.getAdminConfigs(isNull())).thenReturn(adminConfigs);

    Field replicatorField = EmbeddableLrngWidgetDatasource.class.getDeclaredField("configService");
    replicatorField.setAccessible(true);
    replicatorField.set(dsServlet, configService);

    Field replicatorField1 =
        EmbeddableLrngWidgetDatasource.class.getDeclaredField("clientBuilderFactory");
    replicatorField1.setAccessible(true);
    replicatorField1.set(dsServlet, clientBuilderFactory);

    ctx.registerService(HttpClientBuilderFactory.class, clientBuilderFactory);

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
    List<String> resourcesNames = new ArrayList<>();
    while (rsrcs.hasNext()) {
      Resource rsc = rsrcs.next();
      ValueMap map = rsc.getValueMap();
      if (map.get("name") != null && !map.get("name").toString().isEmpty()) {
        resourcesNames.add(map.get("name").toString());
      }
    }
    assertTrue(resourcesNames.contains("./widgetConfig.attributes.numRows"));
    assertTrue(resourcesNames.contains("./widgetConfig.attributes.catalogIds"));
  }
}
