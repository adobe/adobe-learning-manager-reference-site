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