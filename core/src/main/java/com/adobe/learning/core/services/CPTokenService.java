package com.adobe.learning.core.services;

import org.apache.commons.lang3.tuple.Pair;

public interface CPTokenService {
	
	// public Pair<String, Integer> getRefreshToken(String almURL, String clientId, String clientSecret, String code);

	public Pair<String, Integer> getAccessTokenFromCode(String almURL, String clientId, String clientSecret, String code);

	public Pair<String, Integer> getAccessToken(String almURL, String clientId, String clientSecret, String refreshToken);
}
