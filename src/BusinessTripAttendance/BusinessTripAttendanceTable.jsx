import React from 'react';
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaEye,
  FaBriefcase,
} from 'react-icons/fa';

const BusinessTripAttendanceTable = ({
  data,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenDetail,
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
      <div className="card border-0 shadow-sm rounded-3 text-center p-5">
        <div className="card-body">
          <FaBriefcase className="text-muted mb-3" size={48} />

          <h5 className="fw-semibold text-secondary">
            Belum ada dinas luar yang perlu dilakukan.
          </h5>

          <p className="text-muted small">
            Pengajuan dinas luar yang sudah disetujui akan muncul di sini
            untuk proses absensi Check In & Check Out.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-3" style={{ width: '60px' }}>
                No
              </th>

              <th>Tanggal</th>

              <th>Tujuan</th>

              <th>Keperluan</th>

              <th>Status</th>

              <th>Absensi</th>

              <th
                className="text-center"
                style={{ width: '100px' }}
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const isApproved = item.status === 'approved';
              const isCompleted = item.status === 'completed';
              const hasCheckedIn = !!item.check_in;
              const hasCheckedOut = !!item.check_out;

              return (
                <tr key={item.id || index}>
                  <td className="ps-3 fw-medium text-muted">
                    {index + 1}
                  </td>

                  {/* PERBAIKAN DI SINI */}
                  <td>
                    <span className="fw-semibold text-dark">
                      {formatDate(item.trip_date)}
                    </span>
                  </td>

                  <td className="fw-medium text-dark">
                    {item.destination || '-'}
                  </td>

                  <td>
                    {item.purpose || '-'}
                  </td>

                  <td>
                    {isApproved && (
                      <span className="badge bg-primary rounded-pill px-3 py-2">
                        Approved
                      </span>
                    )}

                    {isCompleted && (
                      <span className="badge bg-success rounded-pill px-3 py-2">
                        Completed
                      </span>
                    )}
                  </td>

                  <td>
                    {isApproved && !hasCheckedIn && (
                      <button
                        className="btn btn-success btn-sm d-inline-flex align-items-center gap-2 shadow-sm rounded-2"
                        onClick={() => onOpenCheckIn(item)}
                      >
                        <FaSignInAlt />
                        Check In
                      </button>
                    )}

                    {isApproved &&
                      hasCheckedIn &&
                      !hasCheckedOut && (
                        <button
                          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 shadow-sm rounded-2"
                          onClick={() => onOpenCheckOut(item)}
                        >
                          <FaSignOutAlt />
                          Check Out
                        </button>
                      )}

                    {(isCompleted ||
                      (hasCheckedIn && hasCheckedOut)) && (
                      <span className="badge bg-success d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill">
                        <FaCheckCircle />
                        Selesai
                      </span>
                    )}
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-light btn-sm text-secondary rounded-2 border"
                      title="Lihat Detail"
                      onClick={() => onOpenDetail(item)}
                    >
                      <FaEye />
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

export default BusinessTripAttendanceTable;