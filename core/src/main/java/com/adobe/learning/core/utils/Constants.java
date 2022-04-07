package com.adobe.learning.core.utils;

import java.util.HashMap;
import java.util.Map;

public class Constants {
	
	public static final String[] AEM_NODE_PROP_PREFIXES = {"jcr:", "cq:", "sling:"};

	public final class Config {
		public static final String USAGE_TYPE_NAME = "usageType";
		public static final String SITES_USAGE = "aem-sites";
		public static final String SITES_AUTHOR_REFRESH_TOKEN_NAME = "authorRefreshToken";
		public static final String ALM_BASE_URL = "almBaseURL";
		public static final String CLIENT_ID = "clientId";
		public static final String CLIENT_SECRET = "clientSecret";
		public static final String PAGE_LOCALE = "pageLocale";
		public static final String COMMERCE_ADMIN_REFRESH_TOKEN = "refreshToken";
	}

	public final class EmbeddableWidgetConfig {
		public static final String WIDGET_REF = "widgetRef";
		// public static final String CP_NODE_PROPERTY_PREFIX = "cpWidget#";
		public static final String SELECTED_WIDGET_REF = "widgetRefSelected";
		public static final String CP_HOST_NAME_PROP = "commonConfig.captivateHostName";
		public static final String CP_EMIT_PLAYER_EVENT_PROP = "commonConfig.emitPlayerLaunchEvent";
		public static final boolean CP_EMIT_PLAYER_EVENT_PROP_VALUE = true;
		public static final String CONFIG_TYPE_KEY = "type";
		public static final String CONFIG_TYPE_VALUE = "acapConfig";
		public static final String AUTH_ACCESS_TOKEN_KEY = "auth.accessToken";
		// public static final String CP_THEME_BACKGROUND_PROP = "theme.background";
		// public static final String CP_THEME_BACKGROUND_PROP_VALUE = "transparent";
	}

	public final class CPUrl {
		public static final String CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_SRC_URL = "{hostName}/app/embeddablewidget?widgetRef={widgetRef}&resourceType=html";
		public static final String WIDGET_COMMUNICATOR_URL = "{hostName}/app/embeddablewidget?widgetRef=com.adobe.captivateprime.widgetcommunicator";
	}
	
	public static final Map<String, String> NAVIGATION_PATHS = new HashMap<String, String>();
	static {
		NAVIGATION_PATHS.put("trainingOverviewPath", "overview.html");
		NAVIGATION_PATHS.put("catalogPath", "explore.html");
		NAVIGATION_PATHS.put("communityPath", "skills.html");
		NAVIGATION_PATHS.put("communityBoardsPath", "boards.html");
		NAVIGATION_PATHS.put("communityBoardDetailsPath", "board.html");
		NAVIGATION_PATHS.put("instancePath", "instance.html");
		NAVIGATION_PATHS.put("profilePath", "profile.html");
		NAVIGATION_PATHS.put("homePath", "home.html");
		NAVIGATION_PATHS.put("learningPath", "learning.html");
		NAVIGATION_PATHS.put("supportPath", "support.html");
		NAVIGATION_PATHS.put("commerceSignInPath", "commerce/signIn.html");
	}
	/*
	 * public static final String TRAINING_OVERVIEW_PATH = "trainingOverviewPath";
	 * public static final String TRAINING_OVERVIEW_PATH_VALUE = "overview.html";
	 * 
	 * public static final String CATALOG_PATH = "catalogPath"; public static final
	 * String CATALOG_PATH_VALUE = "explore.html";
	 * 
	 * public static final String COMMUNITY_PATH = "communityPath"; public static
	 * final String COMMUNITY_PATH_VALUE = "skills.html";
	 * 
	 * public static final String COMMUNITY_BOARDS_PATH = "communityBoardsPath";
	 * public static final String COMMUNITY_BOARDS_PATH_VALUE = "boards.html";
	 * 
	 * public static final String COMMUNITY_BOARD_DETAILS_PATH =
	 * "communityBoardDetailsPath"; public static final String
	 * COMMUNITY_BOARD_DETAILS_PATH_VALUE = "board.html";
	 * 
	 * public static final String INSTANCE_PATH = "instancePath"; public static
	 * final String INSTANCE_PATH_VALUE = "instance.html";
	 * 
	 * public static final String PROFILE_PATH = "profilePath"; public static final
	 * String PROFILE_PATH_VALUE = "profile.html";
	 * 
	 * public static final String HOME_PATH = "homePath"; public static final String
	 * HOME_PATH_VALUE = "home.html";
	 * 
	 * public static final String LEARNING_PATH = "learningPath"; public static
	 * final String LEARNING_PATH_VALUE = "learning.html";
	 * 
	 * public static final String SUPPORT_PATH = "supportPath"; public static final
	 * String SUPPORT_PATH_VALUE = "support.html";
	 */
}
