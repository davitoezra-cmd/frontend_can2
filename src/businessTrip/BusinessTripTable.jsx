import React from 'react';
import {
  FaEye,
  FaTrash,
  FaSignInAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

const BusinessTripTable = ({
  data,
  onDetail,
  onDelete,
  onCheckInOpen,
  onCheckOutOpen,
  onOpenCreate,
}) => {
  // Format tanggal
  const formatDate = (date) => {
    if (!date) return '-';

    const d = new Date(date);

    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-3 p-5 text-center">
        <div className="py-4">
          <FaExclamationCircle className="text-muted mb-3" size={48} />

          <h5 className="fw-semibold text-secondary">
            Belum ada pengajuan dinas luar
          </h5>

          <p className="text-muted mb-3">
            Silakan ajukan dinas luar baru untuk memulai.
          </p>

          <button
            className="btn btn-primary px-4 rounded-3"
            onClick={onOpenCreate}
          >
            + Ajukan Dinas Luar
          </button>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
            Pending
          </span>
        );

      case 'approved':
        return (
          <span className="badge bg-info text-dark px-3 py-2 rounded-pill">
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

  const renderAttendanceAction = (item) => {
    if (item.status === 'pending') {
      return (
        <span className="badge bg-warning text-dark px-3 py-2 rounded-2">
          Menunggu Approval
        </span>
      );
    }

    if (item.status === 'rejected') {
      return (
        <span className="badge bg-danger px-3 py-2 rounded-2">
          Ditolak
        </span>
      );
    }

    if (item.status === 'approved' && !item.check_in) {
      return (
        <button
          className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm px-3 py-1 rounded-2"
          onClick={() => onCheckInOpen(item)}
        >
          <FaSignInAlt />
          Check In
        </button>
      );
    }

    if (item.status === 'approved' && item.check_in && !item.check_out) {
      return (
        <button
          className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm px-3 py-1 rounded-2"
          onClick={() => onCheckOutOpen(item)}
        >
          <FaSignOutAlt />
          Check Out
        </button>
      );
    }

    if (item.status === 'completed' || item.check_out) {
      return (
        <span className="badge bg-success d-inline-flex align-items-center gap-1 px-3 py-2 rounded-2">
          <FaCheckCircle />
          Selesai
        </span>
      );
    }

    return <span className="text-muted">-</span>;
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light text-muted border-bottom">
            <tr>
              <th className="py-3 px-4">No</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Tujuan</th>
              <th className="py-3 px-4">Keperluan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Absensi</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                <td className="py-3 px-4 fw-semibold">
                  {index + 1}
                </td>

                <td className="py-3 px-4 fw-semibold">
                  {formatDate(item.trip_date)}
                </td>

                <td className="py-3 px-4 text-primary fw-medium">
                  {item.destination || '-'}
                </td>

                <td className="py-3 px-4 text-muted">
                  {item.purpose || '-'}
                </td>

                <td className="py-3 px-4">
                  {renderStatusBadge(item.status)}
                </td>

                <td className="py-3 px-4 text-center">
                  {renderAttendanceAction(item)}
                </td>

                <td className="py-3 px-4 text-center">
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                      onClick={() => onDetail(item.id)}
                      title="Detail"
                    >
                      <FaEye size={14} />
                    </button>

                    {item.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                        onClick={() => onDelete(item.id)}
                        title="Hapus"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessTripTable;