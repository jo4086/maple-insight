import cn from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';

const NavBarContext = React.createContext<{
  focusedItemId?: string | null;
  setFocusedItemId?: (id: string | null) => void;
  hoveredItemId?: string | null;
  setHoveredItemId?: (id: string | null) => void;
  interactingInside: boolean;
  setInteractingInside: (v: boolean) => void;
  refsById: React.RefObject<Map<string, React.RefObject<HTMLDivElement>>>;
} | null>(null);

const useNavBarContext = () => {
  const ctx = useContext(NavBarContext);
  if (!ctx) throw new Error('NavBar compound components must be used inside <NavBar>');
  return ctx;
};

interface NavBarItemProps extends BaseComponentProps<'div'> {
  label?: string;
}

// interface NavBarProps extends BaseComponentProps<'div'> {}
type NavBarProps = BaseComponentProps<'div'>;

export const NavBar = ({ children, ...rest }: NavBarProps) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [interactingInside, setInteractingInside] = useState<boolean>(false);
  const refsById = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());

  return (
    <NavBarContext.Provider
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
      <div className={cn('NavBar-Root', rest.className)} {...rest}>
        {children}
      </div>
    </NavBarContext.Provider>
  );
};

NavBar.Item = function NavBarItem({ label, className, ...rest }: NavBarItemProps) {
  const {
    focusedItemId,
    setFocusedItemId,
    hoveredItemId,
    setHoveredItemId,
    refsById,
    interactingInside,
    setInteractingInside,
  } = useNavBarContext();

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
    setFocusedItemId(itemId);
    setInteractingInside(true); // 클릭 시 조작 중으로 전환
  };

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn('NavBar-Item', className, {
        'is-hovered': hoveredItemId === itemId,
        'is-focused': focusedItemId === itemId,
      })}
      {...rest}
    >
      {label}
    </div>
  );
};
