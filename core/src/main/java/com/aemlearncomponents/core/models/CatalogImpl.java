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
    String showSearch;

    @Override
    public String getShowSearch() {
        return showSearch;
    }

    @ValueMapValue
    Boolean showFilters;

    @Override
    public Boolean getShowFilters() {
        return showFilters;
    }

    @ValueMapValue
    String showCatalogFilter;

    @Override
    public String getShowCatalogFilter() {
        return showCatalogFilter;
    }
    
    @ValueMapValue
    private String typeFilter;

    @Override
    public String getTypeFilter() {
        return typeFilter;
    }

    @ValueMapValue
    private String skillsFilter;

    @Override
    public String getSkillsFilter() {
        return skillsFilter;
    }

    @ValueMapValue
    private String formatFilter;

    @Override
    public String getFormatFilter() {
        return formatFilter;
    }

    @ValueMapValue
    private String durationFilter;

    @Override
    public String getDurationFilter() {
        return durationFilter;
    }

    @ValueMapValue
    private String priceFilter;

    @Override
    public String getPriceFilter() {
        return priceFilter;
    }

    @ValueMapValue
    private String skillsLevelFilter;

    @Override
    public String getSkillsLevelFilter() {
        return skillsLevelFilter;
    }

    @ValueMapValue
    private String statusFilter;

    @Override
    public String getStatusFilter() {
        return statusFilter;
    }

    @ValueMapValue
    private String tagsFilter;

    @Override
    public String getTagsFilter() {
        return tagsFilter;
    }
}