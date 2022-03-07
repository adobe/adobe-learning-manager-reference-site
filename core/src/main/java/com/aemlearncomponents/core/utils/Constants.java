package com.aemlearncomponents.core.utils;

public final class Constants {
	
	public static final String[] AEM_NODE_PROP_PREFIXES = {"jcr:", "cq:", "sling:"};

	public final class Config {
		public static final String USAGE_TYPE_NAME = "usageType";
		public static final String SITES_USAGE = "sites";
		public static final String SITES_AUTHOR_REFRESH_TOKEN_NAME = "authorRefreshToken";
		public static final String PRIME_URL = "primeUrl";
		public static final String ALM_BASE_URL = "almBaseURL";
		public static final String CLIENT_ID = "clientId";
		public static final String CLIENT_SECRET = "clientSecret";
	}

	public final class EmbeddableWidgetConfig {
		public static final String WIDGET_REF = "widgetRef";
		// public static final String CP_NODE_PROPERTY_PREFIX = "cpWidget#";
		public static final String SELECTED_WIDGET_REF = "widgetRefSelected";
		public static final String CP_HOST_NAME_PROP = "commonConfig.captivateHostName";
		public static final String CP_EMIT_PLAYER_EVENT_PROP = "commonConfig.emitPlayerLaunchEvent";
		public static final boolean CP_EMIT_PLAYER_EVENT_PROP_VALUE = true;
		// public static final String CP_THEME_BACKGROUND_PROP = "theme.background";
		// public static final String CP_THEME_BACKGROUND_PROP_VALUE = "transparent";
	}

	public final class CPUrl {
		public static final String CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_SRC_URL = "{hostName}/app/embeddablewidget?widgetRef={widgetRef}&resourceType=html";
		public static final String WIDGET_COMMUNICATOR_URL = "{hostName}/app/embeddablewidget?widgetRef=com.adobe.captivateprime.widgetcommunicator";
	}

}
