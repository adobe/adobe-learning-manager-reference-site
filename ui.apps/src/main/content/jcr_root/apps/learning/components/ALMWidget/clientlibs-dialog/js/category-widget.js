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
 * Category Widget Module
 * 
 * Encapsulates all logic related to the Category widget behavior.
 * This includes:
 * - Dynamic label updates based on source selection (CATALOGS/ROLES/PRODUCTS)
 * - Radio button default initialization
 * - Conditional autocomplete visibility
 * - Event handling for source dropdown and radio button changes
 */
(function (window, $) {
    "use strict";
    
    const CP_DIALOG_REL = ".cp-dialog-form-rel";
    const WIDGET_REF = 'com.adobe.captivateprime.category';

    /**
     * Get source-specific labels using Nomenclature (auto-loaded with defaults)
     * @private
     */
    function getSourceLabels(source) {
        const N = window.ALM.ALMWidget.Nomenclature;
        const term = source === 'ROLES' ? N.ROLE : source === 'PRODUCTS' ? N.PRODUCT : N.CATALOG;
        
        return {
            all: 'All ' + term.plural,
            select: 'Select ' + term.plural,
            fieldLabel: 'Selected ' + term.plural,
            placeholder: 'Select ' + term.plural + ' (up to 25)'
        };
    }

    /**
     * Update radio button and autocomplete labels based on source
     * @private
     */
    function updateLabels(source) {
        const labels = getSourceLabels(source);
        
        // Update radio button labels - labels are inside the coral-radio elements
        const $allRadio = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"][value="all"]');
        const $selectRadio = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"][value="select"]');
        
        if ($allRadio.length > 0) {
            $allRadio.find('label').text(labels.all);
        }
        if ($selectRadio.length > 0) {
            $selectRadio.find('label').text(labels.select);
        }
        
        // Update autocomplete field label
        const $autocompleteWrapper = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceIds"]').closest('.coral-Form-fieldwrapper');
        const $fieldLabel = $autocompleteWrapper.find('.coral-Form-fieldlabel');
        if ($fieldLabel.length > 0) {
            $fieldLabel.text(labels.fieldLabel);
        }
        
        // Update autocomplete placeholder with dynamic limit
        const $autocompleteInput = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceIds"]');
        if ($autocompleteInput.length > 0) {
            // Get the max selections from data attribute or use default
            const maxSelections = $autocompleteInput.data('autocomplete-max-selections') || 25;
            const dynamicPlaceholder = labels.placeholder.replace(/\d+/, maxSelections);
            $autocompleteInput.attr('placeholder', dynamicPlaceholder);
        }
    }

    /**
     * Initialize radio button defaults based on sourceIds value
     * If sourceIds has value, select "select", otherwise "all"
     * @public
     */
    function initializeDefaults() {
        const selectedWidget = $('.selector-widget coral-select-item:selected').val();
        
        // Only apply defaults for Category widget
        if (selectedWidget !== WIDGET_REF) {
            return;
        }

        // Set default radio if not already selected
        const $selectionMode = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"]');
        if ($selectionMode.filter(':checked').length === 0) {
            const sourceIds = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceIds"]').val();
            const hasSourceIds = sourceIds && sourceIds.trim().length > 0;
            const defaultValue = hasSourceIds ? 'select' : 'all';
            $(CP_DIALOG_REL).find(`[name="./widgetConfig.attributes.selectionMode"][value="${defaultValue}"]`).prop('checked', true);
        }
    }

    /**
     * Handle category widget UI updates
     * Updates labels and manages autocomplete visibility
     * @public
     */
    function handleUI() {
        const $sourceDropdown = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.source"]');
        const source = $sourceDropdown.val();
        
        // Update labels based on source
        updateLabels(source);
        
        // Get autocomplete wrapper
        const $autocompleteWrapper = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceIds"]').closest('.coral-Form-fieldwrapper');
        
        // Check selection mode and show/hide autocomplete
        // Note: Radio buttons visibility is already managed by handleSelection() based on itemtype
        const selectionMode = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"]:checked').val();
        if (selectionMode === 'select') {
            $autocompleteWrapper.removeAttr('hidden');
        } else {
            $autocompleteWrapper.attr('hidden', '');
        }
    }

    /**
     * Handle category source dropdown change
     * Clears sourceIds and resets radio to "all"
     * @public
     */
    function handleSourceChange() {
        // Reset fields (clear sourceIds and reset radio to "all")
        resetFields();
        
        // Update UI with new source labels
        handleUI();
    }

    /**
     * Clear the selected sourceIds (autocomplete) values without touching the radio.
     * @private
     */
    function clearSourceIds() {
        // Get the clear function from the original/hidden field (where autocomplete stores it)
        const $originalField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceIds"]');
        const clearFn = $originalField.data('autocomplete-clear');

        if (clearFn && typeof clearFn === 'function') {
            // Clear autocomplete properly (clears selectedItems, tags, hidden input, display field)
            clearFn();
        } else {
            // Fallback: manually clear both fields
            $originalField.val('');
            $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceIds_display"]').val('');
        }
    }

    /**
     * Reset category fields when switching away from Category widget
     * Clears sourceIds and resets radio to "all"
     * @public
     */
    function resetFields() {
        // Clear any selected sourceIds
        clearSourceIds();

        // Reset radio to "all"
        $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"][value="all"]').prop('checked', true);
        $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"][value="select"]').prop('checked', false);
    }

    /**
     * Setup event listeners for Category widget
     * Uses namespaced events for clean removal
     * @public
     */
    function setupEventListeners() {
        // Listen for Category source dropdown changes
        $(document).on('change.almCategoryWidget', CP_DIALOG_REL + ' [name="./widgetConfig.attributes.source"]', function() {
            const selectedWidget = $('.selector-widget coral-select-item:selected').val();
            if (selectedWidget === 'com.adobe.captivateprime.category') {
                handleSourceChange();
            }
        });
        
        // Listen for radio button changes
        $(document).on('change.almCategoryWidget', CP_DIALOG_REL + ' [name="./widgetConfig.attributes.selectionMode"]', function() {
            const selectedWidget = $('.selector-widget coral-select-item:selected').val();
            if (selectedWidget === 'com.adobe.captivateprime.category') {
                // When switching to "all", clear any previously selected sourceIds so
                // they aren't persisted on save while the autocomplete is hidden.
                const selectionMode = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.selectionMode"]:checked').val();
                if (selectionMode === 'all') {
                    clearSourceIds();
                }
                handleUI();
            }
        });
    }
    
    /**
     * Remove event listeners for Category widget
     * @public
     */
    function removeEventListeners() {
        $(document).off('.almCategoryWidget');
    }

    // Expose public API to window.ALM.ALMWidget namespace
    window.ALM = window.ALM || {};
    window.ALM.ALMWidget = window.ALM.ALMWidget || {};
    window.ALM.ALMWidget.CategoryWidget = {
        initializeDefaults: initializeDefaults,
        handleUI: handleUI,
        setupEventListeners: setupEventListeners,
        removeEventListeners: removeEventListeners,
        resetFields: resetFields
    };

})(window, jQuery);

