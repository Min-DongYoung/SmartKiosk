import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  let baseClasses = 'inline-block px-4 py-2 rounded font-medium cursor-pointer transition-all duration-300';
  let variantClasses = '';
  let sizeClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white hover:from-indigo-600 hover:to-purple-800 shadow-md hover:shadow-lg';
      break;
    case 'success':
      variantClasses = 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg';
      break;
    case 'danger':
      variantClasses = 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg';
      break;
    case 'warning':
      variantClasses = 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-800 hover:from-yellow-500 hover:to-yellow-600 shadow-md hover:shadow-lg';
      break;
    case 'secondary':
      variantClasses = 'bg-gradient-to-br from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-md hover:shadow-lg';
      break;
    case 'info':
      variantClasses = 'bg-gradient-to-br from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg';
      break;
  }

  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1 text-sm';
      break;
    case 'md':
      sizeClasses = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeClasses = 'px-5 py-3 text-lg';
      break;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;