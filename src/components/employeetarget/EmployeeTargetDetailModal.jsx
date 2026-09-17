import React, { useEffect } from 'react';

const EmployeeTargetDetailModal = ({ show, onClose, data }) => {
  useEffect(() => {
    if (!show) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  if (!show || !data) return null;

  const percent = Math.min(
    100,
    Math.max(0, Number(data.progress_percent) || 0)
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <style>{`
        /* =====================================================
           OVERLAY
        ===================================================== */

        .employee-target-detail-overlay {
          position: fixed;
          inset: 0;

          width: 100%;
          height: 100%;

          z-index: 2000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background: rgba(15, 23, 42, 0.55);

          backdrop-filter: blur(3px);

          overflow-y: auto;

          animation: employeeTargetFadeIn 0.2s ease;
        }

        @keyframes employeeTargetFadeIn {
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

        .employee-target-detail-modal {
          width: 100%;

          max-width: 720px;

          max-height: calc(100vh - 40px);
          max-height: calc(100dvh - 40px);

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.25);

          display: flex;
          flex-direction: column;

          overflow: hidden;

          animation: employeeTargetSlideIn 0.22s ease;
        }

        @keyframes employeeTargetSlideIn {
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

        .employee-target-detail-header {
          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 18px 22px;

          border-bottom: 1px solid #e5e7eb;

          background: #ffffff;
        }

        .employee-target-detail-header-left {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 12px;
        }

        .employee-target-detail-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #eef2ff;

          color: #4f46e5;
        }

        .employee-target-detail-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;

          line-height: 1.3;
        }

        .employee-target-detail-subtitle {
          margin: 3px 0 0;

          color: #6b7280;

          font-size: 12px;

          line-height: 1.4;
        }

        .employee-target-detail-close {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border: none;

          border-radius: 9px;

          background: #f3f4f6;

          color: #6b7280;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .employee-target-detail-close:hover {
          background: #e5e7eb;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .employee-target-detail-body {
          flex: 1;

          min-height: 0;

          overflow-y: auto;

          padding: 22px;

          background: #ffffff;
        }


        /* =====================================================
           TARGET HEADER
        ===================================================== */

        .employee-target-detail-summary {
          padding: 16px;

          margin-bottom: 18px;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 13px;
        }

        .employee-target-detail-target-title {
          margin: 0 0 8px;

          color: #111827;

          font-size: 16px;

          font-weight: 700;

          line-height: 1.45;

          word-break: break-word;
        }

        .employee-target-detail-category {
          display: inline-flex;

          align-items: center;

          padding: 5px 10px;

          border-radius: 7px;

          background: #eef2ff;

          border: 1px solid #c7d2fe;

          color: #4338ca;

          font-size: 11px;

          font-weight: 600;
        }


        /* =====================================================
           INFORMATION GRID
        ===================================================== */

        .employee-target-detail-grid {
          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 12px;

          margin-bottom: 12px;
        }

        .employee-target-detail-item {
          min-width: 0;

          padding: 14px;

          background: #ffffff;

          border: 1px solid #e5e7eb;

          border-radius: 11px;
        }

        .employee-target-detail-label {
          display: block;

          margin-bottom: 5px;

          color: #6b7280;

          font-size: 11px;

          font-weight: 600;
        }

        .employee-target-detail-value {
          color: #111827;

          font-size: 13px;

          font-weight: 600;

          line-height: 1.5;

          word-break: break-word;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .employee-target-detail-status {
          display: inline-flex;

          align-items: center;

          padding: 5px 10px;

          border-radius: 999px;

          background: #f3f4f6;

          color: #374151;

          font-size: 11px;

          font-weight: 600;

          text-transform: capitalize;
        }


        /* =====================================================
           VALUE / PROGRESS
        ===================================================== */

        .employee-target-detail-values {
          display: grid;

          grid-template-columns: repeat(3, minmax(0, 1fr));

          gap: 12px;

          margin-bottom: 18px;
        }

        .employee-target-detail-value-card {
          padding: 14px;

          text-align: center;

          background: #ffffff;

          border: 1px solid #e5e7eb;

          border-radius: 11px;
        }

        .employee-target-detail-number {
          display: block;

          margin-top: 2px;

          color: #111827;

          font-size: 18px;

          font-weight: 700;

          line-height: 1.3;

          word-break: break-word;
        }

        .employee-target-detail-number.primary {
          color: #4f46e5;
        }

        .employee-target-detail-number.success {
          color: #16a34a;
        }


        /* =====================================================
           PROGRESS BAR
        ===================================================== */

        .employee-target-detail-progress {
          margin-top: 10px;
        }

        .employee-target-detail-progress-bar {
          width: 100%;

          height: 7px;

          overflow: hidden;

          background: #e5e7eb;

          border-radius: 999px;
        }

        .employee-target-detail-progress-fill {
          height: 100%;

          background: #4f46e5;

          border-radius: 999px;

          transition: width 0.3s ease;
        }


        /* =====================================================
           NOTES
        ===================================================== */

        .employee-target-detail-note-section {
          padding: 14px;

          background: #ffffff;

          border: 1px solid #e5e7eb;

          border-radius: 11px;
        }

        .employee-target-detail-note {
          margin: 0;

          color: #374151;

          font-size: 13px;

          line-height: 1.65;

          white-space: pre-line;

          word-break: break-word;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .employee-target-detail-footer {
          flex-shrink: 0;

          display: flex;

          justify-content: flex-end;

          align-items: center;

          padding: 13px 22px;

          border-top: 1px solid #e5e7eb;

          background: #ffffff;
        }

        .employee-target-detail-close-btn {
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

        .employee-target-detail-close-btn:hover {
          background: #4b5563;
        }


        /* =====================================================
           TABLET / MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {
          .employee-target-detail-overlay {
            padding: 12px;
          }

          .employee-target-detail-modal {
            max-width: 100%;

            max-height: calc(100vh - 24px);
            max-height: calc(100dvh - 24px);

            border-radius: 15px;
          }

          .employee-target-detail-header {
            padding: 15px 17px;
          }

          .employee-target-detail-icon {
            width: 38px;
            height: 38px;

            border-radius: 9px;
          }

          .employee-target-detail-title {
            font-size: 16px;
          }

          .employee-target-detail-subtitle {
            font-size: 11px;
          }

          .employee-target-detail-body {
            padding: 17px;
          }

          .employee-target-detail-grid {
            gap: 10px;
          }

          .employee-target-detail-values {
            gap: 10px;
          }

          .employee-target-detail-value-card {
            padding: 12px 8px;
          }

          .employee-target-detail-number {
            font-size: 16px;
          }

          .employee-target-detail-footer {
            padding: 12px 17px;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .employee-target-detail-overlay {
            padding: 8px;
          }

          .employee-target-detail-modal {
            max-height: calc(100vh - 16px);
            max-height: calc(100dvh - 16px);

            border-radius: 13px;
          }

          .employee-target-detail-header {
            padding: 13px 15px;
          }

          .employee-target-detail-header-left {
            gap: 9px;
          }

          .employee-target-detail-icon {
            width: 35px;
            height: 35px;
          }

          .employee-target-detail-title {
            font-size: 15px;
          }

          .employee-target-detail-body {
            padding: 15px;
          }

          .employee-target-detail-grid {
            grid-template-columns: 1fr;
          }

          .employee-target-detail-values {
            grid-template-columns: 1fr 1fr 1fr;

            gap: 7px;
          }

          .employee-target-detail-value-card {
            padding: 11px 5px;
          }

          .employee-target-detail-label {
            font-size: 10px;
          }

          .employee-target-detail-number {
            font-size: 14px;
          }

          .employee-target-detail-footer {
            padding: 11px 15px;
          }

          .employee-target-detail-close-btn {
            width: 100%;
          }
        }
      `}</style>

      <div
        className="employee-target-detail-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-target-detail-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="employee-target-detail-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="employee-target-detail-header">
            <div className="employee-target-detail-header-left">

              <div className="employee-target-detail-icon">
                <i className="bi bi-bullseye fs-5"></i>
              </div>

              <div>
                <h5
                  id="employee-target-detail-title"
                  className="employee-target-detail-title"
                >
                  Detail Target Kinerja
                </h5>

                <p className="employee-target-detail-subtitle">
                  Informasi lengkap spesifikasi target
                </p>
              </div>

            </div>

            <button
              type="button"
              className="employee-target-detail-close"
              onClick={onClose}
              aria-label="Close"
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>


          {/* =================================================
              BODY
          ================================================= */}

          <div className="employee-target-detail-body">

            {/* TARGET SUMMARY */}

            <div className="employee-target-detail-summary">

              <h6 className="employee-target-detail-target-title">
                {data.title || data.judul || '-'}
              </h6>

              <span className="employee-target-detail-category">
                {data.category || data.kategori || 'Umum'}
              </span>

            </div>


            {/* SUPERVISOR & STATUS */}

            <div className="employee-target-detail-grid">

              <div className="employee-target-detail-item">
                <span className="employee-target-detail-label">
                  Supervisor
                </span>

                <span className="employee-target-detail-value">
                  {data.supervisor?.name || '-'}
                </span>
              </div>

              <div className="employee-target-detail-item">
                <span className="employee-target-detail-label">
                  Status Target
                </span>

                <span className="employee-target-detail-status">
                  {data.status || '-'}
                </span>
              </div>

              <div className="employee-target-detail-item">
                <span className="employee-target-detail-label">
                  Tanggal Mulai
                </span>

                <span className="employee-target-detail-value">
                  {formatDate(data.start_date)}
                </span>
              </div>

              <div className="employee-target-detail-item">
                <span className="employee-target-detail-label">
                  Tanggal Selesai
                </span>

                <span className="employee-target-detail-value">
                  {formatDate(data.end_date)}
                </span>
              </div>

            </div>


            {/* VALUES */}

            <div className="employee-target-detail-values">

              <div className="employee-target-detail-value-card">

                <span className="employee-target-detail-label">
                  Target Value
                </span>

                <span className="employee-target-detail-number">
                  {data.target_value ?? 0}
                </span>

              </div>


              <div className="employee-target-detail-value-card">

                <span className="employee-target-detail-label">
                  Current Value
                </span>

                <span className="employee-target-detail-number primary">
                  {data.current_value ?? 0}
                </span>

              </div>


              <div className="employee-target-detail-value-card">

                <span className="employee-target-detail-label">
                  Progress
                </span>

                <span className="employee-target-detail-number success">
                  {percent}%
                </span>

                <div className="employee-target-detail-progress">
                  <div className="employee-target-detail-progress-bar">
                    <div
                      className="employee-target-detail-progress-fill"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

              </div>

            </div>


            {/* CATATAN */}

            <div className="employee-target-detail-note-section">

              <span className="employee-target-detail-label">
                Catatan Supervisor
              </span>

              <p className="employee-target-detail-note">
                {data.notes ||
                  data.catatan ||
                  'Tidak ada catatan tambahan dari supervisor.'}
              </p>

            </div>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="employee-target-detail-footer">

            <button
              type="button"
              className="employee-target-detail-close-btn"
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

export default React.memo(EmployeeTargetDetailModal);