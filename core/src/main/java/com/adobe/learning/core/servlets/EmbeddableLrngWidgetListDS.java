package com.adobe.learning.core.servlets;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.Servlet;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.adobe.granite.ui.components.ds.DataSource;
import com.adobe.granite.ui.components.ds.SimpleDataSource;
import com.adobe.granite.ui.components.ds.ValueMapResource;
import com.adobe.learning.core.entity.EmbeddableLrngWidgetConfig;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.adobe.learning.core.utils.EmbeddableLrngWidgetUtils;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.google.gson.JsonObject;

@Component(service = Servlet.class, property = {"sling.servlet.methods=GET", "sling.servlet.resourceTypes=" + EmbeddableLrngWidgetListDS.RESOURCE_TYPE})
public class EmbeddableLrngWidgetListDS extends SlingAllMethodsServlet {

	private static final long serialVersionUID = 6208632688001248037L;

	final static String RESOURCE_TYPE = "cpPrime/widgets/datasource/widgetsSelectDatasource";

	@Reference
	private transient GlobalConfigurationService configService;

	@Override
	protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response)
	{

		String requestSuffix = "";
		List<Resource> resourceList = new ArrayList<>();

		if (null != request.getRequestPathInfo().getSuffix())
		{
			requestSuffix = request.getRequestPathInfo().getSuffix();
			Resource resource = request.getResourceResolver().getResource(requestSuffix);

			if (resource != null)
			{
				PageManager pageManager = resource.getResourceResolver().adaptTo(PageManager.class);
				if (pageManager != null)
				{
					Page currentPage = pageManager.getContainingPage(resource);

					JsonObject adminObj = configService.getAdminConfigs(currentPage);
					String hostName = adminObj.get(Constants.Config.ALM_BASE_URL).getAsString();

					List<EmbeddableLrngWidgetConfig> widgets = EmbeddableLrngWidgetUtils.getEmbeddableWidgetsConfig(hostName);
					List<EmbeddableLrngWidgetConfig> availableWidgetsList = getAvailableWidgets(widgets);

					for (EmbeddableLrngWidgetConfig widgetConfig : availableWidgetsList)
					{
						ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
						String value = widgetConfig.getWidgetRef();
						vm.put("value", value);
						vm.put("text", widgetConfig.getName());
						resourceList.add(new ValueMapResource(request.getResourceResolver(), "", "", vm));
					}
				}
			}
		}

		request.setAttribute(DataSource.class.getName(), new SimpleDataSource(resourceList.iterator()));
	}

	private List<EmbeddableLrngWidgetConfig> getAvailableWidgets(List<EmbeddableLrngWidgetConfig> widgets)
	{
		return widgets.stream().filter(widget -> widget.getType().equals("widget")).collect(Collectors.toList());
	}
}
