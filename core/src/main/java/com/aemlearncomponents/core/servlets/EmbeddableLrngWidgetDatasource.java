package com.aemlearncomponents.core.servlets;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import javax.servlet.Servlet;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.osgi.service.component.annotations.Component;

import com.adobe.granite.ui.components.ValueMapResourceWrapper;
import com.adobe.granite.ui.components.ds.DataSource;
import com.adobe.granite.ui.components.ds.SimpleDataSource;
import com.adobe.granite.ui.components.ds.ValueMapResource;
import com.aemlearncomponents.core.entity.EmbeddableLrngWidgetConfig;
import com.aemlearncomponents.core.entity.EmbeddableLrngWidgetOptions;
import com.aemlearncomponents.core.services.GlobalConfigurationService;
import com.aemlearncomponents.core.utils.Constants;
import com.aemlearncomponents.core.utils.EmbeddableLrngWidgetUtils;
import com.day.cq.commons.jcr.JcrConstants;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

@Component(service = Servlet.class, property = {"sling.servlet.methods=GET", "sling.servlet.resourceTypes=" + EmbeddableLrngWidgetDatasource.RESOURCE_TYPE})
public class EmbeddableLrngWidgetDatasource extends SlingAllMethodsServlet
{

	private static final long serialVersionUID = 6208450620001248037L;

	@OSGiService
	private transient GlobalConfigurationService configService;
	
	final static String RESOURCE_TYPE = "cpPrime/widgets/datasource/widgetsdatasource";

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
				Page currentPage = resource.adaptTo(Page.class);
				ValueMap valueMap = resource.getValueMap();
				JsonObject adminObj = configService.getAdminConfigs(currentPage);

				Map<String, Object> adminConfigs = new HashMap<String, Object>();

				for(Entry<String, JsonElement> entry : adminObj.entrySet())
				{
					adminConfigs.put(entry.getKey(), entry.getValue().getAsString());
				}

				String hostName = adminObj.get(Constants.Config.ALM_BASE_URL).getAsString();

				List<EmbeddableLrngWidgetConfig> widgets = EmbeddableLrngWidgetUtils.getEmbeddableWidgetsConfig(hostName);
				List<EmbeddableLrngWidgetConfig> availableWidgetsList = getAvailableWidgets(widgets);
				String selectedWidgetRef = valueMap.get(Constants.EmbeddableWidgetConfig.SELECTED_WIDGET_REF) != null ? valueMap.get(Constants.EmbeddableWidgetConfig.SELECTED_WIDGET_REF).toString() : null;
				if (selectedWidgetRef == null)
				{
					selectedWidgetRef = availableWidgetsList.get(0).getWidgetRef();
				}

				Resource widgetSelectDropdown = request.getResource().getChild("widgetSelect");
				resourceList.add(widgetSelectDropdown);

				for (EmbeddableLrngWidgetConfig widgetConfig : availableWidgetsList)
				{
					createDataSourceForWidget(request, widgetConfig, selectedWidgetRef, resourceList, valueMap);
				}
			}
		}

		request.setAttribute(DataSource.class.getName(), new SimpleDataSource(resourceList.iterator()));

	}

	private void createDataSourceForWidget(SlingHttpServletRequest request, EmbeddableLrngWidgetConfig widgetConfig, String selectedWidgetRef,
			List<Resource> resourceList, ValueMap map)
	{
		boolean hide = !selectedWidgetRef.equals(widgetConfig.getWidgetRef());
		String itemType = widgetConfig.getWidgetRef();

		for (EmbeddableLrngWidgetOptions option : widgetConfig.getOptions())
		{
			String type = option.getType();
			String name = "./" + option.getRef();
			String value = "", emptyText = "";
			String fieldLabel = option.getName();
			boolean hideOption = option.getHidden();

			boolean required = option.getMandatory();
			if (hideOption)
			{
				value = option.getDefaultValue();
			} else if ((widgetConfig.getWidgetRef() != null) && selectedWidgetRef != null && widgetConfig.getWidgetRef().equals(selectedWidgetRef))
			{
				value = map.get(option.getRef()) != null ? map.get(option.getRef()).toString() : "";
			}

			switch (type)
			{
			case "color":
				emptyText = widgetConfig.getDefault();
				resourceList.add(createColorPickerResource(request, name, value, emptyText, required, fieldLabel, hide, itemType, hideOption));
				break;

			case "string":
				emptyText = widgetConfig.getDefault();
				resourceList.add(createTextFieldResource(request, name, value, emptyText, required, fieldLabel, hide, itemType, hideOption));
				break;

			case "boolean":
				resourceList.add(createCheckBoxResource(request, name, value, widgetConfig.getName(), fieldLabel, hide, itemType, hideOption));
				break;

			default:
				String[] values = type.split("\\|");
				resourceList.add(createDropdownResource(request, name, required, fieldLabel, hide, values, itemType, hideOption));
				break;
			}
		}
	}

	private ValueMapResource createTextFieldResource(SlingHttpServletRequest request, String name, String value, String emptyText, boolean required,
			String fieldLabel, boolean hide, String itemType, boolean hideOption)
	{
		String resourceType = "granite/ui/components/coral/foundation/form/textfield";
		ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
		vm.put("name", name);
		vm.put("emptyText", emptyText);
		vm.put("value", value);
		vm.put("required", required);
		vm.put("renderHidden", hide);
		vm.put("fieldLabel", fieldLabel);
		vm.put("granite:itemtype", itemType);
		if (hideOption)
		{
			vm.put("labelId", "hideOption");
		}
		return new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);
	}

	private ValueMapResource createCheckBoxResource(SlingHttpServletRequest request, String name, String value, String text, String fieldLabel,
			boolean hide, String itemType, boolean hideOption)
	{
		String resourceType = "granite/ui/components/coral/foundation/form/checkbox";
		ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
		vm.put("name", name);
		vm.put("value", value);
		vm.put("text", text);
		vm.put("renderHidden", hide);
		vm.put("fieldLabel", fieldLabel);
		vm.put("granite:itemtype", itemType);
		if (hideOption)
		{
			vm.put("labelId", "hideOption");
		}
		return new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);
	}

	private ValueMapResource createColorPickerResource(SlingHttpServletRequest request, String name, String value, String emptyText, boolean required,
			String fieldLabel, boolean hide, String itemType, boolean hideOption)
	{
		String resourceType = "granite/ui/components/coral/foundation/form/colorfield";
		ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
		vm.put("name", name);
		vm.put("value", value);
		vm.put("emptyText", emptyText);
		vm.put("required", required);
		vm.put("renderHidden", hide);
		vm.put("fieldLabel", fieldLabel);
		vm.put("granite:itemtype", itemType);
		if (hideOption)
		{
			vm.put("labelId", "hideOption");
		}
		return new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);
	}

	private Resource createDropdownResource(SlingHttpServletRequest request, String name, boolean required, String fieldLabel, boolean hide,
			String[] values, String itemType, boolean hideOption)
	{
		String resourceType = "granite/ui/components/coral/foundation/form/select";
		ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());

		Resource res = new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);

		Resource wrapper = new ValueMapResourceWrapper(res, resourceType)
		{
			public Resource getChild(String relPath)
			{
				if ("items".equals(relPath))
				{
					Resource dataWrapper = new ValueMapResourceWrapper(res, JcrConstants.NT_UNSTRUCTURED)
					{
						public Iterator<Resource> listChildren()
						{
							List<Resource> itemsResourceList = new ArrayList<Resource>();

							for (String value : values)
							{
								ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
								vm.put("value", value);
								vm.put("text", value);
								itemsResourceList.add(new ValueMapResource(request.getResourceResolver(), "", JcrConstants.NT_UNSTRUCTURED, vm));
							}

							return itemsResourceList.iterator();
						}
					};
					return dataWrapper;
				} else
				{
					return super.getChild(relPath);
				}
			}
		};
		ValueMap valueMap = wrapper.adaptTo(ValueMap.class);
		if (valueMap != null)
		{
			valueMap.put("name", name);
			valueMap.put("required", required);
			valueMap.put("renderHidden", hide);
			valueMap.put("fieldLabel", fieldLabel);
			valueMap.put("granite:itemtype", itemType);
			if (hideOption)
			{
				vm.put("labelId", "hideOption");
			}
		}
		return wrapper;

	}

	private List<EmbeddableLrngWidgetConfig> getAvailableWidgets(List<EmbeddableLrngWidgetConfig> widgets)
	{
		return widgets.stream().filter(widget -> widget.getType().equals("widget")).collect(Collectors.toList());
	}
}

