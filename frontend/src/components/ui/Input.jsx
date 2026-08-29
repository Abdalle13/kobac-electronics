import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, id, error, icon: Icon, type, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col mb-5 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-fg placeholder-muted/60 focus:outline-none focus:border-primary/50 focus:bg-surface-2 transition-all ${
            Icon ? 'pl-11' : ''
          } ${isPassword ? 'pr-12' : ''} ${error ? 'border-danger/50' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors p-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-danger mt-1.5 ml-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
};

export default Input;
