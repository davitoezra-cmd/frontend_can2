import React from 'react';

const PayrollSettingStats = ({ stats }) => {
  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-subtle text-primary p-3 rounded-3 fs-4">
              <i className="bi bi-people-fill"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold">Total Employee</small>
              <h4 className="fw-bold mb-0 text-dark">{stats.totalEmployee}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success-subtle text-success p-3 rounded-3 fs-4">
              <i className="bi bi-person-check-fill"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold">Employee Aktif</small>
              <h4 className="fw-bold mb-0 text-dark">{stats.activeCount}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger-subtle text-danger p-3 rounded-3 fs-4">
              <i className="bi bi-person-x-fill"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold">Employee Non-Aktif</small>
              <h4 className="fw-bold mb-0 text-dark">{stats.inactiveCount}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-info-subtle text-info p-3 rounded-3 fs-4">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold">Rata-rata Gaji Harian</small>
              <h5 className="fw-bold mb-0 text-dark">{formatRupiah(stats.avgGajiHarian)}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingStats;