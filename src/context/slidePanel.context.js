"use client";
import { createContext, useContext, useState } from 'react';

const SlidePanelContext = createContext();

export function SlidePanelProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const openPanel = () => {
    setIsOpen(true);
  };

  return (
    <SlidePanelContext.Provider value={{ isOpen, togglePanel, closePanel, openPanel }}>
      {children}
    </SlidePanelContext.Provider>
  );
}

export function useSlidePanel() {
  const context = useContext(SlidePanelContext);
  if (!context) {
    throw new Error('useSlidePanel must be used within a SlidePanelProvider');
  }
  return context;
}

