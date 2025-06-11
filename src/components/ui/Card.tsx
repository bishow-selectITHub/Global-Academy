import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '', ...props }: CardHeaderProps) => {
  return (
    <div 
      className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className = '', ...props }: CardTitleProps) => {
  return (
    <h3 
      className={`text-lg font-semibold text-slate-800 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className = '', ...props }: CardDescriptionProps) => {
  return (
    <p 
      className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = '', ...props }: CardContentProps) => {
  return (
    <div 
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div 
      className={`px-6 py-4 border-t border-slate-200 dark:border-slate-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};