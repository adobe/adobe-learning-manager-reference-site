(function (window) {
  "use strict";
  class NamespacedSessionStorage {
    constructor(sessionStorage, key) {
      this.sessionStorage = sessionStorage;
      this.key = key;
    }
    _makeKey(key) {
      return `${this.key}__${key}`;
    }
    getItem(name) {
      return this.sessionStorage.getItem(this._makeKey(name));
    }
    setItem(name, value) {
      return this.sessionStorage.setItem(this._makeKey(name), value);
    }
    removeItem(name) {
      return this.sessionStorage.removeItem(this._makeKey(name));
    }
  }

  class BrowserPersistence {
    static KEY = "ALM_BROWSER_PERSISTENCE";
    constructor() {
      this.storage = new NamespacedSessionStorage(
        sessionStorage,
        BrowserPersistence.KEY
      );
    }
    getRawItem(name) {
      return this.storage.getItem(name);
    }
    getItem(name) {
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
    setItem(name, value, ttl) {
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
    removeItem(name) {
      this.storage.removeItem(name);
    }
  }

  window.ALM = window.ALM || {};
  window.ALM.storage = window.ALM.storage || new BrowserPersistence();
})(window);
