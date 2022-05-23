/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
    constructor() {
      this.key = "ALM_BROWSER_PERSISTENCE";
      this.storage = new NamespacedSessionStorage(sessionStorage, this.key);
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
