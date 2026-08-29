import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-success/10 text-success border border-success/25',
    warning: 'bg-warning/10 text-warning border border-warning/25',
    danger: 'bg-danger/10 text-danger border border-danger/25',
    neutral: 'bg-surface-2 text-muted border border-line',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
