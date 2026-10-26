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
 * Courses & Paths Widget Module
 * 
 * Encapsulates all logic related to the Courses & Paths widget behavior.
 * This includes:
 * - Conditional field visibility based on isSourceSelected radio button
 * - Dynamic label updates based on source selection (CATALOGS/ROLES/PRODUCTS/SKILLS)
 * - Event handling for source dropdown and radio button changes
 */
(function (window, $) {
    "use strict";
    
    const CP_DIALOG_REL = ".cp-dialog-form-rel";
    const WIDGET_REF = 'com.adobe.captivateprime.courses.and.paths';

    /**
     * Get source-specific labels using Nomenclature (auto-loaded with defaults)
     * @private
     */
    function getSourceLabels(source) {
        const N = window.ALM.ALMWidget.Nomenclature;
        const term = source === 'ROLES' ? N.ROLE : source === 'PRODUCTS' ? N.PRODUCT : source === 'SKILLS' ? N.SKILL : N.CATALOG;
        
        return {
            fieldLabel: 'Source details',
            placeholder: 'Select ' + term.plural
        };
    }

    /**
     * Update autocomplete labels based on source
     * @private
     */
    function updateLabels(source) {
        const labels = getSourceLabels(source);
        
        const $autocompleteWrapper = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails"]').closest('.coral-Form-fieldwrapper');
        const $fieldLabel = $autocompleteWrapper.find('.coral-Form-fieldlabel');
        if ($fieldLabel.length > 0) {
            $fieldLabel.text(labels.fieldLabel);
        }
        
        // Update autocomplete placeholder for both hidden and display fields
        const $autocompleteInput = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails"]');
        if ($autocompleteInput.length > 0) {
            $autocompleteInput.attr('placeholder', labels.placeholder);
        }
        
        // Also update display field if it exists (for single-select autocomplete)
        const $displayInput = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails_display"]');
        if ($displayInput.length > 0) {
            $displayInput.attr('placeholder', labels.placeholder);
        }
    }

    /**
     * Initialize radio button defaults and field visibility
     * If sourceDetails or loIds has value, select appropriate radio
     * @public
     */
    function initializeDefaults() {
        const selectedWidget = $('.selector-widget coral-select-item:selected').val();
        
        // Only apply defaults for Courses & Paths widget
        if (selectedWidget !== WIDGET_REF) {
            return;
        }

        const $isSourceSelected = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.isSourceSelected"]');
        const hasChecked = $isSourceSelected.filter(':checked').length > 0;
        
        if (!hasChecked) {
            const sourceDetails = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails"]').val();
            const loIds = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loIds"]').val();
            
            const hasSourceDetails = sourceDetails && sourceDetails.trim().length > 0;
            const hasLoIds = loIds && loIds.trim().length > 0;
            
            // Select "true" (select source) if sourceDetails has value, otherwise "false" (manual) if loIds has value
            let defaultValue = 'true';
            if (hasLoIds && !hasSourceDetails) {
                defaultValue = 'false';
            }
            
            $(CP_DIALOG_REL).find(`[name="./widgetConfig.attributes.isSourceSelected"][value="${defaultValue}"]`).prop('checked', true);
        }
    }

    /**
     * Handle Courses & Paths widget UI updates
     * Shows/hides fields based on isSourceSelected value
     * @public
     */
    function handleUI() {
        const selectedWidget = $('.selector-widget coral-select-item:selected').val();
        
        // Only handle UI for Courses & Paths widget
        if (selectedWidget !== WIDGET_REF) {
            return;
        }
        
        const $sourceDropdown = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.coursesAndPaths.source"]');
        const source = $sourceDropdown.val();
        
        // Update labels based on source
        updateLabels(source);
        
        const $sourceWrapper = $sourceDropdown.closest('.coral-Form-fieldwrapper');
        const $sourceDetailsWrapper = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails"]').closest('.coral-Form-fieldwrapper');
        const $loIdsWrapper = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loIds"]').closest('.coral-Form-fieldwrapper');
        const $loTypesWrapper = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loTypes"]').closest('.coral-Form-fieldwrapper');

        // Check radio selection
        const isSourceSelected = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.isSourceSelected"]:checked').val();

        if (isSourceSelected === 'true') {
            // Show source, sourceDetails and loTypes; hide loIds
            $sourceWrapper.removeAttr('hidden');
            $sourceDetailsWrapper.removeAttr('hidden');
            $loTypesWrapper.removeAttr('hidden');
            $loIdsWrapper.attr('hidden', '');
        } else {
            // Hide source, sourceDetails and loTypes; show loIds
            $sourceWrapper.attr('hidden', '');
            $sourceDetailsWrapper.attr('hidden', '');
            $loTypesWrapper.attr('hidden', '');
            $loIdsWrapper.removeAttr('hidden');
        }
        validateFields();
    }

    /**
     * Handle source dropdown change
     * Clears sourceDetails and refreshes autocomplete with new datasource
     * @public
     */
    function handleSourceChange() {
        const selectedWidget = $('.selector-widget coral-select-item:selected').val();
        
        if (selectedWidget === WIDGET_REF) {
            // Clear sourceDetails field (using autocomplete's clear method if available)
            clearSourceDetails();
            
            // Update UI with new source labels
            // The datasource will automatically use the new source value on next search
            handleUI();
        }
    }

    /**
     * Clear sourceDetails field
     * @private
     */
    function clearSourceDetails() {
        // Get the clear function from the original/hidden field (where autocomplete stores it)
        const $originalField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails"]');
        const clearFn = $originalField.data('autocomplete-clear');
        
        if (clearFn && typeof clearFn === 'function') {
            // Use autocomplete's clear method
            clearFn();
        } else {
            // Fallback: manually clear both fields
            $originalField.val('');
            $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails_display"]').val('');
        }
    }

    /**
     * Clear loIds field
     * @private
     */
    function clearLoIds() {
        // Get the clear function from the original/hidden field (where autocomplete stores it)
        const $originalField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loIds"]');
        const clearFn = $originalField.data('autocomplete-clear');
        
        if (clearFn && typeof clearFn === 'function') {
            // Use autocomplete's clear method
            clearFn();
        } else {
            // Fallback: manually clear both fields
            $originalField.val('');
            $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loIds_display"]').val('');
        }
    }

    /**
     * Clear loTypes field
     * @private
     */
    function clearLoTypes() {
        // loTypes is an autocomplete field (datasource "loType"), so prefer its clear method
        const $originalField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loTypes"]');
        const clearFn = $originalField.data('autocomplete-clear');

        if (clearFn && typeof clearFn === 'function') {
            clearFn();
        } else {
            // Fallback for a Coral.Select rendering
            const el = $originalField[0];
            if (el) {
                $(el).find('coral-select-item[selected]').removeAttr('selected');
                $(el).find('coral-select-item').each(function() {
                    this.selected = false;
                    this.removeAttribute('aria-selected');
                });
            }
            $originalField.val('');
            $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loTypes_display"]').val('');
        }
        $originalField.trigger('change');
    }

    /**
     * Clear source field
     * @private
     */
    function clearSource() {
        const $sourceField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.coursesAndPaths.source"]');
        const el = $sourceField[0];

        if (el && typeof el.clear === 'function') {
            el.clear();
        }
        if (el) {
            $(el).find('coral-select-item[selected]').removeAttr('selected');
            $(el).find('coral-select-item').each(function() {
                this.selected = false;
                this.removeAttribute('aria-selected');
            });
            el.value = 'CATALOGS';
        }
        $sourceField.val('CATALOGS');
    }

    /**
     * Reset Courses & Paths fields when switching away
     * @public
     */
    function resetFields() {
        // Clear both autocomplete fields
        clearSourceDetails();
        clearLoIds();
        clearLoTypes();

        $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.isSourceSelected"][value="true"]').prop('checked', true);
        $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.isSourceSelected"][value="false"]').prop('checked', false);
        
        // Reset source dropdown to default
        $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.coursesAndPaths.source"]').val('CATALOGS');
    }

    /**
     * Validate mandatory fields before dialog submission
     * @returns {boolean} True if validation passes, false otherwise
     * @public
     */
    function validateFields() {
        const selectedWidget = $('.selector-widget coral-select-item:selected').val();
        
        // Only validate for Courses & Paths widget
        if (selectedWidget !== WIDGET_REF) {
            return true;
        }
        
        const isSourceSelected = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.isSourceSelected"]:checked').val();
        const $sourceDetailsDisplayField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails_display"]');
        const $loIdsDisplayField = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loIds_display"]');
        if (isSourceSelected === 'true') {
            const sourceDetails = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.sourceDetails"]').val();
            
            if (!sourceDetails || sourceDetails.trim().length === 0) {
                showValidationError($sourceDetailsDisplayField);
                clearValidationError($loIdsDisplayField);
                return false;
            }
        } else {
            const loIds = $(CP_DIALOG_REL).find('[name="./widgetConfig.attributes.loIds"]').val();
            if (!loIds || loIds.trim().length === 0) {
                showValidationError($loIdsDisplayField);
                clearValidationError($sourceDetailsDisplayField);
                return false;
            }
        }
        clearValidationError($sourceDetailsDisplayField);
        clearValidationError($loIdsDisplayField);
        return true;
    }
    
    /**
     * Show validation error message
     * @private
     */
    function showValidationError($fieldWrapper) {
        $fieldWrapper.addClass('is-invalid');
        $fieldWrapper.attr('aria-required', 'true');
        $fieldWrapper.attr('required', 'true');
        $fieldWrapper.find('.alm-validation-error').remove();
        const $error = $('<span class="alm-validation-error coral-Form-fielderror coral-Icon coral-Icon--sizeS coral-Icon--alert" role="img" aria-label="error"></span>');
        $fieldWrapper.append($error);
    }
    
    /**
     * Clear validation error message
     * @private
     */
    function clearValidationError($fieldWrapper) {
        $fieldWrapper.find('.alm-validation-error').remove();
        $fieldWrapper.removeClass('is-invalid');
        $fieldWrapper.removeAttr('aria-required');
        $fieldWrapper.removeAttr('required');
    }

    /**
     * Setup event listeners for Courses & Paths widget
     * Uses namespaced events for clean removal
     * @public
     */
    function setupEventListeners() {
        $(document).on('change.almCoursesAndPathsWidget', CP_DIALOG_REL + ' [name="./widgetConfig.attributes.coursesAndPaths.source"]', function() {
            const selectedWidget = $('.selector-widget coral-select-item:selected').val();
            if (selectedWidget === WIDGET_REF) {
                handleSourceChange();
            }
        });
        
        $(document).on('change.almCoursesAndPathsWidget', CP_DIALOG_REL + ' [name="./widgetConfig.attributes.isSourceSelected"]', function() {
            const selectedWidget = $('.selector-widget coral-select-item:selected').val();
            if (selectedWidget === WIDGET_REF) {
                // const isSourceSelected = $(this).val();
                // Clear all dependent fields when the selection mode changes
                clearSourceDetails();
                clearLoIds();
                clearLoTypes();
                clearSource();
                handleUI();
            }
        });
        
        // Clear validation errors when user fills in the required field
        $(document).on('change.almCoursesAndPathsWidget', CP_DIALOG_REL + ' [name="./widgetConfig.attributes.sourceDetails"]', function() {
            const selectedWidget = $('.selector-widget coral-select-item:selected').val();
            if (selectedWidget === WIDGET_REF) {
                validateFields();
            }
        });
        
        $(document).on('change.almCoursesAndPathsWidget', CP_DIALOG_REL + ' [name="./widgetConfig.attributes.loIds"]', function() {
            const selectedWidget = $('.selector-widget coral-select-item:selected').val();
            if (selectedWidget === WIDGET_REF) {
                validateFields();
            }
        });
        
        // Intercept dialog submit and validate
        $(document).on('click.almCoursesAndPathsWidget', '.cq-dialog-submit', function(e) {
            if (!validateFields()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        });
    }
    
    /**
     * Remove event listeners for Courses & Paths widget
     * @public
     */
    function removeEventListeners() {
        $(document).off('.almCoursesAndPathsWidget');
    }

    // Expose public API to window.ALM.ALMWidget namespace
    window.ALM = window.ALM || {};
    window.ALM.ALMWidget = window.ALM.ALMWidget || {};
    window.ALM.ALMWidget.CoursesAndPathsWidget = {
        initializeDefaults: initializeDefaults,
        handleUI: handleUI,
        setupEventListeners: setupEventListeners,
        removeEventListeners: removeEventListeners,
        resetFields: resetFields
    };

})(window, jQuery);

