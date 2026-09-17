import React from 'react';

const BPJSPaymentFilter = ({ filters, setFilters, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-3">
        <div className="row g-3 align-items-end">
          {/* Search Nama Pegawai */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-secondary">Cari Pegawai / Dokumen</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                name="search"
                className="form-control border-start-0 ps-0 shadow-none"
                placeholder="Nama pegawai atau dokumen..."
                value={filters.search}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Jenis BPJS */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary">Jenis BPJS</label>
            <select
              name="bpjs_type"
              className="form-select shadow-none"
              value={filters.bpjs_type}
              onChange={handleChange}
            >
              <option value="">Semua Jenis</option>
              <option value="kesehatan">BPJS Kesehatan</option>
              <option value="ketenagakerjaan">BPJS Ketenagakerjaan</option>
            </select>
          </div>

          {/* Periode Bulan */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-secondary">Periode Bulan</label>
            <input
              type="month"
              name="period"
              className="form-control shadow-none"
              value={filters.period}
              onChange={handleChange}
            />
          </div>

          {/* Button Reset */}
          <div className="col-12 col-md-2 d-grid">
            <button
              type="button"
              className="btn btn-light-secondary text-secondary d-flex align-items-center justify-content-center gap-2 border shadow-none"
              onClick={onReset}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPJSPaymentFilter;