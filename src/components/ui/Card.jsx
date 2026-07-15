import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  hoverable = false, 
  glass = false, 
  noPadding = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-card border border-border rounded-custom overflow-hidden';
  const glassStyles = glass ? 'glass-effect' : '';
  const shadowStyles = 'shadow-soft';
  const paddingStyles = noPadding ? '' : 'p-5';
  
  const Component = onClick ? motion.div : 'div';

  const motionProps = onClick ? {
    whileHover: hoverable ? { y: -4, scale: 1.01 } : {},
    whileTap: { scale: 0.99 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
    onClick
  } : {};

  return (
    <Component
      className={`
        ${baseStyles} 
        ${glassStyles} 
        ${shadowStyles} 
        ${paddingStyles}
        ${hoverable && !onClick ? 'shadow-hover transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
