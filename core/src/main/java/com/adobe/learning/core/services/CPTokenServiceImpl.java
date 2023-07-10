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

package com.adobe.learning.core.services;

import com.adobe.learning.core.utils.Constants;
import com.adobe.learning.core.utils.RequestUtils;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.osgi.services.HttpClientBuilderFactory;
import org.apache.http.util.EntityUtils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(service = CPTokenService.class)
public class CPTokenServiceImpl implements CPTokenService {

  private static final Logger LOGGER = LoggerFactory.getLogger(CPTokenServiceImpl.class);

  @Reference private HttpClientBuilderFactory clientBuilderFactory;

  @Override
  public Pair<String, Integer> getAccessTokenFromCode(
      String almURL, String clientId, String clientSecret, String code) {
    if (StringUtils.isAnyEmpty(almURL, clientId, clientSecret, code)) {
      LOGGER.error(
          "CPPrime GetAccessTokenFromCode:: Errors in admin configuration. almURL {}, ClientId {}, ClientSecret {}, code {}",
          almURL,
          clientId,
          clientSecret);
      return null;
    }

    String url = almURL + "/oauth/token";

    List<NameValuePair> nvps = new ArrayList<NameValuePair>();
    nvps.add(new BasicNameValuePair("code", code));
    nvps.add(new BasicNameValuePair("client_id", clientId));
    nvps.add(new BasicNameValuePair("client_secret", clientSecret));

    String responseStr = doCPPost(url, nvps);

    if (StringUtils.isBlank(responseStr)
        || !responseStr.contains("refresh_token")
        || !responseStr.contains("access_token")
        || !responseStr.contains("expires_in")) {
      LOGGER.error("CPPrime GetAccessTokenFromCode:: Incorrect responseStr {}", responseStr);
      return null;
    } else {
      return getTokenAndExpiry(responseStr);
    }
  }

  @Override
  public Pair<String, Integer> getAccessToken(
      String almURL, String clientId, String clientSecret, String refreshToken) {
    if (StringUtils.isAnyEmpty(almURL, clientId, clientSecret, refreshToken)) {
      LOGGER.error(
          "CPPrime FetchAccessToken:: Errors in admin configuration. almURL {}, ClientId {}, ClientSecret {}, RefreshToken {}",
          almURL,
          clientId,
          clientSecret,
          refreshToken);
      return null;
    }

    String url = almURL + "/oauth/token/refresh";

    List<NameValuePair> nvps = new ArrayList<NameValuePair>();
    nvps.add(new BasicNameValuePair("refresh_token", refreshToken));
    nvps.add(new BasicNameValuePair("client_id", clientId));
    nvps.add(new BasicNameValuePair("client_secret", clientSecret));

    String responseStr = doCPPost(url, nvps);

    if (StringUtils.isBlank(responseStr)
        || !responseStr.contains("access_token")
        || !responseStr.contains("expires_in")) {
      LOGGER.error("CPPrime FetchAccessToken:: Error in responseStr {}", responseStr);
      return null;
    } else {
      return getTokenAndExpiry(responseStr);
    }
  }

  @Override
  public String fetchLearnerToken(
      String almURL, String clientId, String clientSecret, String refreshToken, String email) {
    LOGGER.debug(
        "CPPrime::CPTokenServiceImpl::fetchLearnerToken new almURL {}, email {}", almURL, email);
    try {
      String url =
          almURL
              + Constants.Config.LEARNER_TOKEN_URL
                  .replace("{email}", URLEncoder.encode(email, "UTF-8"))
                  .replace(
                      "{min_validity_sec}",
                      String.valueOf(Constants.Config.LEARNER_TOKEN_MIN_VALIDITY_SEC));
      HttpPost post = new HttpPost(url);
      post.setHeader("Content-Type", "application/json");
      post.setHeader("Accept", "application/json");

      Map<String, String> requestBodyMap = new HashMap<String, String>();
      requestBodyMap.put("client_id", clientId);
      requestBodyMap.put("client_secret", clientSecret);
      requestBodyMap.put("refresh_token", refreshToken);
      post.setEntity(
          new StringEntity(new Gson().toJson(requestBodyMap), ContentType.APPLICATION_JSON));

      try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
          CloseableHttpResponse response = httpClient.execute(post)) {
        return EntityUtils.toString(response.getEntity());
      } catch (ParseException | IOException e) {
        LOGGER.error(
            "CPPrime::CPTokenServiceImpl::fetchLearnerToken Exception in http call while fetching learner-token",
            e);
      }

    } catch (UnsupportedEncodingException uee) {
      LOGGER.error(
          "CPPrime::CPTokenServiceImpl::fetchLearnerToken UnsupportedEncodingException in fetching learner-token",
          uee);
    }
    return null;
  }

  private String doCPPost(String url, List<NameValuePair> params) {
    HttpPost post = new HttpPost(url);
    post.setEntity(new UrlEncodedFormEntity(params, StandardCharsets.UTF_8));
    try (CloseableHttpClient httpClient = RequestUtils.getClient(clientBuilderFactory);
        CloseableHttpResponse response = httpClient.execute(post)) {
      return EntityUtils.toString(response.getEntity());
    } catch (ParseException | IOException e) {
      LOGGER.error("CPPrime:: Exception in http call while fetching refresh-token", e);
    }
    return null;
  }

  private ImmutablePair<String, Integer> getTokenAndExpiry(String responseStr) {
    JsonObject jsonObject = new Gson().fromJson(responseStr, JsonObject.class);
    String accessToken = jsonObject.get("access_token").getAsString();
    Integer expirySecond = jsonObject.get("expires_in").getAsInt();
    return new ImmutablePair<String, Integer>(accessToken, expirySecond);
  }
}
