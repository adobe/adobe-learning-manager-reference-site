package com.aemlearncomponents.core.models;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aemlearncomponents.core.services.GlobalConfigurationService;
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

	private String currentPagePath;
	private String configs;


	@PostConstruct
	protected void init() {
		JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);
		configs = jsonConfigs.toString();
		//		PageManager pageManager = request.getResourceResolver().adaptTo(PageManager.class);
		//		currentPagePath = Optional.ofNullable(pageManager)
		//				.map(pm -> pm.getContainingPage(request.getResource()))
		//				.map(Page::getPath).orElse("");

	}

	public String getConfig() {
		return configs;
	}

}
