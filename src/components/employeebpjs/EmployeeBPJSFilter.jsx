import React from 'react';

const EmployeeBPJSFilter = ({ filters, setFilters, onReset }) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
      <div className="row g-3 align-items-center">
        {/* Cari Periode */}
        <div className="col-12 col-md-5">
          <label className="form-label small text-muted fw-medium mb-1">Cari Periode</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
              <i className="bi bi-calendar-event"></i>
            </span>
            <input
              type="month"
              className="form-control bg-light border-start-0 rounded-end-3"
              value={filters.period || ''}
              onChange={(e) => handleChange('period', e.target.value)}
            />
          </div>
        </div>

        {/* Jenis BPJS */}
        <div className="col-12 col-md-5">
          <label className="form-label small text-muted fw-medium mb-1">Jenis BPJS</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
              <i className="bi bi-funnel"></i>
            </span>
            <select
              className="form-select bg-light border-start-0 rounded-end-3"
              value={filters.bpjs_type || ''}
              onChange={(e) => handleChange('bpjs_type', e.target.value)}
            >
              <option value="">Semua Jenis BPJS</option>
              <option value="kesehatan">BPJS Kesehatan</option>
              <option value="ketenagakerjaan">BPJS Ketenagakerjaan</option>
            </select>
          </div>
        </div>

        {/* Tombol Reset */}
        <div className="col-12 col-md-2 d-flex align-items-end mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
            onClick={onReset}
            style={{ height: '38px' }}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBPJSFilter;