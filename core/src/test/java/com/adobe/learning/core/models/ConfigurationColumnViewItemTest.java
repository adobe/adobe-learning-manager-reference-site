package com.adobe.learning.core.models;

import static com.adobe.learning.core.models.ConfigurationColumnViewItem.CREATE_CONFIG_ACTIVATOR;
import static com.adobe.learning.core.models.ConfigurationColumnViewItem.CREATE_FOLDER_ACTIVATOR;
import static com.adobe.learning.core.models.ConfigurationColumnViewItem.CREATE_PULLDOWN_ACTIVATOR;
import static com.adobe.learning.core.models.ConfigurationColumnViewItem.DELETE_ACTIVATOR;
import static com.adobe.learning.core.models.ConfigurationColumnViewItem.PROPERTIES_ACTIVATOR;
import static com.adobe.learning.core.models.ConfigurationColumnViewItem.PUBLISH_ACTIVATOR;
import static com.adobe.learning.core.models.ConfigurationColumnViewItem.UNPUBLISH_ACTIVATOR;

import java.util.List;

import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class ConfigurationColumnViewItemTest {
	public static final String CONFIGURATION_PATH = "/conf/testing/settings/cloudconfigs/adobe-learning-manager-config";
	@Rule
	public AemContext context = new AemContext(ResourceResolverType.JCR_MOCK);

	@BeforeEach
	public void setUp() {
		context.load().json("/files/almConfigRsrc.json", "/conf");
		context.addModelsForClasses(ConfigurationColumnViewItem.class);
	}

	@Test
	public void testGetTitle() {
		context.currentResource(context.resourceResolver().getResource(CONFIGURATION_PATH));

		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);
		Assert.assertEquals("Returns the correct title", "adobe-learning-manager-config", columnViewItem.getTitle());
	}

	@Test
	public void testHasChildrenOnConfiguration() {
		context.currentResource(context.resourceResolver().getResource(CONFIGURATION_PATH));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		Assert.assertFalse("Configuration doesn't have children", columnViewItem.hasChildren());
	}

	@Test
	public void testHasChildrenOnConfigurationParent() {
		context.currentResource(context.resourceResolver().getResource("/conf/testing"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		Assert.assertTrue("Configuration parent has children", columnViewItem.hasChildren());
	}

	@Test
	public void testHasChildrenOnEmptyFolder() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder1"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		Assert.assertFalse("Empty folder has no children", columnViewItem.hasChildren());
	}

	@Test
	public void testHasChildrenOnEmptyConfigFolder() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder2"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		Assert.assertFalse("Empty config folder has no children", columnViewItem.hasChildren());
	}

	@Test
	public void testHasChildrenOnNonEmptyConfigFolder() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder4"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		Assert.assertTrue("Empty config folder has no children", columnViewItem.hasChildren());
	}

	@Test
	public void testGetQuickActionsForFolderWithConfiguration() {
		context.currentResource(context.resourceResolver().getResource("/conf/testing"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsForNoConfigurationFolder() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder1"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsForFolderWithoutConfiguration() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder2"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_CONFIG_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR,
				DELETE_ACTIVATOR
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsForFolderWithoutConfigurationAndWithFolder() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder3"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR,
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsOnEmptyFolder() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder3/folder1"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR,
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsFolderWithSettingsOnly() {
		context.currentResource(context.resourceResolver().getResource("/conf/folder3/folder2"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR,
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsOnConfRoot() {
		context.currentResource(context.resourceResolver().getResource("/conf"));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				CREATE_PULLDOWN_ACTIVATOR,
				CREATE_FOLDER_ACTIVATOR
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}

	@Test
	public void testGetQuickActionsForConfigurations() {
		context.currentResource(context.resourceResolver().getResource(CONFIGURATION_PATH));
		ConfigurationColumnViewItem columnViewItem = context.request().adaptTo(ConfigurationColumnViewItem.class);

		String[] expectedActions = new String[] {
				PROPERTIES_ACTIVATOR,
				PUBLISH_ACTIVATOR,
				UNPUBLISH_ACTIVATOR,
				DELETE_ACTIVATOR
		};

		List<String> actualActions = columnViewItem.getQuickActionsRel();
		Assert.assertArrayEquals("Returns the quick-actions", expectedActions, actualActions.toArray());
	}
}
