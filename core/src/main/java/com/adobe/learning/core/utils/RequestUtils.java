package com.adobe.learning.core.utils;

import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.osgi.services.HttpClientBuilderFactory;

public final class RequestUtils {

  private static final int TIMEOUT = 10000;

  private static final RequestConfig REQUEST_CONFIG =
      RequestConfig.custom()
          .setConnectTimeout(TIMEOUT)
          .setConnectionRequestTimeout(TIMEOUT)
          .setSocketTimeout(TIMEOUT)
          .build();

  private RequestUtils() {}

  public static RequestConfig getRequestConfig() {
    return REQUEST_CONFIG;
  }

  public static CloseableHttpClient getClient(HttpClientBuilderFactory clientBuilderFactory) {
    return clientBuilderFactory.newBuilder().setDefaultRequestConfig(getRequestConfig()).build();
  }
}
