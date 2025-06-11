import React, { ButtonHTMLAttributes, forwardRef, AnchorHTMLAttributes } from 'react';
import { Link, LinkProps } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// Base props for our Button component
interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// Polymorphic props type: C is the component type (e.g., 'button', Link, 'a')
type ButtonProps<C extends React.ElementType> = BaseButtonProps & 
  Omit<React.ComponentPropsWithoutRef<C>, keyof BaseButtonProps>;

const Button = forwardRef(
  <C extends React.ElementType = 'button'>(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled: propDisabled,
      as: Component = 'button' as C,
      ...restProps
    }: ButtonProps<C>,
    ref: React.Ref<React.ElementRef<C>>
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900';
    
    const variantStyles = {
      primary: 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
      secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
      ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800',
    };
    
    const sizeStyles = {
      sm: 'text-xs px-3 py-2',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-5 py-3',
    };
    
    const loadingStyles = isLoading
      ? 'cursor-not-allowed opacity-70'
      : '';
    
    const widthStyles = fullWidth ? 'w-full' : '';
    
    const effectiveDisabled = propDisabled || isLoading;

    // Construct the class name
    let mergedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${widthStyles} ${className}`;

    // If the component is not a button, apply disabled styles via className
    if (Component !== 'button' && effectiveDisabled) {
      mergedClassName += ' opacity-50 cursor-not-allowed';
    }

    // Props to pass to the underlying component
    const componentProps = {
      ...restProps,
      className: mergedClassName,
      children: children,
    } as React.ComponentPropsWithoutRef<C>;

    // Only apply disabled prop if the component is a native button element
    if (Component === 'button') {
      (componentProps as ButtonHTMLAttributes<HTMLButtonElement>).disabled = effectiveDisabled;
    }

    return (
      <Component
        ref={ref}
        {...componentProps}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Component>
    );
  }
) as (<C extends React.ElementType = 'button'>(props: ButtonProps<C> & React.RefAttributes<React.ElementRef<C>>) => React.ReactElement | null);

Button.displayName = 'Button';

export default Button;