import React from 'react';

const EmployeeTargetStats = ({ targets = [] }) => {
  const total = targets.length;
  const ongoing = targets.filter((t) => t.status === 'ongoing').length;
  const completed = targets.filter((t) => t.status === 'completed').length;

  const avgProgress = total > 0
    ? Math.round(targets.reduce((acc, curr) => acc + (Number(curr.progress_percent) || 0), 0) / total)
    : 0;

  const cards = [
    {
      title: 'Total Target',
      value: total,
      icon: 'bi-bullseye',
      bgIcon: 'bg-primary-subtle text-primary',
    },
    {
      title: 'Target Ongoing',
      value: ongoing,
      icon: 'bi-hourglass-split',
      bgIcon: 'bg-warning-subtle text-warning',
    },
    {
      title: 'Target Completed',
      value: completed,
      icon: 'bi-check-circle-fill',
      bgIcon: 'bg-success-subtle text-success',
    },
    {
      title: 'Rata-rata Progress',
      value: `${avgProgress}%`,
      icon: 'bi-percent',
      bgIcon: 'bg-info-subtle text-info',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((card, idx) => (
        <div className="col-12 col-sm-6 col-xl-3" key={idx}>
          <div className="card border-0 shadow-sm rounded-4 h-100 transition-all hover-lift">
            <div className="card-body p-3 p-md-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium d-block mb-1">{card.title}</span>
                <h3 className="fw-bold mb-0 text-dark">{card.value}</h3>
              </div>
              <div
                className={`rounded-4 d-flex align-items-center justify-content-center p-3 fs-4 ${card.bgIcon}`}
                style={{ width: '56px', height: '56px' }}
              >
                <i className={`bi ${card.icon}`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(EmployeeTargetStats);