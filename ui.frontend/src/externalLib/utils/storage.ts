import { getWindowObject } from "./global";

class NamespacedLocalStorage {
  localStorage: any;
  key: string;
  constructor(localStorage: any, key: string) {
    this.localStorage = localStorage;
    this.key = key;
  }
  _makeKey(key: string) {
    return `${this.key}__${key}`;
  }
  getItem(name: string) {
    return this.localStorage.getItem(this._makeKey(name));
  }
  setItem(name: string, value: string) {
    return this.localStorage.setItem(this._makeKey(name), value);
  }
  removeItem(name: string) {
    return this.localStorage.removeItem(this._makeKey(name));
  }
}

class BrowserPersistence {
  static KEY = "ALM_BROWSER_PERSISTENCE";
  storage: NamespacedLocalStorage;
  constructor() {
    this.storage = new NamespacedLocalStorage(
      getWindowObject().localStorage,
      BrowserPersistence.KEY
    );
  }
  getRawItem(name: string) {
    return this.storage.getItem(name);
  }
  getItem(name: string) {
    const now = Date.now();
    const item = this.storage.getItem(name);
    if (!item) {
      return undefined;
    }
    const { value, ttl, timeStored } = JSON.parse(item);

    if (ttl && now - timeStored > ttl * 1000) {
      this.storage.removeItem(name);
      return undefined;
    }

    return JSON.parse(value);
  }
  setItem(name: string, value: any, ttl: Number = 900) {
    const timeStored = Date.now();
    this.storage.setItem(
      name,
      JSON.stringify({
        value: JSON.stringify(value),
        timeStored,
        ttl,
      })
    );
  }
  removeItem(name: any) {
    this.storage.removeItem(name);
  }
}

export default new BrowserPersistence();
