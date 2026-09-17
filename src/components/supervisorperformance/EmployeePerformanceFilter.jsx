import React from 'react';

const EmployeePerformanceFilter = ({
  searchQuery,
  setSearchQuery,
  selectedGrade,
  setSelectedGrade,
  selectedPeriod,
  setSelectedPeriod,
  onReset,
}) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          {/* Search Employee */}
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-muted mb-1">Search Employee</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Cari nama karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Grade */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1">Filter Grade</label>
            <select
              className="form-select form-select-sm bg-light"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="ALL">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
              <option value="E">Grade E</option>
            </select>
          </div>

          {/* Filter Period */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1">Filter Period</label>
            <input
              type="month"
              className="form-control form-select-sm bg-light"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            />
          </div>

          {/* Reset Button */}
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
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

export default EmployeePerformanceFilter;