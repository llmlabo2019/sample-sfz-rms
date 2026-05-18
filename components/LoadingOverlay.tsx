import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="component-overlay">
      <div className="loader" />
    </div>
  );
};

export default LoadingOverlay;
