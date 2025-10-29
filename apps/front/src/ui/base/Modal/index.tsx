import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import useLockBodyScroll from './useLockBodyScroll';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
  ariaDescribedById?: string;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  contentClassName?: string;
  bodyClassName?: string;
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  initialFocusRef,
  ariaDescribedById,
  closeOnEsc = true,
  closeOnBackdrop = true,
  contentClassName,
  bodyClassName,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      const target = initialFocusRef?.current ?? modalRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      target?.focus();
    } else {
      lastFocusedRef.current?.focus?.();
    }
  }, [open, initialFocusRef]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (!focusables || focusables.length === 0) {
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, closeOnEsc]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/50"
      role="presentation"
      onMouseDown={(e) => {
        if (!closeOnBackdrop) {
          return;
        }
        if (e.target === e.currentTarget) onClose(); // 백드롭 클릭 닫기
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title" // [고정값]
        aria-describedby={ariaDescribedById}
        className={`w-[min(560px,92vw)] max-h-[86vh] overflow-auto rounded-xl bg-white shadow-2xl outline-none ${contentClassName ?? ''}`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button type="button" className="cursor-pointer text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        {/* Body */}
        <div className={`p-4 ${bodyClassName ?? ''}`}>{children}</div>
      </div>
    </div>,
    document.body, // [고정값] 포털 위치
  );
};
