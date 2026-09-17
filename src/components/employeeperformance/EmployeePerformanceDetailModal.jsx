import React, { useEffect } from 'react';

const EmployeePerformanceDetailModal = ({ data, onClose }) => {
  // =========================================================
  // BODY LOCK
  // =========================================================

  useEffect(() => {
    if (!data) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [data]);

  // =========================================================
  // ESCAPE
  // =========================================================

  useEffect(() => {
    if (!data) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [data, onClose]);

  if (!data) return null;

  const target = data.employee_target || {};
  const supervisor = data.supervisor || {};

  // =========================================================
  // PERFORMANCE BADGE
  // =========================================================

  const getPerformanceBadge = (grade) => {
    switch ((grade || '').toUpperCase()) {
      case 'A':
        return {
          text: 'Excellent Performance',
          className: 'employee-performance-badge-success',
        };

      case 'B':
        return {
          text: 'Good Performance',
          className: 'employee-performance-badge-primary',
        };

      case 'C':
        return {
          text: 'Average Performance',
          className: 'employee-performance-badge-warning',
        };

      default:
        return {
          text: 'Need Improvement',
          className: 'employee-performance-badge-danger',
        };
    }
  };

  const badgeInfo = getPerformanceBadge(data.grade);

  // =========================================================
  // DATE
  // =========================================================

  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        /* =====================================================
           OVERLAY
        ===================================================== */

        .employee-performance-overlay {
          position: fixed;
          inset: 0;

          width: 100%;
          height: 100%;

          background: rgba(15, 23, 42, 0.60);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          z-index: 2000;

          overflow-y: auto;

          animation: employeePerformanceFade 0.2s ease;
        }

        @keyframes employeePerformanceFade {
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

        .employee-performance-modal {
          width: 100%;
          max-width: 760px;

          max-height: calc(100vh - 40px);
          max-height: calc(100dvh - 40px);

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.25);

          display: flex;
          flex-direction: column;

          overflow: hidden;

          animation: employeePerformanceSlide 0.22s ease;
        }

        @keyframes employeePerformanceSlide {
          from {
            transform: translateY(15px) scale(0.98);
            opacity: 0;
          }

          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .employee-performance-header {
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 18px 24px;

          border-bottom: 1px solid #e5e7eb;

          background: #ffffff;
        }

        .employee-performance-title-wrapper {
          display: flex;
          align-items: center;

          gap: 10px;

          min-width: 0;
        }

        .employee-performance-title-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #eef2ff;

          color: #4f46e5;

          font-size: 18px;
        }

        .employee-performance-title {
          margin: 0;

          color: #111827;

          font-size: 18px;
          font-weight: 700;
        }

        .employee-performance-subtitle {
          margin: 3px 0 0;

          color: #6b7280;

          font-size: 12px;
        }

        .employee-performance-close {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          border: none;

          border-radius: 9px;

          background: #f3f4f6;

          color: #6b7280;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .employee-performance-close:hover {
          background: #e5e7eb;
          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .employee-performance-body {
          flex: 1;

          min-height: 0;

          overflow-y: auto;

          padding: 22px 24px;

          background: #ffffff;
        }

        .employee-performance-body::-webkit-scrollbar {
          width: 7px;
        }

        .employee-performance-body::-webkit-scrollbar-track {
          background: #f8fafc;
        }

        .employee-performance-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;

          border-radius: 999px;
        }


        /* =====================================================
           RESULT
        ===================================================== */

        .employee-performance-result {
          padding: 18px;

          margin-bottom: 20px;

          border: 1px solid #e5e7eb;

          border-radius: 14px;

          background: #f8fafc;

          text-align: center;
        }

        .employee-performance-result-label {
          display: block;

          margin-bottom: 9px;

          color: #6b7280;

          font-size: 11px;

          font-weight: 700;

          letter-spacing: 0.5px;

          text-transform: uppercase;
        }

        .employee-performance-badge {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          padding: 8px 18px;

          border-radius: 999px;

          font-size: 13px;

          font-weight: 700;
        }

        .employee-performance-badge-success {
          background: #dcfce7;
          color: #166534;
        }

        .employee-performance-badge-primary {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .employee-performance-badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .employee-performance-badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }


        /* =====================================================
           INFO CARDS
        ===================================================== */

        .employee-performance-info-card {
          height: 100%;

          padding: 15px;

          border: 1px solid #e5e7eb;

          border-radius: 12px;

          background: #ffffff;
        }

        .employee-performance-info-label {
          display: block;

          margin-bottom: 6px;

          color: #6b7280;

          font-size: 11px;

          font-weight: 600;
        }

        .employee-performance-info-value {
          color: #111827;

          font-size: 14px;

          font-weight: 600;

          line-height: 1.5;

          word-break: break-word;
        }

        .employee-performance-info-value.large {
          font-size: 17px;
        }

        .employee-performance-category {
          display: inline-flex;

          align-items: center;

          padding: 5px 10px;

          border-radius: 7px;

          background: #f1f5f9;

          color: #475569;

          font-size: 12px;

          font-weight: 600;
        }


        /* =====================================================
           FEEDBACK
        ===================================================== */

        .employee-performance-feedback {
          margin-top: 20px;
        }

        .employee-performance-feedback-label {
          display: block;

          margin-bottom: 8px;

          color: #111827;

          font-size: 13px;

          font-weight: 700;
        }

        .employee-performance-feedback-box {
          padding: 15px 16px;

          border: 1px solid #e5e7eb;

          border-left: 4px solid #4f46e5;

          border-radius: 10px;

          background: #f8fafc;

          color: #4b5563;

          font-size: 13px;

          line-height: 1.7;

          word-break: break-word;

          white-space: pre-line;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .employee-performance-footer {
          flex-shrink: 0;

          display: flex;

          justify-content: flex-end;

          padding: 14px 24px;

          border-top: 1px solid #e5e7eb;

          background: #ffffff;
        }

        .employee-performance-close-btn {
          min-height: 40px;

          padding: 8px 20px;

          border: none;

          border-radius: 9px;

          background: #6b7280;

          color: #ffffff;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .employee-performance-close-btn:hover {
          background: #4b5563;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .employee-performance-overlay {
            padding: 10px;
          }

          .employee-performance-modal {
            max-width: 100%;

            max-height: calc(100vh - 20px);
            max-height: calc(100dvh - 20px);

            border-radius: 15px;
          }

          .employee-performance-header {
            padding: 15px 17px;
          }

          .employee-performance-title {
            font-size: 16px;
          }

          .employee-performance-subtitle {
            font-size: 11px;
          }

          .employee-performance-title-icon {
            width: 34px;
            height: 34px;

            font-size: 16px;
          }

          .employee-performance-body {
            padding: 17px;
          }

          .employee-performance-result {
            padding: 15px;
            margin-bottom: 17px;
          }

          .employee-performance-badge {
            font-size: 12px;
            padding: 7px 14px;
          }

          .employee-performance-info-card {
            padding: 13px;
          }

          .employee-performance-footer {
            padding: 12px 17px;
          }

          .employee-performance-close-btn {
            width: 100%;
          }
        }

      `}</style>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="employee-performance-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-performance-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >

        {/* ===================================================
            MODAL
        =================================================== */}

        <div className="employee-performance-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="employee-performance-header">

            <div className="employee-performance-title-wrapper">

              <div className="employee-performance-title-icon">
                <i className="bi bi-award"></i>
              </div>

              <div>
                <h5
                  id="employee-performance-title"
                  className="employee-performance-title"
                >
                  Detail Penilaian Kinerja
                </h5>

                <p className="employee-performance-subtitle">
                  Informasi lengkap hasil penilaian kinerja
                </p>
              </div>

            </div>

            <button
              type="button"
              className="employee-performance-close"
              onClick={onClose}
              aria-label="Tutup"
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>


          {/* =================================================
              BODY
          ================================================= */}

          <div className="employee-performance-body">

            {/* HASIL PENILAIAN */}

            <div className="employee-performance-result">

              <span className="employee-performance-result-label">
                Hasil Penilaian Akhir
              </span>

              <span
                className={`employee-performance-badge ${badgeInfo.className}`}
              >
                {badgeInfo.text}
              </span>

            </div>


            {/* DATA TARGET */}

            <div className="row g-3">

              {/* Judul Target */}

              <div className="col-12 col-md-8">

                <div className="employee-performance-info-card">

                  <span className="employee-performance-info-label">
                    Judul Target
                  </span>

                  <div className="employee-performance-info-value">
                    {target.title || '-'}
                  </div>

                </div>

              </div>


              {/* Kategori */}

              <div className="col-12 col-md-4">

                <div className="employee-performance-info-card">

                  <span className="employee-performance-info-label">
                    Kategori
                  </span>

                  <span className="employee-performance-category">
                    {target.category || '-'}
                  </span>

                </div>

              </div>


              {/* Progress */}

              <div className="col-12 col-sm-6 col-md-4">

                <div className="employee-performance-info-card text-center">

                  <span className="employee-performance-info-label">
                    Progress Akhir
                  </span>

                  <div className="employee-performance-info-value large text-primary">
                    {target.current_value ?? 0} / {target.target_value ?? 0}
                  </div>

                </div>

              </div>


              {/* Nilai */}

              <div className="col-6 col-sm-3 col-md-4">

                <div className="employee-performance-info-card text-center">

                  <span className="employee-performance-info-label">
                    Nilai
                  </span>

                  <div className="employee-performance-info-value large">
                    {data.score ?? '-'}
                  </div>

                </div>

              </div>


              {/* Grade */}

              <div className="col-6 col-sm-3 col-md-4">

                <div className="employee-performance-info-card text-center">

                  <span className="employee-performance-info-label">
                    Grade
                  </span>

                  <div className="employee-performance-info-value large text-primary">
                    {data.grade || '-'}
                  </div>

                </div>

              </div>


              {/* Supervisor */}

              <div className="col-12 col-md-6">

                <div className="employee-performance-info-card">

                  <span className="employee-performance-info-label">
                    Supervisor Penilai
                  </span>

                  <div className="employee-performance-info-value">
                    {supervisor.name || '-'}
                  </div>

                </div>

              </div>


              {/* Tanggal */}

              <div className="col-12 col-md-6">

                <div className="employee-performance-info-card">

                  <span className="employee-performance-info-label">
                    Tanggal Penilaian
                  </span>

                  <div className="employee-performance-info-value">
                    {formattedDate}
                  </div>

                </div>

              </div>

            </div>


            {/* FEEDBACK */}

            <div className="employee-performance-feedback">

              <label className="employee-performance-feedback-label">
                Feedback Supervisor
              </label>

              <div className="employee-performance-feedback-box">
                {data.feedback ||
                  'Tidak ada catatan feedback tambahan.'}
              </div>

            </div>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="employee-performance-footer">

            <button
              type="button"
              className="employee-performance-close-btn"
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

export default EmployeePerformanceDetailModal;