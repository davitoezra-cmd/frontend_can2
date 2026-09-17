import React from 'react';

const EmployeePerformanceStats = ({ performances }) => {
  const total = performances.length;

  const gradeA = performances.filter((p) => p.grade === 'A').length;

  const avgScore =
    total > 0
      ? (
          performances.reduce((acc, curr) => acc + Number(curr.score || 0), 0) /
          total
        ).toFixed(1)
      : '0.0';

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthCount = performances.filter((p) => {
    if (!p.created_at) return false;
    const date = new Date(p.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  return (
    <div className="row g-3 mb-4">
      {/* Total Performance */}
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-primary">
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>
                Total Performance
              </div>
              <div className="fs-3 fw-bold text-dark mt-1">{total}</div>
            </div>
            <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-bar-chart-line fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Grade A */}
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-success">
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>
                Grade A
              </div>
              <div className="fs-3 fw-bold text-success mt-1">{gradeA}</div>
            </div>
            <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-award fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Average Score */}
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-info">
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>
                Average Score
              </div>
              <div className="fs-3 fw-bold text-info mt-1">{avgScore}</div>
            </div>
            <div className="bg-info bg-opacity-10 text-info rounded-3 p-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-graph-up-arrow fs-3"></i>
            </div>
          </div>
        </div>
      </div>

      {/* This Month */}
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 bg-white border-start border-4 border-warning">
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-uppercase text-muted fw-bold small" style={{ fontSize: '0.75rem' }}>
                This Month
              </div>
              <div className="fs-3 fw-bold text-warning mt-1">{thisMonthCount}</div>
            </div>
            <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-calendar-check fs-3"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceStats;