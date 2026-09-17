import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import LoadingSpinner from '../components/LoadingSpinner';

const MedicalDetailModal = ({ id, isOpen, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // FETCH DETAIL
  // =========================================================

  useEffect(() => {
    if (isOpen && id) {
      fetchDetail();
    }
  }, [isOpen, id]);

  const fetchDetail = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        `/employee/medical-leave/${id}`
      );

      if (response.data?.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error(error);
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

    document.addEventListener('keydown', handleKeyDown);

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

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // =========================================================
  // NOT OPEN
  // =========================================================

  if (!isOpen) return null;

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
  // STATUS BADGE
  // =========================================================

  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'medical-status-approved';

      case 'rejected':
        return 'medical-status-rejected';

      default:
        return 'medical-status-pending';
    }
  };

  // =========================================================
  // STATUS TEXT
  // =========================================================

  const getStatusText = (status) => {
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

  const getDocumentUrl = (path) => {
    if (!path) return "";

    // Kalau API sudah mengirim URL lengkap
    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    // Bersihkan slash di depan
    let cleanPath = String(path).replace(/^\/+/, "");

    // Kalau database sudah menyimpan "storage/..."
    if (cleanPath.startsWith("storage/")) {
      cleanPath = cleanPath.replace(/^storage\//, "");
    }

    return `http://192.168.100.9:8000/storage/${cleanPath}`;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        /* =====================================================
           MODAL DIALOG
        ===================================================== */

        .medical-detail-dialog {
          width: 100%;
          max-width: 680px;

          margin: 1.75rem auto;
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .medical-detail-content {
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

        .medical-detail-header {
          padding: 20px 24px;

          border-bottom: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .medical-detail-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .medical-detail-icon {
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


        .medical-detail-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }


        .medical-detail-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        /* =====================================================
           CLOSE BUTTON
        ===================================================== */

        .medical-detail-close {
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


        .medical-detail-close:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .medical-detail-body {
          padding: 24px;

          background: #FFFFFF;

          max-height: calc(100vh - 220px);

          overflow-y: auto;
        }


        /* =====================================================
           DETAIL CARD
        ===================================================== */

        .medical-detail-card {
          border: 1px solid #E5E7EB;

          border-radius: 13px;

          background: #F8FAFC;

          padding: 18px;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .medical-status-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding-bottom: 15px;

          margin-bottom: 15px;

          border-bottom: 1px solid #E5E7EB;
        }


        .medical-status-label {
          font-size: 12px;

          color: #6B7280;

          font-weight: 500;
        }


        .medical-status {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 6px 12px;

          border-radius: 999px;

          font-size: 11px;

          font-weight: 700;

          text-transform: capitalize;
        }


        .medical-status-approved {
          background: #DCFCE7;

          color: #166534;
        }


        .medical-status-rejected {
          background: #FEE2E2;

          color: #991B1B;
        }


        .medical-status-pending {
          background: #FEF3C7;

          color: #92400E;
        }


        /* =====================================================
           DETAIL ITEM
        ===================================================== */

        .medical-detail-item {
          min-height: 60px;
        }


        .medical-detail-label {
          display: block;

          margin-bottom: 5px;

          color: #6B7280;

          font-size: 12px;

          font-weight: 500;
        }


        .medical-detail-value {
          margin: 0;

          color: #111827;

          font-size: 14px;

          font-weight: 600;

          line-height: 1.5;

          word-break: break-word;
        }


        .medical-reason {
          font-weight: 500;

          white-space: pre-wrap;
        }


        /* =====================================================
           DOCUMENT
        ===================================================== */

        .medical-document-section {
          margin-top: 4px;

          padding-top: 16px;

          border-top: 1px solid #E5E7EB;
        }


        .medical-document-button {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          min-height: 38px;

          padding: 8px 14px;

          border: 1px solid #D1D5DB;

          border-radius: 9px;

          background: #FFFFFF;

          color: #374151;

          text-decoration: none;

          font-size: 12px;

          font-weight: 600;

          transition: all 0.2s ease;
        }


        .medical-document-button:hover {
          background: #F3F4F6;

          border-color: #9CA3AF;

          color: #111827;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .medical-detail-footer {
          padding: 15px 24px;

          border-top: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          justify-content: flex-end;
        }


        .medical-detail-close-button {
          min-height: 40px;

          padding: 8px 20px;

          border: none;

          border-radius: 9px;

          background: #374151;

          color: #FFFFFF;

          font-size: 13px;

          font-weight: 600;

          transition: all 0.2s ease;
        }


        .medical-detail-close-button:hover {
          background: #1F2937;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .medical-detail-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }


          .medical-detail-content {
            border-radius: 14px !important;
          }


          .medical-detail-header {
            padding: 16px;
          }


          .medical-detail-body {
            padding: 16px;

            max-height: calc(100vh - 190px);
          }


          .medical-detail-card {
            padding: 15px;
          }


          .medical-detail-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }


          .medical-detail-title {
            font-size: 16px;
          }


          .medical-detail-subtitle {
            font-size: 11px;
          }


          .medical-detail-footer {
            padding: 13px 16px;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .medical-detail-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }


          .medical-detail-body {
            padding: 12px;
          }


          .medical-detail-card {
            padding: 13px;
          }


          .medical-detail-footer {
            padding: 12px;
          }


          .medical-detail-close-button {
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
            medical-detail-dialog
          "
        >

          <div className="modal-content medical-detail-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="medical-detail-header">

              <div className="medical-detail-header-left">

                <div className="medical-detail-icon">
                  <i className="bi bi-heart-pulse"></i>
                </div>

                <div>

                  <h5 className="medical-detail-title">
                    Detail Pengajuan Sakit
                  </h5>

                  <p className="medical-detail-subtitle">
                    Informasi lengkap pengajuan sakit
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="medical-detail-close"
                onClick={onClose}
                title="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="medical-detail-body">

              {loading ? (

                <div className="py-4 text-center">
                  <LoadingSpinner />
                </div>

              ) : detail ? (

                <div className="medical-detail-card">

                  {/* STATUS */}

                  <div className="medical-status-row">

                    <span className="medical-status-label">
                      Status Pengajuan
                    </span>

                    <span
                      className={`
                        medical-status
                        ${getBadgeClass(detail.status)}
                      `}
                    >
                      {getStatusText(detail.status)}
                    </span>

                  </div>


                  {/* DETAIL */}

                  <div className="row g-4">

                    {/* TANGGAL SAKIT */}

                    <div className="col-12 col-sm-6">

                      <div className="medical-detail-item">

                        <span className="medical-detail-label">
                          Tanggal Sakit
                        </span>

                        <p className="medical-detail-value">
                          {formatDate(detail.sick_date)}
                        </p>

                      </div>

                    </div>





                    {/* ALASAN */}

                    <div className="col-12">

                      <div className="medical-detail-item">

                        <span className="medical-detail-label">
                          Alasan Sakit
                        </span>

                        <p className="
                          medical-detail-value
                          medical-reason
                        ">
                          {detail.reason || '-'}
                        </p>

                      </div>

                    </div>


                    {/* SURAT DOKTER */}

                    {detail.doctor_note && (
                      <div className="col-12">
                        <div className="medical-document-section">

                          <span className="medical-detail-label">
                            Surat Dokter
                          </span>

                          <div
                            className="mt-2 p-3 rounded-3 border bg-light text-center"
                            style={{
                              width: "100%",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={getDocumentUrl(detail.doctor_note)}
                              alt="Surat Dokter"
                              className="img-fluid rounded-3"
                              style={{
                                width: "100%",
                                maxHeight: "600px",
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto",
                              }}
                              onLoad={() => {
                                console.log(
                                  "Foto berhasil:",
                                  getDocumentUrl(detail.doctor_note)
                                );
                              }}
                              onError={(e) => {
                                console.error(
                                  "Foto gagal:",
                                  getDocumentUrl(detail.doctor_note)
                                );
                              }}
                            />
                          </div>

                        </div>
                      </div>
                    )}

                  </div>

                </div>

              ) : (

                <div className="text-center py-4">

                  <div
                    className="mb-2"
                    style={{
                      fontSize: '32px',
                      color: '#9CA3AF',
                    }}
                  >
                    <i className="bi bi-file-earmark-x"></i>
                  </div>

                  <p className="text-muted mb-0">
                    Data tidak ditemukan.
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="medical-detail-footer">

              <button
                type="button"
                className="medical-detail-close-button"
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

export default MedicalDetailModal;
