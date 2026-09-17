import React from 'react';
import { BiMoney, BiCheckCircle, BiTimeFive, BiGroup, BiDollar } from 'react-icons/bi';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0);
};

const PayrollStats = ({ stats }) => {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-6 col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div className="d-flex align-items-center">
            <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4 me-3">
              <BiMoney size={28} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Nominal Bulan Ini</p>
              <h4 className="fw-bold mb-0 text-dark">{formatRupiah(stats.totalNominal)}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div className="d-flex align-items-center">
            <div className="p-3 bg-info bg-opacity-10 text-info rounded-4 me-3">
              <BiDollar size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Generated</p>
              <h4 className="fw-bold mb-0">{stats.totalGenerated}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div className="d-flex align-items-center">
            <div className="p-3 bg-success bg-opacity-10 text-success rounded-4 me-3">
              <BiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Paid</p>
              <h4 className="fw-bold mb-0 text-success">{stats.totalPaid}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div className="d-flex align-items-center">
            <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4 me-3">
              <BiTimeFive size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Pending</p>
              <h4 className="fw-bold mb-0 text-warning">{stats.totalPending}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 col-lg-2">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
          <div className="d-flex align-items-center">
            <div className="p-3 bg-secondary bg-opacity-10 text-secondary rounded-4 me-3">
              <BiGroup size={24} />
            </div>
            <div>
              <p className="text-muted mb-0 small text-uppercase fw-bold">Employee</p>
              <h4 className="fw-bold mb-0">{stats.totalEmployee}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollStats;