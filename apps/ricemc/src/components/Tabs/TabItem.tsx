import type React from 'react';
import { type TabsValue, useTabsContext } from './tabsContext';

interface TabItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: TabsValue;
}

export const TabItem = ({
  value,
  className,
  disabled,
  onClick,
  children,
  ...rest
}: TabItemProps) => {
  const { activeValue, setActiveValue, baseId } = useTabsContext();
  const isActive = activeValue === value;
  const tabId = `tab-${baseId}-${String(value)}`;
  const panelId = `panel-${baseId}-${String(value)}`;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    setActiveValue(value);
  };

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      className={className}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
};
