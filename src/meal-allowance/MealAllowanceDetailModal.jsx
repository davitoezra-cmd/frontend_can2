import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';

const MealAllowanceDetailModal = ({ id, isOpen, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // FETCH DETAIL
  // =========================================================

  useEffect(() => {
    if (isOpen && id) {
      fetchDetail();
    }

    if (!isOpen) {
      setDetail(null);
    }
  }, [isOpen, id]);

  const fetchDetail = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        `/employee/meal-allowance/${id}`
      );

      if (response.data?.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error(
        'Gagal mengambil detail pengajuan uang makan:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BODY LOCK
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
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
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  const formatRupiah = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ''
    ) {
      return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'meal-detail-status-approved';

      case 'rejected':
        return 'meal-detail-status-rejected';

      default:
        return 'meal-detail-status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';

      case 'rejected':
        return 'Ditolak';

      case 'pending':
        return 'Menunggu';

      default:
        return status || '-';
    }
  };

  // =========================================================
  // NOT OPEN
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        /* =====================================================
           DIALOG
        ===================================================== */

        .meal-detail-dialog {
          width: 100%;

          max-width: 620px;

          margin: 1.75rem auto;
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .meal-detail-content {
          border: none !important;

          border-radius: 18px !important;

          overflow: hidden;

          background: #FFFFFF;

          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.20);
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .meal-detail-header {
          padding: 20px 24px;

          border-bottom: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .meal-detail-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .meal-detail-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          border-radius: 11px;

          background: #EEF2FF;

          color: #4F46E5;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 18px;
        }


        .meal-detail-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }


        .meal-detail-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        /* =====================================================
           CLOSE
        ===================================================== */

        .meal-detail-close {
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

          transition: all 0.2s ease;
        }


        .meal-detail-close:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .meal-detail-body {
          padding: 24px;

          background: #FFFFFF;
        }


        /* =====================================================
           DETAIL CARD
        ===================================================== */

        .meal-detail-card {
          border: 1px solid #E5E7EB;

          border-radius: 12px;

          background: #F8FAFC;

          padding: 18px;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .meal-detail-status-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding-bottom: 15px;

          margin-bottom: 15px;

          border-bottom: 1px solid #E5E7EB;
        }


        .meal-detail-label {
          display: block;

          margin-bottom: 5px;

          color: #6B7280;

          font-size: 12px;

          font-weight: 500;
        }


        .meal-detail-status-text {
          color: #374151;

          font-size: 13px;

          font-weight: 600;
        }


        .meal-detail-badge {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 6px 12px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 600;

          white-space: nowrap;
        }


        .meal-detail-status-approved {
          background: #DCFCE7;

          color: #166534;
        }


        .meal-detail-status-rejected {
          background: #FEE2E2;

          color: #991B1B;
        }


        .meal-detail-status-pending {
          background: #FEF3C7;

          color: #92400E;
        }


        /* =====================================================
           INFORMATION
        ===================================================== */

        .meal-detail-info {
          padding: 14px;

          background: #FFFFFF;

          border: 1px solid #E5E7EB;

          border-radius: 10px;
        }


        .meal-detail-value {
          color: #111827;

          font-size: 14px;

          font-weight: 600;
        }


        .meal-detail-reason {
          margin: 0;

          color: #374151;

          font-size: 14px;

          line-height: 1.6;

          white-space: pre-wrap;

          word-break: break-word;
        }


        /* =====================================================
           LOADING
        ===================================================== */

        .meal-detail-loading {
          min-height: 120px;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        /* =====================================================
           EMPTY
        ===================================================== */

        .meal-detail-empty {
          padding: 30px 20px;

          text-align: center;

          color: #6B7280;

          font-size: 14px;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .meal-detail-footer {
          padding: 14px 24px;

          border-top: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: flex-end;
        }


        .meal-detail-button {
          min-height: 42px;

          padding: 9px 20px;

          border: none;

          border-radius: 9px;

          background: #F3F4F6;

          color: #374151;

          font-size: 13px;

          font-weight: 600;

          transition: all 0.2s ease;
        }


        .meal-detail-button:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .meal-detail-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }


          .meal-detail-content {
            border-radius: 14px !important;
          }


          .meal-detail-header {
            padding: 16px;
          }


          .meal-detail-body {
            padding: 18px;
          }


          .meal-detail-footer {
            padding: 13px 16px;
          }


          .meal-detail-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }


          .meal-detail-title {
            font-size: 16px;
          }


          .meal-detail-subtitle {
            font-size: 11px;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .meal-detail-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }


          .meal-detail-body {
            padding: 14px;
          }


          .meal-detail-card {
            padding: 14px;
          }


          .meal-detail-status-row {
            align-items: flex-start;

            flex-direction: column;

            gap: 8px;
          }


          .meal-detail-footer {
            padding: 12px;
          }


          .meal-detail-button {
            width: 100%;
          }
        }

      `}</style>


      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 1040,
        }}
      />


      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{
          zIndex: 1050,
        }}
      >

        <div
          className="
            modal-dialog
            modal-dialog-centered
            meal-detail-dialog
          "
        >

          <div className="modal-content meal-detail-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="meal-detail-header">

              <div className="meal-detail-header-left">

                <div className="meal-detail-icon">
                  <i className="bi bi-cup-hot-fill"></i>
                </div>

                <div>

                  <h5 className="meal-detail-title">
                    Detail Pengajuan Uang Makan
                  </h5>

                  <p className="meal-detail-subtitle">
                    Informasi lengkap pengajuan uang makan.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="meal-detail-close"
                onClick={onClose}
                title="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="meal-detail-body">

              {loading ? (

                <div className="meal-detail-loading">
                  <LoadingSpinner />
                </div>

              ) : detail ? (

                <div className="meal-detail-card">

                  {/* STATUS */}

                  <div className="meal-detail-status-row">

                    <div>

                      <span className="meal-detail-label">
                        Status Pengajuan
                      </span>

                      <span className="meal-detail-status-text">
                        Status pengajuan uang makan
                      </span>

                    </div>


                    <span
                      className={`
                        meal-detail-badge
                        ${getBadgeClass(detail.status)}
                      `}
                    >
                      {getStatusLabel(detail.status)}
                    </span>

                  </div>


                  {/* INFO */}

                  <div className="row g-3">

                    {/* TANGGAL UANG MAKAN */}

                    <div className="col-12 col-sm-6">

                      <div className="meal-detail-info">

                        <span className="meal-detail-label">
                          Tanggal Uang Makan
                        </span>

                        <div className="meal-detail-value">
                          {formatDate(
                            detail.meal_date
                          )}
                        </div>

                      </div>

                    </div>


                    {/* NOMINAL */}

                    <div className="col-12 col-sm-6">

                      <div className="meal-detail-info">

                        <span className="meal-detail-label">
                          Nominal Uang Makan
                        </span>

                        <div className="meal-detail-value">
                          {formatRupiah(
                            detail.amount
                          )}
                        </div>

                      </div>

                    </div>


                    {/* TANGGAL DIAJUKAN */}

                    <div className="col-12">

                      <div className="meal-detail-info">

                        <span className="meal-detail-label">
                          Tanggal Diajukan
                        </span>

                        <div className="meal-detail-value">
                          {formatDate(
                            detail.created_at
                          )}
                        </div>

                      </div>

                    </div>


                    {/* ALASAN */}

                    <div className="col-12">

                      <div className="meal-detail-info">

                        <span className="meal-detail-label">
                          Alasan Uang Makan
                        </span>

                        <p className="meal-detail-reason">
                          {detail.reason || '-'}
                        </p>

                      </div>

                    </div>


                    {/* TANGGAL DIPROSES */}

                    {detail.approved_at && (

                      <div className="col-12">

                        <div className="meal-detail-info">

                          <span className="meal-detail-label">
                            Tanggal Diproses
                          </span>

                          <div className="meal-detail-value">
                            {formatDate(
                              detail.approved_at
                            )}
                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              ) : (

                <div className="meal-detail-empty">
                  Data pengajuan uang makan tidak ditemukan.
                </div>

              )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="meal-detail-footer">

              <button
                type="button"
                className="meal-detail-button"
                onClick={onClose}
              >
                Tutup
              </button>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default MealAllowanceDetailModal;