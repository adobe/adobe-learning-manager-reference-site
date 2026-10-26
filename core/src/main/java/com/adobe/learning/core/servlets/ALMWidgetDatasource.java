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

package com.adobe.learning.core.servlets;

import com.adobe.granite.ui.components.ValueMapResourceWrapper;
import com.adobe.granite.ui.components.ds.DataSource;
import com.adobe.granite.ui.components.ds.SimpleDataSource;
import com.adobe.granite.ui.components.ds.ValueMapResource;
import com.adobe.learning.core.entity.ALMWidgetConfig;
import com.adobe.learning.core.entity.ALMWidgetOptions;
import com.adobe.learning.core.entity.AccountResponse;
import com.adobe.learning.core.services.ALMWidgetConfigService;
import com.adobe.learning.core.services.AccountService;
import com.day.cq.commons.jcr.JcrConstants;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.Servlet;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(
    service = Servlet.class,
    property = {
      "sling.servlet.methods=GET",
      "sling.servlet.resourceTypes=" + ALMWidgetDatasource.RESOURCE_TYPE
    })
public class ALMWidgetDatasource extends SlingAllMethodsServlet {

  private static final long serialVersionUID = 6208450620001248037L;

  private static final Logger LOGGER = LoggerFactory.getLogger(ALMWidgetDatasource.class);

  @Reference private transient AccountService accountService;

  @Reference private transient ALMWidgetConfigService widgetConfigService;

  static final String RESOURCE_TYPE = "learning/components/ALMWidget/datasource";

  @Override
  protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) {

    String requestSuffix = "";
    List<Resource> resourceList = new ArrayList<>();

    if (null != request.getRequestPathInfo().getSuffix()) {
      requestSuffix = request.getRequestPathInfo().getSuffix();
      Resource resource = request.getResourceResolver().getResource(requestSuffix);

      if (resource != null) {
        ResourceResolver resolver = request.getResourceResolver();
        List<ALMWidgetConfig> widgets = widgetConfigService.getWidgetConfigs();
        List<ALMWidgetConfig> availableWidgetsList = getAvailableWidgets(widgets);

        // Fetch account response for nomenclature and filtering
        AccountResponse accountResponse = getAccountResponse(resolver, requestSuffix);
        Map<String, String> nomenclatureMap =
            (accountResponse != null)
                ? accountService.buildNomenclatureMap(accountResponse)
                : Collections.emptyMap();
        String effectiveAccountType =
            (accountResponse != null) ? accountResponse.getEffectiveAccountType() : null;

        // Filter widgets by account type
        List<ALMWidgetConfig> filteredWidgets =
            filterWidgetsByAccountType(availableWidgetsList, effectiveAccountType);

        String selectedWidgetRef = resource.getValueMap().get("widgetRefSelected", String.class);
        if (selectedWidgetRef == null && !filteredWidgets.isEmpty()) {
          selectedWidgetRef = filteredWidgets.get(0).getRef();
        }

        // If selected widget was filtered out, reset to first available
        final String resolvedSelectedRef = selectedWidgetRef;
        boolean selectedWidgetStillAvailable =
            filteredWidgets.stream().anyMatch(w -> w.getRef().equals(resolvedSelectedRef));
        if (!selectedWidgetStillAvailable && !filteredWidgets.isEmpty()) {
          selectedWidgetRef = filteredWidgets.get(0).getRef();
        }

        Resource widgetSelectDropdown = request.getResource().getChild("widgetSelect");
        if (widgetSelectDropdown != null) {
          resourceList.add(widgetSelectDropdown);
        }

        for (ALMWidgetConfig widgetConfig : filteredWidgets) {
          createDataSourceForWidget(
              request,
              widgetConfig,
              selectedWidgetRef,
              resourceList,
              resource.getValueMap(),
              nomenclatureMap,
              effectiveAccountType,
              accountResponse);
        }
      }
    }

    request.setAttribute(DataSource.class.getName(), new SimpleDataSource(resourceList.iterator()));
  }

  private void createDataSourceForWidget(
      SlingHttpServletRequest request,
      ALMWidgetConfig widgetConfig,
      String selectedWidgetRef,
      List<Resource> resourceList,
      ValueMap map,
      Map<String, String> nomenclatureMap,
      String effectiveAccountType,
      AccountResponse accountResponse) {
    boolean hide = !selectedWidgetRef.equals(widgetConfig.getRef());
    String itemType = widgetConfig.getRef();

    for (ALMWidgetOptions option : widgetConfig.getOptions()) {
      String type = option.getType();
      String name = "./" + option.getRef();
      String value = "", emptyText = "";
      String[] values = null;
      // Apply nomenclature replacement to fieldLabel (option.getName())
      String fieldLabel = replaceNomenclatureKeys(option.getName(), nomenclatureMap);
      boolean hideOption = option.getHidden();
      boolean multiSelect = option.getMultiSelect();
      boolean required = option.getMandatory();
      if (hideOption) {
        // Apply nomenclature replacement to defaultValue
        value = replaceNomenclatureKeys(option.getDefaultValue(), nomenclatureMap);
      } else if ((widgetConfig.getRef() != null)
          && selectedWidgetRef != null
          && widgetConfig.getRef().equals(selectedWidgetRef)) {
        // Get value from JCR, or use default value if not present
        Object propertyValue = map.get(option.getRef());
        if (propertyValue != null) {
          // Handle array values for multiSelect scenarios
          if (propertyValue instanceof String[]) {
            values = (String[]) propertyValue;
            // For single value fields, take first element
            if (values.length > 0) {
              value = values[0];
            }
          } else {
            value = propertyValue.toString();
          }
        } else {
          // Property doesn't exist - use default value if available
          // Apply nomenclature replacement to defaultValue
          String defaultValue = option.getDefaultValue();
          value =
              defaultValue != null ? replaceNomenclatureKeys(defaultValue, nomenclatureMap) : "";
        }
      }

      switch (type) {
        case "color":
          resourceList.add(
              createColorPickerResource(
                  request, name, value, required, fieldLabel, hide, itemType, hideOption));
          break;

        case "string":
          resourceList.add(
              createTextFieldResource(
                  request, name, value, required, fieldLabel, hide, itemType, hideOption));
          break;

        case "boolean":
          resourceList.add(
              createCheckBoxResource(
                  request, name, value, fieldLabel, fieldLabel, hide, itemType, hideOption));
          break;

        case "autocomplete":
          // Apply nomenclature replacement to emptyText
          emptyText = replaceNomenclatureKeys(option.getEmptyText(), nomenclatureMap);
          String dataSource = option.getDataSource();
          resourceList.add(
              createAutocompleteResource(
                  request,
                  name,
                  multiSelect ? values : new String[] {value},
                  emptyText,
                  required,
                  fieldLabel,
                  hide,
                  itemType,
                  hideOption,
                  multiSelect,
                  dataSource,
                  option.getDraggable()));
          break;

        case "radio":
          // Handle radio button groups
          if (option.getOptions() != null && !option.getOptions().isEmpty()) {
            // Just use the value from JCR, defaults are handled by JavaScript
            resourceList.add(
                createRadioGroupResource(
                    request,
                    name,
                    value,
                    fieldLabel,
                    hide,
                    itemType,
                    hideOption,
                    option.getOptions(),
                    nomenclatureMap));
          }
          break;

        case "select":
          // Handle select dropdowns
          if (option.getOptions() != null && !option.getOptions().isEmpty()) {
            resourceList.add(
                createSelectResource(
                    request,
                    name,
                    value,
                    required,
                    fieldLabel,
                    hide,
                    itemType,
                    hideOption,
                    option.getOptions(),
                    nomenclatureMap,
                    accountResponse));
          }
          break;

        default:
          // Fallback for legacy pipe-separated values
          String[] dropdownValues = type.split("\\|");
          resourceList.add(
              createDropdownResource(
                  request,
                  name,
                  required,
                  fieldLabel,
                  hide,
                  dropdownValues,
                  itemType,
                  hideOption,
                  nomenclatureMap));
          break;
      }
    }
  }

  private ValueMapResource createTextFieldResource(
      SlingHttpServletRequest request,
      String name,
      String value,
      boolean required,
      String fieldLabel,
      boolean hide,
      String itemType,
      boolean hideOption) {
    String resourceType = "granite/ui/components/coral/foundation/form/textfield";
    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
    vm.put("name", name);
    vm.put("value", value);
    vm.put("required", required);
    vm.put("renderHidden", hide);
    vm.put("fieldLabel", fieldLabel);
    vm.put("granite:itemtype", itemType);
    if (hideOption) {
      vm.put("labelId", "hideOption");
      vm.put("granite:rel", "hideOption");
    }
    return new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);
  }

  private ValueMapResource createCheckBoxResource(
      SlingHttpServletRequest request,
      String name,
      String value,
      String text,
      String fieldLabel,
      boolean hide,
      String itemType,
      boolean hideOption) {
    String resourceType = "granite/ui/components/coral/foundation/form/checkbox";
    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
    vm.put("name", name);
    vm.put("text", text);
    vm.put("value", "{Boolean}true");
    vm.put("uncheckedValue", "{Boolean}false");

    // Determine checked state - value must be explicitly "true"
    if (value != null && "true".equalsIgnoreCase(value.trim())) {
      vm.put("checked", true);
    }

    vm.put("renderHidden", hide);
    vm.put("fieldLabel", fieldLabel);
    vm.put("granite:itemtype", itemType);
    if (hideOption) {
      vm.put("labelId", "hideOption");
      vm.put("granite:rel", "hideOption");
    }
    return new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);
  }

  private ValueMapResource createColorPickerResource(
      SlingHttpServletRequest request,
      String name,
      String value,
      boolean required,
      String fieldLabel,
      boolean hide,
      String itemType,
      boolean hideOption) {
    String resourceType = "granite/ui/components/coral/foundation/form/colorfield";
    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
    vm.put("name", name);
    vm.put("value", value);
    vm.put("required", required);
    vm.put("renderHidden", hide);
    vm.put("fieldLabel", fieldLabel);
    vm.put("granite:itemtype", itemType);
    if (hideOption) {
      vm.put("labelId", "hideOption");
    }
    return new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);
  }

  private Resource createSelectResource(
      SlingHttpServletRequest request,
      String name,
      String value,
      boolean required,
      String fieldLabel,
      boolean hide,
      String itemType,
      boolean hideOption,
      List<Map<String, String>> options,
      Map<String, String> nomenclatureMap,
      AccountResponse accountResponse) {
    String resourceType = "granite/ui/components/coral/foundation/form/select";
    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());

    Resource res = new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);

    Resource wrapper =
        new ValueMapResourceWrapper(res, resourceType) {
          @Override
          public Resource getChild(String relPath) {
            if ("items".equals(relPath)) {
              Resource dataWrapper =
                  new ValueMapResourceWrapper(res, JcrConstants.NT_UNSTRUCTURED) {
                    @Override
                    public Iterator<Resource> listChildren() {
                      List<Resource> itemsResourceList = new ArrayList<Resource>();

                      for (Map<String, String> option : options) {
                        // Filter by feature flag restriction
                        String requiredFeature = option.get("requiresFeature");
                        if (requiredFeature != null && accountResponse != null) {
                          if ("prlProductsEnabled".equals(requiredFeature)
                              && !accountResponse.isPrlProductsEnabled()) {
                            continue;
                          }
                          if ("prlRolesEnabled".equals(requiredFeature)
                              && !accountResponse.isPrlRolesEnabled()) {
                            continue;
                          }
                        }

                        ValueMap optionVm = new ValueMapDecorator(new HashMap<String, Object>());
                        optionVm.put("value", option.get("value"));
                        // Apply nomenclature replacement to option label
                        String optionLabel =
                            replaceNomenclatureKeys(option.get("label"), nomenclatureMap);
                        optionVm.put("text", optionLabel);

                        // Set selected state
                        if (value != null && value.equals(option.get("value"))) {
                          optionVm.put("selected", true);
                        }

                        itemsResourceList.add(
                            new ValueMapResource(
                                request.getResourceResolver(),
                                "",
                                JcrConstants.NT_UNSTRUCTURED,
                                optionVm));
                      }

                      return itemsResourceList.iterator();
                    }
                  };
              return dataWrapper;
            } else {
              return super.getChild(relPath);
            }
          }
        };
    ValueMap valueMap = wrapper.adaptTo(ValueMap.class);
    if (valueMap != null) {
      valueMap.put("name", name);
      valueMap.put("required", required);
      valueMap.put("renderHidden", hide);
      valueMap.put("fieldLabel", fieldLabel);
      valueMap.put("granite:itemtype", itemType);
      if (hideOption) {
        vm.put("labelId", "hideOption");
      }
    }
    return wrapper;
  }

  private Resource createDropdownResource(
      SlingHttpServletRequest request,
      String name,
      boolean required,
      String fieldLabel,
      boolean hide,
      String[] values,
      String itemType,
      boolean hideOption,
      Map<String, String> nomenclatureMap) {
    // Convert String[] to List<Map<String, String>> format
    List<Map<String, String>> options = new ArrayList<>();
    for (String value : values) {
      Map<String, String> option = new HashMap<>();
      option.put("value", value);
      option.put("label", value); // Use same value for both
      options.add(option);
    }

    // Reuse createSelectResource - no account-type filtering for legacy dropdowns
    return createSelectResource(
        request,
        name,
        "",
        required,
        fieldLabel,
        hide,
        itemType,
        hideOption,
        options,
        nomenclatureMap,
        null);
  }

  private Resource createAutocompleteResource(
      SlingHttpServletRequest request,
      String name,
      String[] values,
      String emptyText,
      boolean required,
      String fieldLabel,
      boolean hide,
      String itemType,
      boolean hideOption,
      boolean multiple,
      String dataSource,
      boolean draggable) {
    // Use textfield as a reliable base - can be enhanced with custom JS later
    String resourceType = "granite/ui/components/coral/foundation/form/textfield";
    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());

    // Create base resource with empty ValueMap
    Resource res = new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);

    // Wrap resource to add granite:data child node
    Resource wrapper =
        new ValueMapResourceWrapper(res, resourceType) {
          @Override
          public Resource getChild(String relPath) {
            if ("granite:data".equals(relPath)) {
              // Create the granite:data child node with data attributes
              ValueMap dataVm = new ValueMapDecorator(new HashMap<String, Object>());
              dataVm.put("autocomplete-multiple", String.valueOf(multiple));
              dataVm.put("autocomplete-draggable", String.valueOf(draggable));

              if (dataSource != null && !dataSource.isEmpty()) {
                dataVm.put("autocomplete-source", dataSource);
              }

              return new ValueMapResource(
                  request.getResourceResolver(),
                  "granite:data",
                  JcrConstants.NT_UNSTRUCTURED,
                  dataVm);
            }
            return super.getChild(relPath);
          }
        };

    // Get ValueMap from wrapper and set properties
    ValueMap valueMap = wrapper.adaptTo(ValueMap.class);
    if (valueMap != null) {
      valueMap.put("name", name);
      valueMap.put("granite:class", "alm-autocomplete-field");

      // Handle emptyText safely
      if (emptyText != null && !emptyText.isEmpty()) {
        valueMap.put("emptyText", emptyText);
      }

      // For textfield, use first value or join multiple values
      String value = "";
      if (values != null && values.length > 0) {
        if (multiple && values.length > 1) {
          // Join multiple values with comma for display
          value = String.join(", ", values);
        } else if (values[0] != null) {
          value = values[0];
        }
      }
      valueMap.put("value", value);

      valueMap.put("required", required);
      valueMap.put("renderHidden", hide);
      valueMap.put("fieldLabel", fieldLabel);
      valueMap.put("granite:itemtype", itemType);

      if (hideOption) {
        valueMap.put("labelId", "hideOption");
        valueMap.put("granite:rel", "hideOption");
      }
    }

    return wrapper;
  }

  private Resource createRadioGroupResource(
      SlingHttpServletRequest request,
      String name,
      String value,
      String fieldLabel,
      boolean hide,
      String itemType,
      boolean hideOption,
      List<Map<String, String>> options,
      Map<String, String> nomenclatureMap) {
    String resourceType = "granite/ui/components/coral/foundation/form/radiogroup";
    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());

    Resource res = new ValueMapResource(request.getResourceResolver(), "", resourceType, vm);

    Resource wrapper =
        new ValueMapResourceWrapper(res, resourceType) {
          @Override
          public Resource getChild(String relPath) {
            if ("items".equals(relPath)) {
              Resource dataWrapper =
                  new ValueMapResourceWrapper(res, JcrConstants.NT_UNSTRUCTURED) {
                    @Override
                    public Iterator<Resource> listChildren() {
                      List<Resource> itemsResourceList = new ArrayList<Resource>();

                      for (Map<String, String> option : options) {
                        ValueMap optionVm = new ValueMapDecorator(new HashMap<String, Object>());
                        optionVm.put("value", option.get("value"));
                        // Apply nomenclature replacement to option label
                        String optionLabel =
                            replaceNomenclatureKeys(option.get("label"), nomenclatureMap);
                        optionVm.put("text", optionLabel);
                        optionVm.put("granite:itemtype", itemType);

                        // Set checked state
                        if (value != null && value.equals(option.get("value"))) {
                          optionVm.put("checked", true);
                        }

                        itemsResourceList.add(
                            new ValueMapResource(
                                request.getResourceResolver(),
                                "",
                                "granite/ui/components/coral/foundation/form/radio",
                                optionVm));
                      }

                      return itemsResourceList.iterator();
                    }
                  };
              return dataWrapper;
            } else {
              return super.getChild(relPath);
            }
          }
        };

    ValueMap valueMap = wrapper.adaptTo(ValueMap.class);
    if (valueMap != null) {
      valueMap.put("name", name);
      valueMap.put("renderHidden", hide);
      valueMap.put("fieldLabel", fieldLabel);
      valueMap.put("granite:itemtype", itemType);

      if (hideOption) {
        valueMap.put("labelId", "hideOption");
      }
    }
    return wrapper;
  }

  private List<ALMWidgetConfig> getAvailableWidgets(List<ALMWidgetConfig> widgets) {
    return widgets.stream()
        .filter(widget -> "widget".equals(widget.getType()))
        .collect(Collectors.toList());
  }

  /**
   * Fetches the AccountResponse from the AccountService.
   *
   * @param resolver The resource resolver
   * @param resourcePath The path to resolve the page from
   * @return AccountResponse or null if unable to fetch
   */
  private AccountResponse getAccountResponse(ResourceResolver resolver, String resourcePath) {
    try {
      PageManager pageManager = resolver.adaptTo(PageManager.class);
      if (pageManager == null) {
        LOGGER.debug("CPPrime::ALMWidgetDatasource:: Unable to get PageManager");
        return null;
      }

      Page currentPage = pageManager.getContainingPage(resourcePath);
      if (currentPage == null) {
        LOGGER.debug(
            "CPPrime::ALMWidgetDatasource:: Unable to get page from path: {}", resourcePath);
        return null;
      }

      AccountResponse accountResponse = accountService.getAccountDetails(currentPage);
      if (accountResponse == null) {
        LOGGER.debug("CPPrime::ALMWidgetDatasource:: Unable to get account details");
      }

      return accountResponse;

    } catch (Exception e) {
      LOGGER.error("CPPrime::ALMWidgetDatasource:: Exception while fetching account response", e);
      return null;
    }
  }

  /**
   * Filters widgets based on the effective account type. Widgets with no allowedAccountTypes
   * restriction are always included. If effectiveAccountType is null, no filtering is applied
   * (fail-open).
   */
  private List<ALMWidgetConfig> filterWidgetsByAccountType(
      List<ALMWidgetConfig> widgets, String effectiveAccountType) {
    if (effectiveAccountType == null) {
      return widgets;
    }
    return widgets.stream()
        .filter(
            widget -> {
              List<String> allowed = widget.getAllowedAccountTypes();
              return allowed == null || allowed.isEmpty() || allowed.contains(effectiveAccountType);
            })
        .collect(Collectors.toList());
  }

  /**
   * Replaces nomenclature keys in the given text with their corresponding values.
   *
   * @param text The text containing potential nomenclature keys
   * @param nomenclatureMap Map of nomenclature keys to values
   * @return The text with nomenclature keys replaced by values
   */
  private String replaceNomenclatureKeys(String text, Map<String, String> nomenclatureMap) {
    if (text == null || nomenclatureMap.isEmpty()) {
      return text;
    }

    String result = text;
    for (Map.Entry<String, String> entry : nomenclatureMap.entrySet()) {
      if (result.contains(entry.getKey())) {
        result = result.replace(entry.getKey(), entry.getValue());
      }
    }
    return result;
  }
}
