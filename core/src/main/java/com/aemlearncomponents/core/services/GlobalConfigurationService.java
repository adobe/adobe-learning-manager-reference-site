package com.aemlearncomponents.core.services;

import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;

public interface GlobalConfigurationService {

	public JsonObject getAdminConfigs(Page currentPage);
}
