import React from 'react';

const Input = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1 text-sm text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`bg-[#0d0d0f] border border-[var(--color-border)] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;
