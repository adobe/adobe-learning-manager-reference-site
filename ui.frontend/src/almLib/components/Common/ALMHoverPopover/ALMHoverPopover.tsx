/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createPopper } from '@popperjs/core';
import { Heading, Text, Link } from '@adobe/react-spectrum';
import { PrimeUser } from '../../../models';
import styles from './ALMHoverPopover.module.css';

interface ALMHoverPopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: PrimeUser;
  openCard: () => void;
  closeCard: () => void;
  isHoveringTrigger: React.MutableRefObject<boolean>;
  isHoveringContent: React.MutableRefObject<boolean>;
  triggerElement: HTMLElement | null;
  setTriggerElement: (element: HTMLElement | null) => void;
}

const ALMHoverPopoverContext = createContext<ALMHoverPopoverContextType | null>(null);

const useALMHoverPopover = () => {
  const context = useContext(ALMHoverPopoverContext);
  if (!context) {
    throw new Error('ALMHoverPopover components must be used within ALMHoverPopover.Root');
  }
  return context;
};

interface ALMHoverPopoverRootProps {
  user: PrimeUser;
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
}

const Root: React.FC<ALMHoverPopoverRootProps> = ({ 
  user, 
  children, 
  openDelay = 300, 
  closeDelay = 200 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const isHoveringTrigger = useRef(false);
  const isHoveringContent = useRef(false);

  const clearTimeout = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const openCard = () => {
    clearTimeout();
    const newTimeoutId = window.setTimeout(() => {
      if (isHoveringTrigger.current) {
        setIsOpen(true);
      }
    }, openDelay);
    setTimeoutId(newTimeoutId);
  };

  const closeCard = () => {
    clearTimeout();
    const newTimeoutId = window.setTimeout(() => {
      if (!isHoveringTrigger.current && !isHoveringContent.current) {
        setIsOpen(false);
      }
    }, closeDelay);
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    return () => clearTimeout();
  }, []);

  const contextValue: ALMHoverPopoverContextType = {
    isOpen,
    setIsOpen,
    user,
    openCard,
    closeCard,
    isHoveringTrigger,
    isHoveringContent,
    triggerElement,
    setTriggerElement
  };

  return (
    <ALMHoverPopoverContext.Provider value={contextValue}>
      {children}
    </ALMHoverPopoverContext.Provider>
  );
};

interface TriggerProps {
  children: React.ReactNode;
  className?: string;
}

const Trigger: React.FC<TriggerProps> = ({ children, className }) => {
  const { openCard, closeCard, isHoveringTrigger, setTriggerElement } = useALMHoverPopover();
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    isHoveringTrigger.current = true;
    if (triggerRef.current) {
      setTriggerElement(triggerRef.current);
    }
    openCard();
  };

  const handleMouseLeave = () => {
    isHoveringTrigger.current = false;
    closeCard();
  };

  return (
    <span
      ref={triggerRef}
      className={`${styles.trigger} ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </span>
  );
};

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

const Content: React.FC<ContentProps> = ({ children, className }) => {
  const { isOpen, closeCard, isHoveringContent, triggerElement } = useALMHoverPopover();
  const popoverRef = useRef<HTMLDivElement>(null);
  const popperInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && triggerElement && popoverRef.current) {
      // Create Popper instance
      popperInstanceRef.current = createPopper(triggerElement, popoverRef.current, {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8], // 8px gap from trigger
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top-start', 'bottom-end', 'top-end', 'right-start', 'left-start'],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8, // 8px margin from viewport edges
            },
          },
        ],
      });
    }

    // Cleanup Popper instance
    return () => {
      if (popperInstanceRef.current) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = null;
      }
    };
  }, [isOpen, triggerElement]);

  const handleMouseEnter = () => {
    isHoveringContent.current = true;
  };

  const handleMouseLeave = () => {
    isHoveringContent.current = false;
    closeCard();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className={`${styles.content} ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>,
    document.body
  );
};

interface PortalProps {
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  return <>{children}</>;
};

// User Card Content Component
const UserCard: React.FC = () => {
  const { user } = useALMHoverPopover();

  return (
    <div className={styles.userCard}>
      <div className={styles.userCardHeader}>
        <div className={styles.userAvatar}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className={styles.userAvatar}/> : user.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <Heading level={4} UNSAFE_className={styles.userName}>
            {user.name || ''}
          </Heading>
          <Text UNSAFE_className={styles.userEmail}>
            {user.email || ''}
          </Text>
        </div>
      </div>
      <hr/>
      {user.bio && (
        <Text UNSAFE_className={styles.userBio}>
          {user.bio}
        </Text>
      )}
      <div className={styles.userCardFooter}>
        <Link href={`#user/${user.id}`} UNSAFE_className={styles.moreDetailsLink}>
          More details
        </Link>
        <span className={styles.moreDetailsIcon}>&#8250;</span>
      </div>
    </div>
  );
};

// Export the compound component
export const ALMHoverPopover = {
  Root,
  Trigger,
  Portal,
  Content,
  UserCard
}; 