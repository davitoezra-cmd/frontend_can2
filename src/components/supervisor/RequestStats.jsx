import React from 'react';

const RequestStats = ({ statistics }) => {
  const statsList = [
    {
      title: 'Pending',
      value: statistics?.pending || 0,
      icon: 'bi-clock-history',
      bgColor: 'bg-warning-subtle',
      textColor: 'text-warning',
      borderColor: 'border-warning-subtle',
    },
    {
      title: 'Approved',
      value: statistics?.approved || 0,
      icon: 'bi-check-circle',
      bgColor: 'bg-success-subtle',
      textColor: 'text-success',
      borderColor: 'border-success-subtle',
    },
    {
      title: 'Rejected',
      value: statistics?.rejected || 0,
      icon: 'bi-x-circle',
      bgColor: 'bg-danger-subtle',
      textColor: 'text-danger',
      borderColor: 'border-danger-subtle',
    },
    {
      title: 'Total Pengajuan',
      value: statistics?.total || 0,
      icon: 'bi-file-earmark-text',
      bgColor: 'bg-primary-subtle',
      textColor: 'text-primary',
      borderColor: 'border-primary-subtle',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {statsList.map((stat, idx) => (
        <div className="col-12 col-sm-6 col-lg-3" key={idx}>
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100 p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small fw-semibold m-0">{stat.title}</p>
                <h3 className="fw-bold text-dark m-0 mt-1">{stat.value}</h3>
              </div>
              <div
                className={`rounded-4 p-3 d-flex align-items-center justify-content-center ${stat.bgColor} ${stat.textColor} border ${stat.borderColor}`}
                style={{ width: '52px', height: '52px' }}
              >
                <i className={`bi ${stat.icon} fs-4`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestStats;