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
public class GlobalConfigurationModelTest {

	@Rule
	private final AemContext ctx = new AemContext(ResourceResolverType.JCR_MOCK);

	private GlobalConfigurationModel configModel;

	@Mock
	private Page currentPage;

	@Mock
	private GlobalConfigurationService configService;
	
	@BeforeEach
	public void setUp() {
		ctx.addModelsForClasses(GlobalConfigurationModel.class);
		lenient().when(configService.getAdminConfigs(any(Page.class))).thenReturn(getConfigs());
		ctx.registerService(GlobalConfigurationService.class, configService, org.osgi.framework.Constants.SERVICE_RANKING, Integer.MAX_VALUE);
		
	    SlingBindings slingBindings = (SlingBindings) ctx.request().getAttribute(SlingBindings.class.getName());
	    slingBindings.put(WCMBindingsConstants.NAME_CURRENT_PAGE, currentPage);
	    ctx.request().setAttribute(SlingBindings.class.getName(), slingBindings);
	    
	    ctx.load().json("/files/globalModelTest.json", "/content/prime");
	    ctx.currentResource("/content/prime/configModel");
	    configModel = ctx.request().adaptTo(GlobalConfigurationModel.class);
	}
	
	@Test
	public void testConfigs() {
		String expectedConfigs = "{\"accountId\":\"7110\",\"almBaseURL\":\"https://learningmanagerstage1.adobe.com\",\"communityPath\":\"/skills.html\",\"communityBoardDetailsPath\":\"/board.html\",\"commerceBasePath\":\"/commerce.html\",\"emailRedirectPath\":\"/email-redirect.html\",\"homePath\":\"/home.html\",\"catalogPath\":\"/explore.html\",\"learningPath\":\"/learning.html\",\"commerceSignInPath\":\"/commerce.html\",\"supportPath\":\"/support.html\",\"trainingOverviewPath\":\"/overview.html\",\"communityBoardsPath\":\"/boards.html\",\"commerceCartPath\":\"/commerce.html\",\"signOutPath\":\"/sign-out.html\",\"profilePath\":\"/profile.html\",\"instancePath\":\"/instance.html\"}";
		assertTrue(JsonParser.parseString(expectedConfigs).equals(JsonParser.parseString(configModel.getConfig())));
	}
	
	private JsonObject getConfigs() {
		JsonObject config = new JsonObject();
		config.addProperty("accountId", "7110");
		config.addProperty("almBaseURL", "https://learningmanagerstage1.adobe.com");
		return config;
	}

}
