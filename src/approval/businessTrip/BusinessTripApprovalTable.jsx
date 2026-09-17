import React from 'react';
import { FaEye, FaBriefcase } from 'react-icons/fa';

const BusinessTripApprovalTable = ({ data, onOpenDetail }) => {
  const renderBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
            Pending
          </span>
        );

      case 'approved':
        return (
          <span className="badge bg-primary px-3 py-2 rounded-pill">
            Approved
          </span>
        );

      case 'rejected':
        return (
          <span className="badge bg-danger px-3 py-2 rounded-pill">
            Rejected
          </span>
        );

      case 'completed':
        return (
          <span className="badge bg-success px-3 py-2 rounded-pill">
            Completed
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary px-3 py-2 rounded-pill">
            {status}
          </span>
        );
    }
  };

  // Format tanggal
  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-3 text-center py-5">
        <div className="card-body">
          <div className="p-3 bg-light rounded-circle d-inline-block mb-3">
            <FaBriefcase size={36} className="text-muted" />
          </div>

          <h5 className="fw-semibold text-muted mb-0">
            Belum ada pengajuan dinas luar.
          </h5>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 ps-3" style={{ width: '60px' }}>
                No
              </th>

              <th className="py-3">Employee</th>

              <th className="py-3">Tanggal</th>

              <th className="py-3">Tujuan</th>

              <th className="py-3">Keperluan</th>

              <th className="py-3 text-center">Status</th>

              <th
                className="py-3 text-center"
                style={{ width: '120px' }}
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                <td className="ps-3 fw-semibold text-muted">
                  {index + 1}
                </td>

                <td>
                  <span className="fw-semibold text-dark">
                    {item.employee?.name || item.employee_name || '-'}
                  </span>
                </td>

                <td>
                  <small className="text-muted fw-semibold">
                    {formatDate(item.start_date)} s/d{' '}
                    {formatDate(item.end_date)}
                  </small>
                </td>

                <td>{item.destination || '-'}</td>

                <td>{item.purpose || '-'}</td>

                <td className="text-center">
                  {renderBadge(item.status)}
                </td>

                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-primary rounded-2 d-inline-flex align-items-center gap-1"
                    onClick={() => onOpenDetail(item)}
                  >
                    <FaEye />
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessTripApprovalTable;