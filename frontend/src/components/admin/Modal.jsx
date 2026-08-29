import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, footer, maxWidth = 'max-w-2xl' }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={onClose}>
    <div
      className={`bg-canvas border border-line rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5 sm:p-6 border-b border-line flex justify-between items-center sticky top-0 bg-canvas z-10">
        <h2 className="text-lg sm:text-xl font-bold text-fg">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-muted hover:text-fg hover:bg-surface-2 transition-all">
          <X size={16} />
        </button>
      </div>
      {children}
      {footer && (
        <div className="p-5 sm:p-6 border-t border-line flex justify-end gap-3 bg-surface sticky bottom-0">
          {footer}
        </div>
      )}
    </div>
  </div>
);

export default Modal;
