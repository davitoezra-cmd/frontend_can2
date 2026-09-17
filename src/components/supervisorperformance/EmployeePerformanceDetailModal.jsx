import React from 'react';

const EmployeePerformanceDetailModal = ({ show, onClose, detailData, loading }) => {
  if (!show) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50" style={{ zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Detail Penilaian Kinerja</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body py-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted small">Memuat detail...</p>
              </div>
            ) : detailData ? (
              <div className="list-group list-group-flush">
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Employee</span>
                  <span className="fw-semibold">
                    {detailData.employee?.name || detailData.employee?.nama || '-'}
                  </span>
                </div>
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Target</span>
                  <span className="fw-semibold text-end ms-3">
                    {detailData.employee_target?.title || detailData.employee_target?.target_name || '-'}
                  </span>
                </div>
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Score</span>
                  <span className="fw-bold fs-5 text-primary">{detailData.score}</span>
                </div>
                <div className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Grade</span>
                  <span className="badge bg-primary px-3 py-1 fs-6">{detailData.grade}</span>
                </div>
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Supervisor</span>
                  <span className="fw-medium">
                    {detailData.supervisor?.name || detailData.supervisor?.nama || '-'}
                  </span>
                </div>
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Tanggal Penilaian</span>
                  <span className="small text-dark">{formatDate(detailData.created_at)}</span>
                </div>
                <div className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">Tanggal Diperbarui</span>
                  <span className="small text-dark">{formatDate(detailData.updated_at)}</span>
                </div>
                <div className="list-group-item px-0 pt-3">
                  <span className="text-muted d-block mb-1">Feedback:</span>
                  <div className="bg-light p-3 rounded-3 small">
                    {detailData.feedback || 'Tidak ada catatan feedback.'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted">Data tidak tersedia.</p>
            )}
          </div>
          <div className="modal-footer border-top-0">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceDetailModal;