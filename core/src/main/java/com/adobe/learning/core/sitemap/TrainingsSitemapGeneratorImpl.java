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

package com.adobe.learning.core.sitemap;

import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.adobe.learning.core.utils.RequestUtils;
import com.day.cq.wcm.api.Page;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
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

@Component(
    service = SitemapGenerator.class,
    property = {"service.ranking:Integer=20"})
public class TrainingsSitemapGeneratorImpl implements SitemapGenerator {

  private static final Logger LOGGER = LoggerFactory.getLogger(TrainingsSitemapGeneratorImpl.class);

  @Reference private transient GlobalConfigurationService configService;

  @Reference private SitemapLinkExternalizer externalizerService;

  @Reference private HttpClientBuilderFactory clientBuilderFactory;

  private static final String TRAINING_URL_FORMAT =
      "{trainingPage}.html/trainingId/{loType}:{loId}";

  private static final String COMMERCE_PRODUCTS_QUERY =
      "{\r\n"
          + "  products(search: \"\", pageSize:{pageSize}, currentPage:{currentPage})\r\n"
          + "  {\r\n"
          + "    items {\r\n"
          + "      almlotype\r\n"
          + "      almloid\r\n"
          + "    }\r\n"
          + "  }\r\n"
          + "}";

  private static final String COMMERCE_CUSTOM_ATTRS_QUERY =
      "{\r\n"
          + "    customAttributeMetadata(\r\n"
          + "      attributes: [\r\n"
          + "        { attribute_code: \"almlotype\", entity_type: \"catalog_product\" }\r\n"
          + "      ]\r\n"
          + "    ) {\r\n"
          + "      items {\r\n"
          + "        attribute_code\r\n"
          + "        attribute_options {\r\n"
          + "          value\r\n"
          + "          label\r\n"
          + "        }\r\n"
          + "      }\r\n"
          + "    }\r\n"
          + "}";

  private static final int COMMERCE_PRODUCTS_QUERY_PAGE_SIZE = 20;

  @Override
  public Set<String> getNames(Resource sitemapRoot) {
    Page page = sitemapRoot.adaptTo(Page.class);
    JsonObject jsonConfigs = configService.getAdminConfigs(page);
    boolean isSiteMapEnabled =
        "true".equals(jsonConfigs.get(Constants.Config.SITE_MAP).getAsString());
    String sitemapTrainingPath =
        jsonConfigs.get(Constants.Config.SITE_MAP_TRAINING_PATH).getAsString();
    Page sitemapTrainingPage = page.getPageManager().getPage(sitemapTrainingPath);

    return isSiteMapEnabled && sitemapTrainingPage != null
        ? Collections.singleton(SitemapService.DEFAULT_SITEMAP_NAME)
        : Collections.emptySet();
  }

  @Override
  public void generate(
      Resource sitemapRoot, String name, Sitemap sitemap, SitemapGenerator.Context context)
      throws SitemapException {
    Page productPage = sitemapRoot.adaptTo(Page.class);

    if (productPage == null) {
      throw new SitemapException(
          "ProductPage not found while creating sitemap at path- " + sitemapRoot.getPath());
    }

    JsonObject jsonConfigs = configService.getAdminConfigs(productPage);
    String sitemapTrainingPath =
        jsonConfigs.get(Constants.Config.SITE_MAP_TRAINING_PATH).getAsString();

    if (StringUtils.isNotBlank(sitemapTrainingPath)) {
      String usageType = jsonConfigs.get(Constants.Config.USAGE_TYPE_NAME).getAsString();

      switch (usageType) {
        case Constants.Config.COMMERCE_USAGE:
          String commerceURL =
              jsonConfigs.get(Constants.Config.COMMERCE_URL_NAME).getAsString() + "/graphql";
          generateForCommerceUsage(
              sitemapRoot, name, sitemap, context, sitemapTrainingPath, commerceURL);
          break;

        case Constants.Config.ES_USAGE:
          String esBaseURL =
              jsonConfigs.get(Constants.Config.ES_BASE_URL_NAME).getAsString()
                  + "/learningObjectIds";
          generateForESUsage(sitemapRoot, name, sitemap, context, sitemapTrainingPath, esBaseURL);
          break;

        default:
          break;
      }
    }
  }

  private void generateForCommerceUsage(
      Resource sitemapRoot,
      String name,
      Sitemap sitemap,
      SitemapGenerator.Context context,
      String sitemapTrainingPath,
      String commerceURL)
      throws SitemapException {
    try {
      String trainingPagePath = TRAINING_URL_FORMAT.replace("{trainingPage}", sitemapTrainingPath);
      ResourceResolver resResolver = sitemapRoot.getResourceResolver();

      JsonObject customAttrDataObj =
          fetchDataFromCommerceGraphql(commerceURL, COMMERCE_CUSTOM_ATTRS_QUERY);
      if (customAttrDataObj != null) {
        JsonArray attrOptions =
            customAttrDataObj
                .getAsJsonObject("customAttributeMetadata")
                .getAsJsonArray("items")
                .get(0)
                .getAsJsonObject()
                .getAsJsonArray("attribute_options");
        Map<String, String> loTypeMap = new HashMap<String, String>();
        loTypeMap.put("course", "course");
        for (JsonElement option : attrOptions) {
          JsonObject optionObj = option.getAsJsonObject();
          String value =
              (optionObj.get("value").isJsonNull() == false)
                  ? optionObj.get("value").getAsString()
                  : "";
          String label =
              (optionObj.get("label").isJsonNull() == false)
                  ? optionObj.get("label").getAsString()
                  : "";
          loTypeMap.put(value, label);
        }

        int currentPage = 1;

        while (currentPage <= Integer.MAX_VALUE) {
          String productQuery =
              COMMERCE_PRODUCTS_QUERY
                  .replace("{pageSize}", String.valueOf(COMMERCE_PRODUCTS_QUERY_PAGE_SIZE))
                  .replace("{currentPage}", String.valueOf(currentPage));
          JsonObject dataObj = fetchDataFromCommerceGraphql(commerceURL, productQuery);

          if (dataObj != null) {
            JsonArray productItems = dataObj.getAsJsonObject("products").getAsJsonArray("items");
            for (JsonElement product : productItems) {
              JsonObject productObj = product.getAsJsonObject();
              String loId =
                  productObj.get("almloid").isJsonNull()
                      ? "1"
                      : productObj.get("almloid").getAsString();
              String loType =
                  productObj.get("almlotype").isJsonNull()
                      ? "course"
                      : productObj.get("almlotype").getAsString();

              String pagePath =
                  trainingPagePath
                      .replace("{loType}", loTypeMap.get(loType))
                      .replace("{loId}", loId);
              Resource trainingResource = resResolver.resolve(pagePath);
              String trainingURL = externalizerService.externalize(trainingResource);
              String externalURL = trainingURL;
              if (StringUtils.isNotBlank(trainingURL) && pagePath.startsWith(trainingURL)) {
                externalURL = trainingURL + pagePath.substring(trainingURL.length());
              }
              sitemap.addUrl(externalURL);
            }
            currentPage++;
            continue;
          }
          break;
        }
      }
    } catch (NullPointerException npe) {
      LOGGER.error(
          "CPPrime::TrainingsSitemapGeneratorImpl::fetchDataFromCommerceGraphql Exception in generating sitemap for commerce usage",
          npe);
    }
  }

  private JsonObject fetchDataFromCommerceGraphql(String commerceGraphqlURL, String query) {
    try {
      query = URLEncoder.encode(query, "UTF-8");
      String getURL = commerceGraphqlURL + "?query=" + query;
      HttpGet getCall = new HttpGet(getURL);

      try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
          CloseableHttpResponse response = httpClient.execute(getCall)) {
        String responseStr = EntityUtils.toString(response.getEntity());
        Gson gson = new Gson();
        JsonObject jsonObj = gson.fromJson(responseStr, JsonObject.class);
        if (jsonObj.get("errors") != null) {
          LOGGER.error(
              "CPPrime::TrainingsSitemapGeneratorImpl::fetchDataFromCommerceGraphql Exception in Graphql Products query. Reponse {}",
              responseStr);
          return null;
        } else {
          return jsonObj.getAsJsonObject("data");
        }
      } catch (IOException ioe) {
        LOGGER.error(
            "CPPrime::TrainingsSitemapGeneratorImpl::fetchDataFromCommerceGraphql Exception while executing query",
            ioe);
      }
    } catch (UnsupportedEncodingException uee) {
      LOGGER.error(
          "CPPrime::TrainingsSitemapGeneratorImpl::fetchDataFromCommerceGraphql Exception while encoding query- {}",
          query,
          uee);
    }
    return null;
  }

  private void generateForESUsage(
      Resource sitemapRoot,
      String name,
      Sitemap sitemap,
      SitemapGenerator.Context context,
      String sitemapTrainingPath,
      String esBaseURL)
      throws SitemapException {
    try {
      String trainingPagePath = TRAINING_URL_FORMAT.replace("{trainingPage}", sitemapTrainingPath);
      ResourceResolver resResolver = sitemapRoot.getResourceResolver();

      HttpGet getCall = new HttpGet(esBaseURL);

      try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
          CloseableHttpResponse response = httpClient.execute(getCall)) {
        if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
          String configResponse = EntityUtils.toString(response.getEntity());
          JsonArray loIdsArray =
              new Gson().fromJson(configResponse, JsonObject.class).getAsJsonArray("loIds");

          for (JsonElement loObj : loIdsArray) {
            String[] lo = loObj.getAsString().split(":");
            if (lo != null && lo.length == 2) {
              String pagePath =
                  trainingPagePath.replace("{loType}", lo[0]).replace("{loId}", lo[1]);
              Resource trainingResource = resResolver.resolve(pagePath);
              String trainingURL = externalizerService.externalize(trainingResource);
              String externalURL = trainingURL;
              if (StringUtils.isNotBlank(trainingURL) && pagePath.startsWith(trainingURL)) {
                externalURL = trainingURL + pagePath.substring(trainingURL.length());
              }
              sitemap.addUrl(externalURL);
            }
          }
        }
      }

    } catch (IOException ioe) {
      LOGGER.error(
          "CPPrime::TrainingsSitemapGeneratorImpl::generateForESUsage Exception while query for trainings",
          ioe);
    }
  }
}
