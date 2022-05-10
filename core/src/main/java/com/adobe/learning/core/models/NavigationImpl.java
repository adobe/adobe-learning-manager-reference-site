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

@Model(adaptables = { SlingHttpServletRequest.class }, adapters = { Navigation.class }, resourceType = {
        NavigationImpl.RESOURCE_TYPE }, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class NavigationImpl implements Navigation {

    protected static final String RESOURCE_TYPE = "learning/components/navigation";

    @ValueMapValue
    private String learningPageUrl;

    @Override
    public String getLearningPageUrl() {
        return learningPageUrl;
    }

    @ValueMapValue
    private String communityPageUrl;

    @Override
    public String getCommunityPageUrl() {
        return communityPageUrl;
    }

    @ValueMapValue
    private String supportPageUrl;

    @Override
    public String getSupportPageUrl() {
        return supportPageUrl;
    }

}