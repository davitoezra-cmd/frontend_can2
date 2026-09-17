import React from 'react';

const CashAdvanceFilter = ({ search, setSearch, statusFilter, setStatusFilter }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 p-3">
      <div className="row g-3">
        <div className="col-12 col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 rounded-end-3"
              placeholder="Cari Nama Employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select rounded-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            <option value="approved">Approved</option>
            <option value="paid">Sudah Dicairkan</option>
            <option value="unpaid">Belum Dicairkan</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CashAdvanceFilter;