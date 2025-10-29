import React, { useState, useRef, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import './fab.css';

interface FabAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FabProps {
  actions: FabAction[];
}

export const Fab = (props: FabProps) => {
  const { actions } = props;
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 40 });
  const [isDragging, setDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);
  let hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setMenuOpen(true);
    }, 300); // 0.3초 후 메뉴 오픈
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setMenuOpen(false);
    }, 300);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 메뉴가 아닌 FAB 버튼 자체를 클릭했을 때만 드래그 시작
    if (e.target === e.currentTarget) {
      setDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div
      ref={fabRef}
      className={`fab-container ${isMenuOpen ? 'open' : ''}`}
      style={{ top: `${position.y}px`, right: `${position.x}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      <button className="fab-button">
        <IoAddOutline size={24} />
      </button>
      <ul className="fab-list">
        {actions.map((action, index) => (
          <li key={index} className="fab-list-item" onClick={action.onClick}>
            {action.icon}
            <span>{action.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
