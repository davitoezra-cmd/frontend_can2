import React from 'react';
import { FaEye, FaTrashAlt } from 'react-icons/fa';

const MedicalTable = ({ data, onDetail, onDelete }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-success text-white';
      case 'rejected': return 'bg-danger text-white';
      default: return 'bg-warning text-dark';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 text-center" style={{ width: '60px' }}>No</th>
              <th className="py-3">Tanggal Sakit</th>
              <th className="py-3">Alasan Sakit</th>
              <th className="py-3">Status</th>
              <th className="px-4 py-3 text-center" style={{ width: '150px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  Belum ada data pengajuan izin sakit.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-4 text-center fw-medium text-muted">{index + 1}</td>
                  <td className="fw-semibold text-dark">{formatDate(item.sick_date)}</td>
                  <td className="text-secondary text-truncate" style={{ maxWidth: '280px' }}>
                    {item.reason}
                  </td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 text-capitalize ${getBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-3 d-inline-flex align-items-center gap-1"
                        onClick={() => onDetail(item.id)}
                      >
                        <FaEye /> Detail
                      </button>
                      {item.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-3 d-inline-flex align-items-center gap-1"
                          onClick={() => onDelete(item.id)}
                        >
                          <FaTrashAlt /> Hapus
                        </button>
                      )}
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

export default MedicalTable;
