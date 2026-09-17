import React from "react";

const BPJSPaymentDetailModal = ({ show, onClose, data }) => {
  if (!show || !data) return null;

  const fileUrl = data.file_url
    ? data.file_url
    : data.file_path
    ? `${import.meta.env.VITE_API_URL}/storage/${data.file_path}`
    : null;

  const isPdf = data.file_path
    ? data.file_path.toLowerCase().endsWith(".pdf")
    : false;

  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  const bpjsType = data.bpjs_type
    ? String(data.bpjs_type)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "-";

  return (
    <div
      className="bpjs-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bpjs-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="bpjs-modal-header">
          <div className="bpjs-title-wrapper">
            <div className="bpjs-title-icon">
              <i className="bi bi-file-earmark-medical-fill"></i>
            </div>

            <div>
              <h4>Detail Bukti Pembayaran BPJS</h4>

              <span>
                Informasi pembayaran dan dokumen pendukung
              </span>
            </div>
          </div>

          <button
            type="button"
            className="bpjs-close-button"
            onClick={onClose}
            aria-label="Tutup"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}
        <div className="bpjs-modal-body">
          {/* ===================================================
              INFORMATION
          =================================================== */}
          <div className="bpjs-information">
            <div className="bpjs-section-title">
              <i className="bi bi-info-circle"></i>

              <span>Informasi Pembayaran</span>
            </div>

            <div className="bpjs-info-grid">
              {/* Nama Pegawai */}
              <div className="bpjs-info-item">
                <span className="bpjs-label">
                  Nama Pegawai
                </span>

                <strong>
                  {data.employee?.name || "-"}
                </strong>
              </div>

              {/* Jenis BPJS */}
              <div className="bpjs-info-item">
                <span className="bpjs-label">
                  Jenis BPJS
                </span>

                <strong className="text-capitalize">
                  {bpjsType}
                </strong>
              </div>

              {/* Periode */}
              <div className="bpjs-info-item">
                <span className="bpjs-label">
                  Periode
                </span>

                <strong>
                  {data.period || "-"}
                </strong>
              </div>

              {/* Tanggal */}
              <div className="bpjs-info-item">
                <span className="bpjs-label">
                  Tanggal Upload
                </span>

                <strong>
                  {formattedDate}
                </strong>
              </div>

              {/* Dokumen */}
              <div className="bpjs-info-item bpjs-info-full">
                <span className="bpjs-label">
                  Nama Dokumen
                </span>

                <strong className="document-name">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  {data.document_name || "-"}
                </strong>
              </div>

              {/* Catatan */}
              {data.notes && (
                <div className="bpjs-info-item bpjs-info-full">
                  <span className="bpjs-label">
                    Catatan
                  </span>

                  <div className="bpjs-notes">
                    {data.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              DOCUMENT PREVIEW
          =================================================== */}
          <div className="bpjs-preview-section">
            <div className="bpjs-section-title preview-title">
              <div>
                <i className="bi bi-eye"></i>

                <span>
                  Preview Dokumen
                </span>
              </div>

              {isPdf && (
                <span className="file-type-badge">
                  <i className="bi bi-file-earmark-pdf-fill me-1"></i>
                  PDF
                </span>
              )}
            </div>

            <div
              className={`bpjs-preview ${
                isPdf ? "pdf-preview" : "image-preview"
              }`}
            >
              {!fileUrl ? (
                <div className="bpjs-empty-preview">
                  <div className="empty-icon">
                    <i className="bi bi-file-earmark-x"></i>
                  </div>

                  <strong>
                    File tidak tersedia
                  </strong>

                  <span>
                    Dokumen pembayaran belum tersedia.
                  </span>
                </div>
              ) : isPdf ? (
                <iframe
                  src={fileUrl}
                  title="Preview PDF Bukti Pembayaran BPJS"
                  className="bpjs-pdf"
                />
              ) : (
                <div className="image-preview-inner">
                  <img
                    src={fileUrl}
                    alt="Preview Bukti Pembayaran BPJS"
                    className="bpjs-image"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="bpjs-modal-footer">
          <div className="footer-left">
            {fileUrl && (
              <span className="file-available">
                <i className="bi bi-check-circle-fill me-1"></i>
                Dokumen tersedia
              </span>
            )}
          </div>

          <div className="footer-actions">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bpjs-download-button"
              >
                <i className="bi bi-download"></i>
                <span>Download</span>
              </a>
            )}

            <button
              type="button"
              className="bpjs-close-footer"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================
          STYLES
      ======================================================= */}
      <style>
        {`
          /* =====================================================
             BACKDROP
          ===================================================== */

          .bpjs-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9999;
            padding: 20px;
            background: rgba(15, 23, 42, 0.58);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);

            display: flex;
            align-items: center;
            justify-content: center;

            animation: bpjsBackdropIn 0.18s ease-out;
          }

          @keyframes bpjsBackdropIn {
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

          .bpjs-modal {
            width: 100%;
            max-width: 1180px;

            height: min(94vh, 900px);
            max-height: 94vh;

            background: #ffffff;
            border-radius: 18px;

            display: flex;
            flex-direction: column;

            overflow: hidden;

            box-shadow:
              0 30px 80px rgba(15, 23, 42, 0.28),
              0 8px 25px rgba(15, 23, 42, 0.12);

            animation: bpjsModalIn 0.2s ease-out;
          }

          @keyframes bpjsModalIn {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* =====================================================
             HEADER
          ===================================================== */

          .bpjs-modal-header {
            flex-shrink: 0;

            min-height: 78px;

            padding: 16px 24px;

            border-bottom: 1px solid #e9edf3;

            display: flex;
            align-items: center;
            justify-content: space-between;

            background: #ffffff;
          }

          .bpjs-title-wrapper {
            display: flex;
            align-items: center;
            gap: 13px;

            min-width: 0;
          }

          .bpjs-title-icon {
            width: 44px;
            height: 44px;

            flex: 0 0 44px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 11px;

            background: #eef2ff;
            color: #4f46e5;

            font-size: 19px;
          }

          .bpjs-title-wrapper h4 {
            margin: 0;

            color: #172033;

            font-size: 18px;
            font-weight: 750;

            line-height: 1.3;
          }

          .bpjs-title-wrapper span {
            display: block;

            margin-top: 3px;

            color: #8a94a6;

            font-size: 11px;
          }

          .bpjs-close-button {
            width: 38px;
            height: 38px;

            flex: 0 0 38px;

            border: 0;
            border-radius: 9px;

            background: #f3f4f6;
            color: #667085;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            transition:
              background 0.15s ease,
              color 0.15s ease,
              transform 0.15s ease;
          }

          .bpjs-close-button:hover {
            background: #e8ebef;
            color: #1f2937;
            transform: scale(1.03);
          }

          /* =====================================================
             BODY
          ===================================================== */

          .bpjs-modal-body {
            flex: 1;

            min-height: 0;

            overflow-y: auto;
            overflow-x: hidden;

            padding: 20px 24px 24px;

            background: #f7f8fb;
          }

          /* =====================================================
             INFORMATION
          ===================================================== */

          .bpjs-information {
            background: #ffffff;

            border: 1px solid #e7ebf0;
            border-radius: 14px;

            padding: 18px;

            margin-bottom: 18px;
          }

          .bpjs-section-title {
            display: flex;
            align-items: center;
            gap: 8px;

            color: #30394b;

            font-size: 13px;
            font-weight: 750;

            margin-bottom: 14px;
          }

          .bpjs-section-title i {
            color: #5b52df;
            font-size: 14px;
          }

          .bpjs-info-grid {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 10px;
          }

          .bpjs-info-item {
            min-width: 0;

            padding: 12px 14px;

            border: 1px solid #edf0f4;
            border-radius: 10px;

            background: #fafbfc;
          }

          .bpjs-info-full {
            grid-column: 1 / -1;
          }

          .bpjs-label {
            display: block;

            margin-bottom: 4px;

            color: #8b94a3;

            font-size: 10px;
            font-weight: 600;
          }

          .bpjs-info-item strong {
            display: block;

            color: #30394b;

            font-size: 13px;
            font-weight: 700;

            word-break: break-word;
          }

          .document-name {
            display: flex !important;
            align-items: center;
          }

          .document-name i {
            color: #5b52df;
          }

          .bpjs-notes {
            color: #5f6878;

            font-size: 12px;
            line-height: 1.55;

            white-space: pre-wrap;
            word-break: break-word;
          }

          /* =====================================================
             PREVIEW
          ===================================================== */

          .bpjs-preview-section {
            background: #ffffff;

            border: 1px solid #e7ebf0;
            border-radius: 14px;

            overflow: hidden;
          }

          .preview-title {
            min-height: 52px;

            margin: 0;

            padding: 0 16px;

            border-bottom: 1px solid #e9edf3;

            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .preview-title > div {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .file-type-badge {
            display: inline-flex !important;
            align-items: center;

            padding: 4px 8px;

            border-radius: 6px;

            background: #fff0f0;
            color: #d33b3b;

            font-size: 9px !important;
            font-weight: 750 !important;
          }

          .bpjs-preview {
            width: 100%;

            min-height: 500px;

            background: #eef1f5;

            display: flex;
            align-items: center;
            justify-content: center;

            overflow: hidden;
          }

          .bpjs-preview.pdf-preview {
            height: 600px;
            min-height: 600px;
          }

          .bpjs-pdf {
            width: 100%;
            height: 100%;

            min-height: 600px;

            border: 0;

            display: block;

            background: #ffffff;
          }

          .image-preview-inner {
            width: 100%;
            min-height: 500px;

            padding: 24px;

            display: flex;
            align-items: center;
            justify-content: center;

            overflow: auto;
          }

          .bpjs-image {
            display: block;

            max-width: 100%;
            max-height: 600px;

            width: auto;
            height: auto;

            object-fit: contain;

            border-radius: 8px;

            box-shadow:
              0 8px 25px rgba(15, 23, 42, 0.12);
          }

          /* =====================================================
             EMPTY PREVIEW
          ===================================================== */

          .bpjs-empty-preview {
            min-height: 450px;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            text-align: center;

            color: #8b94a3;
          }

          .empty-icon {
            width: 64px;
            height: 64px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 16px;

            background: #e5e8ed;

            color: #8a94a3;

            font-size: 27px;

            margin-bottom: 12px;
          }

          .bpjs-empty-preview strong {
            color: #4b5563;

            font-size: 14px;
          }

          .bpjs-empty-preview span {
            margin-top: 4px;

            font-size: 11px;
          }

          /* =====================================================
             FOOTER
          ===================================================== */

          .bpjs-modal-footer {
            flex-shrink: 0;

            min-height: 68px;

            padding: 12px 24px;

            border-top: 1px solid #e9edf3;

            background: #ffffff;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 15px;
          }

          .footer-left {
            min-width: 0;
          }

          .file-available {
            color: #299153;

            font-size: 11px;
            font-weight: 650;
          }

          .footer-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .bpjs-download-button,
          .bpjs-close-footer {
            height: 40px;

            padding: 0 15px;

            border-radius: 9px;

            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;

            font-size: 12px;
            font-weight: 700;

            text-decoration: none;

            cursor: pointer;

            transition:
              transform 0.15s ease,
              background 0.15s ease;
          }

          .bpjs-download-button {
            background: #198754;
            color: #ffffff;
            border: 1px solid #198754;
          }

          .bpjs-download-button:hover {
            background: #157347;
            color: #ffffff;
            transform: translateY(-1px);
          }

          .bpjs-close-footer {
            min-width: 75px;

            background: #f3f4f6;
            color: #4b5563;

            border: 1px solid #e1e5ea;
          }

          .bpjs-close-footer:hover {
            background: #e7e9ed;
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 900px) {
            .bpjs-modal-backdrop {
              padding: 12px;
            }

            .bpjs-modal {
              height: 96vh;
              max-height: 96vh;
            }

            .bpjs-modal-body {
              padding: 16px;
            }

            .bpjs-preview.pdf-preview {
              height: 520px;
              min-height: 520px;
            }

            .bpjs-pdf {
              min-height: 520px;
            }
          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 576px) {
            .bpjs-modal-backdrop {
              padding: 0;

              align-items: stretch;
            }

            .bpjs-modal {
              width: 100%;
              height: 100dvh;
              max-height: 100dvh;

              border-radius: 0;
            }

            .bpjs-modal-header {
              min-height: 65px;

              padding: 12px 15px;
            }

            .bpjs-title-icon {
              width: 38px;
              height: 38px;

              flex-basis: 38px;

              border-radius: 9px;

              font-size: 16px;
            }

            .bpjs-title-wrapper {
              gap: 10px;
            }

            .bpjs-title-wrapper h4 {
              font-size: 15px;
            }

            .bpjs-title-wrapper span {
              font-size: 9px;
            }

            .bpjs-close-button {
              width: 34px;
              height: 34px;

              flex-basis: 34px;
            }

            .bpjs-modal-body {
              padding: 12px;

              overflow-y: auto;
            }

            .bpjs-information {
              padding: 13px;

              margin-bottom: 12px;

              border-radius: 11px;
            }

            .bpjs-section-title {
              font-size: 12px;

              margin-bottom: 11px;
            }

            .bpjs-info-grid {
              grid-template-columns: 1fr;

              gap: 8px;
            }

            .bpjs-info-full {
              grid-column: auto;
            }

            .bpjs-info-item {
              padding: 10px 11px;
            }

            .bpjs-label {
              font-size: 9px;
            }

            .bpjs-info-item strong {
              font-size: 12px;
            }

            .bpjs-notes {
              font-size: 11px;
            }

            .bpjs-preview-section {
              border-radius: 11px;
            }

            .preview-title {
              min-height: 46px;

              padding: 0 12px;
            }

            .bpjs-preview {
              min-height: 380px;
            }

            .bpjs-preview.pdf-preview {
              height: 55vh;
              min-height: 380px;
            }

            .bpjs-pdf {
              min-height: 380px;
            }

            .image-preview-inner {
              min-height: 380px;

              padding: 12px;
            }

            .bpjs-image {
              max-height: 55vh;
            }

            .bpjs-modal-footer {
              min-height: 62px;

              padding: 10px 12px;
            }

            .footer-left {
              display: none;
            }

            .footer-actions {
              width: 100%;
            }

            .bpjs-download-button,
            .bpjs-close-footer {
              flex: 1;

              height: 40px;
            }
          }

          /* =====================================================
             VERY SMALL MOBILE
          ===================================================== */

          @media (max-width: 380px) {
            .bpjs-title-wrapper span {
              display: none;
            }

            .bpjs-title-wrapper h4 {
              font-size: 14px;
            }

            .bpjs-modal-body {
              padding: 10px;
            }

            .bpjs-information {
              padding: 11px;
            }

            .bpjs-preview.pdf-preview {
              height: 50vh;
              min-height: 320px;
            }

            .bpjs-pdf {
              min-height: 320px;
            }

            .image-preview-inner {
              min-height: 320px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BPJSPaymentDetailModal;

