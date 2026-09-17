import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';

const LeaveDetailModal = ({ id, isOpen, onClose }) => {
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
        `/employee/leave/${id}`
      );

      if (response.data?.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil detail pengajuan:', error);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

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
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          className: 'detail-status-approved',
          label: 'Disetujui',
          icon: 'bi-check-circle-fill',
        };

      case 'rejected':
        return {
          className: 'detail-status-rejected',
          label: 'Ditolak',
          icon: 'bi-x-circle-fill',
        };

      case 'pending':
      default:
        return {
          className: 'detail-status-pending',
          label: 'Menunggu',
          icon: 'bi-clock-fill',
        };
    }
  };

  // =========================================================
  // TYPE
  // =========================================================

  const getTypeLabel = (type) => {
    switch (type) {
      case 'cuti':
        return 'Cuti';

      case 'izin':
        return 'Izin';

      case 'sakit':
        return 'Sakit';

      default:
        return type || '-';
    }
  };

  // =========================================================
  // NOT OPEN
  // =========================================================

  if (!isOpen) return null;

  const statusConfig = detail
    ? getStatusConfig(detail.status)
    : null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        /* =====================================================
           MODAL DIALOG
        ===================================================== */

        .leave-detail-dialog {
          width: 100%;

          max-width: 760px;

          margin: 1.75rem auto;
        }


        /* =====================================================
           MODAL CONTENT
        ===================================================== */

        .leave-detail-content {
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

        .leave-detail-header {
          padding: 20px 24px;

          border-bottom: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .leave-detail-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .leave-detail-icon {
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


        .leave-detail-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }


        .leave-detail-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        /* =====================================================
           CLOSE BUTTON
        ===================================================== */

        .leave-detail-close {
          width: 36px;
          height: 36px;

          border: none;

          border-radius: 9px;

          background: #F3F4F6;

          color: #6B7280;

          display: flex;

          align-items: center;

          justify-content: center;

          transition: all 0.2s ease;
        }


        .leave-detail-close:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .leave-detail-body {
          padding: 24px;

          background: #FFFFFF;

          max-height: calc(100vh - 210px);

          overflow-y: auto;
        }


        /* =====================================================
           DETAIL CARD
        ===================================================== */

        .leave-detail-card {
          border: 1px solid #E5E7EB;

          border-radius: 14px;

          padding: 20px;

          background: #F8FAFC;
        }


        /* =====================================================
           TOP SECTION
        ===================================================== */

        .leave-detail-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          margin-bottom: 20px;

          padding-bottom: 16px;

          border-bottom: 1px solid #E5E7EB;
        }


        /* =====================================================
           TYPE BADGE
        ===================================================== */

        .detail-type {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding: 7px 12px;

          border-radius: 8px;

          background: #EEF2FF;

          color: #4F46E5;

          font-size: 12px;

          font-weight: 700;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .detail-status {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding: 7px 12px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 600;
        }


        .detail-status-approved {
          background: #DCFCE7;

          color: #166534;
        }


        .detail-status-rejected {
          background: #FEE2E2;

          color: #991B1B;
        }


        .detail-status-pending {
          background: #FEF3C7;

          color: #92400E;
        }


        /* =====================================================
           DETAIL ITEM
        ===================================================== */

        .detail-item {
          padding: 14px;

          background: #FFFFFF;

          border: 1px solid #E5E7EB;

          border-radius: 10px;
        }


        .detail-label {
          display: block;

          margin-bottom: 5px;

          color: #6B7280;

          font-size: 11px;

          font-weight: 600;

          text-transform: uppercase;

          letter-spacing: 0.03em;
        }


        .detail-value {
          margin: 0;

          color: #111827;

          font-size: 14px;

          font-weight: 600;

          line-height: 1.5;
        }


        .detail-reason {
          font-weight: 400;

          white-space: pre-wrap;

          word-break: break-word;
        }


        /* =====================================================
           APPROVAL NOTE
        ===================================================== */

        .approval-note {
          margin-top: 16px;

          padding: 14px;

          border-radius: 10px;

          background: #FFFBEB;

          border: 1px solid #FDE68A;
        }


        .approval-note-label {
          display: block;

          margin-bottom: 5px;

          color: #92400E;

          font-size: 11px;

          font-weight: 700;
        }


        .approval-note-text {
          margin: 0;

          color: #78350F;

          font-size: 13px;

          line-height: 1.5;

          white-space: pre-wrap;

          word-break: break-word;
        }


        /* =====================================================
           LOADING
        ===================================================== */

        .leave-detail-loading {
          min-height: 220px;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        /* =====================================================
           EMPTY
        ===================================================== */

        .leave-detail-empty {
          min-height: 180px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #6B7280;
        }


        .leave-detail-empty-icon {
          width: 48px;
          height: 48px;

          margin-bottom: 10px;

          border-radius: 50%;

          background: #F3F4F6;

          display: flex;

          align-items: center;

          justify-content: center;

          color: #9CA3AF;

          font-size: 20px;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .leave-detail-footer {
          padding: 16px 24px;

          border-top: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: flex-end;
        }


        .leave-detail-button {
          min-height: 42px;

          padding: 9px 22px;

          border: none;

          border-radius: 9px;

          background: #4F46E5;

          color: #FFFFFF;

          font-size: 13px;

          font-weight: 600;

          transition: 0.2s ease;
        }


        .leave-detail-button:hover {
          background: #4338CA;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .leave-detail-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }


          .leave-detail-content {
            border-radius: 14px !important;
          }


          .leave-detail-header {
            padding: 16px;
          }


          .leave-detail-body {
            padding: 18px;

            max-height: calc(100vh - 180px);
          }


          .leave-detail-footer {
            padding: 14px 16px;
          }


          .leave-detail-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }


          .leave-detail-title {
            font-size: 16px;
          }


          .leave-detail-subtitle {
            font-size: 11px;
          }


          .leave-detail-card {
            padding: 16px;
          }


          .leave-detail-top {
            align-items: flex-start;

            flex-direction: column;
          }


          .detail-type,
          .detail-status {
            width: 100%;

            justify-content: center;
          }


          .leave-detail-button {
            width: 100%;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .leave-detail-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }


          .leave-detail-body {
            padding: 14px;
          }


          .leave-detail-card {
            padding: 14px;
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
            leave-detail-dialog
          "
        >

          <div className="modal-content leave-detail-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="leave-detail-header">

              <div className="leave-detail-header-left">

                <div className="leave-detail-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>

                <div>

                  <h5 className="leave-detail-title">
                    Detail Pengajuan Cuti / Izin
                  </h5>

                  <p className="leave-detail-subtitle">
                    Informasi lengkap pengajuan Anda.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="leave-detail-close"
                onClick={onClose}
                title="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="leave-detail-body">

              {loading ? (

                <div className="leave-detail-loading">
                  <LoadingSpinner />
                </div>

              ) : detail ? (

                <div className="leave-detail-card">

                  {/* TOP */}

                  <div className="leave-detail-top">

                    <span className="detail-type">
                      <i className="bi bi-calendar-check"></i>

                      {getTypeLabel(detail.type)}
                    </span>


                    {statusConfig && (
                      <span
                        className={`
                          detail-status
                          ${statusConfig.className}
                        `}
                      >

                        <i
                          className={`
                            bi
                            ${statusConfig.icon}
                          `}
                        ></i>

                        {statusConfig.label}

                      </span>
                    )}

                  </div>


                  {/* DETAIL */}

                  <div className="row g-3">

                    {/* TANGGAL MULAI */}

                    <div className="col-12 col-md-6">

                      <div className="detail-item">

                        <span className="detail-label">
                          Tanggal Mulai
                        </span>

                        <p className="detail-value">
                          {formatDate(
                            detail.start_date
                          )}
                        </p>

                      </div>

                    </div>


                    {/* TANGGAL SELESAI */}

                    <div className="col-12 col-md-6">

                      <div className="detail-item">

                        <span className="detail-label">
                          Tanggal Selesai
                        </span>

                        <p className="detail-value">
                          {formatDate(
                            detail.end_date
                          )}
                        </p>

                      </div>

                    </div>


                    {/* ALASAN */}

                    <div className="col-12">

                      <div className="detail-item">

                        <span className="detail-label">
                          Alasan Pengajuan
                        </span>

                        <p className="
                          detail-value
                          detail-reason
                        ">
                          {detail.reason || '-'}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* APPROVAL NOTE */}

                  {detail.approval_note && (

                    <div className="approval-note">

                      <span className="approval-note-label">
                        <i className="bi bi-chat-left-text me-1"></i>
                        Catatan Approval
                      </span>

                      <p className="approval-note-text">
                        {detail.approval_note}
                      </p>

                    </div>

                  )}

                </div>

              ) : (

                <div className="leave-detail-empty">

                  <div className="leave-detail-empty-icon">
                    <i className="bi bi-file-earmark-x"></i>
                  </div>

                  <div className="fw-semibold text-dark">
                    Data tidak ditemukan
                  </div>

                  <div className="small mt-1">
                    Detail pengajuan tidak tersedia.
                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="leave-detail-footer">

              <button
                type="button"
                className="leave-detail-button"
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-2"></i>
                Tutup
              </button>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default LeaveDetailModal;