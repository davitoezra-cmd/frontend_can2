import React from 'react';

const LocationCard = ({ location, getLocation, locationError }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="fw-bold text-dark mb-0">Lokasi GPS</h6>
          <button onClick={getLocation} className="btn btn-sm btn-light border rounded-circle">
            <i className="bi bi-geo-alt-fill text-danger"></i>
          </button>
        </div>

        {locationError ? (
          <p className="text-danger small mb-0">{locationError}</p>
        ) : location.latitude ? (
          <div className="bg-light p-3 rounded-3 small">
            <div><strong>Lat:</strong> {location.latitude}</div>
            <div><strong>Long:</strong> {location.longitude}</div>
          </div>
        ) : (
          <p className="text-muted small mb-0">Mendeteksi lokasi...</p>
        )}
      </div>
    </div>
  );
};

export default LocationCard;