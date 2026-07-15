import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  helperText, 
  type = 'text', 
  className = '', 
  icon: Icon,
  rows,
  ...props 
}, ref) => {
  const isTextArea = type === 'textarea';
  const Component = isTextArea ? 'textarea' : 'input';

  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label className="text-xs font-semibold text-text-muted select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-text-muted/70 pointer-events-none">
            <Icon className="text-lg" />
          </div>
        )}
        <Component
          ref={ref}
          type={type !== 'textarea' ? type : undefined}
          rows={rows || 3}
          className={`
            w-full bg-card border border-border rounded-custom text-text-main text-sm transition-all duration-200
            placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5
            ${Icon ? 'pl-11' : 'px-4'} 
            ${isTextArea ? 'py-3 resize-none' : 'h-11'}
            ${error ? 'border-danger focus:ring-danger/5 focus:border-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <span className="text-xs text-danger font-medium pl-1 select-none">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-text-muted/75 pl-1 select-none">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
