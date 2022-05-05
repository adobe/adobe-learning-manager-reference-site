(function (window, document, Granite, $) {
    "use strict";
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
            debugger;
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
})(window, document, Granite, jQuery);