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

export const getAccountActiveFields = async () => {
  return await getALMObject().getAccountActiveFields();
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
