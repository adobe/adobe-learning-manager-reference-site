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
 * ALM Autocomplete Implementation - Enhanced Multi-Select
 * 
 * Provides autocomplete functionality with:
 * - Force selection (no custom text allowed)
 * - Multiple data sources support
 * - Dynamic field handling
 * - Enhanced multi-select with tags, checkboxes
 */
(function (document, window, $) {
    'use strict';

    const AUTOCOMPLETE_FIELD_CLASS = 'alm-autocomplete-field';
    const AUTOCOMPLETE_WRAPPER_CLASS = 'alm-autocomplete-wrapper';
    const AUTOCOMPLETE_SELECTION_LIST_CLASS = 'alm-selection-list';
    const AUTOCOMPLETE_SELECTION_ITEM_CLASS = 'alm-selection-item';
    const AUTOCOMPLETE_LIST_CLASS = 'alm-autocomplete-list';
    const AUTOCOMPLETE_ITEM_CLASS = 'alm-autocomplete-item';
    const AUTOCOMPLETE_ACTIVE_CLASS = 'is-active';
    const AUTOCOMPLETE_VISIBLE_CLASS = 'is-visible';
    const AUTOCOMPLETE_OPEN_CLASS = 'is-open';
    const MIN_SEARCH_LENGTH = 0; // Changed to 0 to show all on focus
    const DEBOUNCE_DELAY = 300;
    const DEFAULT_MAX_SELECTIONS = 25; // Default maximum selections for multi-select

    // Per-source behaviour. A data source can override these through the optional
    // config getter passed to registerDataSource (e.g. server-side typeahead sources).
    const DEFAULT_SOURCE_CONFIG = {
        minSearchLength: MIN_SEARCH_LENGTH,
        debounceMs: DEBOUNCE_DELAY,
        searchOnFocus: true,
        allowEmptyQuery: false // an empty box may search even when minSearchLength > 0
    };
    
    // Timeout constants
    const BLUR_DELAY = 200;
    const INIT_DELAY = 200;
    const WIDGET_CHANGE_DELAY = 100;
    
    // Singleton document click handler flag
    let documentClickHandlerBound = false;

    /**
     * Data source registry
     */
    const dataSources = {
        default: function(query, callback) {
            callback([]);
        }
    };
    const dataSourceConfigs = {};

    /**
     * @param {string} name - Data source name
     * @param {Function} fn - function(options, callback). callback(suggestions[, error]).
     *     May return an object with abort() so a superseded request can be cancelled.
     * @param {Function} [getConfig] - Optional function returning overrides for
     *     DEFAULT_SOURCE_CONFIG, evaluated each time the user interacts with the field.
     */
    function registerDataSource(name, fn, getConfig) {
        dataSources[name] = fn;
        if (typeof getConfig === 'function') {
            dataSourceConfigs[name] = getConfig;
        }
    }

    function getDataSource(name) {
        return dataSources[name] || dataSources.default;
    }

    /**
     * Multi-select values are saved as one string: values joined with ", ".
     * A value that contains a comma (or a backslash) is escaped so it is not split into two values:
     *   "\" is written "\\" and "," is written "\,".
     * Values without a comma or backslash are saved exactly as they are.
     * Keep this rule in sync with almWidgetUtils.ts (splitEscapedList) and ALMWidgetDatasource.java.
     */
    function escapeListValue(value) {
        return String(value).replace(/\\/g, '\\\\').replace(/,/g, '\\,');
    }

    function joinListValues(values) {
        return values.map(escapeListValue).join(', ');
    }

    /**
     * Splits a saved string on unescaped commas, trims each item and unescapes it.
     * A backslash only escapes "," and "\"; any other backslash is kept as written.
     */
    function splitListValue(text) {
        const items = [];
        let current = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (ch === '\\' && i + 1 < text.length && (text.charAt(i + 1) === ',' || text.charAt(i + 1) === '\\')) {
                current += text.charAt(i + 1);
                i++;
            } else if (ch === ',') {
                items.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        items.push(current);
        return items.map(function(item) {
            return item.trim();
        }).filter(function(item) {
            return item.length > 0;
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, typeof wait === 'function' ? wait() : wait);
        };
    }

    /**
     * Message shown in the dropdown when a search fails. A 429 carries the server's
     * Retry-After (seconds) when the browser is allowed to read it.
     */
    function getSearchErrorMessage(error) {
        if (error && error.status === 429) {
            const seconds = parseInt(error.retryAfter, 10);
            if (seconds > 0) {
                return 'Too many searches. Please retry in ' + seconds + ' second' +
                    (seconds !== 1 ? 's' : '') + '.';
            }
            return 'Too many searches. Please wait a moment and try again.';
        }
        return 'Could not load suggestions. Please try again.';
    }

    /**
     * AutocompleteField class
     */
    function AutocompleteField($field) {
        this.$field = null;  // Always the visible interaction field (created new)
        this.$wrapper = null;
        this.$fieldContainer = null;
        this.$selectionListContainer = null;
        this.$list = null;
        this.suggestions = [];
        this.selectedItems = {}; // Store both value and text: { value: text }
        this.selectedOrder = []; // Maintain order of selections
        this.currentFocus = -1;
        this.isMultiple = $field.data('autocomplete-multiple') === true || $field.data('autocomplete-multiple') === 'true';
        this.isDraggable = $field.data('autocomplete-draggable') !== false && $field.data('autocomplete-draggable') !== 'false';
        this.maxSelections = parseInt($field.data('autocomplete-max-selections')) || DEFAULT_MAX_SELECTIONS;
        this.dataSourceName = $field.data('autocomplete-source') || 'default';
        this.dataSource = getDataSource(this.dataSourceName);
        this.originalValue = $field.val() || '';
        this.isOpen = false;
        this.$hiddenInput = $field; // Original field always becomes hidden input
        this.draggedItem = null;
        this.requestSeq = 0; // Identifies the latest suggestion request; older responses are ignored
        this.pendingRequest = null; // In-flight request handle (if the data source returns one)
        this.statusMessage = null; // Message shown instead of "No suggestions found" (error / hint)
        
        this.init();
    }

    AutocompleteField.prototype = {
        /**
         * ========================================
         * INITIALIZATION METHODS
         * ========================================
         */
        
        init: function() {
            if (this.$hiddenInput.data('autocomplete-initialized')) {
                return;
            }

            this.$hiddenInput.data('autocomplete-initialized', true);
            
            // Store instance reference for singleton document click handler
            this.$hiddenInput.data('autocomplete-instance', this);
            
            // Expose only the clear method (bound to this instance) for external use
            this.$hiddenInput.data('autocomplete-clear', this.clear.bind(this));
            
            this.createWrapper();
            this.parseExistingValues();
            this.bindEvents();
            
            // Initialize display for multi-select
            if (this.isMultiple) {
                this.updateSelectionList();
            }
            
            // Update field display for both modes
            this.updateFieldDisplay();
        },

        parseExistingValues: function() {
            const self = this;
            if (this.originalValue) {
                const values = splitListValue(this.originalValue);
                
                // Store with placeholder text (will be updated when suggestions load)
                values.forEach(function(value) {
                    self.selectedItems[value] = value; // Use value as text initially
                    self.selectedOrder.push(value); // Maintain order
                });
                
                // Defer initialization with timeout to ensure dialog content is fully loaded
                // This ensures the source field and other dialog elements are populated
                if (values.length > 0) {
                    setTimeout(function() {
                        self.initializeSelectedText();
                    }, INIT_DELAY);
                }
            }
        },
        
        /**
         * ========================================
         * HELPER METHODS
         * ========================================
         */
        
        /**
         * Get the field used for user interaction
         * Always returns $field (visible interaction field)
         * @returns {jQuery} The interaction field
         * @private
         */
        getInteractionField: function() {
            return this.$field;
        },

        initializeSelectedText: function() {
            const self = this;
            
            // Helper to update UI after fetching text
            const updateUI = function() {
                if (self.isMultiple) {
                    self.updateSelectionList();
                } else if (Object.keys(self.selectedItems).length > 0) {
                    // For single select, update the visible field with text
                    const firstValue = Object.keys(self.selectedItems)[0];
                    const firstText = self.selectedItems[firstValue];
                    self.$field.val(firstText);
                }
                // Update hidden input and field display for both modes
                self.updateHiddenInput();
                self.updateFieldDisplay();
            };
            
            // Get array of selected IDs
            const selectedIds = Object.keys(this.selectedItems);
            
            if (selectedIds.length === 0) {
                return; // Nothing to initialize
            }
            
            // Fetch items by IDs using the datasource
            this.dataSource({ ids: selectedIds }, function(suggestions) {
                // Build a set of resolved IDs from the datasource response
                const resolvedIds = {};
                suggestions.forEach(function(suggestion) {
                    resolvedIds[suggestion.value] = suggestion.text;
                });

                // Remove IDs that were not resolved (deleted from backend)
                selectedIds.forEach(function(id) {
                    if (!resolvedIds.hasOwnProperty(id)) {
                        delete self.selectedItems[id];
                        var orderIndex = self.selectedOrder.indexOf(id);
                        if (orderIndex > -1) {
                            self.selectedOrder.splice(orderIndex, 1);
                        }
                    } else {
                        self.selectedItems[id] = resolvedIds[id];
                    }
                });

                updateUI();
            });
        },
        
        /**
         * ========================================
         * UI SETUP METHODS
         * ========================================
         */

        createWrapper: function() {
            // Create a positioning container for field + dropdown
            const $fieldContainer = $('<div class="alm-field-container"></div>');
            this.$hiddenInput.wrap($fieldContainer);
            this.$fieldContainer = this.$hiddenInput.parent('.alm-field-container');
            
            // Get the outer wrapper for context
            this.$wrapper = this.$fieldContainer.closest('.coral-Form-fieldwrapper');
            if (this.$wrapper.length === 0) {
                // Fallback if field is not in a fieldwrapper
                this.$wrapper = this.$fieldContainer.parent();
            }
            
            // Add class to wrapper for styling
            this.$wrapper.addClass(AUTOCOMPLETE_WRAPPER_CLASS);
            
            const fieldName = this.$hiddenInput.attr('name');
            
            // BOTH modes follow the same pattern:
            // 1. Original field becomes hidden (stores value)
            // 2. New visible field created (for interaction/search)
            
            this.$hiddenInput.hide();
            
            // Create visible interaction field
            this.$field = $('<input type="text" class="coral-Form-field coral-Textfield" />');
            this.$field.attr('name', fieldName + '_display');
            this.$field.attr('placeholder', this.$hiddenInput.attr('placeholder') || '');
            this.$field.attr('autocomplete', 'off');
            this.$field.attr('data-force-selection', 'true');
            
            // Insert visible field after the hidden field
            this.$hiddenInput.after(this.$field);
            
            // Create suggestion dropdown list positioned relative to field container
            this.$list = $('<div class="' + AUTOCOMPLETE_LIST_CLASS + '" role="listbox"></div>');
            this.$fieldContainer.append(this.$list);
            
            // For multi-select, create sortable selection list below field container
            if (this.isMultiple) {
                this.$selectionListContainer = $('<div class="' + AUTOCOMPLETE_SELECTION_LIST_CLASS + '"></div>');
                this.$fieldContainer.after(this.$selectionListContainer);

                // Bind drag events for sortable list, unless dragging is disabled for this field
                if (this.isDraggable) {
                    this.bindDragEvents();
                }
            }
        },

        /**
         * ========================================
         * EVENT HANDLING METHODS
         * ========================================
         */
        
        bindEvents: function() {
            const self = this;

            // Input event
            this.$field.on('input', debounce(function(e) {
                self.handleInput(e);
            }, function() {
                return self.getSourceConfig().debounceMs;
            }));

            // Focus event
            this.$field.on('focus', function(e) {
                self.handleFocus(e);
            });

            // Blur event
            this.$field.on('blur', function(e) {
                setTimeout(function() {
                    self.handleBlur(e);
                }, BLUR_DELAY);
            });

            // Keydown event
            this.$field.on('keydown', function(e) {
                self.handleKeydown(e);
            });

            // Prevent form submission on Enter
            this.$field.on('keypress', function(e) {
                if (e.which === 13) {
                    e.preventDefault();
                    if (self.currentFocus > -1 && self.suggestions.length > 0) {
                        self.toggleSelection(self.suggestions[self.currentFocus]);
                    }
                    return false;
                }
            });
            
            // Bind document click handler only once (singleton pattern)
            this.bindDocumentClickHandler();
        },
        
        /**
         * Bind document-level click handler (singleton)
         * @private
         */
        bindDocumentClickHandler: function() {
            if (documentClickHandlerBound) {
                return;
            }
            
            documentClickHandlerBound = true;
            
            // Click outside to close
            $(document).on('click.alm-autocomplete', function(e) {
                if (!$(e.target).closest('.' + AUTOCOMPLETE_WRAPPER_CLASS).length) {
                    // Close all open autocompletes
                    $('.' + AUTOCOMPLETE_FIELD_CLASS).each(function() {
                        const autocomplete = $(this).data('autocomplete-instance');
                        if (autocomplete && autocomplete.closeSuggestions) {
                            autocomplete.closeSuggestions();
                        }
                    });
                }
            });
        },

        bindDragEvents: function() {
            const self = this;
            
            // Use event delegation since list items are dynamically created
            this.$selectionListContainer.on('dragstart', '.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS, function(e) {
                self.draggedItem = this;
                $(this).addClass('dragging');
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
            });
            
            this.$selectionListContainer.on('dragend', '.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS, function(e) {
                $(this).removeClass('dragging');
                self.$selectionListContainer.find('.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS).removeClass('drag-over');
                self.draggedItem = null;
            });
            
            this.$selectionListContainer.on('dragover', '.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS, function(e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';
                
                if (self.draggedItem && this !== self.draggedItem) {
                    // Remove drag-over from all items
                    self.$selectionListContainer.find('.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS).removeClass('drag-over');
                    $(this).addClass('drag-over');
                }
                return false;
            });
            
            this.$selectionListContainer.on('dragleave', '.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS, function(e) {
                $(this).removeClass('drag-over');
            });
            
            this.$selectionListContainer.on('drop', '.' + AUTOCOMPLETE_SELECTION_ITEM_CLASS, function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                if (self.draggedItem && this !== self.draggedItem) {
                    // Get the values
                    const draggedValue = $(self.draggedItem).attr('data-value');
                    const targetValue = $(this).attr('data-value');
                    
                    // Reorder in selectedOrder array
                    const draggedIndex = self.selectedOrder.indexOf(draggedValue);
                    const targetIndex = self.selectedOrder.indexOf(targetValue);
                    
                    if (draggedIndex > -1 && targetIndex > -1) {
                        // Remove from old position
                        self.selectedOrder.splice(draggedIndex, 1);
                        
                        // Insert at new position
                        const newTargetIndex = self.selectedOrder.indexOf(targetValue);
                        self.selectedOrder.splice(newTargetIndex, 0, draggedValue);
                        
                        // Re-render the list
                        self.updateSelectionList();
                        self.updateHiddenInput();
                    }
                }
                
                $(this).removeClass('drag-over');
                return false;
            });
        },

        handleInput: function(e) {
            const query = this.$field.val().trim();
            const config = this.getSourceConfig();
            const isAllowedEmpty = query.length === 0 && config.allowEmptyQuery;
            
            if (query.length < config.minSearchLength && !isAllowedEmpty) {
                this.showSearchHint(config);
            } else {
                this.fetchSuggestions(query);
            }
        },

        handleFocus: function(e) {
            // Clear field for searching (both single and multi-select)
            this.$field.val('');
            this.$field.removeAttr('readonly');
            this.$field.css('background-color', '');
            
            const config = this.getSourceConfig();
            if (!config.searchOnFocus) {
                this.showSearchHint(config);
                return;
            }
            
            // Fetch all suggestions on focus
            this.fetchSuggestions('');
        },

        handleBlur: function(e) {
            const self = this;
            // Check if the blur is caused by clicking inside the dropdown or selection list
            setTimeout(function() {
                const activeElement = document.activeElement;
                const $activeElement = $(activeElement);
                
                // Don't close if focus moved to dropdown or selection list
                if ($activeElement.closest('.' + AUTOCOMPLETE_LIST_CLASS).length > 0 ||
                    $activeElement.closest('.' + AUTOCOMPLETE_SELECTION_LIST_CLASS).length > 0) {
                    return;
                }
                
                // Don't close if clicked inside wrapper
                if ($(e.relatedTarget).closest('.' + AUTOCOMPLETE_WRAPPER_CLASS).length > 0) {
                    return;
                }
                
                self.closeSuggestions();
                self.updateFieldDisplay();
            }, BLUR_DELAY);
        },

        handleKeydown: function(e) {
            const $items = this.$list.find('.' + AUTOCOMPLETE_ITEM_CLASS + ':not(.no-results)');
            
            if ($items.length === 0) {
                return;
            }

            switch(e.which) {
                case 40: // Down
                    e.preventDefault();
                    this.currentFocus++;
                    if (this.currentFocus >= $items.length) {
                        this.currentFocus = 0;
                    }
                    this.setActiveItem($items);
                    break;
                    
                case 38: // Up
                    e.preventDefault();
                    this.currentFocus--;
                    if (this.currentFocus < 0) {
                        this.currentFocus = $items.length - 1;
                    }
                    this.setActiveItem($items);
                    break;
                    
                case 13: // Enter
                    e.preventDefault();
                    if (this.currentFocus > -1) {
                        $items.eq(this.currentFocus).click();
                    }
                    break;
                    
                case 27: // Escape
                    e.preventDefault();
                    this.closeSuggestions();
                    break;
            }
        },

        setActiveItem: function($items) {
            $items.removeClass(AUTOCOMPLETE_ACTIVE_CLASS);
            if (this.currentFocus >= 0 && this.currentFocus < $items.length) {
                $items.eq(this.currentFocus).addClass(AUTOCOMPLETE_ACTIVE_CLASS);
                $items.eq(this.currentFocus)[0].scrollIntoView({ block: 'nearest' });
            }
        },

        /**
         * ========================================
         * SUGGESTION RENDERING METHODS
         * ========================================
         */
        
        getSourceConfig: function() {
            const getConfig = dataSourceConfigs[this.dataSourceName];
            return $.extend({}, DEFAULT_SOURCE_CONFIG, getConfig ? getConfig() : null);
        },

        /**
         * Invalidate the latest request: later responses are ignored and an
         * in-flight request is aborted when the data source exposed a handle.
         */
        cancelPending: function() {
            this.requestSeq++;
            if (this.pendingRequest && typeof this.pendingRequest.abort === 'function') {
                this.pendingRequest.abort();
            }
            this.pendingRequest = null;
        },

        showMessage: function(message) {
            this.suggestions = [];
            this.statusMessage = message;
            this.renderSuggestions(this.suggestions);
        },

        showSearchHint: function(config) {
            this.cancelPending();
            this.showMessage('Type at least ' + config.minSearchLength + ' characters to search.');
        },

        fetchSuggestions: function(query) {
            const self = this;
            
            this.cancelPending();
            const requestId = this.requestSeq;
            let completed = false;
            
            const request = this.dataSource({ query: query }, function(suggestions, error) {
                if (requestId !== self.requestSeq) {
                    return; // A newer request (or a cancel) superseded this one
                }
                completed = true;
                self.pendingRequest = null;
                self.suggestions = suggestions || [];
                self.statusMessage = error ? getSearchErrorMessage(error) : null;
                self.renderSuggestions(self.suggestions);
            });
            
            if (!completed && request && typeof request.abort === 'function') {
                this.pendingRequest = request;
            }
        },

        renderSuggestions: function(suggestions) {
            const self = this;
            
            this.$list.empty();
            this.currentFocus = -1;

            if (!suggestions || suggestions.length === 0) {
                this.$list.append(
                    $('<div class="' + AUTOCOMPLETE_ITEM_CLASS + ' no-results"></div>')
                        .text(this.statusMessage || 'No suggestions found')
                );
                this.openSuggestions();
                return;
            }

            suggestions.forEach(function(suggestion, index) {
                const isSelected = self.selectedItems.hasOwnProperty(suggestion.value);
                const $item = $('<div class="' + AUTOCOMPLETE_ITEM_CLASS + '" role="option">')
                    .attr('data-value', suggestion.value)
                    .attr('data-text', suggestion.text)
                    .attr('data-index', index);
                
                if (isSelected) {
                    $item.addClass('selected');
                }

                // Add checkbox for multi-select
                if (self.isMultiple) {
                    const $checkbox = $('<input type="checkbox" class="' + AUTOCOMPLETE_ITEM_CLASS + '-checkbox" />');
                    $checkbox.prop('checked', isSelected);
                    $item.append($checkbox);
                }
                
                const $text = $('<span class="' + AUTOCOMPLETE_ITEM_CLASS + '-text"></span>')
                    .text(suggestion.text);
                $item.append($text);

                $item.on('mousedown', function(e) {
                    // Prevent blur from firing when clicking dropdown items
                    e.preventDefault();
                });
                
                $item.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.toggleSelection(suggestion);
                });

                self.$list.append($item);
            });

            this.openSuggestions();
        },
        
        /**
         * ========================================
         * SELECTION MANAGEMENT METHODS
         * ========================================
         */

        toggleSelection: function(suggestion) {
            if (this.isMultiple) {
                // Toggle selection
                if (this.selectedItems.hasOwnProperty(suggestion.value)) {
                    // Remove selection
                    delete this.selectedItems[suggestion.value];
                    // Remove from order array
                    const index = this.selectedOrder.indexOf(suggestion.value);
                    if (index > -1) {
                        this.selectedOrder.splice(index, 1);
                    }
                } else {
                    // Check if we've reached the maximum selection limit
                    const currentCount = Object.keys(this.selectedItems).length;
                    if (currentCount >= this.maxSelections) {
                        // Show alert to user
                        const message = 'Maximum of ' + this.maxSelections + ' items can be selected.';
                        alert(message);
                        return; // Don't add the item
                    }
                    
                    // Add selection
                    this.selectedItems[suggestion.value] = suggestion.text;
                    // Add to order array
                    this.selectedOrder.push(suggestion.value);
                }
                
                this.updateSelectionList();
                this.updateHiddenInput();
                // DON'T clear the field - keep typed text for continued searching
                // Re-render existing suggestions to update checkbox states (no API call needed)
                this.renderSuggestions(this.suggestions);
                // DON'T close dropdown for multi-select - keep it open for more selections
            } else {
                // Single selection
                this.selectedItems = {};
                this.selectedItems[suggestion.value] = suggestion.text;
                
                // Update displays
                this.updateHiddenInput();
                this.closeSuggestions();
            }
            
            this.$field.trigger('change');
        },

        removeSelection: function(value) {
            delete this.selectedItems[value];
            // Remove from order array
            const index = this.selectedOrder.indexOf(value);
            if (index > -1) {
                this.selectedOrder.splice(index, 1);
            }
            this.updateSelectionList();
            this.updateHiddenInput();
            this.updateFieldDisplay();
            this.$field.trigger('change');
            
            // Re-render existing suggestions if dropdown is open (no API call needed)
            if (this.isOpen && this.suggestions) {
                this.renderSuggestions(this.suggestions);
            }
        },

        updateSelectionList: function() {
            const self = this;
            
            if (!this.isMultiple) {
                return;
            }
            
            this.$selectionListContainer.empty();
            
            // Use selectedOrder array to maintain order
            this.selectedOrder.forEach(function(value) {
                if (!self.selectedItems.hasOwnProperty(value)) {
                    return; // Skip if no longer selected
                }
                
                const text = self.selectedItems[value];
                const $item = $('<div class="' + AUTOCOMPLETE_SELECTION_ITEM_CLASS + '"></div>');
                $item.attr('data-value', value);

                // Drag handle - only for fields where dragging is enabled
                if (self.isDraggable) {
                    $item.attr('draggable', 'true');
                    $item.append($('<span class="alm-drag-handle" title="Drag to reorder">⋮⋮</span>'));
                }

                // Text
                const $text = $('<span class="alm-selection-text">' + text + '</span>');

                // Remove button
                const $remove = $('<button class="alm-remove-btn" title="Remove" type="button">×</button>');
                $remove.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.removeSelection(value);
                });

                $item.append($text, $remove);
                self.$selectionListContainer.append($item);
            });
        },

        updateHiddenInput: function() {
            if (!this.$hiddenInput) {
                return;
            }
            
            if (this.isMultiple) {
                // Multi-select: comma-separated values (commas inside a value are escaped)
                const values = this.selectedOrder.filter(function(value) {
                    return this.selectedItems.hasOwnProperty(value);
                }, this);
                this.$hiddenInput.val(joinListValues(values));
            } else {
                // Single-select: single value
                const values = Object.keys(this.selectedItems);
                this.$hiddenInput.val(values.length > 0 ? values[0] : '');
            }
            this.$hiddenInput.trigger('change');
        },

        updateFieldDisplay: function() {
            const count = Object.keys(this.selectedItems).length;
            
            if (this.isMultiple) {
                // Multi-select: show count summary when not open
                if (count > 0 && !this.isOpen) {
                    this.$field.val(count + ' item' + (count !== 1 ? 's' : '') + ' selected');
                    this.$field.attr('readonly', true);
                    this.$field.css('background-color', '#fafafa');
                } else if (!this.isOpen) {
                    // No selections and not open
                    this.$field.val('');
                    this.$field.removeAttr('readonly');
                    this.$field.css('background-color', '');
                }
            } else {
                // Single-select: show selected item name when not open
                if (count > 0 && !this.isOpen) {
                    const value = Object.keys(this.selectedItems)[0];
                    const text = this.selectedItems[value];
                    this.$field.val(text || '');
                    this.$field.attr('readonly', true);
                    this.$field.css('background-color', '#fafafa');
                } else if (!this.isOpen) {
                    // No selection and not open
                    this.$field.val('');
                    this.$field.removeAttr('readonly');
                    this.$field.css('background-color', '');
                }
            }
        },

        openSuggestions: function() {
            this.$list.addClass(AUTOCOMPLETE_VISIBLE_CLASS);
            this.$wrapper.addClass(AUTOCOMPLETE_OPEN_CLASS);
            this.isOpen = true;
        },

        closeSuggestions: function() {
            this.cancelPending();
            this.$list.removeClass(AUTOCOMPLETE_VISIBLE_CLASS);
            this.$wrapper.removeClass(AUTOCOMPLETE_OPEN_CLASS);
            this.currentFocus = -1;
            this.isOpen = false;
            
            // Clear the typed text and update display for both modes
            this.updateFieldDisplay();
        },


        /**
         * ========================================
         * PUBLIC API METHODS
         * ========================================
         */
        
        /**
         * Clear all selections and reset the autocomplete field
         * Public method that can be called externally
         * @public
         */
        clear: function() {
            // Clear internal state
            this.selectedItems = {};
            this.selectedOrder = [];
            
            // Clear visible field
            this.$field.val('');
            
            // Clear hidden input
            if (this.$hiddenInput) {
                this.$hiddenInput.val('');
            }
            
            // Update displays
            if (this.isMultiple) {
                this.updateSelectionList();
            }
            this.updateFieldDisplay();
            
            // Trigger change event
            this.$field.trigger('change');
        },

        /**
         * Destroy the autocomplete instance and clean up
         * @public
         */
        destroy: function() {
            this.cancelPending();
            // Remove DOM elements
            if (this.$list) {
                this.$list.remove();
            }
            if (this.$selectionListContainer) {
                this.$selectionListContainer.remove();
            }
            
            // Remove created visible field
            if (this.$field) {
                this.$field.remove();
            }
            
            // Restore original hidden field (show it)
            if (this.$hiddenInput) {
                this.$hiddenInput.show();
            }
            
            // Unwrap field from field container
            if (this.$fieldContainer && this.$fieldContainer.length > 0 && this.$hiddenInput) {
                this.$hiddenInput.unwrap('.alm-field-container');
            }
            
            // Remove class from wrapper
            if (this.$wrapper) {
                this.$wrapper.removeClass(AUTOCOMPLETE_WRAPPER_CLASS);
                this.$wrapper.removeClass(AUTOCOMPLETE_OPEN_CLASS);
            }
            
            // Unbind events from visible field
            if (this.$field) {
                this.$field.off('input focus blur keydown keypress');
            }
            
            // Clear data from original field (now $hiddenInput)
            if (this.$hiddenInput) {
                this.$hiddenInput.removeData('autocomplete-initialized');
                this.$hiddenInput.removeData('autocomplete-instance');
                this.$hiddenInput.removeData('autocomplete-clear');
            }
        }
    };

    function initializeAutocompleteFields($context) {
        $context = $context || $(document);
        
        $context.find('.' + AUTOCOMPLETE_FIELD_CLASS).each(function() {
            const $field = $(this);
            
            if ($field.data('autocomplete-initialized')) {
                return;
            }
            new AutocompleteField($field);
        });
    }

    function observeDynamicFields() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            const $node = $(node);
                            
                            if ($node.hasClass(AUTOCOMPLETE_FIELD_CLASS)) {
                                initializeAutocompleteFields($node.parent());
                            }
                            
                            if ($node.find('.' + AUTOCOMPLETE_FIELD_CLASS).length > 0) {
                                initializeAutocompleteFields($node);
                            }
                        }
                    });
                }
            });
        });

        const dialogContent = document.querySelector('.cq-dialog');
        if (dialogContent) {
            observer.observe(dialogContent, {
                childList: true,
                subtree: true
            });
        }
    }

    $(document).on('foundation-contentloaded', function(e) {
        initializeAutocompleteFields($(e.target));
        observeDynamicFields();
    });

    $(document).on('change', '.selector-widget', function() {
        setTimeout(function() {
            initializeAutocompleteFields();
        }, WIDGET_CHANGE_DELAY);
    });

    // Expose API
    window.ALM = window.ALM || {};
    window.ALM.ALMWidget = window.ALM.ALMWidget || {};
    window.ALM.ALMWidget.Autocomplete = {
        registerDataSource: registerDataSource,
        getDataSource: getDataSource,
        initialize: initializeAutocompleteFields,
        escapeListValue: escapeListValue,
        joinListValues: joinListValues,
        splitListValue: splitListValue
    };

})(document, window, jQuery);
