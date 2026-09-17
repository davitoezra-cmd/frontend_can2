import React from 'react';

const CashAdvanceDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-white border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark fs-5">Detail Kasbon</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="text-muted fs-7 fw-semibold d-block">Nama Employee</label>
                <div className="fw-bold fs-6 text-dark">{data.employee?.name || '-'}</div>
              </div>

              <div className="col-6">
                <label className="text-muted fs-7 fw-semibold d-block">Nominal</label>
                <div className="fw-bold fs-5 text-primary">{formatRupiah(data.amount || data.nominal)}</div>
              </div>

              <div className="col-6">
                <label className="text-muted fs-7 fw-semibold d-block">Tanggal Pengajuan</label>
                <div className="fw-semibold text-dark">{formatDate(data.created_at || data.tanggal)}</div>
              </div>

              <div className="col-6">
                <label className="text-muted fs-7 fw-semibold d-block">Status Approval</label>
                <div>
                  <span className={`badge bg-${data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'danger' : 'warning'} bg-opacity-10 text-${data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'danger' : 'warning'} rounded-pill px-3 py-2 mt-1`}>
                    {data.status}
                  </span>
                </div>
              </div>

              <div className="col-6">
                <label className="text-muted fs-7 fw-semibold d-block">Status Cair</label>
                <div>
                  <span className={`badge bg-${data.is_paid ? 'primary' : 'secondary'} bg-opacity-10 text-${data.is_paid ? 'primary' : 'secondary'} rounded-pill px-3 py-2 mt-1`}>
                    {data.is_paid ? 'Sudah Cair' : 'Belum Cair'}
                  </span>
                </div>
              </div>

              <div className="col-12">
                <label className="text-muted fs-7 fw-semibold d-block">Tanggal Approve</label>
                <div className="fw-semibold text-dark">{formatDate(data.approved_at || data.updated_at)}</div>
              </div>

              <div className="col-12">
                <label className="text-muted fs-7 fw-semibold d-block">Alasan</label>
                <div className="p-3 bg-light rounded-3 text-dark mt-1">
                  {data.reason || data.alasan || '-'}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer bg-white border-top px-4 py-3">
            <button type="button" className="btn btn-light rounded-3 px-4 text-secondary fw-semibold" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashAdvanceDetailModal;