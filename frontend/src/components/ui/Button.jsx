import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20",
    secondary: "bg-[var(--color-surface)] text-white border border-[var(--color-border)] hover:bg-[#222]",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
    ghost: "bg-transparent text-gray-300 hover:bg-[var(--color-surface)] hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
