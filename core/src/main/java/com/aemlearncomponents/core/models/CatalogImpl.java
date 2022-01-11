package com.aemlearncomponents.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = { SlingHttpServletRequest.class }, adapters = { Catalog.class }, resourceType = {
        CatalogImpl.RESOURCE_TYPE }, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class CatalogImpl implements Catalog {

    protected static final String RESOURCE_TYPE = "aem-learn-components/components/catalog";

    @ValueMapValue
    private String showSearch;

    @Override
    public String getShowSearch() {
        return showSearch;
    }

    @ValueMapValue
    private String showFilter;

    @Override
    public String getShowFilter() {
        return showFilter;
    }
}