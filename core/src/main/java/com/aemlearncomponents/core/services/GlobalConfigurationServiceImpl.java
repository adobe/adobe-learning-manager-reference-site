package com.aemlearncomponents.core.services;

import java.util.Map;
import java.util.stream.IntStream;

import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.caconfig.ConfigurationBuilder;
import org.apache.sling.serviceusermapping.ServiceUserMapped;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.wcm.api.Page;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonObject;

@Component(service=GlobalConfigurationService.class)
public class GlobalConfigurationServiceImpl implements GlobalConfigurationService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalConfigurationServiceImpl.class);

	private static final String SUBSERVICE_NAME = "alm-components-configuration";

	private static final Map<String, Object> authInfo = ImmutableMap.of(ResourceResolverFactory.SUBSERVICE, SUBSERVICE_NAME);

	private static final String CONFIGURATION_NAME = "cloudconfigs/alm";

//	@Reference(target = "(" + ServiceUserMapped.SUBSERVICENAME + "=" + SUBSERVICE_NAME + ")")
//	private ServiceUserMapped serviceUserMapped;

	@Reference
	private ResourceResolverFactory resolverFactory;
	
	private ValueMap adminConfigs = null;
	private static final String[] colors = {"#00000", "#ffffff", "#445566"};

	@Override
	public String getAdminConfigs(Page currentPage)
	{
		JsonObject globalConfig = new JsonObject();
		try (ResourceResolver serviceResolver = resolverFactory.getServiceResourceResolver(authInfo)) {
			String resourcePath = currentPage.getContentResource().getPath();
			Resource resource = serviceResolver.getResource(resourcePath);

			if (resource == null) {
				LOGGER.error("Service user permissions of {} are not sufficient to view resource at {}", serviceResolver.getUserID(),
						resourcePath);
			}
			else
			{
				ConfigurationBuilder cfgBuilder = resource.adaptTo(ConfigurationBuilder.class);
				adminConfigs = cfgBuilder.name(CONFIGURATION_NAME).asValueMap();
				
				if (adminConfigs != null)
				{
					for(String key : adminConfigs.keySet())
					{
						globalConfig.addProperty(key, adminConfigs.get(key, ""));
					}
				}

				JsonObject primeColors = new JsonObject();
				IntStream.range(0, colors.length).forEach(index -> primeColors.addProperty(String.valueOf(index), colors[index]));
				globalConfig.add("primeColors", primeColors);
			}
		}
		catch (LoginException le)
		{
			LOGGER.error("Login Exception in initializing global config model", le);
		}
		
		return globalConfig.toString();
	}
}
