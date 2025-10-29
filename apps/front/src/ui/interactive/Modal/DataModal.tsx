import React, { useEffect } from 'react';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const DataModal = ({ isOpen, onClose, children }: DataModalProps) => {
  useEffect(() => {
    const preventEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', preventEsc);
    return () => window.removeEventListener('keydown', preventEsc);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content">
          {children}
          <button className="close-btn" onClick={onClose}>
            close
          </button>
        </div>
      </div>
    </>
  );
};
