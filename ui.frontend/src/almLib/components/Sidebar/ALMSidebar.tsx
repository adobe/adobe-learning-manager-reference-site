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
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './ALMSidebar.module.css';
import { getALMObject } from '../../utils/global';
import { CATALOG_PAGE_PATH } from '../../utils/constants';
import { CHEVRON_RIGHT_ICON } from '../../utils/inline_svg';
import { getIconByName } from '../../utils/template_icons_svg';
import { GetTranslation } from '../../utils/translationService';

export interface ALMSidebarMenuItem {
  id: string;
  label: string;
  route?: string;
  pageId?: string;
  customPagePath?: string;
  iconName?: string;
  isSubmenu?: boolean;
  subItems?: ALMSidebarMenuItem[];
  automationId?: string;
}

export interface ALMSidebarProps {
  menuItems: ALMSidebarMenuItem[];
  showIcons?: boolean;
  className?: string;
}

const ALMSidebar = ({ menuItems, showIcons = true, className = '' }: ALMSidebarProps) => {
  const location = useLocation();

  // Hover state for submenu flyout
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [submenuTop, setSubmenuTop] = useState<number>(0);

  const navigateToItem = useCallback((item: ALMSidebarMenuItem): boolean => {
    const almObject = getALMObject();
    if (!almObject) return false;

    // Custom pages
    if (item.pageId && almObject.navigateToCustomPage) {
      almObject.navigateToCustomPage(item.pageId);
      return true;
    }

    // Default pages - catalog
    if (item.route == CATALOG_PAGE_PATH) {
      almObject.navigateToCatalogPage();
      return true;
    }

    return false;
  }, []);

  const isItemActive = useCallback(
    (item: ALMSidebarMenuItem): boolean => {
      if (item.route === location.pathname) return true;

      if (item.subItems) {
        return item.subItems.some(subItem => subItem.route === location.pathname);
      }

      return false;
    },
    [location.pathname]
  );

  const handleItemClick = (item: ALMSidebarMenuItem, e?: React.MouseEvent) => {
    if (item.isSubmenu) {
      e?.preventDefault();
      return;
    }
    navigateToItem(item);
  };

  const handleSubmenuMouseEnter = (e: React.MouseEvent, itemId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSubmenuTop(rect.top + rect.height / 3);
    setHoveredSubmenu(itemId);
    const submenuEl = document.getElementById(`submenu-${itemId}`);
    if (submenuEl) submenuEl.scrollTop = 0;
  };

  const handleSubmenuMouseLeave = () => {
    setHoveredSubmenu(null);
  };

  const renderIcon = (iconName: string | undefined, isSelected: boolean) => {
    if (!showIcons || !iconName) return null;
    const svgString = getIconByName(iconName, isSelected);
    if (!svgString) return null;
    return <span dangerouslySetInnerHTML={{ __html: svgString }} />;
  };

  const renderMenuItem = (item: ALMSidebarMenuItem) => {
    const isActive = isItemActive(item);
    const isSubmenu = item.isSubmenu;
    const isHovered = hoveredSubmenu === item.id;

    const linkClassName = `${styles.menuLink} ${isActive ? styles.menuLinkSelected : ''} ${isSubmenu && isHovered ? styles.submenuExpanded : ''}`;

    return (
      <button
        className={linkClassName}
        onClick={e => handleItemClick(item, e)}
        title={item.label}
        data-automation-id={item.automationId}
        {...(isSubmenu
          ? {
              'aria-expanded': isHovered,
              'aria-haspopup': 'true' as const,
              'aria-controls': `submenu-${item.id}`,
            }
          : {
              'aria-current': isActive ? ('page' as const) : undefined,
            })}
      >
        {showIcons && item.iconName && (
          <span className={`${styles.menuIcon}`}>{renderIcon(item.iconName, isActive)}</span>
        )}
        <span className={styles.menuText}>{item.label}</span>
        {isSubmenu && item.subItems && item.subItems.length > 0 && (
          <span className={styles.submenuChevron}>
            <CHEVRON_RIGHT_ICON />
          </span>
        )}
      </button>
    );
  };

  const renderSubmenu = (item: ALMSidebarMenuItem) => {
    if (!item.isSubmenu || !item.subItems || item.subItems.length === 0) {
      return null;
    }

    const isVisible = hoveredSubmenu === item.id;

    return (
      <ul
        id={`submenu-${item.id}`}
        className={`${styles.submenu} ${isVisible ? styles.submenuVisible : ''}`}
        style={{ top: submenuTop, maxHeight: `calc(100vh - ${submenuTop + 16}px)` }}
        role="menu"
        aria-labelledby={`submenu-heading-${item.id}`}
        onMouseEnter={() => setHoveredSubmenu(item.id)}
        onMouseLeave={handleSubmenuMouseLeave}
      >
        {item.subItems.map(subItem => {
          const isSubActive = subItem.route === location.pathname;

          return (
            <li key={subItem.id} className={styles.submenuItem} role="none">
              <button
                className={`${styles.submenuLink} ${isSubActive ? styles.submenuLinkSelected : ''}`}
                onClick={() => {
                  navigateToItem(subItem);
                  setHoveredSubmenu(null);
                }}
                title={subItem.label}
                data-automation-id={subItem.automationId}
                role="menuitem"
                aria-current={isSubActive ? 'page' : undefined}
              >
                {showIcons && subItem.iconName && (
                  <span className={styles.submenuIcon}>
                    {renderIcon(subItem.iconName, isSubActive ?? false)}
                  </span>
                )}
                <span className={styles.submenuText}>{subItem.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const sidebarClassName = `${styles.sidebarContainer} ${styles.sidebarOpen} ${className}`;

  return (
    <>
      <aside
        id="navigation-sidebar"
        className={sidebarClassName}
        role="navigation"
        aria-label={GetTranslation('alm.sidebar.navigation', true)}
      >
        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarMenu} role="menubar">
            {menuItems.map(item => (
              <li
                key={item.id}
                className={styles.menuItem}
                role="none"
                onMouseEnter={e => item.isSubmenu && handleSubmenuMouseEnter(e, item.id)}
                onMouseLeave={() => item.isSubmenu && handleSubmenuMouseLeave()}
              >
                {renderMenuItem(item)}
                {renderSubmenu(item)}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default ALMSidebar;
