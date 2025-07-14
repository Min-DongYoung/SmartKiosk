import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
}) => {
  const hoverClasses = hoverable
    ? 'hover:translate-y-[-2px] hover:shadow-lg'
    : '';

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-200 ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {children}
    </div>
  );
};

export { Card, CardHeader };