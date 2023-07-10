package com.adobe.learning.core.models;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.adobe.granite.ui.components.ExpressionResolver;
import com.google.common.collect.ImmutableMap;
import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;
import java.util.Locale;
import java.util.Map;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.scripting.SlingBindings;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.Rule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class ConfigurationColumnPreviewTest {

  public static final String CONFIGURATION_PATH =
      "/conf/testing/settings/cloudconfigs/adobe-learning-manager-config";
  public static final String CONFIGURATION_NAME = "adobe-learning-manager-config";

  @Rule public AemContext context = new AemContext(ResourceResolverType.JCR_MOCK);

  Resource columnPreview;

  @BeforeEach
  public void setUp() {
    context.load().json("/files/almConfigRsrc.json", "/conf");

    ExpressionResolver expressionResolver = Mockito.mock(ExpressionResolver.class);
    Mockito.when(
            expressionResolver.resolve(
                Mockito.any(String.class),
                Mockito.any(Locale.class),
                Mockito.any(Class.class),
                Mockito.any(SlingHttpServletRequest.class)))
        .thenReturn(CONFIGURATION_PATH);

    context.registerService(ExpressionResolver.class, expressionResolver);
    context.addModelsForClasses(ConfigurationColumnPreview.class);

    Map<String, Object> columnPreviewProps =
        ImmutableMap.of(
            "sling:resourceType",
            "learning/configuration/columnpreview",
            "path",
            CONFIGURATION_PATH);
    columnPreview = context.create().resource("/libs/something/columnpreview", columnPreviewProps);
  }

  @Test
  public void testProperties() {
    SlingBindings slingBindings =
        (SlingBindings) context.request().getAttribute(SlingBindings.class.getName());
    slingBindings.put("resource", columnPreview);
    context.currentResource(columnPreview);
    ConfigurationColumnPreview preview =
        context.request().adaptTo(ConfigurationColumnPreview.class);
    assertTrue(CONFIGURATION_NAME.equals(preview.getTitle()));
    assertTrue(CONFIGURATION_PATH.equals(preview.getItemResourcePath()));
    assertTrue("2020-02-06T12:21:13Z".equals(preview.getModifiedTime()));
    assertTrue(preview.getPublishedTime() == null);
    assertFalse(preview.isFolder());
  }
}
