/**
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const CART_ID = "CART_ID";

export function getALMObject() {
  return window.ALM;
}

export const setALMAttribute = (key, value) => {
  window.ALM[key] = value;
};

export const getALMAttribute = (key) => {
  return window.ALM[key];
};

export function getALMConfig() {
  return getALMObject().getALMConfig();
}

export function getAccessToken() {
  return getALMObject().getAccessToken();
}

export function getCommerceToken() {
  return getALMObject().getCommerceToken();
}
export const getCommerceStoreName = () => {
  return getALMConfig().commerceStoreName;
}

export const getAccountActiveFields = async () => {
  return await getALMObject().getAccountActiveFields();
};

export const handlePageLoad = async () => {
  return await getALMObject().handlePageLoad();
};

export const getRelativePath = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.href.replace(url.origin, "");
  } catch (e) {
    return urlString;
  }
};

export const postMethod = async (path) => {
  const primeApiURL = getALMConfig().primeApiURL;
  const url = `${primeApiURL}${path}`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `oauth ${getAccessToken()}`,
    },
    body: JSON.stringify({}),
  });
};

export const getCartId = () => {
  return getALMObject().storage.getItem(CART_ID);
};

export const setCartId = (data, ttl = 10800) => {
  return getALMObject().storage.setItem(CART_ID, data, ttl);
};
