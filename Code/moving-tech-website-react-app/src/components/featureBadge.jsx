import React from 'react';
import '../styles/components.css';

export default function FeatureBadge({ label, size = 'sm' }) {
  return (
    <span className={`feature-badge feature-badge--${size}`}>{label}</span>
  );
}