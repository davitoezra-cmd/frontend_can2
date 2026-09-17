import React, { useMemo } from 'react';

const BPJSPaymentStats = ({ proofs = [] }) => {
  const stats = useMemo(() => {
    const total = proofs.length;
    const kesehatan = proofs.filter((p) => p.bpjs_type === 'kesehatan').length;
    const ketenagakerjaan = proofs.filter((p) => p.bpjs_type === 'ketenagakerjaan').length;

    // Filter upload bulan ini
    const currentMonthYear = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const thisMonth = proofs.filter((p) => {
      if (!p.created_at) return false;
      return p.created_at.startsWith(currentMonthYear);
    }).length;

    return { total, kesehatan, ketenagakerjaan, thisMonth };
  }, [proofs]);

  return (
    <div className="row g-3 mb-4">
      {/* Total Bukti */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '50px', height: '50px', fontSize: '1.4rem' }}
            >
              <i className="bi bi-file-earmark-text-fill"></i>
            </div>
            <div>
              <p className="text-muted small fw-medium text-uppercase mb-0" style={{ fontSize: '0.75rem' }}>
                Total Bukti
              </p>
              <h4 className="fw-bold mb-0 text-dark">{stats.total}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* BPJS Kesehatan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '50px', height: '50px', fontSize: '1.4rem' }}
            >
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <div>
              <p className="text-muted small fw-medium text-uppercase mb-0" style={{ fontSize: '0.75rem' }}>
                BPJS Kesehatan
              </p>
              <h4 className="fw-bold mb-0 text-dark">{stats.kesehatan}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* BPJS Ketenagakerjaan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '50px', height: '50px', fontSize: '1.4rem' }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div>
              <p className="text-muted small fw-medium text-uppercase mb-0" style={{ fontSize: '0.75rem' }}>
                BPJS Ketenagakerjaan
              </p>
              <h4 className="fw-bold mb-0 text-dark">{stats.ketenagakerjaan}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Bulan Ini */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '50px', height: '50px', fontSize: '1.4rem' }}
            >
              <i className="bi bi-cloud-arrow-up-fill"></i>
            </div>
            <div>
              <p className="text-muted small fw-medium text-uppercase mb-0" style={{ fontSize: '0.75rem' }}>
                Upload Bulan Ini
              </p>
              <h4 className="fw-bold mb-0 text-dark">{stats.thisMonth}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPJSPaymentStats;