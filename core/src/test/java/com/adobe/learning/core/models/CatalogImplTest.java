package com.adobe.learning.core.models;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.apache.sling.api.scripting.SlingBindings;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.junit.Rule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.scripting.WCMBindingsConstants;

import io.wcm.testing.mock.aem.junit5.AemContext;
import io.wcm.testing.mock.aem.junit5.AemContextExtension;

@ExtendWith({AemContextExtension.class, MockitoExtension.class})
public class CatalogImplTest {

	@Rule
	private final AemContext ctx = new AemContext(ResourceResolverType.JCR_MOCK);

	private Catalog catalogComponent;

	@Mock
	private Page currentPage;
	
	@BeforeEach
	void setUp() {
		ctx.addModelsForClasses(CatalogImpl.class);
		
	    SlingBindings slingBindings = (SlingBindings) ctx.request().getAttribute(SlingBindings.class.getName());
	    slingBindings.put(WCMBindingsConstants.NAME_CURRENT_PAGE, currentPage);
	    ctx.request().setAttribute(SlingBindings.class.getName(), slingBindings);
	    
	    ctx.load().json("/files/catalogImplTest.json", "/content/learning");
	    ctx.currentResource("/content/learning/catalog");
	    catalogComponent = ctx.request().adaptTo(Catalog.class);
	}
	
	@Test
	void testCatalogComponentConfigs() {
		assertTrue("true".equals(catalogComponent.getShowFilters()));
		assertTrue("true".equals(catalogComponent.getShowCatalogFilter()));
		assertTrue("true".equals(catalogComponent.getSkillsFilter()));
		assertTrue("true".equals(catalogComponent.getDurationFilter()));
		assertTrue("true".equals(catalogComponent.getSkillsLevelFilter()));
		assertTrue("true".equals(catalogComponent.getStatusFilter()));
		
		assertTrue("false".equals(catalogComponent.getShowSearch()));
		assertTrue("false".equals(catalogComponent.getTypeFilter()));
		assertTrue("false".equals(catalogComponent.getFormatFilter()));
		assertTrue("false".equals(catalogComponent.getPriceFilter()));
		assertTrue("false".equals(catalogComponent.getTagsFilter()));		
	}


}
