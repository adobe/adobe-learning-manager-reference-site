package com.adobe.learning.core.models;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
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
import com.adobe.learning.core.services.CPTokenService;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class}, cache=true)
public class GlobalConfigurationModel {

	private static final Logger LOG = LoggerFactory.getLogger(GlobalConfigurationModel.class);

	@Self
	protected SlingHttpServletRequest request;

	@ScriptVariable
	private Page currentPage;

	@OSGiService
	private GlobalConfigurationService configService;

	@OSGiService
	private CPTokenService tokenService;

	@ScriptVariable(name = "wcmmode", injectionStrategy = InjectionStrategy.OPTIONAL)
	private SightlyWCMMode wcmMode;

	private String configs;


	@PostConstruct
	protected void init() {
		JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);
		String usageType = jsonConfigs.get(Constants.Config.USAGE_TYPE_NAME).getAsString();
	
		if (Constants.Config.SITES_USAGE.equals(usageType) && isAuthorMode())
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
		Constants.NAVIGATION_PATHS.forEach((key, value) -> jsonConfigs.addProperty(key, navigationPath + value));
	}

}
