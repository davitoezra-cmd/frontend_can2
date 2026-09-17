import React from 'react';
import { FaBriefcase, FaClock, FaCheckCircle, FaClipboardCheck } from 'react-icons/fa';

const BusinessTripApprovalStats = ({ dataList }) => {
  const total = dataList.length;
  const pending = dataList.filter((item) => item.status === 'pending').length;
  const approved = dataList.filter((item) => item.status === 'approved').length;
  const completed = dataList.filter((item) => item.status === 'completed').length;

  return (
    <div className="row g-3 mb-4">
      {/* Total Pengajuan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
              <FaBriefcase size={24} />
            </div>
            <div>
              <small className="text-muted d-block">Total Pengajuan</small>
              <h4 className="fw-bold mb-0">{total}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
              <FaClock size={24} />
            </div>
            <div>
              <small className="text-muted d-block">Pending</small>
              <h4 className="fw-bold mb-0">{pending}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Approved */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="p-3 bg-info bg-opacity-10 text-info rounded-3">
              <FaCheckCircle size={24} />
            </div>
            <div>
              <small className="text-muted d-block">Approved</small>
              <h4 className="fw-bold mb-0">{approved}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-3 h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
              <FaClipboardCheck size={24} />
            </div>
            <div>
              <small className="text-muted d-block">Completed</small>
              <h4 className="fw-bold mb-0">{completed}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTripApprovalStats;