import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const CashAdvanceApprovalDetailModal = ({
  detailData,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !detailData) return null;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge bg-success px-3 py-2 rounded-pill">
            Approved
          </span>
        );

      case 'rejected':
        return (
          <span className="badge bg-danger px-3 py-2 rounded-pill">
            Rejected
          </span>
        );

      default:
        return (
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
            Pending
          </span>
        );
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        zIndex: 1055,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '650px' }}>
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: '16px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* HEADER */}
          <div
            className="modal-header px-4 py-3"
            style={{
              borderBottom: '1px solid #edf0f2',
            }}
          >
            <div>
              <h5 className="modal-title fw-bold text-dark mb-1">
                Detail Pengajuan Kasbon
              </h5>

              <small className="text-muted">
                Informasi lengkap pengajuan kasbon karyawan
              </small>
            </div>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* BODY */}
          <div
            className="modal-body px-4 py-4"
            style={{
              overflowY: 'auto',
            }}
          >

            {/* SUMMARY */}
            <div
              className="card border-0 rounded-4 p-3 p-md-4 mb-3"
              style={{
                backgroundColor: '#f8f9fa',
              }}
            >
              <div className="row align-items-center g-3">

                {/* EMPLOYEE */}
                <div className="col-sm-7">
                  <span className="text-muted small d-block mb-1">
                    Nama Karyawan
                  </span>

                  <h5 className="fw-bold text-dark mb-3">
                    {detailData.employee?.name || '-'}
                  </h5>

                  <span className="text-muted small d-block mb-1">
                    Nominal Kasbon
                  </span>

                  <h3 className="fw-bold text-primary mb-0">
                    {formatRupiah(detailData.amount)}
                  </h3>
                </div>

                {/* STATUS */}
                <div className="col-sm-5 text-sm-end">
                  <span className="text-muted small d-block mb-2">
                    Status Pengajuan
                  </span>

                  {getStatusBadge(detailData.status)}
                </div>

              </div>
            </div>

            {/* DETAIL */}
            <div className="row g-3">

              {/* ALASAN */}
              <div className="col-12">
                <div
                  className="p-3 border rounded-4"
                  style={{
                    backgroundColor: '#ffffff',
                  }}
                >
                  <label className="form-label text-muted small fw-semibold mb-1">
                    Alasan Pengajuan
                  </label>

                  <p className="text-dark mb-0 lh-base" style={{ fontSize: '14px' }}>
                    {detailData.reason || '-'}
                  </p>
                </div>
              </div>

              {/* TANGGAL PENGAJUAN */}
              <div className="col-12">
                <div
                  className="p-3 border rounded-4"
                  style={{
                    backgroundColor: '#ffffff',
                  }}
                >
                  <label className="form-label text-muted small fw-semibold mb-1">
                    Tanggal Pengajuan
                  </label>

                  <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
                    {formatDate(detailData.created_at)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div
            className="modal-footer px-4 py-3"
            style={{
              borderTop: '1px solid #edf0f2',
              backgroundColor: '#ffffff',
            }}
          >

            {detailData.status === 'pending' ? (
              <div className="d-flex gap-2 w-100 justify-content-end">

                <button
                  type="button"
                  className="btn btn-danger px-3 rounded-3 d-flex align-items-center gap-2"
                  onClick={() => onReject(detailData.id)}
                >
                  <FaTimes />
                  Reject
                </button>

                <button
                  type="button"
                  className="btn btn-success px-3 rounded-3 d-flex align-items-center gap-2"
                  onClick={() => onApprove(detailData.id)}
                >
                  <FaCheck />
                  Approve
                </button>

              </div>
            ) : (
              <div className="d-flex gap-2 w-100 justify-content-end">

                <button
                  type="button"
                  className="btn btn-danger px-3 rounded-3"
                  disabled
                >
                  <FaTimes className="me-1" />
                  Reject
                </button>

                <button
                  type="button"
                  className="btn btn-success px-3 rounded-3"
                  disabled
                >
                  <FaCheck className="me-1" />
                  Approve
                </button>

              </div>
            )}

            <button
              type="button"
              className="btn btn-light border px-3 rounded-3 ms-2"
              onClick={onClose}
            >
              Tutup
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CashAdvanceApprovalDetailModal;
