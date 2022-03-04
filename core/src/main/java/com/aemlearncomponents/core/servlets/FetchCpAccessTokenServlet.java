package com.aemlearncomponents.core.servlets;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.NameValuePair;
import org.apache.http.ParseException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aemlearncomponents.core.services.CPTokenService;
import com.aemlearncomponents.core.services.GlobalConfigurationService;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@Component(service = Servlet.class, property = {"sling.servlet.methods=POST", "sling.servlet.resourceTypes=" + FetchCpAccessTokenServlet.RESOURCE_TYPE,
		"sling.servlet.selectors=" + "cpAccessToken", "sling.servlet.extensions=html"})
public class FetchCpAccessTokenServlet extends SlingAllMethodsServlet {

	private static final long serialVersionUID = 492465267362222317L;

	final static String RESOURCE_TYPE = "sling/servlet/default";

	private final static Logger LOGGER = LoggerFactory.getLogger(FetchCpAccessTokenServlet.class);

	private final static String ACCESS_TOKEN_COOKIE_NAME = "alm-cp-token";

	@Reference
	private transient GlobalConfigurationService configService;

	@Reference
	private transient CPTokenService tokenService;

	@Override
	protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
	{
		try {
			String code = request.getParameter("code");
			String pagePath = request.getParameter("pagePath");

			Page currentPage = getCurrentPage(request, pagePath);
			if (currentPage == null)
			{
				LOGGER.error("CPPrime:: Unable to get current page");
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}
			JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);
			
			String primeUrl = jsonConfigs.get("primeUrl").getAsString(),
					clientId = jsonConfigs.get("clientId").getAsString(),
					clientSecret = jsonConfigs.get("clientSecret").getAsString();

			Pair<String, Integer> refreshTokenResp = tokenService.getRefreshToken(primeUrl, clientId, clientSecret, code);
			if (refreshTokenResp == null)
			{
				LOGGER.error("CPPrime:: Exception in fetching refresh_token");
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}
			
			Pair<String, Integer> accessTokenResp = tokenService.getAccessToken(primeUrl, clientId, clientSecret, refreshTokenResp.getLeft());
			if (accessTokenResp == null)
			{
				LOGGER.error("CPPrime:: Exception in fetching access_token");
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}

			setAccessTokenCookie(request, response, accessTokenResp.getLeft(), accessTokenResp.getRight());

		} catch (IOException ioe)
		{
			LOGGER.error("CPPrime:: IOException while fetching access_token", ioe);
		}
	}

	private void setAccessTokenCookie(SlingHttpServletRequest request, SlingHttpServletResponse response, String accessToken, Integer maxAge)
	{
		final Cookie tokenCookie = new Cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken);
		tokenCookie.setSecure(request.isSecure());
		tokenCookie.setMaxAge(maxAge);
		tokenCookie.setPath("/");
		response.addCookie(tokenCookie);
	}

	private Page getCurrentPage(SlingHttpServletRequest request, String pagePath) {
		Resource pageRsc = request.getResourceResolver().resolve(pagePath);
		Page page = null;
		if (pageRsc != null)
		{
			page = pageRsc.adaptTo(Page.class);
		}
		return page;
	}
}
