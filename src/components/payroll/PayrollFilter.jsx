import React from 'react';
import { BiSearch, BiPlusCircle } from 'react-icons/bi';

const PayrollFilter = ({ filters, onFilterChange, onOpenGenerateModal }) => {
  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4 bg-white">
      <div className="row g-2 align-items-center">
        
        {/* Search Input */}
        <div className="col-12 col-md-4 col-lg-3">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-0 text-muted pe-1">
              <BiSearch size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 shadow-none fs-7 py-2"
              placeholder="Cari nama karyawan..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Dropdown Group Container */}
        <div className="col-12 col-md-8 col-lg-6">
          <div className="row g-2">
            
            {/* Filter Bulan */}
            <div className="col-4">
              <select
                className="form-select form-select-sm bg-light border-0 shadow-none fs-7 py-2 text-truncate"
                value={filters.bulan}
                onChange={(e) => onFilterChange('bulan', e.target.value)}
              >
                <option value="">Semua Bulan</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Filter Tahun */}
            <div className="col-4">
              <select
                className="form-select form-select-sm bg-light border-0 shadow-none fs-7 py-2 text-truncate"
                value={filters.tahun}
                onChange={(e) => onFilterChange('tahun', e.target.value)}
              >
                <option value="">Semua Tahun</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="col-4">
              <select
                className="form-select form-select-sm bg-light border-0 shadow-none fs-7 py-2 text-truncate"
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="generated">Generated</option>
                <option value="paid">Paid</option>
              </select>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div className="col-12 col-lg-3 ms-auto mt-2 mt-lg-0 text-end">
          <button
            className="btn btn-primary btn-sm w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold py-2 fs-7 shadow-sm"
            onClick={onOpenGenerateModal}
          >
            <BiPlusCircle size={16} />
            <span>Generate Payroll</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PayrollFilter;