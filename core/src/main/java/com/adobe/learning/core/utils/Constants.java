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

package com.adobe.learning.core.utils;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.day.cq.commons.jcr.JcrConstants;

public class Constants {

	public static final class Config {
		public static final List<String> AEM_NODE_PROP_PREFIXES = 
				Collections.unmodifiableList(Arrays.asList("jcr:", "cq:", "sling:"));
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
		public static final String COMMERCE_CUSTOMER_TOKEN_LIFETIME = "customerTokenLifetime";
		public static final String SITE_MAP = "siteMap";
		public static final String SITE_MAP_TRAINING_PATH = "sitemapTrainingPath";
		public static final String ES_BASE_URL_NAME = "esBaseUrl";
		public static final String COMMERCE_URL_NAME = "commerceURL";
		public static final String LEARNER_TOKEN_URL = "/oauth/o/learnerToken?learner_email={email}&min_validity_sec={min_validity_sec}";
		public static final long LEARNER_TOKEN_MIN_VALIDITY_SEC = 518400; // 24 Hr
		public static final String CONF_PROP_NAME = "cq:conf";
		public static final String CLOUD_CONFIG_SETTINGS = "settings";
		public static final String ALM_CONFIGURATION_NAME = "cloudconfigs/adobe-learning-manager-config";
		public static final String ALM_SUB_CONFIG_PATH =
				"/" + CLOUD_CONFIG_SETTINGS + "/" + ALM_CONFIGURATION_NAME + "/" + JcrConstants.JCR_CONTENT;
		private static final Map<String, String> MUTABLE_NAVIGATION_PATHS = new HashMap<String, String>();
		static
		{
			MUTABLE_NAVIGATION_PATHS.put("trainingOverviewPath", "overview.html");
			MUTABLE_NAVIGATION_PATHS.put("catalogPath", "explore.html");
			MUTABLE_NAVIGATION_PATHS.put("communityPath", "skills.html");
			MUTABLE_NAVIGATION_PATHS.put("communityBoardsPath", "boards.html");
			MUTABLE_NAVIGATION_PATHS.put("communityBoardDetailsPath", "board.html");
			MUTABLE_NAVIGATION_PATHS.put("instancePath", "instance.html");
			MUTABLE_NAVIGATION_PATHS.put("profilePath", "profile.html");
			MUTABLE_NAVIGATION_PATHS.put("homePath", "home.html");
			MUTABLE_NAVIGATION_PATHS.put("learningPath", "learning.html");
			MUTABLE_NAVIGATION_PATHS.put("supportPath", "support.html");
			MUTABLE_NAVIGATION_PATHS.put("emailRedirectPath", "email-redirect.html");
			MUTABLE_NAVIGATION_PATHS.put("signOutPath", "sign-out.html");
			MUTABLE_NAVIGATION_PATHS.put("commerceSignInPath", "commerce.html");
			MUTABLE_NAVIGATION_PATHS.put("commerceCartPath", "commerce.html");
			MUTABLE_NAVIGATION_PATHS.put("commerceBasePath", "commerce.html");
		}
		public static final Map<String, String> NAVIGATION_PATHS = Collections.unmodifiableMap(MUTABLE_NAVIGATION_PATHS);
	}

	public static final class EmbeddableWidgetConfig {
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

	public static final class CPUrl {
		public static final String CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_CONFIG_URL = "/app/embeddablewidget?widgetRef=widgets-aem";
		public static final String WIDGET_SRC_URL = "{hostName}/app/embeddablewidget?widgetRef={widgetRef}&resourceType=html";
		public static final String WIDGET_COMMUNICATOR_URL = "{hostName}/app/embeddablewidget?widgetRef=com.adobe.captivateprime.widgetcommunicator";
	}
}
