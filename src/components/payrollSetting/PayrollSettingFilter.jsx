import React, { useState, useRef, useEffect } from 'react';

const PayrollSettingFilter = ({ filters, onFilterChange, onOpenAddModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Non-Aktif' },
  ];

  // Menutup dropdown saat diklik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel =
    statusOptions.find((opt) => opt.value === filters.status)?.label || 'Semua Status';

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4 mb-4">
      <div className="row g-2 g-md-3 align-items-center">
        
        {/* Search Input */}
        <div className="col-12 col-sm-7 col-md-5 col-lg-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-0 text-muted pe-1">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 shadow-none fs-7 py-2"
              placeholder="Cari nama pegawai..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Custom Status Dropdown (Tidak menggunakan <select> native) */}
        <div className="col-12 col-sm-5 col-md-3 col-lg-3 position-relative" ref={dropdownRef}>
          <button
            type="button"
            className="btn bg-light border-0 w-100 text-start d-flex align-items-center justify-content-between py-2 px-3 fs-7 text-secondary shadow-none"
            style={{ borderRadius: '8px' }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-truncate fw-medium">{selectedLabel}</span>
            <i className={`bi bi-chevron-down transition-transform ms-1 ${isOpen ? 'rotate-180' : ''}`} style={{ fontSize: '12px' }}></i>
          </button>

          {/* Menu Pilihan Custom */}
          {isOpen && (
            <div
              className="position-absolute start-0 w-100 mt-1 bg-white border-0 shadow-lg rounded-3 py-1 overflow-hidden"
              style={{ zIndex: 1050 }}
            >
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn w-100 text-start px-3 py-2 fs-7 border-0 rounded-0 d-flex align-items-center justify-content-between ${
                    filters.status === option.value
                      ? 'bg-primary bg-opacity-10 text-primary fw-semibold'
                      : 'text-dark hover-bg-light'
                  }`}
                  onClick={() => {
                    onFilterChange('status', option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {filters.status === option.value && <i className="bi bi-check-lg text-primary"></i>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="col-12 col-md-4 col-lg-5 text-md-end ms-auto mt-2 mt-md-0">
          <button
            onClick={onOpenAddModal}
            className="btn btn-primary btn-sm rounded-3 w-100 w-md-auto px-3 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 fs-7 shadow-sm"
          >
            <i className="bi bi-plus-lg"></i>
            <span>Tambah Setting</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PayrollSettingFilter;