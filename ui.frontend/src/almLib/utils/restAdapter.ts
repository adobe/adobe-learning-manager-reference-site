/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  redirectToLoginAndAbort,
} from './global';
export type QueryParams = Record<string, string | number | boolean | Array<any>>;
import store from '../../store/APIStore';
import { AppMode, NetworkStatus } from './mobileAppUtils/appConstants';

export interface IRestAdapterGetOptions {
  url: string;
  headers?: Record<string, string>;
  params?: QueryParams;
  withCredentials?: boolean;
  responseType?: XMLHttpRequestResponseType;
  cancelToken?: string;
}

export interface IRestAdapterAjaxOptions extends IRestAdapterGetOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: string;
}

function getUrl(urlStr: string, params?: QueryParams) {
  const url = new URL(urlStr);
  for (const param in params) {
    url.searchParams.append(param, params[param].toString());
  }
  return url.toString();
}

export class RestAdapter {
  static currentRequest: { [key: string]: XMLHttpRequest | undefined } = {};
  public static get(options: IRestAdapterGetOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = 'GET';
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static post(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = 'POST';
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static patch(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = 'PATCH';
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static put(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = 'PUT';
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static delete(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = 'DELETE';
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static resetPreviousRequest(options: IRestAdapterAjaxOptions): void {
    const { cancelToken } = options;
    if (cancelToken) {
      this.currentRequest[cancelToken] = undefined;
    }
  }

  public static ajax(options: IRestAdapterAjaxOptions): Promise<unknown> {
    let xhr = new XMLHttpRequest();
    const context = this;
    if (options.cancelToken) {
      //cancel the previous call, if any
      context.currentRequest[options.cancelToken]?.abort();
      context.currentRequest[options.cancelToken] = xhr;
    }
    if (store && store.getState().appState.appMode === AppMode.INSIDEAPP) {
      const isOnline = store.getState().appState.isOnline;
      const { networkStatus } = getQueryParamsFromUrl();
      const isOnlineFromQueryParams = !networkStatus || networkStatus === NetworkStatus.ONLINE;
      if (!isOnline && isOnlineFromQueryParams) {
        // TODO: Remove any loaders

        return new Promise(() => {
          console.log('API Intercepted to Load Offline Page');
          console.log('No Network... Redirecting to Offline Page');
          getALMObject().navigateToOfflinePage?.();
        });
      }
    }
    return new Promise(function (resolve, reject) {
      const nonLoggedInUser =
        getALMConfig().learnerMobileApp ||
        getALMConfig().usageType === 'aem-es' ||
        getALMConfig().usageType === 'aem-commerce';
      if (getALMObject().isPrimeUserLoggedIn()) {
        if (getALMConfig().csrfToken) {
          const location = new URL(options.url);
          const urlSearchParams = new URLSearchParams(location.search);
          urlSearchParams.set('csrf_token', getALMObject().getCsrfToken());
          options.url = options.url.split('?')[0] + `?${urlSearchParams.toString()}`;
          xhr.open(options.method, getUrl(options.url, options.params));
        } else if (getALMObject().getAccessToken()) {
          xhr.open(options.method, getUrl(options.url, options.params));
          xhr.setRequestHeader('Authorization', `oauth ${getALMObject().getAccessToken()}`);
        }
      } else if (nonLoggedInUser) {
        xhr.open(options.method, getUrl(options.url, options.params));
        options.withCredentials = false;
      }
      xhr.withCredentials = options.withCredentials === undefined ? true : options.withCredentials;

      for (const header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
      if (options.responseType) {
        xhr.responseType = options.responseType;
      }
      xhr.onload = function () {
        if ((this.status >= 200 && this.status < 300) || this.status === 304) {
          context.resetPreviousRequest(options);
          resolve(xhr.response);
        } else {
          context.resetPreviousRequest(options);
          reject({
            status: this.status,
            statusText: xhr.statusText,
            responseText: this.responseText,
          });
        }
      };
      xhr.onerror = function () {
        context.resetPreviousRequest(options);
        reject({
          status: this.status,
          statusText: xhr.statusText,
          responseText: this.responseText,
        });
      };

      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 401) {
          context.resetPreviousRequest(options);
          redirectToLoginAndAbort(true);
          return;
        }
      };

      xhr.send(options.body ? options.body : null);
    });
  }
}
