import React from 'react';

const AttendanceStatus = ({ todayData, today }) => {
  // Mendukung kedua props
  const data = todayData || today;

  // Format Jam
  const formatTime = (timeString) => {
    if (!timeString) return '';

    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }

    try {
      const date = new Date(timeString);

      return isNaN(date.getTime())
        ? ''
        : date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
    } catch {
      return '';
    }
  };

  // Badge Status
  const getStatusBadge = () => {
    const status = data?.status?.toLowerCase() || '';

    if (status === 'hadir' || status === 'present') {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill fw-semibold">
          <i className="bi bi-check-circle me-1"></i>
          Hadir
        </span>
      );
    }

    if (status === 'terlambat' || status === 'late') {
      return (
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1.5 rounded-pill fw-semibold">
          <i className="bi bi-exclamation-circle me-1"></i>
          Terlambat
        </span>
      );
    }

    

    return (
      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1.5 rounded-pill fw-semibold">
        <i className="bi bi-dash-circle me-1"></i>
        Belum Absen
      </span>
    );
  };

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary"></i>
            Status Hari Ini
          </h6>
          <p className="text-muted small m-0 mt-1">
            Catatan waktu masuk dan keluar Anda
          </p>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Check In & Check Out */}
      <div className="row g-2">
        <div className="col-6">
          <div className="p-3 bg-light rounded-4 border text-center">
            <span className="text-muted small d-block mb-1 font-monospace">
              <i className="bi bi-box-arrow-in-right text-success me-1"></i>
              Check In
            </span>

            <h4 className="fw-bold text-dark m-0">
              {data?.check_in ? formatTime(data.check_in) : ''}
            </h4>
          </div>
        </div>

        <div className="col-6">
          <div className="p-3 bg-light rounded-4 border text-center">
            <span className="text-muted small d-block mb-1 font-monospace">
              <i className="bi bi-box-arrow-right text-danger me-1"></i>
              Check Out
            </span>

            <h4 className="fw-bold text-dark m-0">
              {data?.check_out ? formatTime(data.check_out) : ''}
            </h4>
          </div>
        </div>
      </div>

      {/* Bonus */}
      {data?.bonus_didapat && (
        <div className="mt-3 text-center">
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-2">
            <i className="bi bi-star-fill me-1"></i>
            Bonus Absensi Didapat
          </span>
        </div>
      )}
    </div>
  );
};

export default AttendanceStatus;