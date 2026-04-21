"use client";
import { SlidePanelProvider, useSlidePanel } from '@/context/slidePanel.context';
import SlidePanel from './slidePanel';

function AppContent({ children }) {
  const { isOpen } = useSlidePanel();

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'mr-[450px]' : 'mr-0'
        }`}
      >
        {children}
      </div>
      <SlidePanel />
    </>
  );
}

export default function AppWrapper({ children }) {
  return (
    <SlidePanelProvider>
      <AppContent>{children}</AppContent>
    </SlidePanelProvider>
  );
}

