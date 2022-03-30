package com.adobe.learning.core.utils;

import com.google.gson.JsonObject;

public final class GlobalConfigurationUtils {
	
	public static void filterAdminConfigs(JsonObject globalConfig)
	{
		globalConfig.remove(Constants.Config.CLIENT_SECRET);
		globalConfig.remove(Constants.Config.SITES_AUTHOR_REFRESH_TOKEN_NAME);
		globalConfig.remove(Constants.Config.COMMERCE_ADMIN_REFRESH_TOKEN);
	}

}
