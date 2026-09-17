import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import { toast } from 'react-toastify';

const CashAdvanceModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
  // RESET
  // =========================================================

  const resetForm = () => {
    setAmount('');
    setReason('');
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!amount || numericAmount < 10000) {
      toast.error(
        'Nominal minimal adalah Rp 10.000'
      );
      return;
    }

    if (!reason.trim()) {
      toast.warning(
        'Mohon isi alasan pengajuan kasbon.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await apiFetch.post(
          '/employee/cash-advance',
          {
            amount: numericAmount,
            reason: reason.trim(),
          }
        );

      if (response.data?.success !== false) {
        toast.success(
          response.data?.message ||
            'Pengajuan kasbon berhasil dikirim.'
        );

        resetForm();

        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      }
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)?.[0]?.[0];

        toast.error(
          firstError ||
            'Data pengajuan tidak valid.'
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            'Gagal mengirim pengajuan.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // ESCAPE
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (
        e.key === 'Escape' &&
        !submitting
      ) {
        handleClose();
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
  }, [isOpen, submitting]);

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

        .cash-advance-modal-dialog {
          width: 100%;
          max-width: 620px;

          margin: 1.75rem auto;
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .cash-advance-modal-content {
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

        .cash-advance-modal-header {
          padding: 20px 24px;

          background: #FFFFFF;

          border-bottom: 1px solid #E5E7EB;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .cash-advance-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .cash-advance-icon {
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


        .cash-advance-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }


        .cash-advance-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        /* =====================================================
           CLOSE
        ===================================================== */

        .cash-advance-close {
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


        .cash-advance-close:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .cash-advance-modal-body {
          padding: 24px;

          background: #FFFFFF;
        }


        /* =====================================================
           LABEL
        ===================================================== */

        .cash-advance-label {
          display: block;

          margin-bottom: 7px;

          color: #374151;

          font-size: 13px;

          font-weight: 600;
        }


        .cash-advance-required {
          color: #EF4444;
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .cash-advance-control {
          width: 100%;

          min-height: 44px;

          padding: 9px 12px;

          border: 1px solid #D1D5DB;

          border-radius: 9px;

          background: #FFFFFF;

          color: #111827;

          font-size: 14px;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        .cash-advance-control:focus {
          border-color: #4F46E5;

          box-shadow:
            0 0 0 3px rgba(79, 70, 229, 0.10);
        }


        .cash-advance-control::placeholder {
          color: #9CA3AF;
        }


        textarea.cash-advance-control {
          min-height: 120px;

          resize: vertical;
        }


        /* =====================================================
           HELP TEXT
        ===================================================== */

        .cash-advance-help {
          display: block;

          margin-top: 6px;

          color: #6B7280;

          font-size: 11px;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .cash-advance-modal-footer {
          padding: 14px 24px;

          background: #FFFFFF;

          border-top: 1px solid #E5E7EB;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 10px;
        }


        /* =====================================================
           BUTTON
        ===================================================== */

        .cash-advance-button {
          min-height: 42px;

          padding: 9px 20px;

          border: none;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          transition: all 0.2s ease;
        }


        .cash-advance-cancel {
          background: #F3F4F6;

          color: #374151;
        }


        .cash-advance-cancel:hover {
          background: #E5E7EB;

          color: #111827;
        }


        .cash-advance-submit {
          background: #4F46E5;

          color: #FFFFFF;

          box-shadow:
            0 3px 10px rgba(79, 70, 229, 0.18);
        }


        .cash-advance-submit:hover:not(:disabled) {
          background: #4338CA;

          transform: translateY(-1px);
        }


        .cash-advance-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none !important;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .cash-advance-modal-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }


          .cash-advance-modal-content {
            border-radius: 14px !important;
          }


          .cash-advance-modal-header {
            padding: 16px;
          }


          .cash-advance-modal-body {
            padding: 18px;
          }


          .cash-advance-modal-footer {
            padding: 13px 16px;
          }


          .cash-advance-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }


          .cash-advance-title {
            font-size: 16px;
          }


          .cash-advance-subtitle {
            font-size: 11px;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .cash-advance-modal-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }


          .cash-advance-modal-body {
            padding: 14px;
          }


          .cash-advance-modal-footer {
            padding: 12px;

            flex-direction: column-reverse;

            align-items: stretch;
          }


          .cash-advance-button {
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
            cash-advance-modal-dialog
          "
        >

          <div className="modal-content cash-advance-modal-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="cash-advance-modal-header">

              <div className="cash-advance-header-left">

                <div className="cash-advance-icon">
                  <i className="bi bi-cash-stack"></i>
                </div>

                <div>

                  <h5 className="cash-advance-title">
                    Ajukan Kasbon Baru
                  </h5>

                  <p className="cash-advance-subtitle">
                    Lengkapi data pengajuan kasbon Anda.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="cash-advance-close"
                onClick={handleClose}
                disabled={submitting}
                title="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>

              <div className="cash-advance-modal-body">

                {/* NOMINAL */}

                <div className="mb-3">

                  <label className="cash-advance-label">

                    Nominal Kasbon (Rp)

                    <span className="cash-advance-required">
                      {' '}*
                    </span>

                  </label>

                  <input
                    type="number"
                    className="cash-advance-control"
                    placeholder="Masukkan nominal kasbon"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    min="10000"
                    step="1000"
                    disabled={submitting}
                    required
                  />

                  <small className="cash-advance-help">
                    Minimal pengajuan Rp 10.000
                  </small>

                </div>


                {/* ALASAN */}

                <div>

                  <label className="cash-advance-label">

                    Alasan Pengajuan

                    <span className="cash-advance-required">
                      {' '}*
                    </span>

                  </label>

                  <textarea
                    className="cash-advance-control"
                    rows="4"
                    placeholder="Tuliskan alasan pengajuan kasbon..."
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    disabled={submitting}
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="cash-advance-modal-footer">

                <button
                  type="button"
                  className="
                    cash-advance-button
                    cash-advance-cancel
                  "
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="
                    cash-advance-button
                    cash-advance-submit
                  "
                  disabled={submitting}
                >

                  {submitting ? (
                    <>
                      <span
                        className="
                          spinner-border
                          spinner-border-sm
                          me-2
                        "
                        role="status"
                      ></span>

                      Mengirim...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Kirim Pengajuan
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>
    </>
  );
};

export default CashAdvanceModal;