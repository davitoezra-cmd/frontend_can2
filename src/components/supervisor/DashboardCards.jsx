import React from 'react';

const DashboardCards = ({ statistics }) => {
  const cards = [
    {
      title: 'Total Karyawan',
      value: statistics?.total_employee || 0,
      icon: 'bi-people-fill',
      borderColor: 'border-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary-subtle',
    },
    {
      title: 'Hadir Hari Ini',
      value: statistics?.hadir || 0,
      icon: 'bi-check-circle-fill',
      borderColor: 'border-success',
      textColor: 'text-success',
      bgColor: 'bg-success-subtle',
    },
    {
      title: 'Terlambat',
      value: statistics?.terlambat || 0,
      icon: 'bi-clock-history',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      bgColor: 'bg-warning-subtle',
    },
  ];

  return (
    <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
      {cards.map((card, index) => (
        <div className="col" key={index}>
          <div className={`card border-0 shadow-sm border-start border-4 ${card.borderColor} h-100`}>
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <div className="text-muted small fw-bold text-uppercase mb-1">{card.title}</div>
                <div className={`fs-3 fw-bold ${card.textColor}`}>{card.value}</div>
              </div>
              <div
                className={`rounded-circle p-3 d-flex align-items-center justify-content-center ${card.bgColor} ${card.textColor}`}
                style={{ width: '48px', height: '48px' }}
              >
                <i className={`bi ${card.icon} fs-4`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;