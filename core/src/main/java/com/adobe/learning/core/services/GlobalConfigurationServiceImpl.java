/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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

	private static final String CONFIGURATION_NAME = "cloudconfigs/adobe-learning-manager-config";

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
				}
			}
		} catch (LoginException le) {
			LOGGER.error("Login Exception in initializing global config model", le);
		}

		return globalConfig;
	}
}
