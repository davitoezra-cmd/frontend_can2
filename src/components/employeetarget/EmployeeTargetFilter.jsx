import React from 'react';

const EmployeeTargetFilter = ({ filters, setFilters, onReset, categories = [] }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div className="card-body p-3 p-md-4">
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-muted">Cari Judul Target</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                name="search"
                className="form-control bg-light border-start-0 rounded-end-3 fs-7"
                placeholder="Cari berdasarkan judul..."
                value={filters.search}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Status Select */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-muted">Status Target</label>
            <select
              name="status"
              className="form-select bg-light rounded-3 fs-7"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">Semua Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="not_achieved">Not Achieved</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-muted">Kategori</label>
            <select
              name="category"
              className="form-select bg-light rounded-3 fs-7"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="col-12 col-md-1 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={onReset}
              title="Reset Filter"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              <span className="d-md-none">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmployeeTargetFilter);