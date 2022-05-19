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

package com.adobe.learning.core.models;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.cq.sightly.SightlyWCMMode;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.adobe.learning.core.utils.GlobalConfigurationUtils;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class})
public class GlobalConfigurationModel {

	private static final Logger LOG = LoggerFactory.getLogger(GlobalConfigurationModel.class);

	@Self
	protected SlingHttpServletRequest request;

	@ScriptVariable
	private Page currentPage;

	@OSGiService
	private GlobalConfigurationService configService;

	@ScriptVariable(name = "wcmmode", injectionStrategy = InjectionStrategy.OPTIONAL)
	private SightlyWCMMode wcmMode;

	private String configs;


	@PostConstruct
	protected void init() {
		LOG.debug("GlobalConfigurationModel currentPagePath {}", currentPage.getPath());
		JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);
		GlobalConfigurationUtils.filterAdminConfigs(jsonConfigs);
	
		if (isAuthorMode())
		{
			jsonConfigs.addProperty("authorMode", true);
		}
		addNavigationPaths(jsonConfigs);
		configs = jsonConfigs.toString();
	}

	public String getConfig() {
		return configs;
	}

	private boolean isAuthorMode()
	{
		return (wcmMode != null && !wcmMode.isDisabled());
	}
	
	private void addNavigationPaths(JsonObject jsonConfigs)
	{
		String parentPagePath = (currentPage.getParent() != null) ? currentPage.getParent().getPath() : "";
		String navigationPath = parentPagePath + "/";
		Constants.Config.NAVIGATION_PATHS.forEach((key, value) -> jsonConfigs.addProperty(key, navigationPath + value));
	}

}
