import React from 'react';

const LoadingSpinner = ({ text = "Memuat data..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <div className="spinner-border text-primary mb-2" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted small font-weight-500">{text}</span>
    </div>
  );
};

export default LoadingSpinner;