import React from 'react';

const StatisticCards = ({ stats }) => {
  const cards = [
    { title: 'Hadir Bulan Ini', value: stats?.present_this_month ?? 0, icon: 'bi-check-circle-fill', color: 'text-success', bg: 'bg-success-subtle' },
    { title: 'Terlambat', value: stats?.late_this_month ?? 0, icon: 'bi-exclamation-triangle-fill', color: 'text-warning', bg: 'bg-warning-subtle' },
    

  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((card, idx) => (
        <div key={idx} className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-2">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">{card.title}</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-4 ${card.bg} ${card.color} d-flex align-items-center justify-content-center`}>
                <i className={`bi ${card.icon} fs-4`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticCards;


