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

package com.adobe.learning.core.models;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = { SlingHttpServletRequest.class }, adapters = { Catalog.class }, resourceType = {
        CatalogImpl.RESOURCE_TYPE }, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class CatalogImpl implements Catalog {

    protected static final String RESOURCE_TYPE = "learning/components/catalog";

    @ValueMapValue
    String showSearch;

    @Override
    public String getShowSearch() {
        return showSearch;
    }

    @ValueMapValue
    String showFilters;

    @Override
    public String getShowFilters() {
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