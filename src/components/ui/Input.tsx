import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputBaseStyles = 'block rounded-md shadow-sm border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:text-white';
    const widthStyles = fullWidth ? 'w-full' : '';
    const errorStyles = error ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-700' : '';
    const iconStyles = (leftIcon || rightIcon) ? 'pl-10' : '';
    
    return (
      <div className={`${widthStyles}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputBaseStyles} ${widthStyles} ${errorStyles} ${disabledStyles} ${iconStyles} ${className}`}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;