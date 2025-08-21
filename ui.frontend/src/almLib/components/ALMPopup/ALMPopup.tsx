import React, { useEffect, useRef } from 'react';
import styles from './ALMPopup.module.css';
import {
  DeviceTypeContextType,
  useDeviceTypeContext,
} from '../../contextProviders/DeviceContextProvider';
import { Flex } from '@adobe/react-spectrum';

interface ALMPopupProps {
  id: string;
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  position?: 'left' | 'right' | 'center';
  borderRadius?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  triggerRef?: React.RefObject<HTMLDivElement>;
  closeOnClickOutside?: boolean;
}

export const ALMPopup: React.FC<ALMPopupProps> = ({
  id,
  direction,
  position,
  borderRadius = 'all',
  children,
  isOpen = false,
  onClose,
  triggerRef,
  closeOnClickOutside = true,
}) => {
  const deviceContext = useDeviceTypeContext();
  const popupRef = useRef<HTMLDivElement>(null);

  const directionClasses: {
    [key: string]: string;
  } = {
    top: styles.almPopupTop,
    bottom: styles.almPopupBottom,
    left: styles.almPopupLeft,
    right: styles.almPopupRight,
    center: styles.almPopupCenter,
  };

  const borderRadiusClasses: {
    [key: string]: string;
  } = {
    top: styles.almPopupBorderRadiusTop,
    bottom: styles.almPopupBorderRadiusBottom,
    left: styles.almPopupBorderRadiusLeft,
    right: styles.almPopupBorderRadiusRight,
    all: styles.almPopupBorderRadiusAll,
  };

  const getDirectionClass = (
    direction?: 'top' | 'bottom' | 'left' | 'right' | 'center',
    deviceContext?: DeviceTypeContextType
  ) => {
    if (direction) {
      return directionClasses[direction] || '';
    } else {
      if (deviceContext?.isDesktop || deviceContext?.isTablet) {
        return styles.almDialogCenter;
      } else {
        return styles.almDialogBottom;
      }
    }
  };

  const getBorderRadiusClass = (borderRadius: string) => {
    return borderRadiusClasses[borderRadius] || '';
  };

  const borderRadiusClass = getBorderRadiusClass(borderRadius);
  const directionClass = getDirectionClass(direction, deviceContext);

  const CENTER_POSITION = '25%';
  const POPUP_OFFSET = 24;

  const getPositionStyles = (
    position: string | undefined,
    direction: string | undefined,
    triggerRect: DOMRect,
    popupHeight: number
  ) => {
    const baseStyles = {
      right: position === 'right' ? '0px' : 'auto',
      left: position === 'left' ? '0px' : position === 'center' ? CENTER_POSITION : 'auto',
    };

    if (direction === 'top') {
      return {
        ...baseStyles,
        top: `${triggerRect.top - popupHeight - POPUP_OFFSET}px`,
        bottom: 'auto',
      };
    }

    return {
      ...baseStyles,
      bottom: `${triggerRect.bottom + popupHeight + POPUP_OFFSET}px`,
      top: 'auto',
    };
  };

  useEffect(() => {
    // Position the popup relative to the trigger element when it opens
    if (isOpen && triggerRef?.current) {
      const popup = document.getElementById(id);
      const trigger = triggerRef.current;
      const triggerRect =
        trigger.closest('.alm-popup-almPopupContent')?.getBoundingClientRect() ||
        trigger.getBoundingClientRect();

      if (!popup) return;

      const styles = getPositionStyles(position, direction, triggerRect, popup.offsetHeight);
      Object.assign(popup.style, styles);
    }
  }, [isOpen, id, direction, triggerRef]);

  // Click outside handler - only active if closeOnClickOutside is true
  useEffect(() => {
    if (!closeOnClickOutside) return; // Skip if feature is disabled

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef?.current !== event.target &&
        !triggerRef?.current?.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    // Only add the event listener if the popup is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef, closeOnClickOutside]);

  // If not open, don't render
  if (!isOpen) return null;

  return (
    <div
      id={id}
      ref={popupRef}
      className={`${styles.almPopup} ${directionClass} ${borderRadiusClass}`}
    >
      <Flex direction={'column'} gap={'size-100'}>
        {children}
      </Flex>
    </div>
  );
};

export const ALMPopupContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Flex UNSAFE_className={styles.almPopupContent} direction={'column'} gap={'size-100'}>
    {children}
  </Flex>
);
