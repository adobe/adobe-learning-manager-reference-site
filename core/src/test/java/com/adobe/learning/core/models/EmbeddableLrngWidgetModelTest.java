package com.adobe.learning.core.models;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

import org.apache.sling.api.scripting.SlingBindings;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.Rule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.adobe.learning.core.services.GlobalConfigurationService;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.scripting.WCMBindingsConstants;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class EmbeddableLrngWidgetModelTest {
	@Rule
	private final AemContext ctx = new AemContext(ResourceResolverType.JCR_MOCK);

	private EmbeddableLrngWidgetModel widgetModel;

	@Mock
	private Page currentPage;
	
	@Mock
	private GlobalConfigurationService configService;
	
	@BeforeEach
	public void setUp() {
		ctx.addModelsForClasses(EmbeddableLrngWidgetModel.class);
		lenient().when(configService.getAdminConfigs(any(Page.class))).thenReturn(getConfigs());
		ctx.registerService(GlobalConfigurationService.class, configService, org.osgi.framework.Constants.SERVICE_RANKING, Integer.MAX_VALUE);
		
	    SlingBindings slingBindings = (SlingBindings) ctx.request().getAttribute(SlingBindings.class.getName());
	    slingBindings.put(WCMBindingsConstants.NAME_CURRENT_PAGE, currentPage);
	    ctx.request().setAttribute(SlingBindings.class.getName(), slingBindings);
	    
	    ctx.load().json("/files/widgetModelTest.json", "/content/prime");
	    ctx.currentResource("/content/prime/widgetModel");
	    widgetModel = ctx.request().adaptTo(EmbeddableLrngWidgetModel.class);
	}
	
	@Test
	public void testWidgetConfigs() {
		String expectedProperties = "{\"jcr:primaryType\":\"nt:unstructured\",\"widgetRefSelected\":\"com.adobe.captivateprime.lostrip.trending\",\"test.boolean\":true,\"name\":\"Admin Recommendation\",\"sling:resourceType\":\"cprime/components/widget\",\"theme.primaryColor\":\"rgb(38,118,255)\",\"theme.background\":\"transparent\"}"; 
		assertTrue(JsonParser.parseString(expectedProperties).equals(JsonParser.parseString(widgetModel.getProperties())));
		
		assertTrue("com.adobe.captivateprime.primeStrip".equals(widgetModel.getSelectedRef()));
		
		assertTrue("https://learningmanagerqe.adobe.com/app/embeddablewidget?widgetRef=com.adobe.captivateprime.widgetcommunicator".equals(widgetModel.getWidgetCommunicatorUrl()));
		
		String expectedConfigs = "{\"widgetRefSelected\":\"com.adobe.captivateprime.lostrip.trending\",\"commonConfig\":{\"emitPlayerLaunchEvent\":true,\"captivateHostName\":\"https://learningmanagerqe.adobe.com\",\"emitPageLinkEvents\":true,\"disableLinks\":false},\"auth\":{\"accessToken\":\"\"},\"test\":{\"boolean\":true},\"almBaseURL\":\"https://learningmanagerqe.adobe.com\",\"theme\":{\"primaryColor\":\"rgb(38,118,255)\",\"background\":\"transparent\"},\"type\":\"acapConfig\",\"accountId\":\"7110\",\"name\":\"Admin Recommendation\",\"widgetConfig\":{\"widgetRef\":\"com.adobe.captivateprime.lostrip.trending\"}}";
		assertTrue(JsonParser.parseString(expectedConfigs).equals(JsonParser.parseString(widgetModel.getWidgetConfigs())));
		
		assertTrue("https://learningmanagerqe.adobe.com/app/embeddablewidget?widgetRef=com.adobe.captivateprime.primeStrip&resourceType=html".equals(widgetModel.getWidgetSrcUrl()));
	}
	
	private JsonObject getConfigs() {
		JsonObject config = new JsonObject();
		config.addProperty("accountId", "7110");
		config.addProperty("almBaseURL", "https://learningmanagerqe.adobe.com");
		return config;
	}
	
}
