import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text-main/30 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`
              relative w-full ${sizes[size]} bg-card border border-border rounded-custom shadow-soft p-6 z-10 
              flex flex-col max-h-[90vh] overflow-hidden ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4 select-none">
              {title && (
                <h3 className="font-display text-lg font-bold text-text-main">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-main p-1 rounded-full hover:bg-border/30 transition-colors"
                aria-label="Close modal"
              >
                <IoCloseOutline className="text-2xl" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
