package com.adobe.learning.core.utils;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.osgi.services.HttpClientBuilderFactory;

public class HttpClientBuilderFactoryMock implements HttpClientBuilderFactory {

  @Override
  public HttpClientBuilder newBuilder() {
    return new MockHttpClientBuilder();
  }

  private class MockHttpClientBuilder extends HttpClientBuilder {
    @Override
    public CloseableHttpClient build() {
      return HttpClients.createDefault();
    }
  }
}
