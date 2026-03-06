import type React from 'react';
import { useCallback, useId, useMemo, useState } from 'react';
import { TabsContext, type TabsValue, useTabsContext } from './tabsContext';

interface TabsProps {
  value?: TabsValue;
  defaultValue?: TabsValue;
  onChange?: (_value: TabsValue) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Tabs = ({
  value,
  defaultValue,
  onChange,
  className,
  children,
}: TabsProps) => {
  const baseId = useId();
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<TabsValue | null>(
    defaultValue ?? null,
  );
  const activeValue = isControlled ? value ?? null : uncontrolledValue;

  const setActiveValue = useCallback(
    (nextValue: TabsValue) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  const ctx = useMemo(
    () => ({
      activeValue,
      setActiveValue,
      baseId,
    }),
    [activeValue, setActiveValue, baseId],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

export const TabList = ({
  ariaLabel,
  className,
  ...rest
}: TabListProps) => {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={className}
      {...rest}
    />
  );
};

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabsValue;
  keepMounted?: boolean;
}

export const TabPanel = ({
  value,
  keepMounted = false,
  className,
  children,
  ...rest
}: TabPanelProps) => {
  const { activeValue, baseId } = useTabsContext();
  const isActive = activeValue === value;
  const panelId = `panel-${baseId}-${String(value)}`;
  const tabId = `tab-${baseId}-${String(value)}`;

  if (!keepMounted && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
};
