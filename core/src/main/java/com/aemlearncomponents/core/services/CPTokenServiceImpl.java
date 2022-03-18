package com.aemlearncomponents.core.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.http.NameValuePair;
import org.apache.http.ParseException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@Component(service = CPTokenService.class)
public class CPTokenServiceImpl implements CPTokenService {

	private final static Logger LOGGER = LoggerFactory.getLogger(CPTokenServiceImpl.class);

	@Override
	public Pair<String, Integer> getRefreshToken(String almURL, String clientId, String clientSecret, String code)
	{
		if (StringUtils.isAnyEmpty(almURL, clientId, clientSecret, code))
		{
			LOGGER.error("CPPrime FetchRefreshToken:: Errors in admin configuration. almURL {}, ClientId {}, ClientSecret {}, code {}", almURL, clientId, clientSecret);
			return null;
		}

		String url = almURL + "/oauth/token";

		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		nvps.add(new BasicNameValuePair("code", code));
		nvps.add(new BasicNameValuePair("client_id", clientId));
		nvps.add(new BasicNameValuePair("client_secret", clientSecret));

		String responseStr = doCPPost(url, nvps);

		if (StringUtils.isBlank(responseStr) || !responseStr.contains("refresh_token"))
		{
			LOGGER.error("CPPrime FetchRefreshToken:: Empty responseStr {}", responseStr);
			return null;
		}
		else
		{
			JsonObject jsonObject = new Gson().fromJson(responseStr, JsonObject.class);
			String refreshToken = jsonObject.get("refresh_token").getAsString();
			Integer expirySecond = jsonObject.get("expires_in").getAsInt();
			return new ImmutablePair<String, Integer>(refreshToken, expirySecond);
		}
	}

	@Override
	public Pair<String, Integer> getAccessToken(String almURL, String clientId, String clientSecret, String refreshToken)
	{
		if (StringUtils.isAnyEmpty(almURL, clientId, clientSecret, refreshToken))
		{
			LOGGER.error("CPPrime FetchAccessToken:: Errors in admin configuration. almURL {}, ClientId {}, ClientSecret {}, RefreshToken {}", almURL, clientId, clientSecret, refreshToken);
			return null;
		}

		String url = almURL + "/oauth/token/refresh";

		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		nvps.add(new BasicNameValuePair("refresh_token", refreshToken));
		nvps.add(new BasicNameValuePair("client_id", clientId));
		nvps.add(new BasicNameValuePair("client_secret", clientSecret));

		String responseStr = doCPPost(url, nvps);

		if (StringUtils.isBlank(responseStr) || !responseStr.contains("access_token") || !responseStr.contains("expires_in"))
		{
			LOGGER.error("CPPrime FetchAccessToken:: Error in responseStr {}", responseStr);
			return null;
		}
		else
		{
			JsonObject jsonObject = new Gson().fromJson(responseStr, JsonObject.class);
			String accessToken = jsonObject.get("access_token").getAsString();
			Integer expirySecond = jsonObject.get("expires_in").getAsInt();
			return new ImmutablePair<String, Integer>(accessToken, expirySecond);
		}
	}

	private String doCPPost(String url, List<NameValuePair> params)
	{
		HttpPost post = new HttpPost(url);
		post.setEntity(new UrlEncodedFormEntity(params, StandardCharsets.UTF_8));
		try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(post))
		{
			return EntityUtils.toString(response.getEntity());
		} catch (ParseException | IOException e)
		{
			LOGGER.error("CPPrime:: Exception in http call while fetching refresh-token", e);
		}
		return null;
	}
}
