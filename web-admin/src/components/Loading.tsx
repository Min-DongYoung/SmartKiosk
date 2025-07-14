import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  showLoading: (target?: string) => void;
  hideLoading: (target?: string) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState<string | undefined>(undefined);

  const showLoading = (target?: string) => {
    setLoading(true);
    setLoadingTarget(target);
  };

  const hideLoading = (target?: string) => {
    setLoading(false);
    setLoadingTarget(undefined);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading: loading }}>
      {children}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
