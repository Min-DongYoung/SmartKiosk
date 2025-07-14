import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ children, type = 'info', className = '' }) => {
  let baseClasses = 'p-4 rounded-lg border';
  let typeClasses = '';

  switch (type) {
    case 'success':
      typeClasses = 'bg-green-50 border-green-300 text-green-800';
      break;
    case 'error':
      typeClasses = 'bg-red-50 border-red-300 text-red-800';
      break;
    case 'warning':
      typeClasses = 'bg-yellow-50 border-yellow-300 text-yellow-800';
      break;
    case 'info':
    default:
      typeClasses = 'bg-blue-50 border-blue-300 text-blue-800';
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => {
  return <p className={`text-sm ${className}`}>{children}</p>;
};

export { Alert, AlertDescription };