import cn from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';

const PopoverContext = React.createContext<{
  focusedItemId?: string | null;
  setFocusedItemId?: (id: string | null) => void;
  refsById: React.RefObject<Map<string, React.RefObject<HTMLLIElement>>>;
} | null>(null);

const usePopoverContext = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error('Popover compound components must be used inside <Popover>');
  return ctx;
};

type PopoverProps = BaseComponentProps<'ul'>;

export const Popover = ({ children, ...rest }: PopoverProps) => {
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const refsById = useRef<Map<string, React.RefObject<HTMLLIElement>>>(new Map());

  return (
    <PopoverContext.Provider value={{ focusedItemId, setFocusedItemId, refsById }}>
      <ul className={cn('Popover-Root', rest.className)}>{children}</ul>
    </PopoverContext.Provider>
  );
};

interface PopoverItemProps extends BaseComponentProps<'li'> {
  label?: string;
}

Popover.Item = function PopoverItem({ label, className, ...rest }: PopoverItemProps) {
  const { focusedItemId, setFocusedItemId, refsById } = usePopoverContext();

  const itemRef = useRef<HTMLLIElement>(null);
  const itemId = label || '';

  useEffect(() => {
    refsById.current.set(itemId, itemRef);
    return () => {
      refsById.current.delete(itemId);
    };
  }, [itemId]);

  return (
    <li ref={itemRef} className={cn('Popover-Item', className)} {...rest}>
      {label}
    </li>
  );
};
