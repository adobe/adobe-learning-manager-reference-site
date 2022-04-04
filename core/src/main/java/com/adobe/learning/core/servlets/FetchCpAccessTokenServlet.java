package com.adobe.learning.core.servlets;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.learning.core.services.CPTokenService;
import com.adobe.learning.core.services.GlobalConfigurationService;
import com.adobe.learning.core.utils.Constants;
import com.day.cq.wcm.api.Page;
import com.google.gson.JsonObject;

@Component(service = Servlet.class, property = {"sling.servlet.methods=POST", "sling.servlet.resourceTypes=" + FetchCpAccessTokenServlet.RESOURCE_TYPE,
		"sling.servlet.selectors=" + "cpAccessToken", "sling.servlet.extensions=html"})
public class FetchCpAccessTokenServlet extends SlingAllMethodsServlet {

	private static final long serialVersionUID = 492465267362222317L;

	final static String RESOURCE_TYPE = "sling/servlet/default";

	private final static Logger LOGGER = LoggerFactory.getLogger(FetchCpAccessTokenServlet.class);

	private final static String ACCESS_TOKEN_COOKIE_NAME = "alm-cp-token";

	private final static String AUTHOR_MODE = "author";

	@Reference
	private transient GlobalConfigurationService configService;

	@Reference
	private transient CPTokenService tokenService;

	@Override
	protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
	{
		try {
			String pagePath = request.getParameter("pagePath");

			Page currentPage = getCurrentPage(request, pagePath);
			if (currentPage == null)
			{
				LOGGER.error("CPPrime:: Unable to get current page");
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}

			JsonObject jsonConfigs = configService.getAdminConfigs(currentPage);

			String almURL = jsonConfigs.get(Constants.Config.ALM_BASE_URL).getAsString(),
					clientId = jsonConfigs.get(Constants.Config.CLIENT_ID).getAsString(),
					clientSecret = jsonConfigs.get(Constants.Config.CLIENT_SECRET).getAsString();

			String mode = request.getParameter("mode");

			if(AUTHOR_MODE.equals(mode))
			{
				String authorRefreshToken = jsonConfigs.get("authorRefreshToken").getAsString();
				Pair<String, Integer> accessTokenResp = tokenService.getAccessToken(almURL, clientId, clientSecret, authorRefreshToken);
				if (accessTokenResp == null)
				{
					LOGGER.error("CPPrime:: Exception in fetching access_token");
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					return;
				}
				setAccessTokenCookie(request, response, accessTokenResp.getLeft(), accessTokenResp.getRight());
			}
			else
			{
				String code = request.getParameter("code");

				Pair<String, Integer> refreshTokenResp = tokenService.getRefreshToken(almURL, clientId, clientSecret, code);
				if (refreshTokenResp == null)
				{
					LOGGER.error("CPPrime:: Exception in fetching refresh_token");
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					return;
				}

				Pair<String, Integer> accessTokenResp = tokenService.getAccessToken(almURL, clientId, clientSecret, refreshTokenResp.getLeft());
				if (accessTokenResp == null)
				{
					LOGGER.error("CPPrime:: Exception in fetching access_token");
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					return;
				}

				setAccessTokenCookie(request, response, accessTokenResp.getLeft(), accessTokenResp.getRight());
			}
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
