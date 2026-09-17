import React from 'react';
import { FaEye } from 'react-icons/fa';

const MedicalApprovalTable = ({ data, onDetail }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'rejected':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">Nama Employee</th>
              <th className="py-3 px-4">Jenis</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tanggal Pengajuan</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  Tidak ada data pengajuan sakit/medical.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-4 fw-medium">{index + 1}</td>
                  <td className="px-4 fw-semibold text-dark">{item.employee?.name || '-'}</td>
                  <td className="px-4">{item.type || 'Sakit/Medical'}</td>
                  <td className="px-4">
                    <span className={`badge rounded-pill px-3 py-2 text-capitalize ${getBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4">{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-4 text-center">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-3 d-inline-flex align-items-center gap-1"
                      onClick={() => onDetail(item.id)}
                    >
                      <FaEye /> Detail
                    </button>
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

export default MedicalApprovalTable;
