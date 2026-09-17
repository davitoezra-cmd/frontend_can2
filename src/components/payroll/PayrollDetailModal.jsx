import React, { useState, useEffect, useCallback } from 'react';
import apiFetch from '../../api/apiFetch';
import PayrollCorrectionTable from './PayrollCorrectionTable';

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(num || 0)
    .replace('Rp', 'Rp ');

const PayrollDetailModal = ({ item, onClose }) => {
  const [payroll, setPayroll] = useState(item);

  useEffect(() => {
    setPayroll(item);
  }, [item]);

  const refreshPayrollDetail = useCallback(async () => {
    if (!payroll?.id) return;

    try {
      const res = await apiFetch.get(
        `/finance/payroll/${payroll.id}`
      );

      setPayroll(res.data.data || res.data);
    } catch (err) {
      console.error(
        'Gagal memperbarui detail payroll:',
        err
      );
    }
  }, [payroll?.id]);

  if (!payroll) return null;

  const getNamaBulan = (bulan) => {
    const namaBulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    return (
      namaBulan[parseInt(bulan, 10) - 1] || bulan
    );
  };

  return (
    <div className="payroll-detail-overlay">

      {/* =====================================================
          MODAL
      ====================================================== */}

      <div className="payroll-detail-dialog">

        <div className="payroll-detail-content">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="payroll-detail-header">

            <div className="payroll-detail-title-wrapper">

              <div className="payroll-detail-icon">
                <i className="bi bi-file-earmark-medical-fill"></i>
              </div>

              <div className="payroll-detail-title">

                <h5>
                  Detail Payroll
                </h5>

                <small>
                  Menampilkan rincian hasil generate payroll.
                </small>

              </div>

            </div>

            <div className="payroll-detail-summary">

              <div className="payroll-summary-item">

                <small>
                  <i className="bi bi-calendar-event me-1"></i>
                  Periode
                </small>

                <span>
                  {getNamaBulan(payroll.bulan)}{' '}
                  {payroll.tahun}
                </span>

              </div>

              <div className="payroll-summary-item">

                <small>
                  <i className="bi bi-person me-1"></i>
                  Employee
                </small>

                <span>
                  {payroll.employee?.name ||
                    `Employee #${payroll.employee_id}`}
                </span>

              </div>

              <span className="badge bg-primary rounded-pill px-3 py-2 text-capitalize">
                {payroll.status || 'Generated'}
              </span>

            </div>

            <button
              type="button"
              className="btn-close shadow-none payroll-detail-close"
              onClick={onClose}
            />

          </div>

          {/* =================================================
              BODY
          ================================================== */}

          <div className="payroll-detail-body">

            {/* =================================================
                INFORMASI UTAMA
            ================================================== */}

            <div className="row g-3 mb-4">

              {/* =================================================
                  ABSENSI
              ================================================== */}

              <div className="col-lg-4">

                <div className="payroll-info-card">

                  <h6 className="payroll-section-title text-primary">
                    <i className="bi bi-calendar-check-fill"></i>
                    Informasi Absensi
                  </h6>

                  <div className="payroll-info-row">
                    <span>
                      <i className="bi bi-check-circle-fill text-success"></i>
                      Total Hadir
                    </span>

                    <strong>
                      {payroll.total_hadir || 0} Hari
                    </strong>
                  </div>

                  <div className="payroll-info-row">
                    <span>
                      <i className="bi bi-clock-history text-warning"></i>
                      Total Terlambat
                    </span>

                    <strong className="text-danger">
                      {payroll.total_terlambat || 0} Hari
                    </strong>
                  </div>

                  <div className="payroll-info-row">
                    <span>
                      <i className="bi bi-person-fill text-info"></i>
                      Total Izin
                    </span>

                    <strong>
                      {payroll.total_izin || 0} Hari
                    </strong>
                  </div>

                  <div className="payroll-info-row">
                    <span>
                      <i className="bi bi-house-door-fill text-secondary"></i>
                      Total Cuti
                    </span>

                    <strong>
                      {payroll.total_cuti || 0} Hari
                    </strong>
                  </div>

                  <div className="payroll-info-row last">
                    <span>
                      <i className="bi bi-hospital-fill text-danger"></i>
                      Total Sakit
                    </span>

                    <strong>
                      {payroll.total_sakit || 0} Hari
                    </strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  PENDAPATAN
              ================================================== */}

              <div className="col-lg-4">

                <div className="payroll-info-card">

                  <h6 className="payroll-section-title text-success">
                    <i className="bi bi-arrow-up-right-circle-fill"></i>
                    Pendapatan
                  </h6>

                  {/* GAJI HARIAN */}

                  <div className="payroll-money-row">

                    <span>
                      Gaji Harian
                    </span>

                    <strong>
                      {formatRupiah(
                        payroll.gaji_harian ||
                        0
                      )}
                    </strong>

                  </div>

                  {/* TOTAL GAJI DASAR */}

                  <div className="payroll-money-row">

                    <span>
                      Total Gaji Dasar
                    </span>

                    <strong>
                      {formatRupiah(
                        payroll.total_gaji_dasar
                      )}
                    </strong>

                  </div>

                  {/* BONUS DATANG AWAL */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-sunrise-fill text-success me-1"></i>
                      Bonus Datang Awal
                    </span>

                    <strong className="text-success">

                      +

                      {formatRupiah(
                        payroll.bonus_datang_awal || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      BONUS KEDISIPLINAN
                  ================================================== */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-award-fill text-success me-1"></i>
                      Bonus Kedisiplinan
                    </span>

                    <strong className="text-success">

                      +

                      {formatRupiah(
                        payroll.bonus_kedisiplinan || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      TOTAL KOREKSI
                  ================================================== */}

                  <div className="payroll-money-row last">

                    <span>
                      Total Koreksi
                    </span>

                    <strong>

                      {(payroll.total_koreksi || 0) >= 0
                        ? `+${formatRupiah(
                            payroll.total_koreksi
                          )}`
                        : formatRupiah(
                            payroll.total_koreksi
                          )}

                    </strong>

                  </div>

                </div>

              </div>

              {/* =================================================
                  POTONGAN
              ================================================== */}

              <div className="col-lg-4">

                <div className="payroll-info-card">

                  <h6 className="payroll-section-title text-danger">
                    <i className="bi bi-arrow-down-right-circle-fill"></i>
                    Potongan
                  </h6>

                  {/* =================================================
                      POTONGAN TERLAMBAT
                  ================================================== */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-dash-circle-fill text-danger me-1"></i>
                      Potongan Terlambat
                    </span>

                    <strong className="text-danger">

                      -

                      {formatRupiah(
                        payroll.potongan_terlambat || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      POTONGAN UANG MAKAN
                  ================================================== */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-cup-hot-fill text-danger me-1"></i>
                      Potongan Uang Makan
                    </span>

                    <strong className="text-danger">

                      -

                      {formatRupiah(
                        payroll.total_uang_makan || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      POTONGAN IZIN
                  ================================================== */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-dash-circle-fill text-danger me-1"></i>
                      Potongan Izin
                    </span>

                    <strong className="text-danger">

                      -

                      {formatRupiah(
                        payroll.potongan_izin || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      POTONGAN CUTI
                  ================================================== */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-dash-circle-fill text-danger me-1"></i>
                      Potongan Cuti
                    </span>

                    <strong className="text-danger">

                      -

                      {formatRupiah(
                        payroll.potongan_cuti || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      TOTAL KASBON
                  ================================================== */}

                  <div className="payroll-money-row">

                    <span>
                      <i className="bi bi-wallet2 text-danger me-1"></i>
                      Total Kasbon
                    </span>

                    <strong className="text-danger">

                      -

                      {formatRupiah(
                        payroll.total_kasbon || 0
                      )}

                    </strong>

                  </div>

                  {/* =================================================
                      AKUMULASI POTONGAN
                  ================================================== */}

                  <div className="payroll-money-row last">

                    <span>
                      Akumulasi Potongan
                    </span>

                    <strong className="text-danger">

                      -

                      {formatRupiah(
                        payroll.total_potongan || 0
                      )}

                    </strong>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                RINGKASAN BONUS KEDISIPLINAN
            ================================================== */}

            {(Number(payroll.bonus_kedisiplinan) || 0) > 0 && (

              <div className="payroll-discipline-bonus">

                <div className="payroll-discipline-bonus-icon">
                  <i className="bi bi-award-fill"></i>
                </div>

                <div className="payroll-discipline-bonus-info">

                  <strong>
                    Bonus Kedisiplinan
                  </strong>

                  <small>
                    Karyawan tidak pernah terlambat selama periode payroll.
                  </small>

                </div>

                <div className="payroll-discipline-bonus-value">

                  +
                  {formatRupiah(
                    payroll.bonus_kedisiplinan
                  )}

                </div>

              </div>

            )}

            {/* =================================================
                TAKE HOME PAY
            ================================================== */}

            <div className="payroll-take-home-pay">

              <div className="payroll-take-home-left">

                <div className="payroll-take-home-icon">
                  <i className="bi bi-cash-stack"></i>
                </div>

                <div>

                  <h6>
                    TAKE HOME PAY
                  </h6>

                  <small>
                    Total penerimaan bersih karyawan
                  </small>

                </div>

              </div>

              <div className="payroll-take-home-value">

                {formatRupiah(
                  payroll.take_home_pay
                )}

              </div>

            </div>

            {/* =================================================
                PAYROLL CORRECTION
            ================================================== */}

            <div className="payroll-correction-section">

              <PayrollCorrectionTable
                payroll={payroll}
                onRefreshPayroll={
                  refreshPayrollDetail
                }
              />

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="payroll-detail-footer">

            <div className="d-flex align-items-center gap-2">

              <span className="text-secondary small">
                Status Payroll:
              </span>

              <span className="badge bg-primary rounded-pill px-3 py-1 text-capitalize">
                {payroll.status || 'Generated'}
              </span>

            </div>

            <button
              type="button"
              className="btn btn-secondary rounded-3 px-4"
              onClick={onClose}
            >
              Tutup
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          STYLE
      ====================================================== */}

      <style>{`

        /* =====================================================
           OVERLAY
        ===================================================== */

        .payroll-detail-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px;

          background: rgba(0, 0, 0, 0.55);

          overflow: hidden;
        }


        /* =====================================================
           DIALOG
        ===================================================== */

        .payroll-detail-dialog {
          width: 100%;
          max-width: 1100px;

          height: auto;
          max-height: calc(100vh - 48px);

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .payroll-detail-content {
          width: 100%;

          max-height: calc(100vh - 48px);

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.25);

          display: flex;
          flex-direction: column;

          overflow: hidden;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .payroll-detail-header {
          min-height: 76px;

          padding: 16px 20px;

          display: flex;
          align-items: center;

          gap: 18px;

          background: #ffffff;

          border-bottom: 1px solid #e9ecef;

          flex-shrink: 0;
        }


        .payroll-detail-title-wrapper {
          display: flex;
          align-items: center;

          gap: 12px;

          min-width: 240px;

          flex: 1;
        }


        .payroll-detail-icon {
          width: 42px;
          height: 42px;

          border-radius: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #0d6efd;
          color: white;

          font-size: 20px;

          flex-shrink: 0;
        }


        .payroll-detail-title h5 {
          margin: 0;

          font-size: 17px;

          font-weight: 700;

          color: #212529;
        }


        .payroll-detail-title small {
          display: block;

          margin-top: 2px;

          color: #6c757d;

          font-size: 11px;
        }


        .payroll-detail-summary {
          display: flex;
          align-items: center;

          gap: 22px;

          flex-shrink: 0;
        }


        .payroll-summary-item {
          display: flex;
          flex-direction: column;

          text-align: right;
        }


        .payroll-summary-item small {
          font-size: 10px;

          color: #6c757d;

          margin-bottom: 2px;
        }


        .payroll-summary-item span {
          font-size: 12px;

          font-weight: 700;

          color: #212529;

          white-space: nowrap;
        }


        .payroll-detail-close {
          flex-shrink: 0;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .payroll-detail-body {
          padding: 20px;

          background: #f8f9fa;

          overflow-y: auto;
          overflow-x: hidden;

          flex: 1;

          min-height: 0;
        }


        /* =====================================================
           INFORMATION CARD
        ===================================================== */

        .payroll-info-card {
          height: 100%;

          padding: 16px;

          background: #ffffff;

          border-radius: 14px;

          box-shadow:
            0 2px 10px rgba(0, 0, 0, 0.05);
        }


        .payroll-section-title {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-bottom: 14px;

          font-size: 13px;

          font-weight: 700;
        }


        .payroll-info-row,
        .payroll-money-row {
          min-height: 34px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          font-size: 11px;

          border-bottom: 1px solid #f0f0f0;
        }


        .payroll-info-row span,
        .payroll-money-row span {
          color: #6c757d;
        }


        .payroll-info-row span i,
        .payroll-money-row span i {
          margin-right: 6px;
        }


        .payroll-info-row strong,
        .payroll-money-row strong {
          color: #212529;

          white-space: nowrap;
        }


        .payroll-info-row.last,
        .payroll-money-row.last {
          border-bottom: 0;
        }


        /* =====================================================
           BONUS KEDISIPLINAN
        ====================================================== */

        .payroll-discipline-bonus {
          width: 100%;

          min-height: 66px;

          margin-bottom: 16px;

          padding: 12px 16px;

          display: flex;
          align-items: center;

          gap: 12px;

          background: #f0fdf4;

          border: 1px solid #bbf7d0;

          border-radius: 14px;
        }


        .payroll-discipline-bonus-icon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #dcfce7;

          color: #16a34a;

          font-size: 18px;
        }


        .payroll-discipline-bonus-info {
          display: flex;
          flex-direction: column;

          flex: 1;

          min-width: 0;
        }


        .payroll-discipline-bonus-info strong {
          font-size: 12px;

          font-weight: 700;

          color: #166534;
        }


        .payroll-discipline-bonus-info small {
          margin-top: 2px;

          font-size: 10px;

          color: #4d7c0f;
        }


        .payroll-discipline-bonus-value {
          font-size: 15px;

          font-weight: 800;

          color: #16a34a;

          white-space: nowrap;
        }


        /* =====================================================
           TAKE HOME PAY
        ====================================================== */

        .payroll-take-home-pay {
          width: 100%;

          min-height: 78px;

          padding: 14px 18px;

          margin-bottom: 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          border-radius: 14px;

          background: #eef6ff;

          border: 1px solid #b9d7ff;

          box-shadow:
            0 2px 8px rgba(13, 110, 253, 0.06);
        }


        .payroll-take-home-left {
          display: flex;
          align-items: center;

          gap: 12px;
        }


        .payroll-take-home-icon {
          width: 42px;
          height: 42px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #0d6efd;

          color: #ffffff;

          font-size: 19px;

          flex-shrink: 0;
        }


        .payroll-take-home-left h6 {
          margin: 0;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: 0.5px;

          color: #0d6efd;
        }


        .payroll-take-home-left small {
          display: block;

          margin-top: 2px;

          font-size: 10px;

          color: #6c757d;
        }


        .payroll-take-home-value {
          font-size: 22px;

          font-weight: 800;

          color: #0d6efd;

          white-space: nowrap;
        }


        /* =====================================================
           CORRECTION
        ====================================================== */

        .payroll-correction-section {
          width: 100%;

          background: #ffffff;

          border-radius: 14px;

          padding: 16px;

          box-shadow:
            0 2px 10px rgba(0, 0, 0, 0.05);

          overflow-x: auto;
        }


        /* =====================================================
           FOOTER
        ====================================================== */

        .payroll-detail-footer {
          min-height: 64px;

          padding: 12px 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          background: #ffffff;

          border-top: 1px solid #e9ecef;

          flex-shrink: 0;
        }


        /* =====================================================
           LARGE DESKTOP
        ====================================================== */

        @media (min-width: 1400px) {

          .payroll-detail-dialog {
            max-width: 1120px;
          }

        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (min-width: 768px) and (max-width: 1199.98px) {

          .payroll-detail-overlay {
            padding: 18px;
          }

          .payroll-detail-dialog {
            max-width: 900px;
          }

          .payroll-detail-summary {
            gap: 12px;
          }

          .payroll-detail-header {
            gap: 10px;
          }

          .payroll-detail-title-wrapper {
            min-width: 180px;
          }

        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 767.98px) {

          .payroll-detail-overlay {
            padding: 10px;
            align-items: center;
          }


          .payroll-detail-dialog {
            width: 100%;
            max-width: 100%;

            max-height: calc(100vh - 20px);
          }


          .payroll-detail-content {
            max-height: calc(100vh - 20px);

            border-radius: 14px;
          }


          .payroll-detail-header {
            padding: 14px;

            gap: 10px;

            align-items: flex-start;
          }


          .payroll-detail-title-wrapper {
            min-width: 0;
          }


          .payroll-detail-icon {
            width: 36px;
            height: 36px;

            font-size: 17px;
          }


          .payroll-detail-title h5 {
            font-size: 15px;
          }


          .payroll-detail-title small {
            font-size: 9px;
          }


          .payroll-detail-summary {
            display: none;
          }


          .payroll-detail-body {
            padding: 14px;
          }


          .payroll-info-card {
            padding: 14px;
          }


          .payroll-discipline-bonus {
            padding: 10px 12px;
          }


          .payroll-discipline-bonus-icon {
            width: 36px;
            height: 36px;

            font-size: 16px;
          }


          .payroll-discipline-bonus-info strong {
            font-size: 11px;
          }


          .payroll-discipline-bonus-info small {
            font-size: 9px;
          }


          .payroll-discipline-bonus-value {
            font-size: 13px;
          }


          .payroll-take-home-pay {
            min-height: 70px;

            padding: 12px;

            margin-bottom: 14px;
          }


          .payroll-take-home-icon {
            width: 36px;
            height: 36px;

            font-size: 16px;
          }


          .payroll-take-home-value {
            font-size: 17px;
          }


          .payroll-take-home-left h6 {
            font-size: 10px;
          }


          .payroll-take-home-left small {
            font-size: 8px;
          }


          .payroll-detail-footer {
            padding: 10px 14px;
          }

        }

      `}</style>

    </div>
  );
};

export default PayrollDetailModal;