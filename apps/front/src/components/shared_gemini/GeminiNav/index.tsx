import cn from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';

const GemimiNavContext = React.createContext<{
  focusedItemId?: string | null;
  setFocusedItemId?: (id: string | null) => void;
  hoveredItemId?: string | null;
  setHoveredItemId?: (id: string | null) => void;
  interactingInside: boolean;
  setInteractingInside: (v: boolean) => void;
  refsById: React.RefObject<Map<string, React.RefObject<HTMLDivElement>>>;
} | null>(null);

const useGemimiNavContext = () => {
  const ctx = useContext(GemimiNavContext);
  if (!ctx) throw new Error('GemimiNav compound components must be used inside <GemimiNav>');
  return ctx;
};

interface GemimiNavItemProps extends BaseComponentProps<'div'> {
  label?: string | React.ReactNode;
}

// interface GemimiNavProps extends BaseComponentProps<'div'> {}
type GemimiNavProps = BaseComponentProps<'div'>;

export const GemimiNav = ({ children, ...rest }: GemimiNavProps) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [interactingInside, setInteractingInside] = useState<boolean>(false);
  const refsById = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());

  return (
    <GemimiNavContext.Provider
      value={{
        focusedItemId,
        setFocusedItemId,
        hoveredItemId,
        setHoveredItemId,
        refsById,
        interactingInside,
        setInteractingInside,
      }}
    >
      <div className={cn('GemimiNav-Root', rest.className)} {...rest}>
        {children}
      </div>
    </GemimiNavContext.Provider>
  );
};

GemimiNav.Item = function GemimiNavItem({ children, label, className, ...rest }: GemimiNavItemProps) {
  const {
    focusedItemId,
    setFocusedItemId,
    hoveredItemId,
    setHoveredItemId,
    refsById,
    interactingInside,
    setInteractingInside,
  } = useGemimiNavContext();

  const itemRef = useRef<HTMLDivElement>(null);
  const itemId = label || '';

  useEffect(() => {
    refsById.current.set(itemId, itemRef);
    return () => {
      refsById.current.delete(itemId);
    };
  }, [itemId]);

  const handleMouseEnter = () => {
    setHoveredItemId(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItemId(null);
  };

  const handleClick = () => {
    if (focusedItemId === itemId) {
      setFocusedItemId(null);
      setInteractingInside(false);
    } else {
      setFocusedItemId(itemId);
      setInteractingInside(true);
    }
  };

  // const isPopoverOpen = hoveredItemId === itemId || focusedItemId === itemId;
  const isPopoverOpen = hoveredItemId === itemId;
  // const isPopoverOpen = focusedItemId === itemId;

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn('GemimiNav-Item', className, {
        // 'is-hovered': hoveredItemId === itemId,
        'is-focused': focusedItemId === itemId,
      })}
      {...rest}
    >
      {label}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen: isPopoverOpen,
            anchorEl: itemRef,
            onClose: () => {
              setFocusedItemId(null);
              setHoveredItemId(null);
              setInteractingInside(false);
            },
          });
        }
        return child;
      })}
    </div>
  );
};
