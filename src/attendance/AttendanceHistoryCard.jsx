import React from 'react';

const AttendanceHistoryCard = ({ todayData }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        <h6 className="fw-bold text-dark mb-3">Riwayat Hari Ini</h6>
        {todayData ? (
          <div className="row g-3 text-center">
            <div className="col-4">
              <div className="p-2 border rounded-3">
                <small className="text-muted d-block">Status</small>
                <span className="fw-bold text-capitalize text-primary">{todayData.status || '-'}</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-2 border rounded-3">
                <small className="text-muted d-block">Check In</small>
                <span className="fw-bold text-dark">{todayData.check_in || '-'}</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-2 border rounded-3">
                <small className="text-muted d-block">Check Out</small>
                <span className="fw-bold text-dark">{todayData.check_out || '-'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted small mb-0 text-center py-2">Belum ada riwayat hari ini</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistoryCard;