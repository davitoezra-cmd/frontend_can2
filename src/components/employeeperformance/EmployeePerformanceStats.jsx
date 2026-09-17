import React from 'react';

const EmployeePerformanceStats = ({ performances }) => {
  const totalPenilaian = performances.length;

  const avgScore = totalPenilaian > 0
    ? (performances.reduce((acc, curr) => acc + Number(curr.score || 0), 0) / totalPenilaian).toFixed(1)
    : 0;

  const maxScore = totalPenilaian > 0
    ? Math.max(...performances.map(p => Number(p.score || 0)))
    : 0;

  // Grade Terbaik (A > B > C > D > E)
  const bestGrade = totalPenilaian > 0
    ? performances.reduce((best, curr) => {
        const order = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
        const currGrade = curr.grade?.toUpperCase() || 'E';
        return (order[currGrade] || 5) < (order[best] || 5) ? currGrade : best;
      }, 'E')
    : '-';

  return (
    <div className="row g-3 mb-4">
      {/* Card 1: Total Penilaian */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 p-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-primary"
              style={{ width: '56px', height: '56px', backgroundColor: '#e0f2fe' }}
            >
              <i className="bi bi-clipboard-check fs-2"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold d-block">Total Penilaian</small>
              <h3 className="fw-bold mb-0 text-dark">{totalPenilaian}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Rata-rata Nilai */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 p-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-info"
              style={{ width: '56px', height: '56px', backgroundColor: '#e0f7fa' }}
            >
              <i className="bi bi-award-fill fs-2"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold d-block">Rata-rata Nilai</small>
              <h3 className="fw-bold mb-0 text-dark">{avgScore}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Grade Terbaik */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 p-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-warning"
              style={{ width: '56px', height: '56px', backgroundColor: '#fef3c7' }}
            >
              <i className="bi bi-trophy-fill fs-2"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold d-block">Grade Terbaik</small>
              <h3 className="fw-bold mb-0 text-dark">{bestGrade}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Nilai Tertinggi */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100 p-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-success"
              style={{ width: '56px', height: '56px', backgroundColor: '#dcfce7' }}
            >
              <i className="bi bi-star-fill fs-2"></i>
            </div>
            <div>
              <small className="text-muted fw-semibold d-block">Nilai Tertinggi</small>
              <h3 className="fw-bold mb-0 text-dark">{maxScore}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceStats;