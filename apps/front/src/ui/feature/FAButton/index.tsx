import { useState, useCallback, useEffect } from 'react';

interface FloatingAction {
  id: string;
  label: string;
  icon: string;
  onClick?: () => void;
}

interface FAButtonProps {
  actions: FloatingAction[];
  className?: string;
}

export function FAButton({ actions, className = '' }: FAButtonProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('fab-position');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 80 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = Math.max(0, Math.min(window.innerWidth - 64, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 64, e.clientY - dragOffset.y));

      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('fab-position', JSON.stringify(position));
    }
  }, [isDragging, position]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.max(0, Math.min(window.innerWidth - 64, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - 64, prev.y)),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMenuPosition = () => {
    const spaceBelow = window.innerHeight - position.y;
    const spaceAbove = position.y;
    const menuHeight = actions.length * 48 + 16;

    if (spaceBelow >= menuHeight + 80) {
      return 'bottom';
    } else if (spaceAbove >= menuHeight) {
      return 'top';
    } else {
      return 'bottom';
    }
  };

  const menuPosition = getMenuPosition();

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}

      {/* FAB Container */}
      <div
        className={`fixed z-50 ${className}`}
        style={{ left: position.x, top: position.y }}
        onMouseEnter={() => !isDragging && setIsOpen(true)}
        onMouseLeave={() => !isDragging && setIsOpen(false)}
      >
        {/* Action Menu */}
        {isOpen && (
          <div className={`absolute right-0 ${menuPosition === 'top' ? 'bottom-16' : 'top-16'} bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48`}>
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${action.icon} text-lg`}></i>
                </div>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Button */}
        <button
          onMouseDown={handleMouseDown}
          className={`w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
          }`}
        >
          <i className={`ri-${isOpen ? 'close' : 'add'}-line text-xl transition-transform ${isOpen ? 'rotate-45' : ''}`}></i>
        </button>
      </div>
    </>
  );
}
