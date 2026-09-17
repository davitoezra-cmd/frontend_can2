import React from 'react';

const RecentActivities = ({ activities }) => {

  // Format tanggal ke Indonesia
  const formatDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) return date;

    return parsedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="h-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <div 
            className="rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center" 
            style={{ width: 32, height: 32 }}
          >
            <i className="bi bi-clock-history text-primary fs-6"></i>
          </div>
          <h5 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            Aktivitas Terbaru
          </h5>
        </div>
        <span className="badge rounded-pill bg-light text-secondary border px-2.5 py-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
          {activities?.length || 0} Riwayat
        </span>
      </div>

      {activities?.length > 0 ? (
        <div className="timeline-container ps-2">
          {activities.map((act, index) => {
            const isLast = index === activities.length - 1;
            return (
              <div
                key={index}
                className={`position-relative ps-4 ${!isLast ? 'pb-4' : 'pb-1'}`}
                style={{
                  borderLeft: isLast ? '2px solid transparent' : '2px solid #e2e8f0'
                }}
              >
                {/* Node Dot Timeline */}
                <div
                  className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary shadow-sm"
                  style={{
                    width: 10,
                    height: 10,
                    marginLeft: -1,
                    marginTop: 6,
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 3px rgba(37,99,235,0.15)'
                  }}
                />

                {/* Card Item Activity */}
                <div 
                  className="p-3 rounded-3 border bg-white" 
                  style={{ 
                    borderColor: '#f1f5f9',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.03)'
                  }}
                >
                  <div className="fw-semibold small mb-2" style={{ color: '#0f172a' }}>
                    {formatDate(act.attendance_date)}
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
                    
                    {/* Check In Badge Style */}
                    <div 
                      className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-2 border" 
                      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                    >
                      <i className="bi bi-box-arrow-in-right text-success fw-bold"></i>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Check In:</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                        {act.check_in || '-'}
                      </strong>
                    </div>

                    {/* Check Out Badge Style */}
                    <div 
                      className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-2 border" 
                      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                    >
                      <i className="bi bi-box-arrow-right text-danger fw-bold"></i>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Check Out:</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                        {act.check_out || '-'}
                      </strong>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div 
          className="text-center py-5 rounded-3 border border-dashed" 
          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
        >
          <i className="bi bi-inbox text-muted fs-2 d-block mb-2"></i>
          <p className="text-secondary small mb-0" style={{ fontWeight: 500 }}>
            Belum ada riwayat aktivitas
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;