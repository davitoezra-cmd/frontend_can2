import React from 'react';

const AttendanceStatus = ({ today }) => {
  // Helper untuk membersihkan format jam jika dari API membawa format HH:mm:ss
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  // Fungsi untuk mendapatkan badge status yang sesuai
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'hadir':
        return (
          <span 
            className="badge rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: '#ffffff', 
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem', 
              fontWeight: 600,
              letterSpacing: '0.03em'
            }}
          >
            <i className="bi bi-check-circle-fill fs-6"></i> Hadir
          </span>
        );
      case 'terlambat':
        return (
          <span 
            className="badge rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
              color: '#ffffff', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
              fontSize: '0.75rem', 
              fontWeight: 600,
              letterSpacing: '0.03em'
            }}
          >
            <i className="bi bi-exclamation-triangle-fill fs-6"></i> Terlambat
          </span>
        );
      case 'tidak hadir':
      case 'alpha':
        return (
          <span 
            className="badge rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              color: '#ffffff', 
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              fontSize: '0.75rem', 
              fontWeight: 600,
              letterSpacing: '0.03em'
            }}
          >
            <i className="bi bi-x-circle-fill fs-6"></i> Tidak Hadir
          </span>
        );
      default:
        return (
          <span 
            className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1.5 border"
            style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#64748b', 
              borderColor: '#e2e8f0',
              fontSize: '0.75rem', 
              fontWeight: 600 
            }}
          >
            <i className="bi bi-clock-history fs-6"></i> Belum Absen
          </span>
        );
    }
  };

  return (
    <div className="w-100">
      {/* Header Section */}
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center" 
              style={{ 
                width: 36, 
                height: 36,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              <i className="bi bi-person-workspace fs-6"></i>
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                Status Hari Ini
              </h5>
            </div>
          </div>
          <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem', paddingLeft: '2px' }}>
            Aktivitas presensi real-time harian Anda
          </p>
        </div>

        {/* Dynamic Status Badge */}
        <div>
          {renderStatusBadge(today?.status)}
        </div>
      </div>

      {/* Futuristic Time Cards (Posisi dinaikkan langsung ke bawah header) */}
      <div className="row g-3 mt-1">
        {/* Check In Box */}
        <div className="col-12 col-sm-6">
          <div 
            className="p-3 rounded-4 border position-relative overflow-hidden" 
            style={{ 
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', 
              borderColor: '#e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            <div 
              className="position-absolute top-0 start-0 end-0" 
              style={{ height: '3px', background: 'linear-gradient(90deg, #10b981, #34d399)' }} 
            />

            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold text-uppercase" style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.05em' }}>
                Check In
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 24, height: 24, backgroundColor: '#ecfdf5', color: '#10b981' }}
              >
                <i className="bi bi-box-arrow-in-right fs-6 fw-bold"></i>
              </div>
            </div>

            <div 
              className="fw-extrabold font-monospace my-1" 
              style={{ 
                color: today?.check_in ? '#0f172a' : '#94a3b8', 
                fontSize: '1.75rem', 
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}
            >
              {formatTime(today?.check_in)}
            </div>

            <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              <i className="bi bi-clock"></i>
              <span>{today?.check_in ? 'Tercatat otomatis' : 'Menunggu absen'}</span>
            </div>
          </div>
        </div>

        {/* Check Out Box */}
        <div className="col-12 col-sm-6">
          <div 
            className="p-3 rounded-4 border position-relative overflow-hidden" 
            style={{ 
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', 
              borderColor: '#e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            <div 
              className="position-absolute top-0 start-0 end-0" 
              style={{ height: '3px', background: 'linear-gradient(90deg, #f43f5e, #fb7185)' }} 
            />

            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold text-uppercase" style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.05em' }}>
                Check Out
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 24, height: 24, backgroundColor: '#fff1f2', color: '#f43f5e' }}
              >
                <i className="bi bi-box-arrow-right fs-6 fw-bold"></i>
              </div>
            </div>

            <div 
              className="fw-extrabold font-monospace my-1" 
              style={{ 
                color: today?.check_out ? '#0f172a' : '#94a3b8', 
                fontSize: '1.75rem', 
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}
            >
              {formatTime(today?.check_out)}
            </div>

            <div className="d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              <i className="bi bi-clock"></i>
              <span>{today?.check_out ? 'Tercatat otomatis' : 'Belum jam pulang'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatus;