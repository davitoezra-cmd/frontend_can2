import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {apiFetch} from '../api/apiFetch';

import SidebarFinance from '../layouts/SidebarFinance';
import NavbarFinance from '../layouts/NavbarFinance';

import PayrollStats from '../components/payroll/PayrollStats';
import PayrollFilter from '../components/payroll/PayrollFilter';
import PayrollTable from '../components/payroll/PayrollTable';
import PayrollDetailModal from '../components/payroll/PayrollDetailModal';
import PayrollGenerateModal from '../components/payroll/PayrollGenerateModal';
import LoadingSpinner from '../components/LoadingSpinner';

const PayrollPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    bulan: '',
    tahun: '',
    status: '',
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [paymentModal, setPaymentModal] = useState({
    open: false,
    payroll: null,
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Payroll
  |--------------------------------------------------------------------------
  */

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      if (filters.bulan) {
        params.bulan = filters.bulan;
      }

      if (filters.tahun) {
        params.tahun = filters.tahun;
      }

      const res = await apiFetch.get('/finance/payroll', {
        params,
      });

      setPayrolls(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Gagal memuat daftar payroll.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [filters.bulan, filters.tahun]);

  /*
  |--------------------------------------------------------------------------
  | Filter
  |--------------------------------------------------------------------------
  */

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Generate Payroll
  |--------------------------------------------------------------------------
  */

  const handleGenerate = async (formData) => {
    setActionLoading(true);

    try {
      const res = await apiFetch.post(
        '/finance/payroll/generate',
        formData
      );

      toast.success(
        res.data.message ||
        'Payroll berhasil di-generate!'
      );

      setIsGenerateOpen(false);

      fetchPayrolls();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Gagal generate payroll'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Buka Modal Pembayaran
  |--------------------------------------------------------------------------
  */

  const handleMarkPaid = (payroll) => {
    setPaymentMethod('');

    setPaymentModal({
      open: true,
      payroll: payroll,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Tutup Payment Modal
  |--------------------------------------------------------------------------
  */

  const closePaymentModal = () => {
    if (paymentLoading) {
      return;
    }

    setPaymentModal({
      open: false,
      payroll: null,
    });

    setPaymentMethod('');
  };

  /*
  |--------------------------------------------------------------------------
  | Proses Pembayaran
  |--------------------------------------------------------------------------
  */

  const handlePaymentSubmit = async () => {
    if (!paymentModal.payroll) {
      return;
    }

    if (!paymentMethod) {
      toast.warning(
        'Silakan pilih metode pembayaran.'
      );
      return;
    }

    setPaymentLoading(true);

    try {
      const res = await apiFetch.put(
        `/finance/payroll/${paymentModal.payroll.id}/paid`,
        {
          payment_method: paymentMethod,
        }
      );

      toast.success(
        res.data.message ||
        'Payroll berhasil dibayarkan.'
      );

      setPaymentModal({
        open: false,
        payroll: null,
      });

      setPaymentMethod('');

      fetchPayrolls();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Gagal memproses pembayaran payroll.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Payroll
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Yakin ingin menghapus data payroll ini?'
      )
    ) {
      return;
    }

    try {
      const res = await apiFetch.delete(
        `/finance/payroll/${id}`
      );

      toast.success(
        res.data.message ||
        'Data payroll berhasil dihapus'
      );

      fetchPayrolls();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Gagal menghapus data'
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Filter Client Side
  |--------------------------------------------------------------------------
  */

  const filteredPayrolls = payrolls.filter((item) => {
    const keyword = filters.search.toLowerCase().trim();

    const employeeName =
      item.employee?.name?.toLowerCase() || '';

    const matchesName =
      !keyword ||
      employeeName.includes(keyword);

    const matchesStatus =
      filters.status
        ? item.status === filters.status
        : true;

    return matchesName && matchesStatus;
  });

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const stats = {
    totalNominal: payrolls.reduce(
      (acc, curr) =>
        acc + Number(curr.take_home_pay || 0),
      0
    ),

    totalGenerated: payrolls.filter(
      (p) => p.status === 'generated'
    ).length,

    totalPaid: payrolls.filter(
      (p) => p.status === 'paid'
    ).length,

    totalPending: payrolls.filter(
      (p) => p.status !== 'paid'
    ).length,

    totalEmployee: new Set(
      payrolls.map((p) => p.employee_id)
    ).size,
  };

  return (
    <div className="payroll-page d-flex min-vh-100">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <SidebarFinance
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="payroll-main-wrapper">

        <NavbarFinance
          title="Penggajian & Payroll"
          onToggleSidebar={toggleSidebar}
        />

        <main className="payroll-main-content">

          {/* =================================================
              STATISTICS
          ================================================== */}

          <PayrollStats stats={stats} />

          {/* =================================================
              FILTER
          ================================================== */}

          <PayrollFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onOpenGenerateModal={() =>
              setIsGenerateOpen(true)
            }
          />

          {/* =================================================
              TABLE
          ================================================== */}

          <section className="payroll-table-card">

            {loading ? (

              <div className="payroll-loading">
                <LoadingSpinner />
              </div>

            ) : error ? (

              <div className="p-4">
                <div className="alert alert-danger mb-0">
                  {error}
                </div>
              </div>

            ) : filteredPayrolls.length === 0 ? (

              <div className="payroll-empty-state">

                <div className="empty-icon">
                  <i className="bi bi-receipt"></i>
                </div>

                <div className="fw-semibold text-dark mb-1">
                  Tidak ada data payroll
                </div>

                <div className="text-muted small">
                  Tidak ada data payroll yang ditemukan.
                </div>

              </div>

            ) : (

              <div className="payroll-table-container">

                <PayrollTable
                  data={filteredPayrolls}
                  onDetail={(item) =>
                    setSelectedItem(item)
                  }
                  onMarkPaid={handleMarkPaid}
                  onDelete={handleDelete}
                />

              </div>

            )}

          </section>

        </main>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedItem && (
        <PayrollDetailModal
          item={selectedItem}
          onClose={() =>
            setSelectedItem(null)
          }
        />
      )}

      {/* =====================================================
          GENERATE MODAL
      ====================================================== */}

      <PayrollGenerateModal
        isOpen={isGenerateOpen}
        onClose={() =>
          setIsGenerateOpen(false)
        }
        onGenerate={handleGenerate}
        loading={actionLoading}
      />

      {/* =====================================================
          PAYMENT MODAL
      ====================================================== */}

      {paymentModal.open &&
        paymentModal.payroll && (

        <div
          className="payroll-payment-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !paymentLoading
            ) {
              closePaymentModal();
            }
          }}
        >

          {/* MODAL */}
          <div
            className="payroll-payment-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="payroll-payment-header">

              <div>

                <h5 className="fw-bold mb-1">
                  Pembayaran Payroll
                </h5>

                <div className="small text-muted">
                  Pilih metode pembayaran
                </div>

              </div>

              <button
                type="button"
                className="payment-close-btn"
                disabled={paymentLoading}
                onClick={closePaymentModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            {/* =================================================
                BODY
            ================================================== */}

            <div className="payroll-payment-body">

              {/* EMPLOYEE */}

              <div className="payment-summary">

                <div className="payment-summary-row">

                  <span>
                    Employee
                  </span>

                  <strong>
                    {
                      paymentModal.payroll.employee?.name ||
                      `Employee #${paymentModal.payroll.employee_id}`
                    }
                  </strong>

                </div>

                <div className="payment-summary-row">

                  <span>
                    Periode
                  </span>

                  <strong>
                    {paymentModal.payroll.bulan}/
                    {paymentModal.payroll.tahun}
                  </strong>

                </div>

                <div className="payment-summary-row salary-row">

                  <span>
                    Take Home Pay
                  </span>

                  <strong>
                    Rp{' '}
                    {Number(
                      paymentModal.payroll.take_home_pay || 0
                    ).toLocaleString('id-ID')}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  PAYMENT METHOD
              ================================================== */}

              <div className="payment-method-title">
                Metode Pembayaran
              </div>

              <div className="payment-method-grid">

                {/* CASH */}

                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={() =>
                    setPaymentMethod('cash')
                  }
                  className={`payment-option ${
                    paymentMethod === 'cash'
                      ? 'selected'
                      : ''
                  }`}
                >

                  <div className="payment-option-icon">
                    💵
                  </div>

                  <div className="payment-option-title">
                    Cash
                  </div>

                  <div className="payment-option-description">
                    Pembayaran tunai
                  </div>

                </button>

                {/* TRANSFER */}

                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={() =>
                    setPaymentMethod('transfer')
                  }
                  className={`payment-option ${
                    paymentMethod === 'transfer'
                      ? 'selected'
                      : ''
                  }`}
                >

                  <div className="payment-option-icon">
                    🏦
                  </div>

                  <div className="payment-option-title">
                    Transfer
                  </div>

                  <div className="payment-option-description">
                    Masuk ke saldo employee
                  </div>

                </button>

              </div>

              {/* =================================================
                  INFORMATION
              ================================================== */}

              {paymentMethod === 'cash' && (

                <div className="payment-information warning">

                  <strong>Cash:</strong>{' '}
                  Pembayaran dilakukan secara tunai.
                  Saldo employee tidak akan bertambah.

                </div>

              )}

              {paymentMethod === 'transfer' && (

                <div className="payment-information info">

                  <strong>Transfer:</strong>{' '}
                  Take Home Pay akan ditambahkan ke
                  saldo employee dan dicatat sebagai
                  transaksi saldo.

                </div>

              )}

            </div>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="payroll-payment-footer">

              <button
                type="button"
                className="btn btn-light border"
                disabled={paymentLoading}
                onClick={closePaymentModal}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn btn-primary px-4"
                disabled={
                  !paymentMethod ||
                  paymentLoading
                }
                onClick={handlePaymentSubmit}
              >

                {paymentLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Pembayaran'
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          STYLE
      ====================================================== */}

      <style>{`

        /* =====================================================
           MAIN
        ===================================================== */

        .payroll-page {
          width: 100%;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .payroll-main-wrapper {
          width: calc(100% - 250px);
          margin-left: 250px;
          min-height: 100vh;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .payroll-main-content {
          width: 100%;
          flex: 1;
          min-width: 0;
          padding: 24px;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .payroll-table-card {
          width: 100%;
          background: #ffffff;
          border-radius: 16px;
          border: 0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .payroll-table-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .payroll-table-container table {
          width: 100% !important;
          max-width: none !important;
          margin-bottom: 0 !important;
        }

        .payroll-table-container th,
        .payroll-table-container td {
          vertical-align: middle;
        }

        .payroll-table-container thead th {
          white-space: nowrap;
        }

        .payroll-table-container tbody td {
          white-space: nowrap;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .payroll-loading {
          width: 100%;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .payroll-empty-state {
          width: 100%;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #f1f3f5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          font-size: 24px;
          color: #6c757d;
        }

        /* =====================================================
           PAYMENT OVERLAY
        ===================================================== */

        .payroll-payment-overlay {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          left: 0 !important;

          width: 100vw !important;
          height: 100vh !important;

          z-index: 99999 !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          padding: 20px !important;

          background: rgba(0, 0, 0, 0.55) !important;

          box-sizing: border-box !important;
        }

        /* =====================================================
           PAYMENT MODAL
        ===================================================== */

        .payroll-payment-modal {
          position: relative !important;

          width: 460px !important;
          max-width: 460px !important;

          height: auto !important;
          max-height: calc(100vh - 80px) !important;

          min-height: 0 !important;

          margin: 0 !important;

          background: #ffffff !important;

          border-radius: 18px !important;

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.25) !important;

          overflow: hidden !important;

          display: flex !important;
          flex-direction: column !important;

          box-sizing: border-box !important;
        }

        /* =====================================================
           PAYMENT HEADER
        ===================================================== */

        .payroll-payment-header {
          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 18px 22px;

          border-bottom: 1px solid #eeeeee;
        }

        .payment-close-btn {
          width: 34px;
          height: 34px;

          border: 0;
          background: transparent;

          border-radius: 8px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #6c757d;

          transition: all 0.15s ease;
        }

        .payment-close-btn:hover:not(:disabled) {
          background: #f1f3f5;
          color: #212529;
        }

        /* =====================================================
           PAYMENT BODY
        ===================================================== */

        .payroll-payment-body {
          flex: 0 1 auto;

          padding: 18px 22px;

          overflow-y: auto;
          overflow-x: hidden;
        }

        /* =====================================================
           SUMMARY
        ===================================================== */

        .payment-summary {
          background: #f8f9fa;
          border-radius: 12px;

          padding: 14px 16px;

          margin-bottom: 18px;
        }

        .payment-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          font-size: 14px;
        }

        .payment-summary-row + .payment-summary-row {
          margin-top: 12px;
        }

        .payment-summary-row span {
          color: #6c757d;
          font-size: 13px;
        }

        .payment-summary-row strong {
          color: #212529;
          text-align: right;
        }

        .payment-summary-row.salary-row {
          padding-top: 12px;
          margin-top: 12px;

          border-top: 1px solid #dee2e6;
        }

        .payment-summary-row.salary-row strong {
          color: #198754;
          font-size: 18px;
        }

        /* =====================================================
           PAYMENT METHOD
        ===================================================== */

        .payment-method-title {
          font-size: 14px;
          font-weight: 600;

          margin-bottom: 10px;
        }

        .payment-method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .payment-option {
          width: 100% !important;

          min-height: 105px !important;

          padding: 14px 10px !important;

          border: 1px solid #dee2e6 !important;
          border-radius: 12px !important;

          background: #ffffff !important;

          text-align: center;

          cursor: pointer;

          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            transform 0.15s ease,
            box-shadow 0.15s ease;

          box-sizing: border-box !important;
        }

        .payment-option:hover:not(:disabled) {
          border-color: #0d6efd !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.10);
        }

        .payment-option.selected {
          border: 2px solid #0d6efd !important;
          background: #e7f1ff !important;
        }

        .payment-option-icon {
          font-size: 27px;
          line-height: 1;

          margin-bottom: 7px;
        }

        .payment-option-title {
          font-size: 14px;
          font-weight: 600;
          color: #212529;
        }

        .payment-option-description {
          font-size: 11px;
          color: #6c757d;
          margin-top: 3px;
        }

        /* =====================================================
           INFORMATION
        ===================================================== */

        .payment-information {
          margin-top: 12px;

          padding: 10px 12px;

          border-radius: 8px;

          font-size: 12px;
          line-height: 1.5;
        }

        .payment-information.warning {
          background: #fff3cd;
          color: #664d03;
          border: 1px solid #ffecb5;
        }

        .payment-information.info {
          background: #cff4fc;
          color: #055160;
          border: 1px solid #b6effb;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .payroll-payment-footer {
          flex: 0 0 auto;

          display: flex;
          justify-content: flex-end;
          align-items: center;

          gap: 8px;

          padding: 14px 22px 18px;

          border-top: 1px solid #eeeeee;
        }

        /* =====================================================
           DESKTOP
        ===================================================== */

        @media (min-width: 1200px) {

          .payroll-main-content {
            padding: 24px;
          }

        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (min-width: 768px) and (max-width: 1199.98px) {

          .payroll-main-wrapper {
            width: calc(100% - 250px);
            margin-left: 250px;
          }

          .payroll-main-content {
            padding: 16px;
          }

          .payroll-table-container {
            overflow-x: auto;
          }

          .payroll-table-container table {
            min-width: 900px;
          }

        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .payroll-main-wrapper {
            width: 100%;
            margin-left: 0 !important;
          }

          .payroll-main-content {
            width: 100%;
            padding: 12px;
          }

          .payroll-table-card {
            border-radius: 12px;
          }

          .payroll-table-container {
            overflow-x: auto;
          }

          .payroll-table-container table {
            min-width: 900px;
          }

          /* PAYMENT MOBILE */

          .payroll-payment-overlay {
            padding: 12px !important;
          }

          .payroll-payment-modal {
            width: 100% !important;
            max-width: 420px !important;
            max-height: calc(100vh - 24px) !important;
            border-radius: 14px !important;
          }

          .payroll-payment-header {
            padding: 16px 18px;
          }

          .payroll-payment-body {
            padding: 16px 18px;
          }

          .payroll-payment-footer {
            padding: 12px 18px 16px;
          }

          .payment-method-grid {
            gap: 8px;
          }

          .payment-option {
            min-height: 100px !important;
          }

        }

      `}</style>

    </div>
  );
};

export default PayrollPage;