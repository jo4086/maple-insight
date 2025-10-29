// File: /src/components/feature/Modal/index.tsx

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg relative flex flex-col">
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center border-b border-gray-300 px-4 py-2">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-xl font-bold">
            ✕
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
};
