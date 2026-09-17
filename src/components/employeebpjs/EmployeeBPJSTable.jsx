import React from 'react';

const EmployeeBPJSTable = ({ proofs = [], onDetail, onDownload }) => {
  const safeProofs = Array.isArray(proofs) ? proofs : [];

  const formatPeriod = (periodStr) => {
    if (!periodStr) return '-';
    const [year, month] = periodStr.split('-');
    if (!year || !month) return periodStr;
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-secondary small text-uppercase">
          <tr>
            <th className="py-3 px-3 text-center" style={{ width: '60px' }}>No</th>
            <th className="py-3 px-3">Jenis BPJS</th>
            <th className="py-3 px-3">Periode</th>
            <th className="py-3 px-3">Nama Dokumen</th>
            <th className="py-3 px-3">Tanggal Upload</th>
            <th className="py-3 px-3 text-center">Status</th>
            <th className="py-3 px-3 text-center" style={{ width: '130px' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {safeProofs.map((item, index) => {
            const isKesehatan = item?.bpjs_type === 'kesehatan';
            return (
              <tr key={item?.id || index}>
                <td className="text-center fw-medium text-muted">{index + 1}</td>
                <td>
                  <span
                    className={`badge rounded-pill ${
                      isKesehatan ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                    } px-2 py-1 fw-semibold`}
                  >
                    {isKesehatan ? 'BPJS Kesehatan' : 'BPJS Ketenagakerjaan'}
                  </span>
                </td>
                <td className="fw-medium text-dark">{formatPeriod(item?.period)}</td>
                <td className="text-dark fw-medium">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                    <span>{item?.document_name || item?.file_name || 'Bukti_BPJS.pdf'}</span>
                  </div>
                </td>
                <td className="text-muted small">{formatDate(item?.created_at)}</td>
                <td className="text-center">
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-medium">
                    Tersedia
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light text-primary rounded-2 border-0"
                      title="Lihat Detail"
                      onClick={() => onDetail(item)}
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-light text-success rounded-2 border-0"
                      title="Download"
                      onClick={() => onDownload(item)}
                    >
                      <i className="bi bi-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeBPJSTable;