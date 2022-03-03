package com.aemlearncomponents.core.models;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.StreamSupport;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.jcr.resource.api.JcrResourceConstants;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.commons.jcr.JcrConstants;

/**
 * Sling Model for the column-view item of the configuration console
 */
@Model(adaptables = {SlingHttpServletRequest.class, Resource.class})
public class ConfigurationColumnViewItem {

    private static final Logger LOG = LoggerFactory.getLogger(ConfigurationColumnViewItem.class);

    static final String CREATE_PULLDOWN_ACTIVATOR = "cq-confadmin-actions-create-pulldown-activator";
    static final String CREATE_CONFIG_ACTIVATOR = "cq-confadmin-actions-create-config-activator";
    static final String PROPERTIES_ACTIVATOR = "cq-confadmin-actions-properties-activator";
    static final String CREATE_FOLDER_ACTIVATOR = "cq-confadmin-actions-create-folder-activator";
    static final String DELETE_ACTIVATOR = "cq-confadmin-actions-delete-activator";
    static final String PUBLISH_ACTIVATOR = "cq-confadmin-actions-publish-activator";
    static final String UNPUBLISH_ACTIVATOR = "cq-confadmin-actions-unpublish-activator";
    
    private static final String CONF_ROOT = "/conf";
    private static final String CONF_CONTAINER_BUCKET_NAME = "settings";
    private static final String CLOUDCONFIGS_BUCKET_NAME = "cloudconfigs";
    private static final String ALM_CONFIG_NAME = "alm";
    private static final String ALM_BUCKET_PATH = StringUtils.join(new String[] { CONF_CONTAINER_BUCKET_NAME, CLOUDCONFIGS_BUCKET_NAME,
            ALM_CONFIG_NAME }, "/");

    @SlingObject
    private Resource resource;

    private boolean hasALMSetting;

    @PostConstruct
    public void initModel() {
        LOG.debug("Initializing column view item for resource {}", resource.getPath());
        hasALMSetting = resource.getChild(ALM_BUCKET_PATH) != null;
    }

    public String getTitle() {
        Resource jcrContent = resource.getChild(JcrConstants.JCR_CONTENT);
        ValueMap properties = jcrContent != null ? jcrContent.getValueMap() : resource.getValueMap();
        return properties.get(JcrConstants.JCR_TITLE, resource.getName());
    }

    public boolean hasChildren() {
        if (isALMBucket())
            return false;

        boolean isContainer = isConfigurationContainer();
        boolean hasChildren = resource.hasChildren();
        boolean hasMoreChildren = getChildCount(resource) > 1;
        boolean hasSettings = resource.getChild("settings") != null;
        return isContainer && (hasALMSetting || hasMoreChildren) ||
            !isContainer && !hasALMSetting && (hasChildren && !hasSettings || hasMoreChildren && hasSettings);
    }

    private boolean isALMBucket() {
        return resource.getPath().endsWith(ALM_BUCKET_PATH);
    }

    public List<String> getQuickActionsRel() {
        List<String> actions = new ArrayList<>();
        if (isConfigurationContainer()) {
            if (!hasALMSetting && !resource.getPath().equals(CONF_ROOT)) {
                actions.add(CREATE_PULLDOWN_ACTIVATOR);
                actions.add(CREATE_CONFIG_ACTIVATOR);
            }
        }

        if (isALMBucket()) {
            actions.add(PROPERTIES_ACTIVATOR);
            actions.add(PUBLISH_ACTIVATOR);
            actions.add(UNPUBLISH_ACTIVATOR);
        } else {
            if (!actions.contains(CREATE_PULLDOWN_ACTIVATOR)) {
                actions.add(CREATE_PULLDOWN_ACTIVATOR);
            }
            actions.add(CREATE_FOLDER_ACTIVATOR);
        }

        if (isSafeToDelete()) {
            actions.add(DELETE_ACTIVATOR);
        }

        return actions;
    }

    private boolean isConfigurationContainer() {
        return resource.getPath().startsWith(CONF_ROOT) && isFolder(resource) &&
            resource.getChild(CONF_CONTAINER_BUCKET_NAME + "/" + CLOUDCONFIGS_BUCKET_NAME) != null;
    }

    private boolean isFolder(Resource resource) {
        return resource.isResourceType(JcrConstants.NT_FOLDER) || isSlingFolder(resource);
    }

    private boolean isSafeToDelete() {
        if (isALMBucket()) {
            return true;
        }

        // or container only without children
        if (resource.getPath().startsWith(CONF_ROOT) && isSlingFolder(resource) &&
            hasOnlyChild(resource, CONF_CONTAINER_BUCKET_NAME)) {
            Resource container = resource.getChild(CONF_CONTAINER_BUCKET_NAME);
            return hasOnlyChild(container, CLOUDCONFIGS_BUCKET_NAME) && !container.getChild(CLOUDCONFIGS_BUCKET_NAME).hasChildren();
        }

        return false;
    }

    private boolean isSlingFolder(Resource resource) {
        return resource.isResourceType(JcrResourceConstants.NT_SLING_FOLDER) ||
            resource.isResourceType(JcrResourceConstants.NT_SLING_ORDERED_FOLDER);
    }

    private boolean hasOnlyChild(Resource resource, String child) {
        return getChildCount(resource) == 1 && resource.getChild(child) != null;
    }

    private long getChildCount(Resource resource) {
        return StreamSupport.stream(resource.getChildren().spliterator(), false).count();
    }
}

