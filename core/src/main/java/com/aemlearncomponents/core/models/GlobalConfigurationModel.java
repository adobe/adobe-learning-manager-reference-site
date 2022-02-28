package com.aemlearncomponents.core.models;

import java.util.Optional;
import java.util.stream.IntStream;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;

import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.google.gson.JsonObject;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class})
public class GlobalConfigurationModel {

	@Self
	protected SlingHttpServletRequest request;
	
	private String currentPagePath;
	
	private static final String[] colors = {"#00000", "#ffffff", "#445566"};
	
	@PostConstruct
	protected void init() {
		PageManager pageManager = request.getResourceResolver().adaptTo(PageManager.class);
		currentPagePath = Optional.ofNullable(pageManager)
                .map(pm -> pm.getContainingPage(request.getResource()))
                .map(Page::getPath).orElse("");

	}

	public String getConfig() {
		JsonObject globalConfig = new JsonObject();
		
		JsonObject primeColors = new JsonObject();
		IntStream.range(0, colors.length).forEach(index -> primeColors.addProperty(String.valueOf(index), colors[index]));
		globalConfig.add("primeColors", primeColors);
		
		return globalConfig.toString();
	}

}
