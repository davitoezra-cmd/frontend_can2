import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';

const CashAdvanceDetailModal = ({
  detailData,
  id,
  isOpen,
  onClose,
}) => {
  const [detail, setDetail] = useState(detailData || null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // UPDATE DATA DARI PROPS
  // =========================================================

  useEffect(() => {
    if (detailData) {
      setDetail(detailData);
    }
  }, [detailData]);

  // =========================================================
  // FETCH DETAIL JIKA ADA ID
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    // Kalau sudah ada data dari parent, tidak perlu fetch lagi
    if (detailData) {
      setDetail(detailData);
      return;
    }

    // Kalau ada ID, ambil detail dari API
    if (id) {
      fetchDetail();
    }
  }, [isOpen, id, detailData]);

  // =========================================================
  // FETCH DETAIL
  // =========================================================

  const fetchDetail = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        `/employee/cash-advance/${id}`
      );

      if (response.data?.success) {
        setDetail(response.data.data);
      } else {
        setDetail(null);
      }
    } catch (error) {
      console.error(
        'Gagal mengambil detail kasbon:',
        error
      );

      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BODY LOCK
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

  // =========================================================
  // ESCAPE
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  // =========================================================
  // JIKA MODAL TIDAK DIBUKA
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return '-';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatus = (status) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Approved',
          className: 'approved',
        };

      case 'rejected':
        return {
          label: 'Rejected',
          className: 'rejected',
        };

      default:
        return {
          label: 'Pending',
          className: 'pending',
        };
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        /* =====================================================
           OVERLAY
        ===================================================== */

        .cash-detail-overlay {
          position: fixed;
          inset: 0;

          width: 100vw;
          height: 100vh;
          height: 100dvh;

          background: rgba(15, 23, 42, 0.50);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          z-index: 2000;

          overflow-y: auto;

          animation:
            cashDetailFadeIn
            0.2s ease;
        }

        @keyframes cashDetailFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }


        /* =====================================================
           MODAL
        ===================================================== */

        .cash-detail-modal {
          width: 100%;

          max-width: 620px;

          max-height:
            calc(100vh - 40px);

          max-height:
            calc(100dvh - 40px);

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px
            rgba(15, 23, 42, 0.22);

          display: flex;

          flex-direction: column;

          overflow: hidden;

          animation:
            cashDetailSlideIn
            0.22s ease;
        }

        @keyframes cashDetailSlideIn {
          from {
            transform:
              translateY(15px)
              scale(0.98);

            opacity: 0;
          }

          to {
            transform:
              translateY(0)
              scale(1);

            opacity: 1;
          }
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .cash-detail-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 18px 22px;

          border-bottom:
            1px solid #E5E7EB;

          flex-shrink: 0;
        }

        .cash-detail-header-info {
          min-width: 0;
        }

        .cash-detail-title {
          margin: 0;

          font-size: 18px;

          font-weight: 700;

          color: #111827;
        }

        .cash-detail-subtitle {
          margin:
            4px 0 0;

          font-size: 12px;

          color: #6B7280;
        }

        .cash-detail-close {
          width: 36px;

          height: 36px;

          flex-shrink: 0;

          border: none;

          border-radius: 9px;

          background: #F3F4F6;

          color: #6B7280;

          display: flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;

          transition:
            all 0.2s ease;
        }

        .cash-detail-close:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .cash-detail-body {
          padding: 22px;

          overflow-y: auto;

          flex: 1;

          min-height: 0;

          background: #FFFFFF;
        }


        /* =====================================================
           LOADING
        ===================================================== */

        .cash-detail-loading {
          min-height: 220px;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        /* =====================================================
           EMPTY
        ===================================================== */

        .cash-detail-empty {
          min-height: 180px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #6B7280;
        }

        .cash-detail-empty-icon {
          width: 52px;

          height: 52px;

          border-radius: 50%;

          background: #F3F4F6;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 12px;

          font-size: 22px;
        }


        /* =====================================================
           SUMMARY
        ===================================================== */

        .cash-detail-summary {
          background: #F8FAFC;

          border:
            1px solid #E5E7EB;

          border-radius: 14px;

          padding: 18px;

          margin-bottom: 18px;
        }

        .cash-detail-summary-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 20px;

          align-items: center;
        }


        /* =====================================================
           LABEL
        ===================================================== */

        .cash-detail-label {
          display: block;

          margin-bottom: 6px;

          font-size: 12px;

          font-weight: 600;

          color: #6B7280;
        }


        /* =====================================================
           AMOUNT
        ===================================================== */

        .cash-detail-amount {
          margin: 0;

          font-size: 23px;

          font-weight: 700;

          color: #4F46E5;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .cash-detail-status-wrapper {
          text-align: right;
        }

        .cash-detail-status {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding:
            7px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 600;
        }

        .cash-detail-status.approved {
          background: #DCFCE7;

          color: #166534;
        }

        .cash-detail-status.rejected {
          background: #FEE2E2;

          color: #991B1B;
        }

        .cash-detail-status.pending {
          background: #FEF3C7;

          color: #92400E;
        }


        /* =====================================================
           SECTION
        ===================================================== */

        .cash-detail-section {
          margin-bottom: 18px;
        }

        .cash-detail-section:last-child {
          margin-bottom: 0;
        }


        /* =====================================================
           TEXT BOX
        ===================================================== */

        .cash-detail-text-box {
          padding:
            12px 14px;

          border:
            1px solid #E5E7EB;

          border-radius: 10px;

          background: #FFFFFF;

          color: #374151;

          font-size: 14px;

          line-height: 1.6;

          word-break: break-word;
        }

        .cash-detail-note {
          color: #6B7280;

          font-style: italic;
        }


        /* =====================================================
           INFO
        ===================================================== */

        .cash-detail-info {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 18px;

          margin-bottom: 18px;
        }

        .cash-detail-info-item {
          min-width: 0;
        }

        .cash-detail-value {
          color: #111827;

          font-size: 13px;

          font-weight: 600;

          word-break: break-word;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .cash-detail-footer {
          display: flex;

          justify-content: flex-end;

          align-items: center;

          padding:
            13px 22px;

          border-top:
            1px solid #E5E7EB;

          background: #FFFFFF;

          flex-shrink: 0;
        }

        .cash-detail-close-btn {
          min-height: 40px;

          padding:
            8px 20px;

          border: none;

          border-radius: 9px;

          background: #6B7280;

          color: #FFFFFF;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease;
        }

        .cash-detail-close-btn:hover {
          background: #4B5563;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 575.98px) {

          .cash-detail-overlay {
            padding: 12px;
          }

          .cash-detail-modal {
            max-width: 100%;

            max-height:
              calc(100vh - 24px);

            max-height:
              calc(100dvh - 24px);

            border-radius: 15px;
          }

          .cash-detail-header {
            padding:
              15px 17px;
          }

          .cash-detail-title {
            font-size: 16px;
          }

          .cash-detail-body {
            padding: 17px;
          }

          .cash-detail-summary {
            padding: 15px;
          }

          .cash-detail-summary-grid {
            grid-template-columns: 1fr;

            gap: 14px;
          }

          .cash-detail-status-wrapper {
            text-align: left;
          }

          .cash-detail-amount {
            font-size: 21px;
          }

          .cash-detail-info {
            grid-template-columns: 1fr;

            gap: 14px;
          }

          .cash-detail-footer {
            padding:
              12px 17px;
          }

          .cash-detail-close-btn {
            width: 100%;
          }
        }

      `}</style>


      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="cash-detail-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cash-detail-title"

        onMouseDown={(e) => {
          if (
            e.target === e.currentTarget
          ) {
            onClose();
          }
        }}
      >

        {/* ===================================================
            MODAL
        =================================================== */}

        <div className="cash-detail-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="cash-detail-header">

            <div className="cash-detail-header-info">

              <h5
                id="cash-detail-title"
                className="cash-detail-title"
              >
                Rincian Pengajuan Kasbon
              </h5>

              <p className="cash-detail-subtitle">
                Informasi lengkap pengajuan kasbon
              </p>

            </div>

            <button
              type="button"
              className="cash-detail-close"
              onClick={onClose}
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>


          {/* =================================================
              BODY
          ================================================= */}

          <div className="cash-detail-body">

            {loading ? (

              <div className="cash-detail-loading">
                <LoadingSpinner />
              </div>

            ) : !detail ? (

              <div className="cash-detail-empty">

                <div className="cash-detail-empty-icon">
                  <i className="bi bi-file-earmark-x"></i>
                </div>

                <div className="fw-semibold">
                  Data tidak ditemukan
                </div>

                <small>
                  Detail pengajuan kasbon tidak tersedia.
                </small>

              </div>

            ) : (

              <>
                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="cash-detail-summary">

                  <div className="cash-detail-summary-grid">

                    <div>

                      <span className="cash-detail-label">
                        Nominal Kasbon
                      </span>

                      <h3 className="cash-detail-amount">
                        {formatRupiah(
                          detail.amount
                        )}
                      </h3>

                    </div>


                    <div className="cash-detail-status-wrapper">

                      <span className="cash-detail-label">
                        Status Pengajuan
                      </span>

                      {(() => {
                        const status =
                          getStatus(
                            detail.status
                          );

                        return (
                          <span
                            className={`
                              cash-detail-status
                              ${status.className}
                            `}
                          >
                            {status.label}
                          </span>
                        );
                      })()}

                    </div>

                  </div>

                </div>


                {/* =================================================
                    ALASAN
                ================================================= */}

                <div className="cash-detail-section">

                  <label className="cash-detail-label">
                    Alasan Pengajuan
                  </label>

                  <div className="cash-detail-text-box">
                    {detail.reason || '-'}
                  </div>

                </div>


                {/* =================================================
                    TANGGAL
                ================================================= */}

                <div className="cash-detail-info">

                  <div className="cash-detail-info-item">

                    <span className="cash-detail-label">
                      Tanggal Pengajuan
                    </span>

                    <div className="cash-detail-value">
                      {formatDate(
                        detail.created_at
                      )}
                    </div>

                  </div>


                  <div className="cash-detail-info-item">

                    <span className="cash-detail-label">
                      Diproses Pada
                    </span>

                    <div className="cash-detail-value">
                      {formatDate(
                        detail.approved_at
                      )}
                    </div>

                  </div>

                </div>


                {/* =================================================
                    CATATAN APPROVAL
                ================================================= */}

                <div className="cash-detail-section">

                  <label className="cash-detail-label">
                    Catatan Persetujuan
                  </label>

                  <div
                    className="
                      cash-detail-text-box
                      cash-detail-note
                    "
                  >
                    {detail.approval_note ||
                      'Belum ada catatan dari admin.'}
                  </div>

                </div>

              </>

            )}

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="cash-detail-footer">

            <button
              type="button"
              className="cash-detail-close-btn"
              onClick={onClose}
            >
              Tutup
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default CashAdvanceDetailModal;