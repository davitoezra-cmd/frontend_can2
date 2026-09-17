import React, { useEffect, useState } from 'react';

const BusinessTripFormModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    trip_date: '',
    destination: '',
    purpose: '',
  });

  // Lock scroll halaman ketika modal terbuka
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Tutup dengan tombol ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData, () => {
      setFormData({
        trip_date: '',
        destination: '',
        purpose: '',
      });
    });
  };

  return (
    <>
      <style>{`
        /* =====================================================
           OVERLAY
        ===================================================== */

        .business-trip-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          height: 100dvh;

          background: rgba(15, 23, 42, 0.50);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          z-index: 2000;

          overflow-y: auto;

          animation: businessTripFadeIn 0.2s ease;
        }

        @keyframes businessTripFadeIn {
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

        .business-trip-modal {
          width: 100%;
          max-width: 520px;

          max-height: calc(100vh - 40px);
          max-height: calc(100dvh - 40px);

          background: #ffffff;

          border-radius: 16px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.20);

          display: flex;
          flex-direction: column;

          overflow: hidden;

          animation: businessTripSlideIn 0.22s ease;
        }

        @keyframes businessTripSlideIn {
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

        .business-trip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 18px 22px;

          border-bottom: 1px solid #e5e7eb;

          flex-shrink: 0;
        }

        .business-trip-title {
          margin: 0;

          font-size: 18px;
          font-weight: 700;

          color: #111827;
        }

        .business-trip-close {
          width: 34px;
          height: 34px;

          border: none;
          border-radius: 8px;

          background: #f3f4f6;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .business-trip-close:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .business-trip-close:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* =====================================================
           BODY
        ===================================================== */

        .business-trip-body {
          padding: 22px;

          overflow-y: auto;

          flex: 1;
          min-height: 0;
        }

        .business-trip-field {
          margin-bottom: 18px;
        }

        .business-trip-field:last-child {
          margin-bottom: 0;
        }

        .business-trip-label {
          display: block;

          margin-bottom: 7px;

          color: #6b7280;

          font-size: 12px;

          font-weight: 600;
        }

        .business-trip-input {
          width: 100%;

          min-height: 42px;

          border: 1px solid #d1d5db;

          border-radius: 9px;

          padding: 9px 12px;

          font-size: 14px;

          color: #111827;

          background: #ffffff;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .business-trip-input:focus {
          border-color: #4f46e5;

          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.10);
        }

        .business-trip-textarea {
          width: 100%;

          min-height: 100px;

          resize: vertical;

          border: 1px solid #d1d5db;

          border-radius: 9px;

          padding: 10px 12px;

          font-size: 14px;

          color: #111827;

          background: #ffffff;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .business-trip-textarea:focus {
          border-color: #4f46e5;

          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.10);
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .business-trip-footer {
          display: flex;

          justify-content: flex-end;

          align-items: center;

          gap: 10px;

          padding: 14px 22px;

          border-top: 1px solid #e5e7eb;

          background: #ffffff;

          flex-shrink: 0;
        }

        .business-trip-btn {
          min-height: 40px;

          padding: 8px 18px;

          border: none;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .business-trip-btn-cancel {
          background: #f3f4f6;

          color: #374151;
        }

        .business-trip-btn-cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .business-trip-btn-submit {
          background: #0d6efd;

          color: #ffffff;
        }

        .business-trip-btn-submit:hover:not(:disabled) {
          background: #0b5ed7;
        }

        .business-trip-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 575.98px) {
          .business-trip-overlay {
            padding: 12px;
          }

          .business-trip-modal {
            max-width: 100%;

            max-height: calc(100vh - 24px);
            max-height: calc(100dvh - 24px);

            border-radius: 14px;
          }

          .business-trip-header {
            padding: 15px 17px;
          }

          .business-trip-title {
            font-size: 16px;
          }

          .business-trip-body {
            padding: 18px;
          }

          .business-trip-footer {
            padding: 12px 17px;
          }

          .business-trip-btn {
            flex: 1;
          }
        }
      `}</style>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="business-trip-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-trip-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !loading) {
            onClose();
          }
        }}
      >
        {/* =================================================
            MODAL
        ================================================= */}

        <div className="business-trip-modal">
          
          {/* HEADER */}

          <div className="business-trip-header">
            <h5
              id="business-trip-title"
              className="business-trip-title"
            >
              Ajukan Dinas Luar
            </h5>

            <button
              type="button"
              className="business-trip-close"
              onClick={onClose}
              disabled={loading}
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            
            {/* BODY */}

            <div className="business-trip-body">

              {/* TANGGAL */}

              <div className="business-trip-field">
                <label className="business-trip-label">
                  Tanggal Dinas
                </label>

                <input
                  type="date"
                  className="business-trip-input"
                  name="trip_date"
                  value={formData.trip_date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* TUJUAN */}

              <div className="business-trip-field">
                <label className="business-trip-label">
                  Tujuan
                </label>

                <input
                  type="text"
                  className="business-trip-input"
                  name="destination"
                  placeholder="Contoh: PT. Client Utama Jakarta"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* KEPERLUAN */}

              <div className="business-trip-field">
                <label className="business-trip-label">
                  Keperluan
                </label>

                <textarea
                  className="business-trip-textarea"
                  name="purpose"
                  rows="3"
                  placeholder="Jelaskan agenda dan keperluan dinas..."
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

            </div>

            {/* FOOTER */}

            <div className="business-trip-footer">

              <button
                type="button"
                className="business-trip-btn business-trip-btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>

              <button
                type="submit"
                className="business-trip-btn business-trip-btn-submit"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default BusinessTripFormModal;