import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  allowBackdropClose?: boolean;
}

export const BaseModal = ({ open, onClose, allowBackdropClose, children }: BaseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !onClose) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/50"
      role="presentation"
      onMouseDown={(e) => {
        if (allowBackdropClose && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div ref={modalRef} className="w-[min(560px,92vw)] max-h-[86vh] overflow-auto rounded-lg bg-white shadow-2xl">
        {children}
      </div>
    </div>,
    document.body,
  );
};

interface BaseDialogProps extends BaseModalProps {
  allow: boolean;
}

export const BaseDialog = ({ open, children, onClose, allowBackdropClose, allow }: BaseDialogProps) => {};
