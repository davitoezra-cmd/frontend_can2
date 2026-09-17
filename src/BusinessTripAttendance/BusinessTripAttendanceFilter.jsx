import React from 'react';

const BusinessTripAttendanceFilter = ({ filterStatus, setFilterStatus, searchTerm, setSearchTerm }) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 mb-4">
      <div className="card-body p-3">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Cari berdasarkan tujuan atau keperluan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Semua Status (Approved & Completed)</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTripAttendanceFilter;