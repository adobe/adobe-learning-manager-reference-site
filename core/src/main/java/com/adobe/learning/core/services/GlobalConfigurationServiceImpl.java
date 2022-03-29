package com.adobe.learning.core.services;

import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.caconfig.ConfigurationBuilder;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.learning.core.utils.Constants;
import com.day.cq.wcm.api.Page;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonObject;

@Component(service = GlobalConfigurationService.class)
public class GlobalConfigurationServiceImpl implements GlobalConfigurationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalConfigurationServiceImpl.class);

	private static final String SUBSERVICE_NAME = "alm-components-configuration";

	private static final Map<String, Object> authInfo = ImmutableMap.of(ResourceResolverFactory.SUBSERVICE,
			SUBSERVICE_NAME);

	private static final String CONFIGURATION_NAME = "cloudconfigs/alm";

	@Reference
	private ResourceResolverFactory resolverFactory;

	private ValueMap adminConfigs = null;

	@Override
	public JsonObject getAdminConfigs(Page currentPage) {
		JsonObject globalConfig = new JsonObject();
		try (ResourceResolver serviceResolver = resolverFactory.getServiceResourceResolver(authInfo)) {
			String resourcePath = currentPage.getContentResource().getPath();
			Resource resource = serviceResolver.getResource(resourcePath);

			if (resource == null) {
				LOGGER.error("Service user permissions of {} are not sufficient to view resource at {}",
						serviceResolver.getUserID(), resourcePath);
			} else {
				ConfigurationBuilder cfgBuilder = resource.adaptTo(ConfigurationBuilder.class);
				adminConfigs = cfgBuilder.name(CONFIGURATION_NAME).asValueMap();

				if (adminConfigs != null) {
					for (String key : adminConfigs.keySet()) {
						if (!StringUtils.startsWithAny(key, Constants.AEM_NODE_PROP_PREFIXES))
							globalConfig.addProperty(key, adminConfigs.get(key, ""));
					}
					
					String pageLocale = currentPage.getLanguage(false).toString();
					globalConfig.addProperty(Constants.Config.PAGE_LOCALE, pageLocale);
					
					filterAdminConfigs(globalConfig);
				}
			}
		} catch (LoginException le) {
			LOGGER.error("Login Exception in initializing global config model", le);
		}

		return globalConfig;
	}
	
	private void filterAdminConfigs(JsonObject globalConfig)
	{
		globalConfig.remove(Constants.Config.CLIENT_SECRET);
		globalConfig.remove(Constants.Config.SITES_AUTHOR_REFRESH_TOKEN_NAME);
		globalConfig.remove(Constants.Config.COMMERCE_ADMIN_REFRESH_TOKEN);
	}
}
