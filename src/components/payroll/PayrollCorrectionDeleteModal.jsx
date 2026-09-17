import React, { useState, useEffect } from 'react';
import {apiFetch} from '../../api/apiFetch';
import PayrollCorrectionTable from './PayrollCorrectionTable';

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

const PayrollDetailModal = ({ item, onClose }) => {
  const [payroll, setPayroll] = useState(item);

  useEffect(() => {
    setPayroll(item);
  }, [item]);

  // Callback untuk refresh data detail payroll ketika ada perubahan pada correction
  const refreshPayrollDetail = async () => {
    if (!payroll?.id) return;
    try {
      const res = await apiFetch.get(`/finance/payroll/${payroll.id}`);
      setPayroll(res.data.data || res.data);
    } catch (err) {
      console.error('Gagal memperbarui detail payroll:', err);
    }
  };

  if (!payroll) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div className="modal-content border-0 shadow-sm rounded-4">
          {/* Modal Header */}
          <div className="modal-header border-bottom px-4 py-3">
            <div>
              <h5 className="modal-title fw-bold text-dark">Detail Slip Gaji</h5>
              <small className="text-muted fs-8">
                {payroll.employee?.name || `Employee #${payroll.employee_id}`} - Periode {payroll.bulan}/{payroll.tahun}
              </small>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 bg-light">
            {/* Ringkasan Gaji & Potongan */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <h6 className="fw-bold text-success mb-3 fs-7">Rincian Pendapatan</h6>
                  <div className="d-flex justify-content-between mb-2 fs-7">
                    <span className="text-muted">Gaji Pokok:</span>
                    <span className="fw-semibold">{formatRupiah(payroll.total_gaji_dasar)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 fs-7">
                    <span className="text-muted">Bonus Datang Awal:</span>
                    <span className="fw-semibold">{formatRupiah(payroll.bonus_datang_awal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 fs-7">
                    <span className="text-muted">Total Lembur:</span>
                    <span className="fw-semibold">{formatRupiah(payroll.total_lembur)}</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <h6 className="fw-bold text-danger mb-3 fs-7">Rincian Potongan</h6>
                  <div className="d-flex justify-content-between mb-2 fs-7">
                    <span className="text-muted">Total Potongan:</span>
                    <span className="fw-semibold">{formatRupiah(payroll.total_potongan)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 fs-7">
                    <span className="text-muted">Total Kasbon:</span>
                    <span className="fw-semibold">{formatRupiah(payroll.total_kasbon)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Take Home Pay Card */}
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-white-50 fs-8 uppercase">Total Koreksi</small>
                  <h6 className="m-0 fw-bold">
                    {(payroll.total_koreksi || 0) >= 0 ? `+${formatRupiah(payroll.total_koreksi)}` : formatRupiah(payroll.total_koreksi)}
                  </h6>
                </div>
                <div className="text-end">
                  <small className="text-white-50 fs-8 uppercase">Take Home Pay Akhir</small>
                  <h4 className="m-0 fw-bold">{formatRupiah(payroll.take_home_pay)}</h4>
                </div>
              </div>
            </div>

            {/* SECTION BARU: PAYROLL CORRECTION TABLE */}
            <PayrollCorrectionTable
              payroll={payroll}
              onRefreshPayroll={refreshPayrollDetail}
            />
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-top px-4 py-3 bg-white">
            <button type="button" className="btn btn-secondary rounded-3 px-4 fs-7" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailModal;