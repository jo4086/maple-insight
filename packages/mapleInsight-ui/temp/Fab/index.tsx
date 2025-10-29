import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { IoAddOutline } from 'react-icons/io5';
// import './fab.css';

export interface FabAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export type FabProp = FabAction[];

export type ClassNameProps = {
  container?: string;
  button?: string;
  list?: string;
  item?: string;
};

interface FabProps {
  actions: FabProp;
  classNames?: ClassNameProps;
  onToggle?: (v: boolean) => void;
}

export const Fab = (props: FabProps) => {
  const { actions, classNames, onToggle } = props;
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 40 });
  const [isDragging, setDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  let hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setMenuOpen(true);
      onToggle(true);
    }, 300); // 0.3초 후 메뉴 오픈
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // if (e.target === e.currentTarget)
    {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      dragTimeoutRef.current = setTimeout(() => {
        setDragging(true);
      }, 500); // 0.5초 누르면 드래그 시작
    }
  };

  // const handleMouseLeave = () => {
  //   if (hoverTimeout.current) {
  //     clearTimeout(hoverTimeout.current);
  //   }
  //   hoverTimeout.current = setTimeout(() => {
  //     setMenuOpen(false);
  //     onToggle(false);
  //   }, 300);
  // };

  const handleMouseLeave = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setMenuOpen(false);
      onToggle?.(false);
    }, 300);
  };

  // const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  //   // 메뉴가 아닌 FAB 버튼 자체를 클릭했을 때만 드래그 시작
  //   if (e.target === e.currentTarget) {
  //     setDragging(true);
  //     dragStartRef.current = {
  //       x: e.clientX,
  //       y: e.clientY,
  //     };
  //   }
  // };

  /*   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      dragTimeoutRef.current = setTimeout(() => {
        setDragging(true);
      }, 500); // 0.5초 이상 누르면 드래그 모드
    }
  }; */

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = dragStartRef.current.x - e.clientX;
      const deltaY = -dragStartRef.current.y + e.clientY;
      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }
  };
  /* 
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = -e.clientX + dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({ x: newX, y: newY });
    }
  };
 */

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    if (isDragging) {
      setDragging(false); // 💥 중요!
    }
  };
  /* 
  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    if (isDragging) {
      setDragging(false); // 드래그 종료
    }
  };
 */
  // const handleMouseUp = () => {
  //   setDragging(false);
  // };
  /* 
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);
 */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const styleMap: ClassNameProps = {
    container: 'fixed right-[2rem] bottom-[2rem]',
    button:
      'w-[150px] h-[50px] rounded-md bg-black/50 text-white border-none cursor-pointer flex items-center justify-center text-[1.2rem] transition-all duration-300 ease-in-out hover:bg-black/70',
    list: clsx(
      'list-none p-0 m-0 absolute bottom-[60px] right-0 w-[150px] bg-white rounded-sm shadow-md',
      'opacity-0 invisible translate-y-[10px] transition-all duration-300 ease-in-out',
      isMenuOpen && 'opacity-100 visible translate-y-0',
    ),
    item: 'p-[10px] cursor-pointer transition-colors duration-200 hover:bg-[#f0f0f0]',
  };

  const writeContainer = classNames?.container || '';
  const writeButton = classNames?.button || '';
  const writeList = classNames?.list || '';
  const writeItem = classNames?.item || '';

  return (
    <div
      ref={fabRef}
      className={`fab-container fixed right-[2rem] bottom-[2rem] ${isMenuOpen ? 'open' : ''} ${writeContainer}`}
      style={{ top: `${position.y}px`, right: `${position.x}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <button
        className={`flex w-40 h-12 cursor-pointer rounded-md bg-black/50 text-white 
                   items-center justify-center text-[1.2rem] transition-all duration-300 ease-in-out hover:bg-black/70 ${writeButton}`}
      >
        <IoAddOutline size={40} />
      </button>
      <ul
        className={clsx(
          'list-none p-0 m-0 absolute bottom-[0px] right-0 w-40 rounded -translate-y-4 transition-all duration-300 ease-in-out',
          !isMenuOpen && 'opacity-100 visible',
          isMenuOpen && 'opacity-100 visible translate-y-3 bg-blue-300',
          writeList,
        )}
      >
        {actions.map((action, index) => (
          <li
            key={index}
            className={`fab-list-item p-2 my-2 cursor-pointer transition-colors duration-200 rounded-md hover:bg-[#f0f0f0] ${writeItem}`}
            onClick={action.onClick}
          >
            {action?.icon}
            <span>{action?.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// <button className={`fab-button ${styleMap.button} ${writeButton}`}>

// <div
//   ref={fabRef}
//   className={`fab-container ${styleMap.container} ${isMenuOpen ? 'open' : ''} ${writeContainer}`}
//   style={{ top: `${position.y}px`, right: `${position.x}px` }}
//   onMouseEnter={handleMouseEnter}
//   onMouseLeave={handleMouseLeave}
//   onMouseDown={handleMouseDown}
// >
//   <button
//     className="w-[150px] h-[50px] rounded-md bg-black/50 text-white
//                flex items-center justify-center text-[1.2rem]
//                transition-all duration-300 ease-in-out hover:bg-black/70"
//   >
//     <IoAddOutline size={24} />
//   </button>
//   <ul className={`fab-list ${styleMap.list} ${writeList}`}>
//     {actions.map((action, index) => (
//       <li key={index} className={`fab-list-item ${styleMap.item} ${writeItem}`} onClick={action.onClick}>
//         {action.icon}
//         <span>{action.label}</span>
//       </li>
//     ))}
//   </ul>
// </div>
//

// className={clsx(
//   'list-none p-0 m-0 absolute bottom-[60px] right-0 w-[150px] bg-white rounded shadow-md',
//   'opacity-0 invisible translate-y-[10px] transition-all duration-300 ease-in-out',
//   isMenuOpen && 'opacity-100 visible translate-y-0',
//   writeList,
// )}

// className={`list-none p-0 m-0 absolute bottom-[60px] right-0 w-[150px] bg-white rounded shadow-md opacity-0 invisible translate-y-[10px] transition-all duration-300 ease-in-out`}
