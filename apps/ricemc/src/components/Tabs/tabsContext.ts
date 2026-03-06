import { createContext, useContext } from 'react';

export type TabsValue = string | number;

interface TabsContextValue {
  activeValue: TabsValue | null;
  setActiveValue: (_value: TabsValue) => void;
  baseId: string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tab components must be used within <Tabs>.');
  }
  return ctx;
};
