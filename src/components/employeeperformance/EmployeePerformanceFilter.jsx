import React from 'react';

const EmployeePerformanceFilter = ({ search, setSearch, selectedGrade, setSelectedGrade, selectedPeriod, setSelectedPeriod, periods, onReset }) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 mb-4">
      <div className="row g-3 align-items-center">
        {/* Search */}
        <div className="col-12 col-md-5 col-lg-4">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0"
              placeholder="Cari target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Grade */}
        <div className="col-12 col-sm-6 col-md-3 col-lg-3">
          <select
            className="form-select bg-light border-0"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Semua Grade</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="E">Grade E</option>
          </select>
        </div>

        {/* Filter Periode */}
        <div className="col-12 col-sm-6 col-md-3 col-lg-3">
          <select
            className="form-select bg-light border-0"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="">Semua Periode</option>
            {periods && periods.map((period, idx) => (
              <option key={idx} value={period}>{period}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="col-12 col-md-1 col-lg-2 d-flex justify-content-end">
          <button
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={onReset}
            type="button"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceFilter;