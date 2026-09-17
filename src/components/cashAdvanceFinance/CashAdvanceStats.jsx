import React from 'react';

const CashAdvanceStats = ({ data }) => {
  const totalKasbon = data.length;
  const sudahDicairkan = data.filter((item) => item.is_paid).length;
  const belumDicairkan = data.filter((item) => !item.is_paid).length;
  const totalNominal = data.reduce((acc, item) => acc + Number(item.amount || item.nominal || 0), 0);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="row g-3 mb-4">
      {/* Card 1: Total Kasbon */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-7 fw-semibold d-block mb-1">Total Kasbon</span>
              <h3 className="fw-bold mb-0 text-dark">{totalKasbon}</h3>
            </div>
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
              <i className="bi bi-wallet2 fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Sudah Dicairkan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-7 fw-semibold d-block mb-1">Sudah Dicairkan</span>
              <h3 className="fw-bold mb-0 text-success">{sudahDicairkan}</h3>
            </div>
            <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
              <i className="bi bi-check-circle fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Belum Dicairkan */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-7 fw-semibold d-block mb-1">Belum Dicairkan</span>
              <h3 className="fw-bold mb-0 text-warning">{belumDicairkan}</h3>
            </div>
            <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
              <i className="bi bi-clock-history fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Total Nominal Kasbon */}
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-7 fw-semibold d-block mb-1">Total Nominal</span>
              <h4 className="fw-bold mb-0 text-dark fs-5">{formatRupiah(totalNominal)}</h4>
            </div>
            <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
              <i className="bi bi-cash-stack fs-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashAdvanceStats;