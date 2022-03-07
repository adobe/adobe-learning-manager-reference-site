package com.aemlearncomponents.core.models;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aemlearncomponents.core.entity.EmbeddableLrngWidgetConfig;
import com.aemlearncomponents.core.services.GlobalConfigurationService;
import com.aemlearncomponents.core.utils.Constants;
import com.aemlearncomponents.core.utils.EmbeddableLrngWidgetUtils;
import com.day.cq.wcm.api.Page;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

@Model(adaptables = {SlingHttpServletRequest.class, Resource.class})
public class EmbeddableLrngWidgetModel {

	@OSGiService
	private transient GlobalConfigurationService configService;

	@ScriptVariable
	private Page currentPage;

	@Self
	private SlingHttpServletRequest request;

	private static final Logger LOGGER = LoggerFactory.getLogger(EmbeddableLrngWidgetModel.class);

	private Resource resource;
	private String selectedWidgetRef = "";
	private String selectedRef = "";
	private String widgetConfigs = "";
	private String widgetSrcUrl = "";
	private String widgetCommunicatorUrl = "";
	private ValueMap properties;

	public EmbeddableLrngWidgetModel(final SlingHttpServletRequest request)
	{
	}

	@PostConstruct
	public void init()
	{
		resource = request.getResource();
		properties = resource.getValueMap();
		JsonObject adminConfigsObj = configService.getAdminConfigs(currentPage);

		String hostName = adminConfigsObj.get(Constants.Config.ALM_BASE_URL).getAsString();

		LOGGER.debug("EmbeddableLrngWidgetModel Init:: currentPage {} hostName {}", currentPage.getPath(), hostName);
		ValueMap map = resource.getValueMap();

		if (map != null)
		{
			List<EmbeddableLrngWidgetConfig> widgets = EmbeddableLrngWidgetUtils.getEmbeddableWidgetsConfig(hostName);
			LOGGER.trace("EmbeddableWidgetModel Init:: Widgets from CP {}", new Gson().toJson(widgets));
			List<EmbeddableLrngWidgetConfig> availableWidgetsList = getAvailableWidgets(widgets);
			selectedWidgetRef = map.get(Constants.EmbeddableWidgetConfig.SELECTED_WIDGET_REF) != null ? map.get(Constants.EmbeddableWidgetConfig.SELECTED_WIDGET_REF).toString() : null;
			if (selectedWidgetRef == null)
			{
				selectedWidgetRef = availableWidgetsList.get(0).getWidgetRef();
			}
			Optional<EmbeddableLrngWidgetConfig> opSelectedWidgetConfig =
					availableWidgetsList.stream().filter(widget -> widget.getWidgetRef().equals(selectedWidgetRef)).findFirst();
			EmbeddableLrngWidgetConfig selectedWidgetConfig;
			if (opSelectedWidgetConfig.isPresent())
			{
				selectedWidgetConfig = opSelectedWidgetConfig.get();
			} else
			{
				selectedWidgetConfig = availableWidgetsList.get(0);
			}
			selectedRef = selectedWidgetConfig.getRef();
			widgetSrcUrl = Constants.CPUrl.WIDGET_SRC_URL.replace("{hostName}", hostName).replace("{widgetRef}", selectedWidgetConfig.getRef());
			widgetCommunicatorUrl = Constants.CPUrl.WIDGET_COMMUNICATOR_URL.replace("{hostName}", hostName);
		}

		this.widgetConfigs = getWidgetConfig(map, selectedWidgetRef, adminConfigsObj);
	}

	private String getWidgetConfig(Map<String, Object> valueMap, String selectedWidgetRef, JsonObject adminConfigsObj)
	{
		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
		Map<String, Object> widgetObject = new HashMap<>();
		for (Entry<String, Object> e : valueMap.entrySet())
		{
			String key = e.getKey();

			Object value = e.getValue();
			if (value instanceof String)
			{
				widgetObject.put(key, value.toString());
			} else if (value instanceof Integer)
			{
				widgetObject.put(key, (Integer) value);
			} else if (value instanceof Boolean)
			{
				widgetObject.put(key, (Boolean) value);
			} else
			{
				widgetObject.put(key, gson.toJson(value));
			}
		}
		widgetObject.put("widgetConfig.widgetRef", selectedWidgetRef);
		widgetObject.put("type", "acapConfig");
		widgetObject.put("auth.accessToken", "");
		widgetObject.put(Constants.EmbeddableWidgetConfig.CP_HOST_NAME_PROP, adminConfigsObj.get(Constants.Config.ALM_BASE_URL).getAsString());
		widgetObject.put(Constants.EmbeddableWidgetConfig.CP_EMIT_PLAYER_EVENT_PROP, Constants.EmbeddableWidgetConfig.CP_EMIT_PLAYER_EVENT_PROP_VALUE);
		//widgetObject.put(Constants.EmbeddableWidgetConfig.CP_THEME_BACKGROUND_PROP, Constants.EmbeddableWidgetConfig.CP_THEME_BACKGROUND_PROP_VALUE);
		

//		widgetObject.remove(Constants.Config.CLIENT_ID);
//		widgetObject.remove(Constants.Config.CLIENT_SECRET);
//		widgetObject.remove(Constants.Config.SITES_AUTHOR_REFRESH_TOKEN_NAME);
		
		for (Entry<String, JsonElement> e : adminConfigsObj.entrySet())
		{
			widgetObject.put(e.getKey(), e.getValue().getAsString());
		}

		JsonObject obj = EmbeddableLrngWidgetUtils.getWidgetConfig(widgetObject);
		
		return gson.toJson(obj);
	}

	public String getWidgetConfigs()
	{
		return widgetConfigs;
	}

	public String getProperties()
	{
		return new Gson().toJson(properties);
	}

	public String getWidgetSrcUrl()
	{
		return widgetSrcUrl;
	}

	public String getSelectedRef()
	{
		return selectedRef;
	}

	public String getWidgetCommunicatorUrl()
	{
		return widgetCommunicatorUrl;
	}

	private List<EmbeddableLrngWidgetConfig> getAvailableWidgets(List<EmbeddableLrngWidgetConfig> widgets)
	{
		return widgets.stream().filter(widget -> widget.getType().equals("widget")).collect(Collectors.toList());
	}
}
