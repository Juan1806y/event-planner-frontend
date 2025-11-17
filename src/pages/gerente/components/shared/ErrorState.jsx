import React from 'react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Ocurrió un error</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorState;