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
class NamespacedLocalStorage {
  constructor(localStorage, key) {
    this.localStorage = localStorage;
    this.key = key;
  }
  _makeKey(key) {
    return `${this.key}__${key}`;
  }
  getItem(name) {
    return this.localStorage.getItem(this._makeKey(name));
  }
  setItem(name, value) {
    return this.localStorage.setItem(this._makeKey(name), value);
  }
  removeItem(name) {
    return this.localStorage.removeItem(this._makeKey(name));
  }
}

class BrowserPersistence {
  static KEY = "ALM_BROWSER_PERSISTENCE";
  constructor() {
    this.storage = new NamespacedLocalStorage(
      localStorage,
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

export default new BrowserPersistence();
