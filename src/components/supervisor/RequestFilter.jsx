import React from 'react';

const RequestFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mb-4">
      <div className="row g-3 align-items-end">
        {/* Search Nama */}
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label small fw-bold text-secondary">Cari Karyawan</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 rounded-start-3">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 rounded-end-3"
              placeholder="Nama karyawan..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label small fw-bold text-secondary">Status</label>
          <select
            className="form-select bg-light rounded-3"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Tanggal */}
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label small fw-bold text-secondary">Tanggal</label>
          <input
            type="date"
            className="form-control bg-light rounded-3"
            value={filters.date}
            onChange={(e) => onFilterChange('date', e.target.value)}
          />
        </div>

        {/* Button Reset */}
        <div className="col-12 col-lg-3 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
            onClick={onReset}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestFilter;