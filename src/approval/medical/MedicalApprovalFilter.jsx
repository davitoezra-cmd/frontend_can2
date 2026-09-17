import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const MedicalApprovalFilter = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
      <div className="row g-3 align-items-center">
        <div className="col-12 col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0 rounded-end-3 py-2"
              placeholder="Cari nama karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
              <FaFilter />
            </span>
            <select
              className="form-select border-start-0 rounded-end-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalApprovalFilter;