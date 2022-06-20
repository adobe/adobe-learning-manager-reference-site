package com.adobe.learning.core.utils;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.adobe.learning.core.entity.EmbeddableLrngWidgetConfig;
import com.google.gson.JsonObject;

public class EmbeddableLrngWidgetUtilsTest {

	private String hostName;
	private Map<String, Object> widgetObject;

	@BeforeEach
	public void setUp()
	{
		hostName = "https://learningmanagerqe.adobe.com";
		widgetObject = new HashMap<>();
		widgetObject.put("auth.accessToken", "1234");
		widgetObject.put("commonConfig.almBaseURL", "https://learningmanagerqe.adobe.com");
		widgetObject.put("commonConfig.disableLinks", true);
		widgetObject.put("theme.primaryColor", "rgb(38,118,255)");
		widgetObject.put("theme.background", "transparent");
	}

	@Test
	public void testGetWidgetConfig()
	{
		JsonObject objects = EmbeddableLrngWidgetUtils.getWidgetConfig(widgetObject);
		assertNotNull(objects);
		String accessToken = objects.get("auth").getAsJsonObject().get("accessToken").getAsString();
		assertTrue(accessToken.equals("1234"));
		JsonObject commonObject = objects.get("commonConfig").getAsJsonObject();
		String hostName = commonObject.get("almBaseURL").getAsString();
		assertTrue(hostName.equals("https://learningmanagerqe.adobe.com"));
		String disableLink = commonObject.get("disableLinks").getAsString();
		assertTrue(disableLink.equals("true"));
		JsonObject themeObject = objects.get("theme").getAsJsonObject();
		String primaryColor = themeObject.get("primaryColor").getAsString();
		assertTrue(primaryColor.equals("rgb(38,118,255)"));
		String background = themeObject.get("background").getAsString();
		assertTrue(background.equals("transparent"));
		assertNotNull(objects);
	}

	@Test
	public void testGetEmbeddableWidgetsConfig()
	{
		List<EmbeddableLrngWidgetConfig> widgetsConfig = EmbeddableLrngWidgetUtils.getEmbeddableWidgetsConfig(hostName);
		assertNotNull(widgetsConfig);
		assertTrue(widgetsConfig.size() > 0);
	}
}
