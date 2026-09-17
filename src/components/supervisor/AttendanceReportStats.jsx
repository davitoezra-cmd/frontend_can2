import React from 'react';

const AttendanceReportStats = ({ stats }) => {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3">
        <div className="card border-0 shadow-sm border-start border-success border-4">
          <div className="card-body">
            <div className="text-muted small fw-bold text-uppercase">Hadir</div>
            <div className="fs-3 fw-bold text-success mt-1">{stats.hadir}</div>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-0 shadow-sm border-start border-warning border-4">
          <div className="card-body">
            <div className="text-muted small fw-bold text-uppercase">Terlambat</div>
            <div className="fs-3 fw-bold text-warning mt-1">{stats.terlambat}</div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default AttendanceReportStats;