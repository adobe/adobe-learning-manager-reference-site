package com.aemlearncomponents.core.services;

import org.apache.commons.lang3.tuple.Pair;

public interface CPTokenService {
	
	public Pair<String, Integer> getRefreshToken(String primeUrl, String clientId, String clientSecret, String code);

	public Pair<String, Integer> getAccessToken(String primeUrl, String clientId, String clientSecret, String refreshToken);
}