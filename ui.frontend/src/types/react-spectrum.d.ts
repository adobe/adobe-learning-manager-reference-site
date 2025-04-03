declare module '@react-spectrum/tabs' {
    import { ReactNode } from 'react';
  
    interface SpectrumTabsProps {
      children?: ReactNode;
      [key: string]: any;
    }
  
    export const Tabs: React.FC<SpectrumTabsProps>;
    export const TabList: React.FC<SpectrumTabsProps>;
    export const TabPanels: React.FC<SpectrumTabsProps>;
    export const Item: React.FC<SpectrumTabsProps>;
  }
  
  declare module '@react-spectrum/dialog' {
    import { ReactNode } from 'react';
  
    interface SpectrumDialogProps {
      children?: ReactNode;
      [key: string]: any;
    }
  
    export const Dialog: React.FC<SpectrumDialogProps>;
    export const DialogContainer: React.FC<SpectrumDialogProps>;
  }