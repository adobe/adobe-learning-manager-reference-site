import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface DialogContextType {
  isOpen: (id: string) => boolean;
  openDialog: (id: string) => void;
  closeDialog: (id: string) => void;
  currentOpenDialogId: string;
}

// Create contexts for Dialog state
const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

// Dialog Root Component
export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [openDialogs, setOpenDialogs] = useState<{ [key: string]: boolean }>({});
  const [currentOpenDialogId, setCurrentOpenDialogId] = useState<string>('');

  const isOpen = (id: string) => !!openDialogs[id];

  const openDialog = (id: string) => {
    setOpenDialogs(prev => ({ ...prev, [id]: true }));
    setCurrentOpenDialogId(id);
  };

  const closeDialog = (id: string) => {
    setOpenDialogs(prev => ({ ...prev, [id]: false }));
    if (currentOpenDialogId === id) {
      setCurrentOpenDialogId('');
    }
  };

  return (
    <DialogContext.Provider value={{ isOpen, openDialog, closeDialog, currentOpenDialogId }}>
      {children}
    </DialogContext.Provider>
  );
};

// Hook to use Dialog context
export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
