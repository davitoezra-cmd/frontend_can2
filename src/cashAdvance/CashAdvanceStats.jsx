import React from 'react';
import { FaFileInvoiceDollar, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CashAdvanceStats = ({ data = [] }) => {
  const total = data.length;
  const pending = data.filter((item) => item.status === 'pending').length;
  const approved = data.filter((item) => item.status === 'approved').length;
  const rejected = data.filter((item) => item.status === 'rejected').length;

  const stats = [
    { title: 'Total Pengajuan', count: total, icon: <FaFileInvoiceDollar size={28} className="text-primary" />, border: 'border-primary' },
    { title: 'Pending', count: pending, icon: <FaClock size={28} className="text-warning" />, border: 'border-warning' },
    { title: 'Approved', count: approved, icon: <FaCheckCircle size={28} className="text-success" />, border: 'border-success' },
    { title: 'Rejected', count: rejected, icon: <FaTimesCircle size={28} className="text-danger" />, border: 'border-danger' },
  ];

  return (
    <div className="row g-3 mb-4">
      {stats.map((item, idx) => (
        <div key={idx} className="col-12 col-sm-6 col-xl-3">
          <div className={`card border-0 shadow-sm rounded-3 border-start border-4 ${item.border} h-100 transition-hover`}>
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">{item.title}</span>
                <h3 className="mb-0 mt-1 fw-bold text-dark">{item.count}</h3>
              </div>
              <div className="bg-light p-3 rounded-circle d-flex align-items-center justify-content-center">
                {item.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CashAdvanceStats;


