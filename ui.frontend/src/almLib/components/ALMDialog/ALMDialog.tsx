import React, { useState, useEffect } from 'react';
import { useDialog } from '../../contextProviders/ALMDialogContextProvider';
import { Content, Flex, View } from '@adobe/react-spectrum';
import styles from './ALMDialog.module.css';
import { useDeviceTypeContext } from '../../contextProviders/DeviceContextProvider';
import { getBorderRadiusClass, getDirectionClass, getAnimationClass } from './ALMDialogHelper';

interface ALMDialogProps {
  id: string;
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  height?: number;
  stickyPosition?: boolean;
  overlayClose?: boolean;
  borderRadius?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  children: React.ReactNode;
  className?: string;
}

interface ALMDialogFooterProps {
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const ALMDialog: React.FC<ALMDialogProps> = ({
  id,
  direction,
  height,
  stickyPosition = false,
  overlayClose = true,
  borderRadius = 'all',
  children,
  className,
}) => {
  const deviceContext = useDeviceTypeContext();
  const { isOpen, closeDialog } = useDialog();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen(id)) {
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 300); // Match the animation duration
    }
  }, [isOpen(id)]);

  useEffect(() => {
    document.body.classList.add(styles.noScroll);
    return () => {
      document.body.classList.remove(styles.noScroll);
    };
  }, []);

  if (!isOpen(id) && !isClosing) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (overlayClose) {
      closeDialog(id);
      setTimeout(() => {
        document.body.classList.remove(styles.noScroll);
      }, 300);
    }
  };

  const borderRadiusClass = getBorderRadiusClass(borderRadius);
  const directionClass = getDirectionClass(direction, deviceContext);
  const animationClass = getAnimationClass(direction, deviceContext, isClosing);

  return (
    <div className={styles.almDialogOverlay} onClick={handleOverlayClick}>
      <div
        className={`${styles.almDialog} ${directionClass} ${borderRadiusClass} ${animationClass} ${className}`}
        style={{
          minHeight: `${height ? height : ''}vh`,
          maxHeight: `${height ? height : 50}vh`,
          position: stickyPosition ? 'sticky' : 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ALMDialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <View UNSAFE_className={`${styles.almDialogHeader} ${className}`}>
      <div className={styles.almDialogNotch}></div>
      {children}
    </View>
  );
};

export const ALMDialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Content UNSAFE_className={styles.almDialogContent}>{children}</Content>
);

export const ALMDialogFooter: React.FC<ALMDialogFooterProps> = ({ children, align, className }) => {
  const deviceContext = useDeviceTypeContext();
  return (
    <Flex
      direction="row"
      justifyContent={align || (deviceContext.isMobile ? 'space-around' : 'right')}
      UNSAFE_className={`${styles.almDialogFooter} ${className}`}
    >
      {children}
    </Flex>
  );
};
