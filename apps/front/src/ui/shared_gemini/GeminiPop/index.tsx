import cn from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const GeminiPopContext = React.createContext<{
  focusedItemId?: string | null;
  setFocusedItemId?: (id: string | null) => void;
  refsById: React.RefObject<Map<string, React.RefObject<HTMLLIElement>>>;
} | null>(null);

const useGeminiPopContext = () => {
  const ctx = useContext(GeminiPopContext);
  if (!ctx) throw new Error('GeminiPop compound components must be used inside <GeminiPop>');
  return ctx;
};

type GeminiPopProps = BaseComponentProps<'ul'> & {
  isOpen?: boolean;
  anchorEl?: React.RefObject<HTMLElement> | null;
  onClose?: () => void;
};

export const GeminiPop = ({ children, isOpen, anchorEl, onClose, className, style, ...rest }: GeminiPopProps) => {
  const popoverRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; right: number } | null>(null);

  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const refsById = useRef<Map<string, React.RefObject<HTMLLIElement>>>(new Map());

  useEffect(() => {
    if (isOpen && anchorEl?.current) {
      const anchorRect = anchorEl.current.getBoundingClientRect();
      setPosition({
        top: anchorRect.bottom + window.scrollY,
        left: anchorRect.left + window.scrollX,
        right: anchorRect.right + window.scrollX,
      });
    }
  }, [isOpen, anchorEl]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !anchorEl?.current?.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen) return null;

  console.log(position);
  const width = position?.right - position?.left;

  const popoverContent = (
    <GeminiPopContext.Provider value={{ focusedItemId, setFocusedItemId, refsById }}>
      <ul
        ref={popoverRef}
        className={cn('GeminiPop-Root', className)}
        style={{
          position: 'absolute',
          top: position?.top ?? 0,
          left: position?.left ? position.left - 20 : 0,
          // left: 'calc(100px + 50%)',
          // left: `calc(${position?.left}px - ${width}px / 2)`,
          zIndex: 1000,
          ...style,
        }}
        {...rest}
      >
        {children}
      </ul>
    </GeminiPopContext.Provider>
  );

  return createPortal(popoverContent, document.body);
};

interface GeminiPopItemProps extends BaseComponentProps<'li'> {
  label?: string;
}

GeminiPop.Item = function GeminiPopItem({ label, className, ...rest }: GeminiPopItemProps) {
  const { refsById } = useGeminiPopContext();
  const itemRef = useRef<HTMLLIElement>(null);
  const itemId = label || '';

  useEffect(() => {
    if (refsById?.current) {
      refsById.current.set(itemId, itemRef);
      return () => {
        refsById.current.delete(itemId);
      };
    }
  }, [itemId, refsById]);

  return (
    <li ref={itemRef} className={cn('GeminiPop-Item', className)} {...rest}>
      {label}
    </li>
  );
};

