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
import { useCallback } from 'react';
import { useFocusTrap, UseFocusTrapOptions } from './useFocusTrap';

interface UseSidebarFocusTrapOptions extends Omit<
  UseFocusTrapOptions,
  'onKeyDown' | 'onArrowNavigation'
> {
  preventArrowScroll?: boolean;
}

export const useSidebarFocusTrap = <T extends HTMLElement>(options: UseSidebarFocusTrapOptions) => {
  const { isOpen, preventArrowScroll = true, ...restOptions } = options;

  const getMenuItems = (container: Element) => {
    const allElements = container.querySelectorAll<HTMLElement>(
      'button[role="menuitem"], [role="menuitem"]'
    );

    return Array.from(allElements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, container: HTMLElement) => {
      const currentElement = document.activeElement as HTMLElement;
      const currentSubmenu = currentElement?.closest('[role="menu"]');
      const isInSubmenu =
        currentSubmenu && currentSubmenu !== container.querySelector('[role="menu"]');
      const menuContainer = isInSubmenu ? currentSubmenu : container;

      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && isOpen) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Handle submenu navigation
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault();
          const menuItems = getMenuItems(menuContainer);
          if (menuItems.length === 0) return;

          const currentIndex = menuItems.indexOf(currentElement);
          let newIndex;

          if (e.key === 'ArrowDown') {
            newIndex =
              currentIndex === -1 || currentIndex === menuItems.length - 1 ? 0 : currentIndex + 1;
          } else {
            newIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
          }

          menuItems[newIndex].focus();
          break;
        }

        case 'ArrowRight': {
          if (
            currentElement.getAttribute('aria-haspopup') === 'true' &&
            currentElement.getAttribute('aria-expanded') === 'false'
          ) {
            e.preventDefault();
            currentElement.click();
          }
          break;
        }

        case 'ArrowLeft': {
          if (isInSubmenu) {
            e.preventDefault();
            const parentButton = currentSubmenu.previousElementSibling as HTMLElement;
            if (parentButton) {
              parentButton.click();
              parentButton.focus();
            }
          }
          break;
        }

        case 'Tab': {
          if (isInSubmenu && !e.shiftKey) {
            const menuItems = getMenuItems(currentSubmenu);
            if (currentElement === menuItems[menuItems.length - 1]) {
              e.preventDefault();
              const parentButton = currentSubmenu.previousElementSibling as HTMLElement;
              if (parentButton) {
                setTimeout(() => {
                  parentButton.click();
                }, 0);
              }
            }
          }
          break;
        }

        case 'Escape': {
          if (isInSubmenu) {
            e.preventDefault();
            const parentButton = currentSubmenu.previousElementSibling as HTMLElement;
            if (parentButton) {
              parentButton.click();
              parentButton.focus();
              return;
            }
          }
          break;
        }
      }
    },
    [isOpen]
  );

  // Using the base useFocusTrap with sidebar-specific handlers
  return useFocusTrap<T>({
    ...restOptions,
    isOpen,
    onKeyDown: handleKeyDown,
    focusableSelectors:
      '[data-focus-first], a[class*="profileLink"], button[role="menuitem"], [role="menuitem"], button[class*="closeButton"]',
  });
};
