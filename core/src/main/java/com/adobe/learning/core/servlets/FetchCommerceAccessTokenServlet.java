package com.adobe.learning.core.servlets;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.HttpStatus;
import org.apache.http.ParseException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
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

	private final static String ACCESS_TOKEN_COOKIE_NAME = "alm-cp-token";

	private static final String COMMERCE_EMAIL_QUERY = "{\"query\":\"query {\\n customer {\\n firstname \\n lastname \\n email\\n}\\n}\"}";

	private static final String ALM_CREATE_USER_BODY = "{\"data\": { \"type\": \"user\", \"attributes\": {\"email\":\"{email}\",\"name\": \"{name}\",\"userType\":\"INTERNAL\"}}}";

	private static final String ACCESS_TOKEN_URL = "/oauth/o/learnerToken?learner_email={email}&min_validity_sec={min_validity_sec}";

	private static final long ACCESS_TOKEN_MIN_VALIDITY_SEC = 518400; // 24 Hr

	@Reference
	private transient GlobalConfigurationService configService;

	@Reference
	private transient CPTokenService tokenService;

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

			CustomerCommerceEntity customer = getCustomerFromCommerce(customerToken, commerceURL);

			Pair<String, Integer> accessTokenWithExpiry;

			if (customer != null)
			{
				String email = customer.getEmail();

				String accessTokenResp = fetchAccessToken(almURL, clientId, clientSecret, refreshToken, email);
				if(containValidAccessToken(accessTokenResp))
				{
					accessTokenWithExpiry = getAccessTokenWithExpiry(accessTokenResp);
					setAccessTokenCookie(request, response, accessTokenWithExpiry.getLeft(), accessTokenWithExpiry.getRight());
					return;
				} else if (userNotPresent(accessTokenResp))
				{
					boolean success = createALMUser(almURL, clientId, clientSecret, refreshToken, email, customer.getFirstname(), customer.getLastname());
					if (success)
					{
						accessTokenResp = fetchAccessToken(almURL, clientId, clientSecret, refreshToken, email);
						if(containValidAccessToken(accessTokenResp))
						{
							accessTokenWithExpiry = getAccessTokenWithExpiry(accessTokenResp);
							setAccessTokenCookie(request, response, accessTokenWithExpiry.getLeft(), accessTokenWithExpiry.getRight());
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

	Pair<String, Integer> getAccessTokenWithExpiry(String responseStr)
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

			try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(post))
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

	private String fetchAccessToken(String almURL, String clientId, String clientSecret, String refreshToken, String email)
	{
		LOGGER.debug("CPPrime::FetchCommerceAccessTokenServlet::FetchAccessToken almURL {}, email {}", almURL, email);
		try
		{
			String url = almURL + ACCESS_TOKEN_URL.replace("{email}", URLEncoder.encode(email, "UTF-8")).replace("{min_validity_sec}", String.valueOf(ACCESS_TOKEN_MIN_VALIDITY_SEC));
			HttpPost post = new HttpPost(url);
			post.setHeader("Content-Type", "application/json");

			Map<String, String> requestBodyMap = new HashMap<String, String>();
			requestBodyMap.put("client_id", clientId);
			requestBodyMap.put("client_secret", clientSecret);
			requestBodyMap.put("refresh_token", refreshToken);
			post.setEntity(new StringEntity(new Gson().toJson(requestBodyMap), ContentType.APPLICATION_JSON));

			try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(post))
			{
				return EntityUtils.toString(response.getEntity());
			} catch (ParseException | IOException e)
			{
				LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet::FetchAccessToken Exception in http call while fetching access-token", e);
			}

		} catch (UnsupportedEncodingException uee)
		{
			LOGGER.error("CPPrime::FetchCommerceAccessTokenServlet::FetchAccessToken UnsupportedEncodingException in fetching access-token", uee);
		}
		return null;
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

			try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(httpPost))
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

	private void setAccessTokenCookie(SlingHttpServletRequest request, SlingHttpServletResponse response, String accessToken, Integer maxAge)
	{
		final Cookie tokenCookie = new Cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
		tokenCookie.setSecure(request.isSecure());
		tokenCookie.setMaxAge(maxAge);
		tokenCookie.setPath("/");
		response.addCookie(tokenCookie);
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

}
