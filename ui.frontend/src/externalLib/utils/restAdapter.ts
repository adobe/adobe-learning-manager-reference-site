import { getALMObject } from "../utils/global";
export type QueryParams = Record<
  string,
  string | number | boolean | Array<any>
>;

export interface IRestAdapterGetOptions {
  url: string;
  headers?: Record<string, string>;
  params?: QueryParams;
  withCredentials?: boolean;
}

export interface IRestAdapterAjaxOptions extends IRestAdapterGetOptions {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
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
  public static get(options: IRestAdapterGetOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = "GET";
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static post(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = "POST";
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static patch(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = "PATCH";
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static put(options: IRestAdapterAjaxOptions): Promise<unknown> {
    (options as IRestAdapterAjaxOptions).method = "PUT";
    return this.ajax(options as IRestAdapterAjaxOptions);
  }

  public static ajax(options: IRestAdapterAjaxOptions): Promise<unknown> {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method, getUrl(options.url, options.params));
      xhr.withCredentials =
        options.withCredentials === undefined ? true : options.withCredentials;
      xhr.setRequestHeader(
        "Authorization",
        `oauth ${getALMObject().getAccessToken()}`
      );
      for (const header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
      xhr.onload = function () {
        if ((this.status >= 200 && this.status < 300) || this.status === 304) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText,
            responseText: this.responseText,
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText,
          responseText: this.responseText,
        });
      };
      xhr.send(options.body ? options.body : null);
    });
  }
}

