package com.adobe.learning.core.services;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.day.cq.wcm.api.Page;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class}) 
public class GlobalConfigurationServiceImplTest {

	private final AemContext ctx = new AemContext();

	private static final String SUBSERVICE_NAME = "alm-components-configuration";
	private static final Map<String, Object> SERVICE_PARAMS = ImmutableMap.of(ResourceResolverFactory.SUBSERVICE, SUBSERVICE_NAME);

	@Mock
	private Page currentPage;

	@Mock 
	private ResourceResolverFactory resolverFactory;

	private GlobalConfigurationServiceImpl globalConfigService;

	@BeforeEach
	public void setUp() throws LoginException, NoSuchFieldException, SecurityException, IllegalArgumentException, IllegalAccessException {
		Map<String, String> pageProperties = new HashMap<>();
		pageProperties.put("cq:conf", "/conf/global/learning/testConfig");
		ctx.create().page("/content/mypage", null, pageProperties);
		ctx.currentResource("/content/mypage");
		ctx.load().json("/files/AdminConfigRsrc.json", "/conf/global/learning/testConfig/settings/cloudconfigs/adobe-learning-manager-config");

		lenient().when(resolverFactory.getServiceResourceResolver(SERVICE_PARAMS)).thenReturn(ctx.resourceResolver());
		ctx.registerService(ResourceResolverFactory.class, resolverFactory, org.osgi.framework.Constants.SERVICE_RANKING, Integer.MAX_VALUE);

		globalConfigService = new GlobalConfigurationServiceImpl();

		Field resourceResolverFactory = GlobalConfigurationServiceImpl.class.getDeclaredField("resolverFactory");
		resourceResolverFactory.setAccessible(true);
		resourceResolverFactory.set(globalConfigService, resolverFactory);
	}

	@Test
	public void testGetAdminConfigs() {
		//String expectedConfigs = "{\"testConfig\":\"test1\",\"clientId\":\"clientId\",\"clientSecret\":\"clientSecret\",\"almBaseURL\":\"https://learningmanagerstage1.adobe.com\",\"refreshToken\":\"refreshToken\",\"theme.background\":\"transparent\",\"pageLocale\":\"en_IN\"}";
		JsonObject j = globalConfigService.getAdminConfigs(ctx.currentPage());
		assertTrue("test1".equals(j.get("testConfig").getAsString()));
		assertTrue("clientId".equals(j.get("clientId").getAsString()));
		assertTrue("clientSecret".equals(j.get("clientSecret").getAsString()));
		assertTrue("transparent".equals(j.get("theme.background").getAsString()));
	}

}
