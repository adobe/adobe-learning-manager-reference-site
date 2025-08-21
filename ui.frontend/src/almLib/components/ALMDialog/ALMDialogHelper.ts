import { DeviceTypeContextType } from '../../contextProviders/DeviceContextProvider';
import styles from './ALMDialog.module.css';

const borderRadiusClasses: {
  [key: string]: string;
} = {
  top: styles.almDialogBorderRadiusTop,
  bottom: styles.almDialogBorderRadiusBottom,
  left: styles.almDialogBorderRadiusLeft,
  right: styles.almDialogBorderRadiusRight,
  all: styles.almDialogBorderRadiusAll,
};

const directionClasses: {
  [key: string]: string;
} = {
  top: styles.almDialogTop,
  bottom: styles.almDialogBottom,
  left: styles.almDialogLeft,
  right: styles.almDialogRight,
  center: styles.almDialogCenter,
};

export const getBorderRadiusClass = (borderRadius: string) => {
  return borderRadiusClasses[borderRadius] || '';
};

export const getDirectionClass = (
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

export const getAnimationClass = (
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center',
  deviceContext?: DeviceTypeContextType,
  isClosing?: boolean
) => {
  isClosing = isClosing;
  if (direction) {
    const animationClasses: {
      [key: string]: string;
    } = {
      top: isClosing ? styles.slideOutToTop : styles.slideInFromTop,
      bottom: isClosing ? styles.slideOutToBottom : styles.slideInFromBottom,
      left: isClosing ? styles.slideOutToLeft : styles.slideInFromLeft,
      right: isClosing ? styles.slideOutToRight : styles.slideInFromRight,
      center: isClosing ? styles.fadeOut : styles.fadeIn,
    };

    return animationClasses[direction] || '';
  } else {
    if (deviceContext?.isDesktop || deviceContext?.isTablet) {
      return isClosing ? styles.fadeOut : styles.fadeIn;
    } else {
      return isClosing ? styles.slideOutToBottom : styles.slideInFromBottom;
    }
  }
};
