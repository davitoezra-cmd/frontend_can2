import React from 'react';
import { FaSearch } from 'react-icons/fa';

const BusinessTripApprovalFilter = ({ filterStatus, setFilterStatus, searchTerm, setSearchTerm }) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 mb-4">
      <div className="card-body p-3">
        <div className="row g-3">
          {/* Search Bar */}
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Cari nama employee, tujuan atau keperluan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTripApprovalFilter;