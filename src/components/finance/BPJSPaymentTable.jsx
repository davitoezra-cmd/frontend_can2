import React from 'react';

const BPJSPaymentTable = ({
  proofs = [],
  onDetail,
  onEdit,
  onDelete,
}) => {
  const getDownloadUrl = (filePath) => {
  if (!filePath) return '#';
  return `http://localhost:8000/storage/${filePath}`;
};

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-4 text-secondary text-uppercase small" style={{ width: '60px' }}>No</th>
              <th className="text-secondary text-uppercase small">Nama Pegawai</th>
              <th className="text-secondary text-uppercase small">Jenis BPJS</th>
              <th className="text-secondary text-uppercase small">Periode</th>
              <th className="text-secondary text-uppercase small">Nama Dokumen</th>
              <th className="text-secondary text-uppercase small">Tanggal Upload</th>
              <th className="text-secondary text-uppercase small">Status</th>
              <th className="pe-4 text-center text-secondary text-uppercase small" style={{ width: '160px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {proofs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  Data bukti pembayaran BPJS tidak ditemukan.
                </td>
              </tr>
            ) : (
              proofs.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="ps-4 fw-medium text-secondary">{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-circle bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                        {item.employee?.name ? item.employee.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <div className="fw-semibold text-dark">{item.employee?.name || item.employee_name || 'N/A'}</div>
                        <small className="text-muted">{item.employee?.employee_code || '-'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.bpjs_type === 'kesehatan' ? (
                      <span className="badge bg-info bg-opacity-10 text-info fw-semibold px-2 py-1 rounded-2">
                        <i className="bi bi-heart-pulse me-1"></i> BPJS Kesehatan
                      </span>
                    ) : (
                      <span className="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2 py-1 rounded-2">
                        <i className="bi bi-shield-check me-1"></i> BPJS Ketenagakerjaan
                      </span>
                    )}
                  </td>
                  <td className="fw-medium text-dark">{item.period || '-'}</td>
                  <td className="text-truncate" style={{ maxWidth: '180px' }} title={item.document_name}>
                    {item.document_name}
                  </td>
                  <td className="text-muted small">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">
                      <i className="bi bi-check-circle-fill me-1"></i> Berhasil
                    </span>
                  </td>
                  <td className="pe-4 text-center">
                    <div className="btn-group shadow-none" role="group">
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-primary border-0"
                        title="Lihat Detail"
                        onClick={() => onDetail(item)}
                      >
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <a
                        href={getDownloadUrl(item.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-light text-success border-0"
                        title="Download Dokumen"
                        download
                      >
                        <i className="bi bi-download"></i>
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-warning border-0"
                        title="Edit Data"
                        onClick={() => onEdit(item)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-danger border-0"
                        title="Hapus"
                        onClick={() => onDelete(item)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BPJSPaymentTable;