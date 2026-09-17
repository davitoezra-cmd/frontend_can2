import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const BusinessTripFilter = ({ search, setSearch, filterStatus, setFilterStatus }) => {
  return (
    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Cari tujuan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <FaFilter />
              </span>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTripFilter;