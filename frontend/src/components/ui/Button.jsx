import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle =
    'px-4 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary text-on-primary hover:bg-primary-hover shadow-lg shadow-primary/20',
    secondary:
      'bg-surface text-fg border border-line hover:bg-surface-2',
    danger:
      'bg-danger text-white hover:brightness-95 shadow-md shadow-danger/20',
    ghost:
      'bg-transparent text-muted hover:bg-surface-2 hover:text-fg',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
