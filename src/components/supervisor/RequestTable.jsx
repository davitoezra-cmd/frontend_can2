import React from 'react';

const RequestTable = ({ requests, onOpenDetail, activeTab }) => {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'approved':
        return 'bg-success text-white';
      case 'rejected':
        return 'bg-danger text-white';
      case 'completed':
        return 'bg-primary text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const formatTypeLabel = (item) => {
    const raw = item.request_type || activeTab;
    if (raw === 'cuti') return 'Cuti';
    if (raw === 'izin') return 'Izin';
    if (raw === 'sakit') return 'Sakit';
    if (raw === 'dinas_luar') return 'Dinas Luar';
    return raw;
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 bg-white p-5 text-center my-3">
        <i className="bi bi-inbox fs-1 text-secondary opacity-50 d-block mb-3"></i>
        <h5 className="fw-bold text-dark m-0">Belum Ada Data Pengajuan</h5>
        <p className="text-muted small m-0 mt-1">Tidak ada pengajuan yang sesuai dengan kriteria filter saat ini.</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr className="text-secondary small text-uppercase">
              <th className="py-3 px-4" style={{ width: '60px' }}>No</th>
              <th className="py-3">Nama Karyawan</th>
              <th className="py-3">Jenis</th>
              <th className="py-3">Tanggal</th>
              <th className="py-3">Status</th>
              <th className="py-3">Keterangan</th>
              <th className="py-3 text-center">Attachment</th>
              <th className="py-3 text-end px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item, index) => {
              const empName = item.employee?.name || item.employee_name || 'Karyawan';
              const dateDisplay = item.created_at
                ? new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-';
              const attachment = item.attachment || item.file_proof || item.lampiran;

              return (
              <tr key={`${item.request_type || activeTab}-${item.id}`}>
                  <td className="px-4 fw-semibold text-secondary">{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: '35px', height: '35px', fontSize: '0.85rem' }}
                      >
                        {empName.charAt(0).toUpperCase()}
                      </div>
                      <span className="fw-semibold text-dark">{empName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border fw-normal px-2.5 py-1.5 rounded-2">
                      {formatTypeLabel(item)}
                    </span>
                  </td>
                  <td className="text-secondary small">{dateDisplay}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(item.status)} rounded-pill px-3 py-1.5 text-capitalize`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                    {item.reason || item.notes || item.keterangan || '-'}
                  </td>
                  <td className="text-center">
                    {attachment ? (
                      <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-2">
                        <i className="bi bi-paperclip me-1"></i>Ada
                      </span>
                    ) : (
                      <span className="text-muted small">-</span>
                    )}
                  </td>
                  <td className="text-end px-4">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-3 px-3 d-inline-flex align-items-center gap-1"
                      onClick={() => onOpenDetail(item)}
                    >
                      <i className="bi bi-eye"></i>
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;