import React, { useEffect } from 'react';

const EmployeeBPJSDetailModal = ({ show, onClose, data, onDownload }) => {
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

  const isKesehatan = data?.bpjs_type === 'kesehatan';

  const formatPeriod = (periodStr) => {
    if (!periodStr) return '-';

    const [year, month] = periodStr.split('-');

    if (!year || !month) return periodStr;

    const date = new Date(year, month - 1);

    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';

    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const fileUrl =
    data?.file_url ||
    (data?.file_path ? `/storage/${data.file_path}` : null);

  const isPdf = fileUrl
    ? fileUrl.toLowerCase().split('?')[0].endsWith('.pdf')
    : false;

  return (
    <>
      <style>{`
        .bpjs-detail-overlay {
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

          animation: bpjsFadeIn 0.2s ease;
        }

        @keyframes bpjsFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .bpjs-detail-modal {
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

          animation: bpjsSlideIn 0.22s ease;
        }

        @keyframes bpjsSlideIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .bpjs-detail-header {
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 18px 22px;

          border-bottom: 1px solid #e5e7eb;

          background: #ffffff;
        }

        .bpjs-detail-title {
          margin: 0;

          color: #111827;

          font-size: 18px;
          font-weight: 700;
        }

        .bpjs-detail-subtitle {
          margin: 4px 0 0;

          color: #6b7280;

          font-size: 12px;
          line-height: 1.5;
        }

        .bpjs-detail-close {
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

        .bpjs-detail-close:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .bpjs-detail-body {
          flex: 1;

          min-height: 0;

          overflow-y: auto;

          padding: 22px;

          background: #ffffff;
        }

        .bpjs-summary {
          display: grid;

          grid-template-columns: repeat(4, 1fr);

          gap: 12px;

          padding: 15px;

          margin-bottom: 20px;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 13px;
        }

        .bpjs-summary-item {
          min-width: 0;
        }

        .bpjs-label {
          display: block;

          margin-bottom: 5px;

          color: #6b7280;

          font-size: 11px;
          font-weight: 600;
        }

        .bpjs-value {
          color: #111827;

          font-size: 13px;
          font-weight: 600;

          line-height: 1.5;

          word-break: break-word;
        }

        .bpjs-type-badge {
          display: inline-flex;

          align-items: center;

          padding: 5px 10px;

          border-radius: 999px;

          font-size: 11px;
          font-weight: 600;
        }

        .bpjs-type-health {
          background: #dcfce7;
          color: #166534;
        }

        .bpjs-type-work {
          background: #fef3c7;
          color: #92400e;
        }

        .bpjs-note-section {
          margin-bottom: 20px;
        }

        .bpjs-section-title {
          display: block;

          margin-bottom: 7px;

          color: #374151;

          font-size: 12px;
          font-weight: 700;
        }

        .bpjs-note {
          padding: 12px 14px;

          background: #ffffff;

          border: 1px solid #e5e7eb;

          border-radius: 10px;

          color: #4b5563;

          font-size: 13px;

          line-height: 1.6;

          word-break: break-word;
        }

        .bpjs-preview-wrapper {
          margin-top: 5px;

          border: 1px solid #e5e7eb;

          border-radius: 12px;

          background: #f8fafc;

          overflow: hidden;
        }

        .bpjs-preview {
          min-height: 180px;

          max-height: 420px;

          padding: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: auto;
        }

        .bpjs-preview iframe {
          width: 100%;

          height: 390px;

          border: none;

          border-radius: 8px;

          background: #ffffff;
        }

        .bpjs-preview img {
          display: block;

          max-width: 100%;
          max-height: 390px;

          object-fit: contain;

          border-radius: 8px;

          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.08);
        }

        .bpjs-no-preview {
          padding: 45px 20px;

          text-align: center;

          color: #6b7280;

          font-size: 13px;
        }

        .bpjs-no-preview i {
          display: block;

          margin-bottom: 8px;

          font-size: 40px;

          color: #9ca3af;
        }

        .bpjs-detail-footer {
          flex-shrink: 0;

          display: flex;

          justify-content: flex-end;
          align-items: center;

          gap: 10px;

          padding: 13px 22px;

          border-top: 1px solid #e5e7eb;

          background: #ffffff;
        }

        .bpjs-footer-btn {
          min-height: 40px;

          padding: 8px 18px;

          border: none;

          border-radius: 9px;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .bpjs-btn-close {
          background: #f3f4f6;

          color: #374151;
        }

        .bpjs-btn-close:hover {
          background: #e5e7eb;
        }

        .bpjs-btn-download {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          background: #198754;

          color: #ffffff;
        }

        .bpjs-btn-download:hover {
          background: #157347;
        }

        @media (max-width: 767.98px) {
          .bpjs-detail-overlay {
            padding: 12px;
          }

          .bpjs-detail-modal {
            max-width: 100%;

            max-height: calc(100vh - 24px);
            max-height: calc(100dvh - 24px);

            border-radius: 15px;
          }

          .bpjs-detail-header {
            padding: 15px 17px;
          }

          .bpjs-detail-title {
            font-size: 16px;
          }

          .bpjs-detail-subtitle {
            font-size: 11px;
          }

          .bpjs-detail-body {
            padding: 17px;
          }

          .bpjs-summary {
            grid-template-columns: 1fr 1fr;

            gap: 14px;

            padding: 14px;
          }

          .bpjs-preview {
            min-height: 150px;

            max-height: 350px;
          }

          .bpjs-preview iframe {
            height: 320px;
          }

          .bpjs-preview img {
            max-height: 320px;
          }

          .bpjs-detail-footer {
            padding: 12px 17px;
          }
        }

        @media (max-width: 480px) {
          .bpjs-detail-overlay {
            padding: 8px;
          }

          .bpjs-detail-modal {
            max-height: calc(100vh - 16px);
            max-height: calc(100dvh - 16px);

            border-radius: 13px;
          }

          .bpjs-summary {
            grid-template-columns: 1fr;
          }

          .bpjs-detail-footer {
            flex-direction: column;
          }

          .bpjs-footer-btn {
            width: 100%;
          }

          .bpjs-preview iframe {
            height: 280px;
          }

          .bpjs-preview img {
            max-height: 280px;
          }
        }
      `}</style>

      <div
        className="bpjs-detail-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bpjs-detail-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bpjs-detail-modal">

          {/* HEADER */}
          <div className="bpjs-detail-header">
            <div>
              <h5
                id="bpjs-detail-title"
                className="bpjs-detail-title"
              >
                Detail Bukti Pembayaran BPJS
              </h5>

              <p className="bpjs-detail-subtitle">
                Informasi lengkap terkait bukti pembayaran BPJS Anda.
              </p>
            </div>

            <button
              type="button"
              className="bpjs-detail-close"
              onClick={onClose}
              aria-label="Close"
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* BODY */}
          <div className="bpjs-detail-body">

            {/* SUMMARY */}
            <div className="bpjs-summary">

              <div className="bpjs-summary-item">
                <span className="bpjs-label">
                  Jenis BPJS
                </span>

                <span
                  className={`bpjs-type-badge ${
                    isKesehatan
                      ? 'bpjs-type-health'
                      : 'bpjs-type-work'
                  }`}
                >
                  {isKesehatan
                    ? 'BPJS Kesehatan'
                    : 'BPJS Ketenagakerjaan'}
                </span>
              </div>

              <div className="bpjs-summary-item">
                <span className="bpjs-label">
                  Periode
                </span>

                <span className="bpjs-value">
                  {formatPeriod(data?.period)}
                </span>
              </div>

              <div className="bpjs-summary-item">
                <span className="bpjs-label">
                  Nama Dokumen
                </span>

                <span
                  className="bpjs-value"
                  title={data?.document_name}
                >
                  {data?.document_name ||
                    data?.file_name ||
                    '-'}
                </span>
              </div>

              <div className="bpjs-summary-item">
                <span className="bpjs-label">
                  Tanggal Upload
                </span>

                <span className="bpjs-value">
                  {formatDate(data?.created_at)}
                </span>
              </div>

            </div>

            {/* CATATAN */}
            <div className="bpjs-note-section">

              <span className="bpjs-section-title">
                Catatan dari Finance
              </span>

              <div className="bpjs-note">
                {data?.notes ||
                  data?.remarks ||
                  'Tidak ada catatan khusus dari tim Finance.'}
              </div>

            </div>

            {/* PREVIEW */}
            <div>

              <span className="bpjs-section-title">
                Preview Dokumen
              </span>

              <div className="bpjs-preview-wrapper">

                <div className="bpjs-preview">

                  {fileUrl ? (
                    isPdf ? (
                      <iframe
                        src={fileUrl}
                        title="Preview PDF"
                      ></iframe>
                    ) : (
                      <img
                        src={fileUrl}
                        alt="Bukti BPJS"
                      />
                    )
                  ) : (
                    <div className="bpjs-no-preview">
                      <i className="bi bi-file-earmark-x"></i>

                      <span>
                        Preview tidak tersedia untuk file ini.
                      </span>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="bpjs-detail-footer">

            <button
              type="button"
              className="bpjs-footer-btn bpjs-btn-close"
              onClick={onClose}
            >
              Tutup
            </button>

            <button
              type="button"
              className="bpjs-footer-btn bpjs-btn-download"
              onClick={() => onDownload(data)}
            >
              <i className="bi bi-download"></i>
              <span>Download Dokumen</span>
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default EmployeeBPJSDetailModal;