import React from 'react';
import { FaCalendarAlt, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const LeaveStats = ({ data }) => {
  const total = data.length;
  const pending = data.filter((item) => item.status === 'pending').length;
  const approved = data.filter((item) => item.status === 'approved').length;
  const rejected = data.filter((item) => item.status === 'rejected').length;

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted small fw-medium mb-1">Total Pengajuan</p>
              <h3 className="fw-bold mb-0 text-dark">{total}</h3>
            </div>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <FaCalendarAlt size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted small fw-medium mb-1">Pending</p>
              <h3 className="fw-bold mb-0 text-dark">{pending}</h3>
            </div>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
              <FaHourglassHalf size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted small fw-medium mb-1">Approved</p>
              <h3 className="fw-bold mb-0 text-dark">{approved}</h3>
            </div>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#DCFCE7', color: '#22C55E' }}>
              <FaCheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted small fw-medium mb-1">Rejected</p>
              <h3 className="fw-bold mb-0 text-dark">{rejected}</h3>
            </div>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
              <FaTimesCircle size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveStats;