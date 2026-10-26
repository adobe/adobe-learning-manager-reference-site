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

/**
 * ALM Autocomplete Data Sources
 * 
 * Register custom data sources for autocomplete fields.
 * This file contains example implementations that you can customize
 * based on your actual API endpoints and requirements.
 */
(function (document, window, $) {
    'use strict';

    /**
     * ALM Configuration Helper
     * Provides reusable methods for accessing ALM configuration and authentication
     */
    var ALMConfigHelper = (function() {
        var cachedWindow = null;

        /**
         * Check if a window has ALM configuration
         */
        function hasALMConfig(win) {
            try {
                return win && win.ALM && win.ALM.getALMConfig && win.ALM.getAccessToken;
            } catch (e) {
                return false;
            }
        }

        /**
         * Recursively search frames in a window
         */
        function searchFrames(win) {
            if (!win) return null;

            try {
                for (var i = 0; i < win.frames.length; i++) {
                    try {
                        var frame = win.frames[i];
                        if (hasALMConfig(frame)) {
                            return frame;
                        }
                        var result = searchFrames(frame);
                        if (result) return result;
                    } catch (e) {
                        // Skip inaccessible frames
                    }
                }
            } catch (e) {
                // Skip if frames are inaccessible
            }
            return null;
        }

        /**
         * Find the window object containing ALM configuration
         * Searches current window, parent, top, and all frames recursively
         */
        function findALMWindow() {
            // Return cached window if available
            if (cachedWindow && hasALMConfig(cachedWindow)) {
                return cachedWindow;
            }

            // Check in order: current -> parent -> top -> frames
            var windowsToCheck = [
                window,
                window.parent !== window ? window.parent : null,
                window.top !== window ? window.top : null
            ];

            // Check direct windows first
            for (var i = 0; i < windowsToCheck.length; i++) {
                if (hasALMConfig(windowsToCheck[i])) {
                    cachedWindow = windowsToCheck[i];
                    return cachedWindow;
                }
            }

            // Search frames in parent and top
            var result = searchFrames(window.parent);
            if (result) {
                cachedWindow = result;
                return cachedWindow;
            }

            result = searchFrames(window.top);
            if (result) {
                cachedWindow = result;
                return cachedWindow;
            }

            return null;
        }

        /**
         * Get ALM configuration object
         * @returns {Object|null} ALM configuration or null if not found
         */
        function getConfig() {
            var almWindow = findALMWindow();
            if (!almWindow) {
                console.error('ALM configuration not found in any window');
                return null;
            }

            try {
                var config = almWindow.ALM.getALMConfig();
                if (!config || !config.primeApiURL) {
                    console.error('ALM configuration or primeApiURL not available');
                    return null;
                }
                return config;
            } catch (e) {
                console.error('Error getting ALM configuration:', e);
                return null;
            }
        }

        /**
         * Get ALM access token
         * @returns {string|null} Access token or null if not found
         */
        function getToken() {
            var almWindow = findALMWindow();
            if (!almWindow) {
                console.error('ALM configuration not found in any window');
                return null;
            }

            try {
                var token = almWindow.ALM.getAccessToken();
                if (!token) {
                    console.error('ALM access token not available');
                    return null;
                }
                return token;
            } catch (e) {
                console.error('Error getting ALM access token:', e);
                return null;
            }
        }

        /**
         * Get both config and token
         * @returns {Object|null} Object with config and token, or null if either is missing
         */
        function getConfigAndToken() {
            var config = getConfig();
            var token = getToken();

            if (!config || !token) {
                return null;
            }

            return {
                config: config,
                token: token
            };
        }

        /**
         * Make an authenticated API call to ALM
         * @param {string} endpoint - API endpoint (relative to primeApiURL)
         * @param {Object} options - jQuery AJAX options (method, data, etc.)
         * @param {Function} callback - Callback function(data, error). On an HTTP failure `error`
         *     is {status, retryAfter, message}; it is not called when the request is aborted.
         * @returns {Object|undefined} The jqXHR (has abort()), or undefined when no call was made
         */
        function makeApiCall(endpoint, options, callback) {
            var configAndToken = getConfigAndToken();
            if (!configAndToken) {
                callback(null, 'ALM configuration or token not available');
                return;
            }

            var apiUrl = configAndToken.config.primeApiURL + endpoint;
            var ajaxOptions = $.extend({}, options, {
                url: apiUrl,
                headers: $.extend({}, options.headers || {}, {
                    'Authorization': 'oauth ' + configAndToken.token,
                    'Content-Type': 'application/json'
                }),
                success: function(response) {
                    callback(response, null);
                },
                error: function(xhr, status, error) {
                    if (status === 'abort') {
                        return;
                    }
                    console.error('ALM API call failed:', error);
                    console.error('Status:', status);
                    console.error('Response:', xhr.responseText);
                    callback(null, {
                        status: xhr.status,
                        retryAfter: xhr.getResponseHeader('Retry-After'),
                        message: error
                    });
                }
            });

            return $.ajax(ajaxOptions);
        }

            /**
         * Get ALM user data including account information
         * @returns {Promise} Promise resolving to user data or null
         */
        function getALMUser() {
            var almWindow = findALMWindow();
            if (!almWindow || !almWindow.ALM || !almWindow.ALM.getALMUser) {
                return Promise.resolve(null);
            }

            try {
                return almWindow.ALM.getALMUser();
            } catch (e) {
                console.error('Error calling ALM.getALMUser:', e);
                return Promise.resolve(null);
            }
        }

        // Public API
        return {
            getConfig: getConfig,
            getToken: getToken,
            getConfigAndToken: getConfigAndToken,
            makeApiCall: makeApiCall,
            getALMUser: getALMUser
        };
    })();

    /**
     * Account Nomenclature (Singleton)
     * Fetches and caches account terminologies for dynamic label display.
     * Auto-loads on document ready.
     * 
     * Usage:
     *   var N = window.ALM.ALMWidget.Nomenclature;
     *   'All ' + N.CATALOG.plural      // "All Catalogs"
     *   'Select ' + N.ROLE.singular    // "Select Role"
     */
    var Nomenclature = {
        // Default values (used before load or if API fails)
        CATALOG: { singular: 'Catalog', plural: 'Catalogs' },
        ROLE: { singular: 'Role', plural: 'Roles' },
        PRODUCT: { singular: 'Product', plural: 'Products' },
        COURSE: { singular: 'Course', plural: 'Courses' },
        LEARNING_PATH: { singular: 'Learning Path', plural: 'Learning Paths' },
        CERTIFICATION: { singular: 'Certification', plural: 'Certifications' },
        JOB_AID: { singular: 'Job Aid', plural: 'Job Aids' },
        SKILL: { singular: 'Skill', plural: 'Skills' },
        BADGE: { singular: 'Badge', plural: 'Badges' },
        MODULE: { singular: 'Module', plural: 'Modules' },
        LEARNER: { singular: 'Learner', plural: 'Learners' },
        
        _loaded: false,
        _fetchPromise: null,

        /**
         * Check if nomenclature has been loaded
         * @returns {boolean}
         */
        isLoaded: function() {
            return this._loaded;
        },

        /**
         * Fetch nomenclature from ALM API
         * @returns {Promise}
         */
        fetch: function() {
            var self = this;
            
            if (self._loaded) {
                return Promise.resolve(self);
            }

            if (self._fetchPromise) {
                return self._fetchPromise;
            }

            self._fetchPromise = new Promise(function(resolve) {
                ALMConfigHelper.getALMUser()
                    .then(function(response) {
                        if (response) {
                            var data = typeof response === 'string' ? JSON.parse(response) : response;
                            
                            var account = null;
                            if (data && data.included && Array.isArray(data.included)) {
                                account = data.included.find(function(item) {
                                    return item.type === 'account';
                                });
                            }

                            if (account && account.attributes && account.attributes.accountTerminologies) {
                                self._buildFromTerminologies(
                                    account.attributes.accountTerminologies,
                                    account.attributes.locale || 'en-US'
                                );
                            }
                        }
                        
                        self._loaded = true;
                        resolve(self);
                    })
                    .catch(function(error) {
                        console.error('Error fetching nomenclature:', error);
                        self._loaded = true;
                        resolve(self);
                    });
            });

            return self._fetchPromise;
        },

        /**
         * Build nomenclature from API terminologies
         * @private
         */
        _buildFromTerminologies: function(terminologies, accountLocale) {
            var self = this;
            var DEFAULT_LOCALE = 'en-US';
            
            // Group by entity type
            var byEntityType = {};
            terminologies.forEach(function(t) {
                if (t.entityType) {
                    if (!byEntityType[t.entityType]) {
                        byEntityType[t.entityType] = [];
                    }
                    byEntityType[t.entityType].push(t);
                }
            });

            // For each entity type, select best match by locale priority
            for (var entityType in byEntityType) {
                var items = byEntityType[entityType];
                var selected = null;
                var defaultMatch = null;
                var firstMatch = items[0];

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (accountLocale && item.locale === accountLocale) {
                        selected = item;
                        break;
                    }
                    if (item.locale === DEFAULT_LOCALE) {
                        defaultMatch = item;
                    }
                }

                selected = selected || defaultMatch || firstMatch;

                if (selected) {
                    if (!self[entityType]) {
                        self[entityType] = {};
                    }
                    if (selected.name) {
                        self[entityType].singular = selected.name;
                    }
                    if (selected.pluralName) {
                        self[entityType].plural = selected.pluralName;
                    }
                }
            }
        }
    };

    /**
     * Cache for roles and products data
     * Stores fetched data to avoid redundant API calls since filtering is done client-side
     * Using object wrappers to allow pass-by-reference
     */
    var rolesCacheWrapper = { value: null };
    var productsCacheWrapper = { value: null };

    /**
     * Value transformation strategies
     * Defines how to transform API response data for different use cases
     */
    var TRANSFORM_STRATEGIES = {
        // Use ID as value, name as text (for category widget)
        ID_AS_VALUE: 'id_as_value',
        // Use name as both value and text (for coursesandpaths widget roles/products)
        NAME_AS_VALUE: 'name_as_value'
    };

    /**
     * Helper function to extract numeric ID from full ID string by removing type prefix
     * Handles IDs in format "type:numericId" and extracts only the numeric portion
     * @param {string} fullId - Full ID string (e.g., "recommendationRole:539")
     * @param {string} type - Type prefix to remove (e.g., "recommendationRole")
     * @returns {string} Extracted numeric ID (e.g., "539") or original ID if prefix not found
     */
    function extractNumericId(fullId, type) {
        if (!fullId || typeof fullId !== 'string') {
            return fullId || '';
        }
        
        // If type is provided, remove the "type:" prefix
        if (type && fullId.startsWith(type + ':')) {
            return fullId.substring(type.length + 1);
        }
        
        // Fallback: return original ID if no type match
        return fullId;
    }

    /**
     * Helper function to extract name from item attributes with fallback to localizedMetadata
     * First tries attributes.name, then falls back to localizedMetadata where locale is "en-US"
     * @param {Object} item - API response item with attributes and optionally localizedMetadata
     * @returns {string} Extracted name or empty string if not found
     */
    function extractName(item) {
        // First, try to get name from attributes
        if (item.attributes && item.attributes.name) {
            return item.attributes.name;
        }
        
        // Fallback: look for localizedMetadata with locale "en-US"
        if (item.attributes && 
            item.attributes.localizedMetadata && 
            Array.isArray(item.attributes.localizedMetadata)) {
            var enUSMetadata = item.attributes.localizedMetadata.find(function(meta) {
                return meta.locale === 'en-US';
            });
            if (enUSMetadata && enUSMetadata.name) {
                return enUSMetadata.name;
            }
        }
        
        // Return id or empty string if no name found
        return item.id || '';
    }

    /**
     * Helper function to filter items based on query
     * @param {Array} items - Array of items to filter
     * @param {string} query - Search query string
     * @returns {Array} Filtered items
     */
    function filterItems(items, query) {
        if (!query || query.trim().length === 0) {
            return items;
        }
        var lowerQuery = query.toLowerCase();
        return items.filter(function(item) {
            return item.text.toLowerCase().includes(lowerQuery);
        });
    }

    /**
     * Transform data based on strategy
     * @param {Array} data - Array of {value, text} objects
     * @param {string} strategy - Transformation strategy
     * @returns {Array} Transformed data
     */
    function transformData(data, strategy) {
        if (strategy === TRANSFORM_STRATEGIES.NAME_AS_VALUE) {
            return data.map(function(item) {
                return {
                    value: item.text,  // Use name as value
                    text: item.text
                };
            });
        }
        // Default: ID_AS_VALUE - return as is
        return data;
    }

    /**
     * Generic function to fetch cached resources (roles or products)
     * Supports both query-based filtering and ID-based fetching
     * @param {string} endpoint - API endpoint
     * @param {Object} cache - Cache object reference {get, set}
     * @param {string} typePrefix - Type prefix for ID extraction
     * @param {Object} options - Options object: {query: string} OR {ids: Array}
     * @param {string} transformStrategy - Value transformation strategy
     * @param {Function} callback - Callback function
     */
    /**
     * Resolve a cached resource list for one caller: filter by IDs when given, otherwise by query
     */
    function resolveCachedResource(items, options, transformStrategy, callback) {
        var transformed = transformData(items, transformStrategy);

        // If IDs are provided, filter by those IDs
        if (options.ids && Array.isArray(options.ids) && options.ids.length > 0) {
            callback(transformed.filter(function(item) {
                return options.ids.indexOf(item.value) !== -1;
            }));
            return;
        }

        // Otherwise, filter by query
        callback(filterItems(transformed, options.query));
    }

    function fetchCachedResource(endpoint, cache, typePrefix, options, transformStrategy, callback) {
        // If data is already cached
        if (cache.value !== null) {
            resolveCachedResource(cache.value, options, transformStrategy, callback);
            return;
        }

        // A fetch is already in flight (e.g. several fields opened together): wait for it
        // instead of sending the same request again.
        var waiter = { options: options, transformStrategy: transformStrategy, callback: callback };
        if (cache.waiters) {
            cache.waiters.push(waiter);
            return;
        }
        cache.waiters = [waiter];

        // First call - fetch from API and cache the results
        ALMConfigHelper.makeApiCall(endpoint, {
            method: 'GET',
            dataType: 'json'
        }, function(response, error) {
            var waiters = cache.waiters;
            cache.waiters = null;

            if (error) {
                waiters.forEach(function(w) {
                    w.callback([], error);
                });
                return;
            }

            // Parse response and extract data
            var items = [];
            if (response && response.data && Array.isArray(response.data)) {
                items = response.data.map(function(item) {
                    return {
                        value: extractNumericId(item.id, item.type),
                        text: extractName(item)
                    };
                });
            }

            // Cache the results for future calls (always store with ID as value)
            cache.value = items;

            waiters.forEach(function(w) {
                resolveCachedResource(items, w.options, w.transformStrategy, w.callback);
            });
        });
    }

    /**
     * Utility function to chunk an array into smaller arrays
     * @param {Array} array - Array to chunk
     * @param {number} chunkSize - Size of each chunk
     * @returns {Array} Array of chunks
     */
    function chunkArray(array, chunkSize) {
        var chunks = [];
        for (var i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Fetch items by IDs with automatic chunking for large ID lists (POST method)
     * Makes parallel API calls in chunks and combines results
     * Used for /search/query endpoint
     * @param {string} endpoint - API endpoint path
     * @param {Function} buildRequestBody - Function(idsChunk, chunkSize) that returns request body
     * @param {Array} ids - Array of IDs to fetch
     * @param {number} maxChunkSize - Maximum IDs per API call (default 10)
     * @param {Function} callback - Callback function(results)
     */
    function fetchByIdsWithChunking(endpoint, buildRequestBody, ids, maxChunkSize, callback) {
        if (!ids || ids.length === 0) {
            callback([]);
            return;
        }

        // Split IDs into chunks
        var chunks = chunkArray(ids, maxChunkSize);
        var allResults = [];
        var completedCalls = 0;

        // Make parallel calls for each chunk
        chunks.forEach(function(chunk) {
            var requestBody = buildRequestBody(chunk, chunk.length);
            
            ALMConfigHelper.makeApiCall(endpoint, {
                method: 'POST',
                data: JSON.stringify(requestBody),
                dataType: 'json'
            }, function(response, error) {
                if (error) {
                    completedCalls++;
                    if (completedCalls === chunks.length) {
                        callback(allResults); // Return what we have
                    }
                    return;
                }

                // Parse and collect results
                if (response && response.data && Array.isArray(response.data)) {
                    var items = response.data.map(function(item) {
                        return {
                            value: item.id,
                            text: extractName(item)
                        };
                    });
                    allResults = allResults.concat(items);
                }

                completedCalls++;
                
                // When all calls complete, return combined results
                if (completedCalls === chunks.length) {
                    callback(allResults);
                }
            });
        });
    }

    /**
     * Fetch items by IDs with automatic chunking for large ID lists (GET method)
     * Makes parallel GET API calls with comma-separated IDs in query params
     * Used for endpoints like /catalogs?ids=1,2,3
     * @param {string} baseEndpoint - Base API endpoint path (e.g., '/catalogs')
     * @param {string} queryParamName - Name of the query parameter for IDs (e.g., 'ids')
     * @param {Array} ids - Array of IDs to fetch
     * @param {number} maxChunkSize - Maximum IDs per API call (default 10)
     * @param {Function} callback - Callback function(results)
     */
    function fetchByIdsWithChunkingGET(baseEndpoint, queryParamName, ids, maxChunkSize, callback) {
        if (!ids || ids.length === 0) {
            callback([]);
            return;
        }

        // Split IDs into chunks
        var chunks = chunkArray(ids, maxChunkSize);
        var allResults = [];
        var completedCalls = 0;

        // Make parallel GET calls for each chunk
        chunks.forEach(function(chunk) {
            // Build query string with comma-separated IDs
            var idsParam = chunk.join(',');
            var endpoint = baseEndpoint + '?' + queryParamName + '=' + idsParam;
            
            ALMConfigHelper.makeApiCall(endpoint, {
                method: 'GET',
                dataType: 'json'
            }, function(response, error) {
                if (error) {
                    completedCalls++;
                    if (completedCalls === chunks.length) {
                        callback(allResults); // Return what we have
                    }
                    return;
                }

                // Parse and collect results
                if (response && response.data && Array.isArray(response.data)) {
                    var items = response.data.map(function(item) {
                        return {
                            value: item.id,
                            text: extractName(item)
                        };
                    });
                    allResults = allResults.concat(items);
                }

                completedCalls++;
                
                // When all calls complete, return combined results
                if (completedCalls === chunks.length) {
                    callback(allResults);
                }
            });
        });
    }

    // Expose Nomenclature to window.ALM.ALMWidget namespace
    window.ALM = window.ALM || {};
    window.ALM.ALMWidget = window.ALM.ALMWidget || {};
    window.ALM.ALMWidget.Nomenclature = Nomenclature;

    /**
     * Wait for ALM.ALMWidget.Autocomplete to be available
     */
    $(document).ready(function() {
        if (!window.ALM || !window.ALM.ALMWidget || !window.ALM.ALMWidget.Autocomplete) {
            console.warn('ALM.ALMWidget.Autocomplete not available. Make sure alm-autocomplete.js is loaded first.');
            return;
        }

        Nomenclature.fetch();

        /**
         * Fetches catalog data from ALM API with search query or ID filter support
         * - By IDs: GET /catalogs?ids=34396,35993 (comma-separated, max 10 per call)
         * - By query: POST /search/query with filter.loTypes=['catalog']
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function to receive catalog data
         */
        function getCatalogs(options, callback) {
            // If IDs are provided, fetch specific catalogs using GET endpoint with chunking
            if (options.ids && Array.isArray(options.ids) && options.ids.length > 0) {
                // Use GET-based chunking utility: /catalogs?ids=34396,35993
                fetchByIdsWithChunkingGET(
                    '/catalogs',  // Base endpoint
                    'ids',        // Query param name
                    options.ids,  // Array of IDs
                    10,           // Max 10 IDs per call
                    callback
                );
                return;
            }

            // Otherwise, use query-based search with POST /search/query
            var query = options.query ? options.query.trim() : '';
            var requestBody = {
                'filter.loTypes': ['catalog'],
                'query': query || null,
                'sort': 'relevance',
                'pageLimit': 10
            };

            return cachedSearch(
                'catalog|' + query,
                '/search/query',
                { method: 'POST', data: JSON.stringify(requestBody), dataType: 'json' },
                function(response) {
                    if (!response || !response.data || !Array.isArray(response.data)) {
                        return [];
                    }
                    return response.data.map(function(item) {
                        return {
                            value: item.id,
                            text: extractName(item)
                        };
                    });
                },
                callback,
                query.length === 0
            );
        }

        /**
         * ========================================
         * ROLES AND PRODUCTS DATA SOURCES
         * ========================================
         */
        
        /**
         * Fetches recommendation roles from ALM API
         * Implements caching and client-side filtering
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function to receive roles data
         */
        function getRoles(options, callback) {
            fetchCachedResource(
                '/recommendationRoles?filter.showAllRecommendationCriteria=true',
                rolesCacheWrapper,
                'recommendationRole',
                options,
                TRANSFORM_STRATEGIES.ID_AS_VALUE,
                callback
            );
        }

        /**
         * Fetches recommendation products from ALM API
         * Implements caching and client-side filtering
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function to receive products data
         */
        function getProducts(options, callback) {
            fetchCachedResource(
                '/recommendationProducts?filter.showAllRecommendationCriteria=true',
                productsCacheWrapper,
                'recommendationProduct',
                options,
                TRANSFORM_STRATEGIES.ID_AS_VALUE,
                callback
            );
        }

        /**
         * Get Roles for Courses & Paths Widget
         * Returns {value: name, text: name} instead of {value: id, text: name}
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function
         */
        function getRolesForCoursesAndPaths(options, callback) {
            fetchCachedResource(
                '/recommendationRoles?filter.showAllRecommendationCriteria=true',
                rolesCacheWrapper,
                'recommendationRole',
                options,
                TRANSFORM_STRATEGIES.NAME_AS_VALUE,
                callback
            );
        }

        /**
         * Get Products for Courses & Paths Widget
         * Returns {value: name, text: name} instead of {value: id, text: name}
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function
         */
        function getProductsForCoursesAndPaths(options, callback) {
            fetchCachedResource(
                '/recommendationProducts?filter.showAllRecommendationCriteria=true',
                productsCacheWrapper,
                'recommendationProduct',
                options,
                TRANSFORM_STRATEGIES.NAME_AS_VALUE,
                callback
            );
        }

        // Server-side typeahead sources (skills, tags, catalogs, learning objects) hit a
        // rate-limited search, so they need a minimum length for typed text, a longer debounce
        // and a cache (see alm-autocomplete.js for how these settings are applied). An empty
        // box (focus, or cleared) runs one cached search that lists the first results.
        var SEARCH_TYPEAHEAD_CONFIG = {
            minSearchLength: 2,
            debounceMs: 600,
            searchOnFocus: true,
            allowEmptyQuery: true
        };
        // Search results are cached until the widget dialog closes (see clearSearchCache).
        var searchCache = {};
        var searchInFlight = {};
        var searchCacheGeneration = 0;

        /**
         * Run a typeahead search, serving repeated searches from the cache.
         * Only successful results are cached.
         * @param {string} cacheKey - Identifies the search (type + query)
         * @param {string} endpoint - API endpoint (relative to primeApiURL)
         * @param {Object} ajaxOptions - jQuery AJAX options (method, data, dataType)
         * @param {Function} parse - function(response) returning the suggestions list
         * @param {Function} callback - Callback function(suggestions[, error])
         * @param {boolean} [shareInFlight] - Let concurrent callers wait for one request. Such a
         *     request is shared, so no abort handle is returned.
         * @returns {Object|undefined} Request handle with abort(), when a request was sent
         */
        function cachedSearch(cacheKey, endpoint, ajaxOptions, parse, callback, shareInFlight) {
            var cached = searchCache[cacheKey];
            if (cached) {
                callback(cached.items);
                return;
            }

            var waiters = null;
            if (shareInFlight) {
                if (searchInFlight[cacheKey]) {
                    searchInFlight[cacheKey].push(callback);
                    return;
                }
                waiters = searchInFlight[cacheKey] = [callback];
            }

            var generation = searchCacheGeneration;
            var request = ALMConfigHelper.makeApiCall(endpoint, ajaxOptions, function(response, error) {
                var callbacks = waiters || [callback];
                if (waiters && searchInFlight[cacheKey] === waiters) {
                    delete searchInFlight[cacheKey];
                }

                if (error) {
                    callbacks.forEach(function(cb) {
                        cb([], error);
                    });
                    return;
                }

                var items = parse(response);
                // Don't cache a response that arrives after the dialog was closed.
                if (generation === searchCacheGeneration) {
                    searchCache[cacheKey] = { items: items };
                }
                callbacks.forEach(function(cb) {
                    cb(items);
                });
            });

            return shareInFlight ? undefined : request;
        }

        /**
         * Forget all cached searches. Called when the widget dialog closes, so the next
         * dialog sees newly created skills, tags, catalogs and learning objects.
         */
        window.ALM.ALMWidget.Autocomplete.clearSearchCache = function() {
            searchCache = {};
            searchInFlight = {};
            searchCacheGeneration++;
        };

        // Searches are cached only for the life of one widget dialog, so clear when a dialog
        // opens or closes. Native capture-phase listeners run before any jQuery handler, so
        // another handler failing or stopping the event cannot prevent the clear.
        var DIALOG_MARKER_DATA = 'almSearchCacheDialog';

        function isWidgetDialog(element) {
            if (!element || element.nodeName !== 'CORAL-DIALOG') {
                return false;
            }
            return !!$(element).data(DIALOG_MARKER_DATA) ||
                $(element).find('.selector-widget, .alm-autocomplete-field').length > 0;
        }

        function clearSearchCacheFor(reason) {
            window.ALM.ALMWidget.Autocomplete.clearSearchCache();
            console.debug('[ALM Widget] search cache cleared (' + reason + ')');
        }

        ['coral-overlay:open', 'coral-overlay:close'].forEach(function(eventName) {
            document.addEventListener(eventName, function(e) {
                if (isWidgetDialog(e.target)) {
                    clearSearchCacheFor(eventName);
                }
            }, true);
        });

        // A dialog seen for the first time starts with an empty cache, even if its
        // open/close events are never heard.
        $(document).on('foundation-contentloaded', function(e) {
            var $dialog = $(e.target).closest('coral-dialog');
            if ($dialog.length && !$dialog.data(DIALOG_MARKER_DATA)) {
                $dialog.data(DIALOG_MARKER_DATA, true);
                clearSearchCacheFor('new dialog');
            }
        });

        /**
         * Get skill or tag NAMES for the Courses & Paths Widget
         * Saves and displays the NAME (not id). On dialog open, saved names are echoed
         * back without an API lookup. Typeahead hits GET /search?filter.loTypes=<type>.
         * @param {string} loType - Search type: 'skill' or 'tag'
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function(names[, error])
         * @returns {Object|undefined} Request handle with abort(), when a request was sent
         */
        function getSearchNamesForCoursesAndPaths(loType, options, callback) {
            // Prepopulation on dialog open: saved values are names, echo them back.
            if (options.ids && Array.isArray(options.ids) && options.ids.length > 0) {
                var echoed = options.ids.map(function(name) {
                    return { value: name, text: name };
                });
                callback(echoed);
                return;
            }

            var query = options.query ? options.query.trim() : '';

            // Typeahead: server-side search.
            var params = [
                'page%5Blimit%5D=10',
                'autoCompleteMode=true',
                'sort=relevance',
                'filter.loTypes=' + loType,
                'matchType=phrase'
            ];
            if (query.length > 0) {
                params.push('query=' + encodeURIComponent(query));
            }

            return cachedSearch(
                loType + '|' + query,
                '/search?' + params.join('&'),
                { method: 'GET', dataType: 'json' },
                function(response) {
                    if (!response || !response.data || !Array.isArray(response.data)) {
                        return [];
                    }
                    return response.data.map(function(item) {
                        var name = extractName(item);
                        return { value: name, text: name };
                    });
                },
                callback,
                query.length === 0
            );
        }

        /**
         * Get Skills for Courses & Paths Widget (saves the skill NAME)
         */
        function getSkillsForCoursesAndPaths(options, callback) {
            return getSearchNamesForCoursesAndPaths('skill', options, callback);
        }

        /**
         * Get Tags for Courses & Paths Widget (saves the tag NAME)
         */
        function getTagsForCoursesAndPaths(options, callback) {
            return getSearchNamesForCoursesAndPaths('tag', options, callback);
        }

        /**
         * ========================================
         * WIDGET-SPECIFIC DATASOURCE REGISTRATIONS
         * ========================================
         */
        
        /**
         * Category Data Source
         * Dynamically fetches data based on the selected source (CATALOGS/ROLES/PRODUCTS)
         * Routes to appropriate API function based on DOM source selection
         * Accepts either {query: string} for search OR {ids: Array} for prepopulation
         */
        window.ALM.ALMWidget.Autocomplete.registerDataSource('category', function(options, callback) {
            // Query DOM to get the current source selection
            var $sourceField = $('.cp-dialog-form-rel [name="./widgetConfig.attributes.source"]');
            var source = $sourceField.val();

            // Route to appropriate data fetching function based on source
            if (source === 'ROLES') {
                getRoles(options, callback);
            } else if (source === 'PRODUCTS') {
                getProducts(options, callback);
            } else {
                // Default to catalogs for 'CATALOGS' or any other value
                return getCatalogs(options, callback);
            }
        }, function() {
            // Roles and products are cached lists; only catalogs use the rate-limited search.
            var source = $('.cp-dialog-form-rel [name="./widgetConfig.attributes.source"]').val();
            return source === 'ROLES' || source === 'PRODUCTS' ? null : SEARCH_TYPEAHEAD_CONFIG;
        });

        /**
         * Courses & Paths Source Data Source
         * Similar to category but with different value storage:
         * - Catalogs: stores ID (same as category)
         * - Roles/Products: stores NAME (different from category which stores ID)
         * Accepts either {query: string} for search OR {ids: Array} for prepopulation
         */
        window.ALM.ALMWidget.Autocomplete.registerDataSource('coursesandpaths-source', function(options, callback) {
            // Query DOM to get the current source selection for Courses & Paths widget specifically
            var $sourceField = $('.cp-dialog-form-rel [name="./widgetConfig.attributes.coursesAndPaths.source"]');
            var source = $sourceField.val();

            // Route to appropriate data fetching function based on source
            if (source === 'ROLES') {
                getRolesForCoursesAndPaths(options, callback);
            } else if (source === 'PRODUCTS') {
                getProductsForCoursesAndPaths(options, callback);
            } else if (source === 'SKILLS') {
                return getSkillsForCoursesAndPaths(options, callback);
            } else {
                // For catalogs: use same as category (stores ID)
                return getCatalogs(options, callback);
            }
        }, function() {
            // Skills and catalogs use the rate-limited search; roles and products are small cached lists.
            var source = $('.cp-dialog-form-rel [name="./widgetConfig.attributes.coursesAndPaths.source"]').val();
            return source === 'ROLES' || source === 'PRODUCTS' ? null : SEARCH_TYPEAHEAD_CONFIG;
        });

        /**
         * Tags Data Source (Courses & Paths)
         * Stores the tag NAME.
         */
        window.ALM.ALMWidget.Autocomplete.registerDataSource('tagName', getTagsForCoursesAndPaths, function() {
            return SEARCH_TYPEAHEAD_CONFIG;
        });

        /**
         * ========================================
         * LEARNING OBJECTS (LO) DATA SOURCE
         * ========================================
         */
        
        /**
         * Fetch Learning Objects (Courses, Learning Programs, Job Aids, Certifications)
         * - By IDs: GET /learningObjects?ids=course:123,learningProgram:456 (comma-separated, max 10 per call)
         * - By query: POST /search/query with filter.loTypes
         * @param {Object} options - Options object: {query: string} OR {ids: Array}
         * @param {Function} callback - Callback function to return results
         */
        function getLearningObjects(options, callback) {
            // If IDs are provided, fetch specific learning objects using GET endpoint with chunking
            if (options.ids && Array.isArray(options.ids) && options.ids.length > 0) {
                // Use GET-based chunking utility: /learningObjects?ids=course:123,course:456
                fetchByIdsWithChunkingGET(
                    '/learningObjects',  // Base endpoint
                    'ids',               // Query param name
                    options.ids,         // Array of IDs
                    10,                  // Max 10 IDs per call
                    callback
                );
                return;
            }

            // Otherwise, use query-based search with POST /search/query
            var query = options.query ? options.query.trim() : '';
            var requestBody = {
                'filter.loTypes': [
                    'course',
                    'learningProgram',
                    'jobAid',
                    'certification'
                ],
                'query': query || null,
                'sort': 'relevance',
                'pageLimit': 10
            };

            // Same endpoint as catalogs
            return cachedSearch(
                'lo|' + query,
                '/search/query',
                { method: 'POST', data: JSON.stringify(requestBody), dataType: 'json' },
                function(response) {
                    if (!response || !response.data || !Array.isArray(response.data)) {
                        return [];
                    }
                    return response.data.map(function(item) {
                        return {
                            value: item.id,  // e.g., "course:12075786"
                            text: extractName(item)
                        };
                    });
                },
                callback,
                query.length === 0
            );
        }

        /**
         * Register 'lo' datasource for Learning Objects
         * Accepts either {query: string} for search OR {ids: Array} for prepopulation
         */
        window.ALM.ALMWidget.Autocomplete.registerDataSource('lo', getLearningObjects, function() {
            return SEARCH_TYPEAHEAD_CONFIG;
        });

        /**
         * ========================================
         * LO TYPE DATA SOURCE
         * ========================================
         * Static, fixed 4-value list (course/certification/learningProgram/jobAid).
         * Labels come from the account-aware Nomenclature singleton (not hardcoded
         * English) so a renamed entity type (e.g. "Course" -> "Class") is reflected here too.
         * Accepts either {query: string} for local filtering OR {ids: Array} for prepopulation
         */
        function getLoTypeOptions() {
            var N = window.ALM.ALMWidget.Nomenclature;
            return [
                { value: 'course', text: N.COURSE.plural },
                { value: 'certification', text: N.CERTIFICATION.plural },
                { value: 'learningProgram', text: N.LEARNING_PATH.plural },
                { value: 'jobAid', text: N.JOB_AID.plural }
            ];
        }

        function getLoTypes(options, callback) {
            var items = getLoTypeOptions();

            if (options.ids && Array.isArray(options.ids) && options.ids.length > 0) {
                callback(items.filter(function(item) {
                    return options.ids.indexOf(item.value) !== -1;
                }));
                return;
            }

            callback(filterItems(items, options.query));
        }

        window.ALM.ALMWidget.Autocomplete.registerDataSource('loType', getLoTypes);

        /**
         * ========================================
         * LEARNER STATE DATA SOURCE
         * ========================================
         * Static list of learner states. Also used for the ordered "Sort on progress" field.
         * Accepts either {query: string} for local filtering OR {ids: Array} for prepopulation
         */
        function getLearnerStateOptions() {
            return [
                { value: 'enrolled', text: 'Enrolled' },
                { value: 'started', text: 'Started' },
                { value: 'completed', text: 'Completed' },
                { value: 'notenrolled', text: 'Not enrolled' }
            ];
        }

        function getLearnerStates(options, callback) {
            var items = getLearnerStateOptions();

            if (options.ids && Array.isArray(options.ids) && options.ids.length > 0) {
                callback(items.filter(function(item) {
                    return options.ids.indexOf(item.value) !== -1;
                }));
                return;
            }

            callback(filterItems(items, options.query));
        }

        window.ALM.ALMWidget.Autocomplete.registerDataSource('learnerState', getLearnerStates);
    });

})(document, window, jQuery);

