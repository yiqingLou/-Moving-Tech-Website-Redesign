import React from 'react';
import '../styles/components.css';

export function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <p className="loading-state__message">{message}</p>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state__icon">⚠</div>
      <p className="error-state__message">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="error-state__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No results found', subtitle }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">◎</div>
      <h3 className="empty-state__title">{title}</h3>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    </div>
  );
}