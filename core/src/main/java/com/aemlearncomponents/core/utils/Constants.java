package com.aemlearncomponents.core.utils;

public final class Constants {

	public final class Config {
		public static final String USAGE_TYPE_NAME = "usageType";
		public static final String SITES_USAGE = "sites";
		public static final String SITES_AUTHOR_REFRESH_TOKEN_NAME = "authorRefreshToken";
		public static final String PRIME_URL = "primeUrl";
		public static final String CLIENT_ID = "clientId";
		public static final String CLIENT_SECRET = "clientSecret";
	}

	public final class EmbeddableWidgetConfig
	{
		public static final String WIDGET_REF = "widgetRef";
		public static final String CP_NODE_PROPERTY_PREFIX = "cpWidget#";
		public static final String SELECTED_WIDGET_REF = "cpWidget#widgetRefSelected";
	}

	public final class CPUrl
	{
		public static final String CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_SRC_URL = "{hostName}/app/embeddablewidget?widgetRef={widgetRef}&resourceType=html";
		public static final String WIDGET_COMMUNICATOR_URL = "{hostName}/app/embeddablewidget?widgetRef=com.adobe.captivateprime.widgetcommunicator";
	}

}
