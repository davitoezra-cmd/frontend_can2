import React, { useEffect, useState } from 'react';
import {apiFetch} from '../api/apiFetch';
import { toast } from 'react-toastify';

const LeaveModal = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState('cuti');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

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
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setType('cuti');
    setStartDate('');
    setEndDate('');
    setReason('');
    setAttachment(null);
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !reason.trim()) {
      toast.warning(
        'Mohon lengkapi semua field bertanda bintang.'
      );
      return;
    }

    if (endDate < startDate) {
      toast.warning(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
      );
      return;
    }

    const formData = new FormData();

    formData.append('type', type);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('reason', reason.trim());

    if (attachment) {
      formData.append('attachment', attachment);
    }

    setLoading(true);

    try {
      const response = await apiFetch.post(
        '/employee/leave',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.success) {
        toast.success(
          response.data.message ||
            'Pengajuan cuti berhasil dikirim.'
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
        const firstError = Object.values(
          validationErrors
        )?.[0]?.[0];

        toast.error(
          firstError ||
            'Data yang dikirim tidak valid.'
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            'Gagal mengajukan cuti.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FILE
  // =========================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setAttachment(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning(
        'Ukuran lampiran maksimal 2 MB.'
      );

      e.target.value = '';
      setAttachment(null);
      return;
    }

    setAttachment(file);
  };

  // =========================================================
  // ESCAPE
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
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
  }, [isOpen, loading]);

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
           MODAL
        ===================================================== */

        .leave-modal-dialog {
          width: 100%;
          max-width: 760px;

          margin: 1.75rem auto;
        }

        .leave-modal-content {
          border: none !important;

          border-radius: 18px !important;

          overflow: hidden;

          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.20);
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .leave-modal-header {
          padding: 20px 24px;

          border-bottom: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }

        .leave-modal-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .leave-modal-icon {
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

        .leave-modal-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }

        .leave-modal-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        /* =====================================================
           CLOSE
        ===================================================== */

        .leave-close-button {
          width: 36px;
          height: 36px;

          border: none;

          border-radius: 9px;

          background: #F3F4F6;

          color: #6B7280;

          display: flex;

          align-items: center;

          justify-content: center;

          transition: 0.2s ease;
        }

        .leave-close-button:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .leave-modal-body {
          padding: 24px;

          background: #FFFFFF;

          max-height: calc(100vh - 210px);

          overflow-y: auto;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .leave-form-label {
          display: block;

          margin-bottom: 7px;

          font-size: 13px;

          font-weight: 600;

          color: #374151;
        }

        .leave-required {
          color: #EF4444;
        }


        .leave-form-control {
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

        .leave-form-control:focus {
          border-color: #4F46E5;

          box-shadow:
            0 0 0 3px rgba(79, 70, 229, 0.10);
        }

        textarea.leave-form-control {
          min-height: 110px;

          resize: vertical;
        }


        /* =====================================================
           FILE
        ===================================================== */

        .leave-file-info {
          margin-top: 6px;

          font-size: 11px;

          color: #6B7280;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .leave-modal-footer {
          padding: 16px 24px;

          border-top: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 10px;
        }


        /* =====================================================
           BUTTON
        ===================================================== */

        .leave-modal-button {
          min-height: 42px;

          padding: 9px 20px;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          border: none;
        }

        .leave-cancel-button {
          background: #F3F4F6;

          color: #374151;
        }

        .leave-cancel-button:hover {
          background: #E5E7EB;
        }

        .leave-submit-button {
          background: #4F46E5;

          color: #FFFFFF;
        }

        .leave-submit-button:hover:not(:disabled) {
          background: #4338CA;
        }

        .leave-modal-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .leave-modal-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }

          .leave-modal-content {
            border-radius: 14px !important;
          }

          .leave-modal-header {
            padding: 16px;
          }

          .leave-modal-body {
            padding: 18px;

            max-height: calc(100vh - 180px);
          }

          .leave-modal-footer {
            padding: 14px 16px;
          }

          .leave-modal-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }

          .leave-modal-title {
            font-size: 16px;
          }

          .leave-modal-subtitle {
            font-size: 11px;
          }
        }


        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {

          .leave-modal-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }

          .leave-modal-body {
            padding: 16px;
          }

          .leave-modal-footer {
            flex-direction: column-reverse;

            align-items: stretch;
          }

          .leave-modal-button {
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
            leave-modal-dialog
          "
        >

          <div className="modal-content leave-modal-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="leave-modal-header">

              <div className="leave-modal-header-left">

                <div className="leave-modal-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>

                <div>

                  <h5 className="leave-modal-title">
                    Form Pengajuan Cuti / Izin
                  </h5>

                  <p className="leave-modal-subtitle">
                    Lengkapi data pengajuan Anda.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="leave-close-button"
                onClick={handleClose}
                disabled={loading}
                title="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>

              <div className="leave-modal-body">

                {/* JENIS */}

                <div className="mb-3">

                  <label className="leave-form-label">
                    Jenis Pengajuan
                    <span className="leave-required">
                      {' '}*
                    </span>
                  </label>

                  <select
                    className="leave-form-control"
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value)
                    }
                    disabled={loading}
                  >

                    <option value="cuti">
                      Cuti
                    </option>

                    <option value="izin">
                      Izin
                    </option>

                    <option value="sakit">
                      Sakit
                    </option>

                  </select>

                </div>


                {/* TANGGAL */}

                <div className="row g-3 mb-3">

                  <div className="col-12 col-md-6">

                    <label className="leave-form-label">
                      Tanggal Mulai
                      <span className="leave-required">
                        {' '}*
                      </span>
                    </label>

                    <input
                      type="date"
                      className="leave-form-control"
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(e.target.value)
                      }
                      disabled={loading}
                      required
                    />

                  </div>


                  <div className="col-12 col-md-6">

                    <label className="leave-form-label">
                      Tanggal Selesai
                      <span className="leave-required">
                        {' '}*
                      </span>
                    </label>

                    <input
                      type="date"
                      className="leave-form-control"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) =>
                        setEndDate(e.target.value)
                      }
                      disabled={loading}
                      required
                    />

                  </div>

                </div>


                {/* ALASAN */}

                <div className="mb-3">

                  <label className="leave-form-label">
                    Alasan
                    <span className="leave-required">
                      {' '}*
                    </span>
                  </label>

                  <textarea
                    className="leave-form-control"
                    placeholder="Berikan alasan pengajuan..."
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    disabled={loading}
                    required
                  />

                </div>


                {/* ATTACHMENT */}

                <div>

                  <label className="leave-form-label">

                    Lampiran

                    <span className="text-muted fw-normal">
                      {' '}(Opsional)
                    </span>

                  </label>

                  <input
                    type="file"
                    className="leave-form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                  />

                  <div className="leave-file-info">
                    Format gambar, maksimal 2 MB.
                  </div>

                  {attachment && (
                    <div className="mt-2 small text-success">
                      File: {attachment.name}
                    </div>
                  )}

                </div>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="leave-modal-footer">

                <button
                  type="button"
                  className="
                    leave-modal-button
                    leave-cancel-button
                  "
                  onClick={handleClose}
                  disabled={loading}
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="
                    leave-modal-button
                    leave-submit-button
                  "
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span
                        className="
                          spinner-border
                          spinner-border-sm
                          me-2
                        "
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

export default LeaveModal;