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

package com.adobe.learning.core.servlets;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.Servlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.HttpStatus;
import org.apache.http.ParseException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.learning.core.entity.CustomerCommerceEntity;
import com.adobe.learning.core.services.CPTokenService;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.day.cq.wcm.api.Page;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@Component(service = Servlet.class, property = {"sling.servlet.methods=GET", "sling.servlet.resourceTypes=" + FetchCommerceAccessTokenServlet.RESOURCE_TYPE,
		"sling.servlet.selectors=" + "commerceToken", "sling.servlet.extensions=html"})
public class FetchCommerceAccessTokenServlet extends SlingAllMethodsServlet {

	private static final long serialVersionUID = 492465267362222327L;

	final static String RESOURCE_TYPE = "sling/servlet/default";

	private final static Logger LOGGER = LoggerFactory.getLogger(FetchCommerceAccessTokenServlet.class);

	private final static String ACCESS_TOKEN_COOKIE_NAME = "alm_cp_token";
	
	private final static String CUSTOMER_TOKEN_COOKIE_NAME = "alm_commerce_token";

	private static final String COMMERCE_EMAIL_QUERY = "{\"query\":\"query {\\n customer {\\n firstname \\n lastname \\n email\\n}\\n}\"}";

	private static final String ALM_CREATE_USER_BODY = "{\"data\": { \"type\": \"user\", \"attributes\": {\"email\":\"{email}\",\"name\": \"{name}\",\"userType\":\"INTERNAL\"}}}";
	
	private static final Integer TOKEN_BUFFER_SECS = 60;

	@Reference
	private transient GlobalConfigurationService configService;

	@Reference
	private transient CPTokenService tokenService;
	
	@Reference
	private HttpClientBuilderFactory clientBuilderFactory;

	@Override
	protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response)
	{
		try {
			String customerToken = request.getParameter("token");
			String pagePath = request.getParameter("pagePath");

			Page currentPage = getCurrentPage(request, pagePath);
			if (currentPage == null)
			{
				LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet:: Unable to get current page");
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to get current page");
				return;
			}

			JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);

			String almURL = jsonConfigs.get(Constants.Config.ALM_BASE_URL).getAsString(),
					clientId = jsonConfigs.get(Constants.Config.CLIENT_ID).getAsString(),
					clientSecret = jsonConfigs.get(Constants.Config.CLIENT_SECRET).getAsString(),
					refreshToken = jsonConfigs.get(Constants.Config.COMMERCE_ADMIN_REFRESH_TOKEN).getAsString(),
					commerceURL = jsonConfigs.get(Constants.Config.COMMERCE_URL).getAsString();
			Integer customerTokenLifetime = Integer.valueOf(jsonConfigs.get(Constants.Config.COMMERCE_CUSTOMER_TOKEN_LIFETIME).getAsString());

			CustomerCommerceEntity customer = getCustomerFromCommerce(customerToken, commerceURL);

			Pair<String, Integer> accessTokenWithExpiry;

			if (customer != null)
			{
				String email = customer.getEmail();

				String accessTokenResp = tokenService.fetchLearnerToken(almURL, clientId, clientSecret, refreshToken, email);
				if(containValidAccessToken(accessTokenResp))
				{
					accessTokenWithExpiry = getAccessTokenWithExpiry(accessTokenResp);
					setAccessTokenCookie(request, response, accessTokenWithExpiry.getLeft(), accessTokenWithExpiry.getRight(), customerToken, customerTokenLifetime);
					return;
				} else if (userNotPresent(accessTokenResp))
				{
					boolean success = createALMUser(almURL, clientId, clientSecret, refreshToken, email, customer.getFirstname(), customer.getLastname());
					if (success)
					{
						accessTokenResp = tokenService.fetchLearnerToken(almURL, clientId, clientSecret, refreshToken, email);
						if(containValidAccessToken(accessTokenResp))
						{
							accessTokenWithExpiry = getAccessTokenWithExpiry(accessTokenResp);
							setAccessTokenCookie(request, response, accessTokenWithExpiry.getLeft(), accessTokenWithExpiry.getRight(), customerToken, customerTokenLifetime);
							return;
						}
					}
					else
					{
						LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet:: Exception in creating ALM User. Response- {}", accessTokenResp);
						response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to create ALM user");
						return;
					}
				}
			}

			LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet:: Exception in fetching access_token.");
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

		} catch (Exception e)
		{
			LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet Exception while fetching access_token", e);
		}
	}

	private Pair<String, Integer> getAccessTokenWithExpiry(String responseStr)
	{
		JsonObject jsonObject = new Gson().fromJson(responseStr, JsonObject.class);
		String accessToken = jsonObject.get("access_token").getAsString();
		Integer expirySecond = jsonObject.get("expires_in").getAsInt();
		return new ImmutablePair<String, Integer>(accessToken, expirySecond);
	}

	private boolean createALMUser(String almURL, String clientId, String clientSecret, String refreshToken, String email, String firstName, String lastName)
	{
		Pair<String, Integer> accessToken = tokenService.getAccessToken(almURL, clientId, clientSecret, refreshToken);
		if (accessToken != null)
		{
			String createUserURL = almURL + "/primeapi/v2/users";
			HttpPost post = new HttpPost(createUserURL);
			post.setHeader("Content-Type", "application/vnd.api+json;charset=UTF-8");
			post.setHeader("Accept", "application/vnd.api+json");
			post.setHeader("Authorization", "oauth " + accessToken.getLeft());

			String requestBody = ALM_CREATE_USER_BODY.replace("{email}", email).replace("{name}", firstName + " " + lastName);
			post.setEntity(new StringEntity(requestBody, ContentType.APPLICATION_JSON));

			try (CloseableHttpClient httpClient = clientBuilderFactory.newBuilder().setDefaultRequestConfig(getRequestConfig()).build(); CloseableHttpResponse response = httpClient.execute(post))
			{
				if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode())
					return true;

				LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet::createALMUser Exception while creating ALM User. Response {}", EntityUtils.toString(response.getEntity(), "UTF-8"));
			} catch (ParseException | IOException e)
			{
				LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet::createALMUser Exception in http call while creating ALM User", e);
			}
		}
		return false;
	}

	private boolean containValidAccessToken(String accessTokenResp)
	{
		if (StringUtils.isNotBlank(accessTokenResp) && accessTokenResp.contains("access_token") && accessTokenResp.contains("expires_in"))
			return true;
		else
			return false;
	}

	private boolean userNotPresent(String accessTokenResp)
	{
		JsonObject respObj = new Gson().fromJson(accessTokenResp, JsonObject.class);
		if (respObj != null)
		{
			JsonObject sourceObj = respObj.get("source") != null ? respObj.get("source").getAsJsonObject() : null;
			if (sourceObj != null)
			{
				String info = sourceObj.get("info") != null ? sourceObj.get("info").getAsString() : "";
				return "User not found".equals(info);
			}

		}
		return false;
	}

	private CustomerCommerceEntity getCustomerFromCommerce(String token, String commerceURL)
	{
		try {
			String commerceGraphQlURL = commerceURL + "/graphql";
			HttpPost httpPost = new HttpPost(commerceGraphQlURL);
			StringEntity entity = new StringEntity(COMMERCE_EMAIL_QUERY);
			httpPost.setEntity(entity);
			httpPost.setHeader("Content-type", "application/json");
			httpPost.setHeader("Authorization", "Bearer " + token);

			try (CloseableHttpClient httpClient = clientBuilderFactory.newBuilder().setDefaultRequestConfig(getRequestConfig()).build(); CloseableHttpResponse response = httpClient.execute(httpPost))
			{
				String responseStr = EntityUtils.toString(response.getEntity());
				if (StringUtils.isNotBlank(responseStr) && HttpStatus.SC_OK == response.getStatusLine().getStatusCode())
				{
					Gson gson = new Gson();
					String customerResp = String.valueOf(gson.fromJson(responseStr, JsonObject.class).get("data").getAsJsonObject().get("customer"));
					return gson.fromJson(customerResp, CustomerCommerceEntity.class);
				}
			} catch (ParseException | IOException e)
			{
				LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet::getCustomerFromCommerce Exception in http call while fetching customer from commerce", e);
			}

		} catch (UnsupportedEncodingException uee)
		{
			LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet::getCustomerFromCommerce Exception in character encoding while fetching email from commerce", uee);
		}
		return null;
	}

	private void setAccessTokenCookie(SlingHttpServletRequest request, SlingHttpServletResponse response, String accessToken, Integer cpTokenTimeout, String commerceToken, Integer commerceTimeout)
	{
		final Cookie tokenCookie = new Cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
		final Cookie customerTokenCookie = new Cookie(CUSTOMER_TOKEN_COOKIE_NAME, commerceToken);
		Integer age = Math.min(cpTokenTimeout, commerceTimeout) - TOKEN_BUFFER_SECS;
		
		tokenCookie.setSecure(request.isSecure());
		tokenCookie.setMaxAge(age);
		tokenCookie.setPath("/");
		response.addCookie(tokenCookie);
		
		customerTokenCookie.setSecure(request.isSecure());
		customerTokenCookie.setMaxAge(age);
		customerTokenCookie.setPath("/");
		response.addCookie(customerTokenCookie);
	}


	private Page getCurrentPage(SlingHttpServletRequest request, String pagePath)
	{ 
		Resource pageRsc = request.getResourceResolver().resolve(pagePath);
		Page page = null;
		if (pageRsc != null)
		{
			page = pageRsc.adaptTo(Page.class);
		}
		return page;
	}
	
	private RequestConfig getRequestConfig() {
		return RequestConfig.custom()
        .setConnectTimeout(10000)
        .setConnectionRequestTimeout(10000)
        .setSocketTimeout(10000)
        .build();
	}

}
