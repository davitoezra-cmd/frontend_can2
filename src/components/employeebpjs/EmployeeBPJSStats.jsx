import React from 'react';

const EmployeeBPJSStats = ({ proofs = [] }) => {
  const safeProofs = Array.isArray(proofs) ? proofs : [];

  const totalDocs = safeProofs.length;
  const kesehatanDocs = safeProofs.filter((p) => p?.bpjs_type === 'kesehatan').length;
  const ketenagakerjaanDocs = safeProofs.filter((p) => p?.bpjs_type === 'ketenagakerjaan').length;

  const latestUpload = safeProofs.length > 0 && safeProofs[0]?.created_at
    ? new Date(safeProofs[0].created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  return (
    <div className="row g-3 mb-4">
      {/* Total Dokumen */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-file-earmark-text-fill fs-4"></i>
            </div>
            <div>
              <p className="text-muted small mb-0 fw-medium">Total Dokumen</p>
              <h4 className="fw-bold text-dark mb-0">{totalDocs}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* BPJS Kesehatan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 bg-success bg-opacity-10 text-success">
              <i className="bi bi-heart-pulse-fill fs-4"></i>
            </div>
            <div>
              <p className="text-muted small mb-0 fw-medium">BPJS Kesehatan</p>
              <h4 className="fw-bold text-dark mb-0">{kesehatanDocs}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* BPJS Ketenagakerjaan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-briefcase-fill fs-4"></i>
            </div>
            <div>
              <p className="text-muted small mb-0 fw-medium">BPJS Ketenagakerjaan</p>
              <h4 className="fw-bold text-dark mb-0">{ketenagakerjaanDocs}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Terbaru */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 bg-info bg-opacity-10 text-info">
              <i className="bi bi-clock-history fs-4"></i>
            </div>
            <div>
              <p className="text-muted small mb-0 fw-medium">Upload Terbaru</p>
              <h6 className="fw-bold text-dark mb-0">{latestUpload}</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBPJSStats;