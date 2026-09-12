import React from 'react';

const Badge = ({ 
  children, 
  variant = 'info', 
  size = 'md', 
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full select-none';
  
  const variants = {
    success: 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]',
    warning: 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]',
    danger: 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]',
    info: 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]',
    neutral: 'bg-border/40 text-text-muted border border-border/70',
    accent: 'bg-[#E8F5E9] text-primary border border-accent/20'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wide',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
