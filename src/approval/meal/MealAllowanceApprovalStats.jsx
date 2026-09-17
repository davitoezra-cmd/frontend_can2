import React from 'react';
import {
  FaList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const MealAllowanceApprovalStats = ({ data }) => {
  const total = data.length;

  const pending = data.filter(
    (item) => item.status === 'pending'
  ).length;

  const approved = data.filter(
    (item) => item.status === 'approved'
  ).length;

  const rejected = data.filter(
    (item) => item.status === 'rejected'
  ).length;

  const stats = [
    {
      title: 'Total Pengajuan',
      value: total,
      icon: <FaList />,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      title: 'Pending',
      value: pending,
      icon: <FaClock />,
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      title: 'Approved',
      value: approved,
      icon: <FaCheckCircle />,
      color: '#059669',
      bg: '#D1FAE5',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: <FaTimesCircle />,
      color: '#DC2626',
      bg: '#FEE2E2',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="col-12 col-sm-6 col-xl-3"
        >
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
            <div className="d-flex align-items-center justify-content-between">

              {/* ==========================================
                  TEXT
              ========================================== */}

              <div>
                <span className="text-muted fw-medium d-block mb-1 fs-7">
                  {stat.title}
                </span>

                <h3 className="fw-bold text-dark mb-0">
                  {stat.value}
                </h3>
              </div>

              {/* ==========================================
                  ICON
              ========================================== */}

              <div
                className="rounded-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: stat.bg,
                  color: stat.color,
                  fontSize: '1.25rem',
                }}
              >
                {stat.icon}
              </div>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealAllowanceApprovalStats;