package com.adobe.learning.core.utils;

import java.util.HashMap;
import java.util.Map;

public class Constants {
	
	public static final String[] AEM_NODE_PROP_PREFIXES = {"jcr:", "cq:", "sling:"};

	public final class Config {
		public static final String USAGE_TYPE_NAME = "usageType";
		public static final String SITES_USAGE = "aem-sites";
		public static final String ES_USAGE = "aem-es";
		public static final String COMMERCE_USAGE = "aem-commerce";
		public static final String SITES_AUTHOR_REFRESH_TOKEN_NAME = "authorRefreshToken";
		public static final String ALM_BASE_URL = "almBaseURL";
		public static final String CLIENT_ID = "clientId";
		public static final String CLIENT_SECRET = "clientSecret";
		public static final String PAGE_LOCALE = "pageLocale";
		public static final String COMMERCE_ADMIN_REFRESH_TOKEN = "refreshToken";
		public static final String COMMERCE_URL = "commerceURL";
		public static final String SITE_MAP = "siteMap";
		public static final String SITE_MAP_TRAINING_PATH = "sitemapTrainingPath";
		public static final String ES_BASE_URL_NAME = "esBaseUrl";
		public static final String COMMERCE_URL_NAME = "commerceURL";
		public static final String LEARNER_TOKEN_URL = "/oauth/o/learnerToken?learner_email={email}&min_validity_sec={min_validity_sec}";
		public static final long LEARNER_TOKEN_MIN_VALIDITY_SEC = 518400; // 24 Hr
	}

	public final class EmbeddableWidgetConfig {
		public static final String WIDGET_REF = "widgetRef";
		public static final String SELECTED_WIDGET_REF = "widgetRefSelected";
		public static final String SOCIAL_WIDGET_REF = "com.adobe.captivateprime.social";
		public static final String LEADERBOARD_WIDGET_REF = "com.adobe.captivateprime.leaderboard";
		public static final String CP_HOST_NAME_PROP = "commonConfig.captivateHostName";
		public static final String CP_EMIT_PLAYER_EVENT_PROP = "commonConfig.emitPlayerLaunchEvent";
		public static final boolean CP_EMIT_PLAYER_EVENT_PROP_VALUE = true;
		public static final String CP_DISABLE_LINKS_PROP = "commonConfig.disableLinks";
		public static final boolean CP_DISABLE_LINKS_PROP_DEFAULT_VALUE = false;
		public static final boolean CP_DISABLE_LINKS_PROP_VALUE_TRUE = true;
		public static final String CP_EMIT_PAGELINK_EVENT_PROP = "commonConfig.emitPageLinkEvents";
		public static final boolean CP_EMIT_PAGELINK_EVENT_PROP_VALUE = true;
		public static final String CONFIG_TYPE_KEY = "type";
		public static final String CONFIG_TYPE_VALUE = "acapConfig";
		public static final String AUTH_ACCESS_TOKEN_KEY = "auth.accessToken";
	}

	public final class CPUrl {
		public static final String CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_SRC_URL = "{hostName}/app/embeddablewidget?widgetRef={widgetRef}&resourceType=html";
		public static final String WIDGET_COMMUNICATOR_URL = "{hostName}/app/embeddablewidget?widgetRef=com.adobe.captivateprime.widgetcommunicator";
	}
	
	public static Map<String, String> NAVIGATION_PATHS = new HashMap<String, String>();
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
		NAVIGATION_PATHS.put("emailRedirectPath", "email-redirect.html");
		NAVIGATION_PATHS.put("signOutPath", "sign-out.html");
		NAVIGATION_PATHS.put("commerceSignInPath", "commerce.html");
		NAVIGATION_PATHS.put("commerceCartPath", "commerce.html");
		NAVIGATION_PATHS.put("commerceBasePath", "commerce.html");
	}
}
