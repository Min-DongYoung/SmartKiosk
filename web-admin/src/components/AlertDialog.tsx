import React from 'react';

interface AlertDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => onOpenChange(false)} // Dimmer click closes modal
    >
      {children}
    </div>
  );
};

interface AlertDialogContentProps {
  children: React.ReactNode;
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children }) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md"
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside content from closing modal
    >
      {children}
    </div>
  );
};

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children }) => {
  return <h4 className="text-xl font-bold mb-2">{children}</h4>;
};

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children }) => {
  return <p className="text-gray-600 mb-4">{children}</p>;
};

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children }) => {
  return <div className="flex justify-end gap-2">{children}</div>;
};

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
};