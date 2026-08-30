import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ label, id, error, className = '', children, ...props }) => (
  <div className={`flex flex-col mb-5 ${className}`}>
    {label && (
      <label htmlFor={id} className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
        {label}
      </label>
    )}
    <div className="relative group">
      <select
        id={id}
        className={`w-full appearance-none bg-surface border border-line rounded-xl px-4 py-3 pr-10 text-sm text-fg focus:outline-none focus:border-primary/50 focus:bg-surface-2 transition-all ${
          error ? 'border-danger/50' : ''
        }`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
    </div>
    {error && <span className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{error}</span>}
  </div>
);

export default Select;
