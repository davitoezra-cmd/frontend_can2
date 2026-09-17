import React, { useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
} from 'react-icons/fa';

const BusinessTripDetailModal = ({
  detailData,
  isOpen,
  onClose,
}) => {
  // =====================================================
  // BODY LOCK
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // =====================================================
  // ESCAPE
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !detailData) return null;

  const storageBaseUrl = 'http://localhost:8000/storage/';

  return (
    <>
      <style>{`
        /* =====================================================
           OVERLAY
        ===================================================== */

        .business-trip-detail-overlay {
          position: fixed;
          inset: 0;

          width: 100%;
          height: 100%;
          height: 100dvh;

          background: rgba(15, 23, 42, 0.55);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          z-index: 2000;

          overflow-y: auto;

          animation: businessTripDetailFadeIn 0.2s ease;
        }

        @keyframes businessTripDetailFadeIn {
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

        .business-trip-detail-modal {
          width: 100%;
          max-width: 720px;

          max-height: calc(100vh - 40px);
          max-height: calc(100dvh - 40px);

          background: #ffffff;

          border-radius: 16px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.22);

          display: flex;
          flex-direction: column;

          overflow: hidden;

          animation: businessTripDetailSlideIn 0.22s ease;
        }

        @keyframes businessTripDetailSlideIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .business-trip-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 18px 22px;

          background: #f8fafc;

          border-bottom: 1px solid #e5e7eb;

          flex-shrink: 0;
        }

        .business-trip-detail-title {
          margin: 0;

          font-size: 18px;
          font-weight: 700;

          color: #111827;
        }

        .business-trip-detail-close {
          width: 34px;
          height: 34px;

          border: none;
          border-radius: 8px;

          background: #ffffff;

          color: #6b7280;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .business-trip-detail-close:hover {
          background: #e5e7eb;
          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .business-trip-detail-body {
          padding: 22px;

          overflow-y: auto;

          flex: 1;

          min-height: 0;

          background: #ffffff;
        }


        /* =====================================================
           SUMMARY
        ===================================================== */

        .business-trip-detail-summary {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 18px 24px;

          margin-bottom: 22px;
        }

        .business-trip-detail-item {
          min-width: 0;
        }

        .business-trip-detail-label {
          display: block;

          margin-bottom: 5px;

          font-size: 12px;

          font-weight: 600;

          color: #6b7280;
        }

        .business-trip-detail-value {
          margin: 0;

          color: #111827;

          font-size: 14px;

          line-height: 1.5;

          word-break: break-word;
        }

        .business-trip-detail-destination {
          color: #4f46e5;

          font-weight: 600;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .business-trip-detail-status {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          padding: 6px 12px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 600;

          text-transform: capitalize;
        }

        .business-trip-detail-status.completed {
          background: #dcfce7;
          color: #166534;
        }

        .business-trip-detail-status.approved {
          background: #cffafe;
          color: #155e75;
        }

        .business-trip-detail-status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .business-trip-detail-status.pending {
          background: #fef3c7;
          color: #92400e;
        }


        /* =====================================================
           DIVIDER
        ===================================================== */

        .business-trip-detail-divider {
          border: 0;

          border-top: 1px solid #e5e7eb;

          margin: 22px 0;
        }


        /* =====================================================
           ABSENSI TITLE
        ===================================================== */

        .business-trip-attendance-title {
          margin: 0 0 14px;

          font-size: 15px;

          font-weight: 700;

          color: #111827;
        }


        /* =====================================================
           SUCCESS ALERT
        ===================================================== */

        .business-trip-success-alert {
          display: flex;

          align-items: flex-start;

          gap: 9px;

          padding: 12px 14px;

          margin-bottom: 18px;

          border: 1px solid #bbf7d0;

          border-radius: 10px;

          background: #f0fdf4;

          color: #166534;

          font-size: 13px;

          line-height: 1.5;
        }


        /* =====================================================
           EMPTY ATTENDANCE
        ===================================================== */

        .business-trip-empty {
          padding: 18px;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 10px;

          text-align: center;

          color: #6b7280;

          font-size: 13px;
        }


        /* =====================================================
           ATTENDANCE GRID
        ===================================================== */

        .business-trip-attendance-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 16px;
        }


        /* =====================================================
           ATTENDANCE CARD
        ===================================================== */

        .business-trip-attendance-card {
          min-width: 0;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 12px;

          padding: 15px;
        }

        .business-trip-attendance-heading {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 12px;

          font-size: 14px;

          font-weight: 700;
        }

        .business-trip-attendance-heading.check-in {
          color: #198754;
        }

        .business-trip-attendance-heading.check-out {
          color: #4f46e5;
        }


        /* =====================================================
           PHOTO
        ===================================================== */

        .business-trip-photo {
          width: 100%;

          height: 180px;

          display: block;

          object-fit: cover;

          border-radius: 9px;

          margin-bottom: 10px;

          background: #e5e7eb;
        }


        /* =====================================================
           LOCATION
        ===================================================== */

        .business-trip-location {
          display: flex;

          align-items: flex-start;

          gap: 6px;

          color: #6b7280;

          font-size: 11px;

          line-height: 1.5;

          word-break: break-word;
        }

        .business-trip-location-icon {
          color: #dc3545;

          flex-shrink: 0;

          margin-top: 2px;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .business-trip-detail-footer {
          display: flex;

          justify-content: flex-end;

          align-items: center;

          padding: 13px 22px;

          background: #f8fafc;

          border-top: 1px solid #e5e7eb;

          flex-shrink: 0;
        }

        .business-trip-detail-close-btn {
          min-height: 40px;

          padding: 8px 20px;

          border: none;

          border-radius: 9px;

          background: #6b7280;

          color: #ffffff;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .business-trip-detail-close-btn:hover {
          background: #4b5563;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {
          .business-trip-detail-overlay {
            padding: 12px;
          }

          .business-trip-detail-modal {
            max-width: 100%;

            max-height: calc(100vh - 24px);
            max-height: calc(100dvh - 24px);

            border-radius: 14px;
          }

          .business-trip-detail-header {
            padding: 15px 17px;
          }

          .business-trip-detail-title {
            font-size: 16px;
          }

          .business-trip-detail-body {
            padding: 18px;
          }

          .business-trip-detail-summary {
            grid-template-columns: 1fr;

            gap: 14px;
          }

          .business-trip-attendance-grid {
            grid-template-columns: 1fr;

            gap: 14px;
          }

          .business-trip-photo {
            height: 200px;
          }

          .business-trip-detail-footer {
            padding: 12px 17px;
          }

          .business-trip-detail-close-btn {
            width: 100%;
          }
        }
      `}</style>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="business-trip-detail-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-trip-detail-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >

        {/* =================================================
            MODAL
        ================================================= */}

        <div className="business-trip-detail-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="business-trip-detail-header">

            <h5
              id="business-trip-detail-title"
              className="business-trip-detail-title"
            >
              Detail Business Trip
            </h5>

            <button
              type="button"
              className="business-trip-detail-close"
              onClick={onClose}
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>


          {/* =================================================
              BODY
          ================================================= */}

          <div className="business-trip-detail-body">

            {/* =================================================
                SUMMARY INFORMASI
            ================================================= */}

            <div className="business-trip-detail-summary">

              {/* TANGGAL */}

              <div className="business-trip-detail-item">
                <span className="business-trip-detail-label">
                  Tanggal Dinas
                </span>

                <p className="business-trip-detail-value">
                  {detailData.trip_date}
                </p>
              </div>


              {/* STATUS */}

              <div className="business-trip-detail-item">
                <span className="business-trip-detail-label">
                  Status Pengajuan
                </span>

                <span
                  className={`business-trip-detail-status ${
                    detailData.status === 'completed'
                      ? 'completed'
                      : detailData.status === 'approved'
                        ? 'approved'
                        : detailData.status === 'rejected'
                          ? 'rejected'
                          : 'pending'
                  }`}
                >
                  {detailData.status}
                </span>
              </div>


              {/* TUJUAN */}

              <div className="business-trip-detail-item">
                <span className="business-trip-detail-label">
                  Tujuan
                </span>

                <p className="business-trip-detail-value business-trip-detail-destination">
                  {detailData.destination}
                </p>
              </div>


              {/* KEPERLUAN */}

              <div className="business-trip-detail-item">
                <span className="business-trip-detail-label">
                  Keperluan
                </span>

                <p className="business-trip-detail-value">
                  {detailData.purpose}
                </p>
              </div>

            </div>


            <hr className="business-trip-detail-divider" />


            {/* =================================================
                ABSENSI
            ================================================= */}

            <h6 className="business-trip-attendance-title">
              Absensi Dinas Luar
            </h6>


            {/* STATUS COMPLETED */}

            {detailData.status === 'completed' && (
              <div
                className="business-trip-success-alert"
                role="alert"
              >
                <FaCheckCircle size={17} />

                <span>
                  Pengajuan dinas luar telah selesai dan absensi
                  telah dilakukan.
                </span>
              </div>
            )}


            {/* =================================================
                BELUM CHECK IN
            ================================================= */}

            {!detailData.check_in ? (

              <div className="business-trip-empty">
                Belum melakukan Check In
              </div>

            ) : (

              <div className="business-trip-attendance-grid">

                {/* =================================================
                    CHECK IN
                ================================================= */}

                <div className="business-trip-attendance-card">

                  <h6 className="business-trip-attendance-heading check-in">
                    <FaClock />

                    <span>
                      Check In: {detailData.check_in}
                    </span>
                  </h6>


                  {/* FOTO CHECK IN */}

                  {detailData.check_in_photo && (
                    <img
                      src={`${storageBaseUrl}${detailData.check_in_photo}`}
                      alt="Check In"
                      className="business-trip-photo"
                    />
                  )}


                  {/* LOKASI CHECK IN */}

                  <div className="business-trip-location">

                    <FaMapMarkerAlt className="business-trip-location-icon" />

                    <span>
                      {detailData.check_in_latitude},{' '}
                      {detailData.check_in_longitude}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    CHECK OUT
                ================================================= */}

                {detailData.check_out ? (

                  <div className="business-trip-attendance-card">

                    <h6 className="business-trip-attendance-heading check-out">
                      <FaClock />

                      <span>
                        Check Out: {detailData.check_out}
                      </span>
                    </h6>


                    {/* FOTO CHECK OUT */}

                    {detailData.check_out_photo && (
                      <img
                        src={`${storageBaseUrl}${detailData.check_out_photo}`}
                        alt="Check Out"
                        className="business-trip-photo"
                      />
                    )}


                    {/* LOKASI CHECK OUT */}

                    <div className="business-trip-location">

                      <FaMapMarkerAlt className="business-trip-location-icon" />

                      <span>
                        {detailData.check_out_latitude},{' '}
                        {detailData.check_out_longitude}
                      </span>

                    </div>

                  </div>

                ) : (

                  <div className="business-trip-attendance-card d-flex align-items-center justify-content-center text-muted">
                    <span className="text-center small">
                      Belum melakukan Check Out
                    </span>
                  </div>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="business-trip-detail-footer">

            <button
              type="button"
              className="business-trip-detail-close-btn"
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

export default BusinessTripDetailModal;