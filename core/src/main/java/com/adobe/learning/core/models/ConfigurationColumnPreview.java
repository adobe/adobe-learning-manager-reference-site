package com.adobe.learning.core.models;

import java.util.Calendar;

import javax.annotation.PostConstruct;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.scripting.SlingBindings;
import org.apache.sling.api.scripting.SlingScriptHelper;
import org.apache.sling.jcr.resource.api.JcrResourceConstants;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.granite.ui.components.Config;
import com.adobe.granite.ui.components.ExpressionHelper;
import com.adobe.granite.ui.components.ExpressionResolver;
import com.day.cq.commons.jcr.JcrConstants;
import com.day.cq.replication.ReplicationStatus;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = ConfigurationColumnPreview.class,
    resourceType = "learning/configuration/columnpreview")
public class ConfigurationColumnPreview {
    private static final Logger LOG = LoggerFactory.getLogger(ConfigurationColumnPreview.class);

    @Self
    public SlingHttpServletRequest request;

    boolean isFolder = false;

    private Resource itemResource;

    private ValueMap properties;

    private Calendar modifiedTime = null;

    private Calendar publishedTime = null;

    @PostConstruct
    protected void initModel() {

        Config cfg = new Config(request.getResource());

        final SlingScriptHelper sling = ((SlingBindings) request.getAttribute(SlingBindings.class.getName())).getSling();
        ExpressionResolver expressionResolver = sling.getService(ExpressionResolver.class);
        final ExpressionHelper ex = new ExpressionHelper(expressionResolver, request);

        String itemResourcePath = ex.getString(cfg.get("path", String.class));
        LOG.debug("Item in preview is at path {}", itemResourcePath);

        itemResource = request.getResourceResolver().getResource(itemResourcePath);
        if (itemResource == null) {
            return;
        }
        isFolder = itemResource.isResourceType(JcrConstants.NT_FOLDER) || itemResource.isResourceType(JcrResourceConstants.NT_SLING_FOLDER)
            || itemResource
                .isResourceType(JcrResourceConstants.NT_SLING_ORDERED_FOLDER);

        if (isFolder) {
            properties = itemResource.getValueMap();
        } else {
            Resource jcrContent = itemResource.getChild(JcrConstants.JCR_CONTENT);
            properties = jcrContent != null ? jcrContent.getValueMap() : itemResource.getValueMap();
        }

        modifiedTime = properties.get("cq:lastModified", Calendar.class);
        ReplicationStatus replicationStatus = itemResource.adaptTo(ReplicationStatus.class);
        if (replicationStatus != null && !replicationStatus.isDeactivated()) {
            publishedTime = replicationStatus.getLastPublished();
        } else {
            publishedTime = null;
        }
    }

    public String getTitle() {
        return properties != null ? properties.get(JcrConstants.JCR_TITLE, itemResource.getName()) : "";
    }

    public boolean isFolder() {
        return isFolder;
    }

    public String getItemResourcePath() {
        return itemResource != null ? itemResource.getPath() : "";
    }

    public String getModifiedTime() {
        return modifiedTime == null ? null : modifiedTime.toInstant().toString();
    }

    public String getPublishedTime() {
        return publishedTime == null ? null : publishedTime.toInstant().toString();
    }
}
