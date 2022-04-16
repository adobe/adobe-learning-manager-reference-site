package com.adobe.learning.core.sitemap;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.sitemap.SitemapException;
import org.apache.sling.sitemap.SitemapService;
import org.apache.sling.sitemap.builder.Sitemap;
import org.apache.sling.sitemap.spi.common.SitemapLinkExternalizer;
import org.apache.sling.sitemap.spi.generator.SitemapGenerator;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.day.cq.wcm.api.Page;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

@Component(service = SitemapGenerator.class, property = { "service.ranking:Integer=20" })
public class TrainingsSitemapGeneratorImpl implements SitemapGenerator {

	private final static Logger LOGGER = LoggerFactory.getLogger(TrainingsSitemapGeneratorImpl.class);

	@Reference
	private transient GlobalConfigurationService configService;

	@Reference
	private SitemapLinkExternalizer externalizerService;

	private static final String TRAINING_URL_FORMAT = "{trainingPage}.html/trainingId/{loType}:{loId}";

	private static final String COMMERCE_PRODUCTS_QUERY = "{\r\n" + 
			"  products(search: \"\", pageSize:{pageSize}, currentPage:{currentPage})\r\n" + 
			"  {\r\n" + 
			"    items {\r\n" + 
			"      almlotype\r\n" + 
			"      almloid\r\n" + 
			"    }\r\n" + 
			"  }\r\n" + 
			"}";

	private static final int COMMERCE_PRODUCTS_QUERY_PAGE_SIZE = 20;

	@Override
	public Set<String> getNames(Resource sitemapRoot) {
		Page page = sitemapRoot.adaptTo(Page.class);
		JsonObject jsonConfigs = configService.getAdminConfigs(page);
		boolean isSiteMapEnabled = "true".equals(jsonConfigs.get(Constants.Config.SITE_MAP).getAsString());
		String sitemapTrainingPath = jsonConfigs.get(Constants.Config.SITE_MAP_TRAINING_PATH).getAsString();
		Page sitemapTrainingPage = page.getPageManager().getPage(sitemapTrainingPath);

		return isSiteMapEnabled && sitemapTrainingPage != null ? Collections.singleton(SitemapService.DEFAULT_SITEMAP_NAME) : Collections.emptySet(); 
	}

	@Override
	public void generate(Resource sitemapRoot, String name, Sitemap sitemap, SitemapGenerator.Context context) throws SitemapException {
		Page productPage = sitemapRoot.adaptTo(Page.class);

		if (productPage == null) {
			throw new SitemapException("ProductPage not found while creating sitemap at path- " + sitemapRoot.getPath());
		}

		JsonObject jsonConfigs = configService.getAdminConfigs(productPage);
		String sitemapTrainingPath = jsonConfigs.get(Constants.Config.SITE_MAP_TRAINING_PATH).getAsString();

		if (StringUtils.isNotBlank(sitemapTrainingPath))
		{
			String usageType = jsonConfigs.get(Constants.Config.USAGE_TYPE_NAME).getAsString();

			switch (usageType)
			{
			case Constants.Config.COMMERCE_USAGE:
				String commerceURL = jsonConfigs.get(Constants.Config.COMMERCE_URL_NAME).getAsString() + "/graphql";
				generateForCommerceUsage(sitemapRoot, name, sitemap, context, sitemapTrainingPath, commerceURL);
				break;

			case Constants.Config.ES_USAGE:
				String esBaseURL = jsonConfigs.get(Constants.Config.ES_BASE_URL_NAME).getAsString() + "/learningObjectIds";
				generateForESUsage(sitemapRoot, name, sitemap, context, sitemapTrainingPath, esBaseURL);
				break;

			default:
				break;
			}
		}
	}

	private void generateForCommerceUsage(Resource sitemapRoot, String name, Sitemap sitemap, SitemapGenerator.Context context, String sitemapTrainingPath, String commerceURL) throws SitemapException {
		try {
			String trainingPagePath = TRAINING_URL_FORMAT.replace("{trainingPage}", sitemapTrainingPath);
			ResourceResolver resResolver = sitemapRoot.getResourceResolver();

			int currentPage = 1;



			while (currentPage <= Integer.MAX_VALUE)
			{
				String queryParam = URLEncoder.encode(COMMERCE_PRODUCTS_QUERY.replace("{pageSize}", String.valueOf(COMMERCE_PRODUCTS_QUERY_PAGE_SIZE)).replace("{currentPage}", String.valueOf(currentPage)), "UTF-8");
				String commerceGraphqlURL = commerceURL + "?query=" + queryParam;

				HttpGet getCall = new HttpGet(commerceGraphqlURL);

				try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(getCall)) {
					String configResponse = EntityUtils.toString(response.getEntity());
					Gson gson = new Gson();
					JsonObject jsonObj = gson.fromJson(configResponse, JsonObject.class);
					if (jsonObj.get("errors") != null)
					{
						LOGGER.error("CPPrime::TrainingsSitemapGeneratorImpl::generateForCommerceUsage Exception in Graphql Products query. Reponse {}", configResponse);
						return;
					}
					else
					{
						JsonArray productItems = jsonObj.getAsJsonObject("data").getAsJsonObject("products").getAsJsonArray("items");
						for (JsonElement product : productItems)
						{
							String loId = product.getAsJsonObject().get("almloid").isJsonNull() ? "1" : product.getAsJsonObject().get("almloid").getAsString();
							String loType = product.getAsJsonObject().get("almlotype").isJsonNull() ? "course" : product.getAsJsonObject().get("almlotype").getAsString();

							String pagePath = trainingPagePath.replace("{loType}", loType).replace("{loId}", loId);
							Resource trainingResource = resResolver.resolve(pagePath);
							String trainingURL = externalizerService.externalize(trainingResource);
							String externalURL = trainingURL;
							if (StringUtils.isNotBlank(trainingURL) && pagePath.startsWith(trainingURL))
							{
								externalURL = trainingURL + pagePath.substring(trainingURL.length());
							}
							sitemap.addUrl(externalURL);
						}
					}
				}
				currentPage++;
			}
		} catch (UnsupportedEncodingException uee)
		{
			LOGGER.error("CPPrime::TrainingsSitemapGeneratorImpl::generateForCommerceUsage Exception while encoding query-param", uee);
		} catch (IOException ioe)
		{
			LOGGER.error("CPPrime::TrainingsSitemapGeneratorImpl::generateForCommerceUsage Exception while product query", ioe);
		}
	}

	private void generateForESUsage(Resource sitemapRoot, String name, Sitemap sitemap, SitemapGenerator.Context context, String sitemapTrainingPath, String esBaseURL) throws SitemapException {
		try {
			String trainingPagePath = TRAINING_URL_FORMAT.replace("{trainingPage}", sitemapTrainingPath);
			ResourceResolver resResolver = sitemapRoot.getResourceResolver();

			HttpGet getCall = new HttpGet(esBaseURL);

			try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(getCall))
			{
				String configResponse = EntityUtils.toString(response.getEntity());
				JsonArray loIdsArray = new Gson().fromJson(configResponse, JsonObject.class).getAsJsonArray("loIds");

				for (JsonElement loObj : loIdsArray)
				{
					String[] lo = loObj.getAsString().split(":");
					if (lo != null && lo.length == 2)
					{
						String pagePath = trainingPagePath.replace("{loType}", lo[0]).replace("{loId}", lo[1]);
						Resource trainingResource = resResolver.resolve(pagePath);
						String trainingURL = externalizerService.externalize(trainingResource);
						String externalURL = trainingURL;
						if (StringUtils.isNotBlank(trainingURL) && pagePath.startsWith(trainingURL))
						{
							externalURL = trainingURL + pagePath.substring(trainingURL.length());
						}
						sitemap.addUrl(externalURL);
					}
				}
			}

		} catch (IOException ioe)
		{
			LOGGER.error("CPPrime::TrainingsSitemapGeneratorImpl::generateForESUsage Exception while query for trainings", ioe);
		}
	}

}
