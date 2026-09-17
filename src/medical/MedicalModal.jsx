import React, { useEffect, useState } from 'react';
import {apiFetch}from '../api/apiFetch';
import { toast } from 'react-toastify';

const MedicalModal = ({ isOpen, onClose, onSuccess }) => {
  const [sickDate, setSickDate] = useState('');
  const [reason, setReason] = useState('');
  const [doctorNote, setDoctorNote] = useState(null);
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
    setSickDate('');
    setReason('');
    setDoctorNote(null);
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
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setDoctorNote(null);
      return;
    }

    // Maksimal 2 MB
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Ukuran surat dokter maksimal 2 MB.');

      e.target.value = '';
      setDoctorNote(null);

      return;
    }

    setDoctorNote(file);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sickDate || !reason.trim()) {
      toast.warning(
        'Mohon isi tanggal sakit dan alasan.'
      );
      return;
    }

    const formData = new FormData();

    formData.append('sick_date', sickDate);
    formData.append('reason', reason.trim());

    if (doctorNote) {
      formData.append('doctor_note', doctorNote);
    }

    setLoading(true);

    try {
      const response = await apiFetch.post(
        '/employee/medical-leave',
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
            'Pengajuan sakit berhasil dikirim.'
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
            'Gagal mengajukan izin sakit.'
        );
      }
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
           MODAL DIALOG
        ===================================================== */

        .medical-modal-dialog {
          width: 100%;
          max-width: 760px;

          margin: 1.75rem auto;
        }


        /* =====================================================
           MODAL CONTENT
        ===================================================== */

        .medical-modal-content {
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

        .medical-modal-header {
          padding: 20px 24px;

          border-bottom: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .medical-modal-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .medical-modal-icon {
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


        .medical-modal-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }


        .medical-modal-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        /* =====================================================
           CLOSE BUTTON
        ===================================================== */

        .medical-close-button {
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


        .medical-close-button:hover {
          background: #E5E7EB;

          color: #111827;
        }


        /* =====================================================
           BODY
        ===================================================== */

        .medical-modal-body {
          padding: 24px;

          background: #FFFFFF;

          max-height: calc(100vh - 210px);

          overflow-y: auto;
        }


        /* =====================================================
           LABEL
        ===================================================== */

        .medical-form-label {
          display: block;

          margin-bottom: 7px;

          font-size: 13px;

          font-weight: 600;

          color: #374151;
        }


        .medical-required {
          color: #EF4444;
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .medical-form-control {
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


        .medical-form-control:focus {
          border-color: #4F46E5;

          box-shadow:
            0 0 0 3px rgba(79, 70, 229, 0.10);
        }


        textarea.medical-form-control {
          min-height: 120px;

          resize: vertical;
        }


        /* =====================================================
           FILE
        ===================================================== */

        .medical-file-info {
          margin-top: 6px;

          font-size: 11px;

          color: #6B7280;
        }


        .medical-file-selected {
          margin-top: 7px;

          padding: 8px 10px;

          border-radius: 8px;

          background: #F0FDF4;

          color: #166534;

          font-size: 12px;

          font-weight: 600;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .medical-modal-footer {
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

        .medical-modal-button {
          min-height: 42px;

          padding: 9px 20px;

          border: none;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          transition: all 0.2s ease;
        }


        .medical-cancel-button {
          background: #F3F4F6;

          color: #374151;
        }


        .medical-cancel-button:hover {
          background: #E5E7EB;
        }


        .medical-submit-button {
          background: #4F46E5;

          color: #FFFFFF;

          box-shadow:
            0 3px 10px rgba(79, 70, 229, 0.18);
        }


        .medical-submit-button:hover:not(:disabled) {
          background: #4338CA;

          transform: translateY(-1px);
        }


        .medical-modal-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;

          transform: none !important;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .medical-modal-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }


          .medical-modal-content {
            border-radius: 14px !important;
          }


          .medical-modal-header {
            padding: 16px;
          }


          .medical-modal-body {
            padding: 18px;

            max-height: calc(100vh - 180px);
          }


          .medical-modal-footer {
            padding: 14px 16px;
          }


          .medical-modal-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }


          .medical-modal-title {
            font-size: 16px;
          }


          .medical-modal-subtitle {
            font-size: 11px;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .medical-modal-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }


          .medical-modal-body {
            padding: 14px;
          }


          .medical-modal-footer {
            flex-direction: column-reverse;

            align-items: stretch;
          }


          .medical-modal-button {
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
            medical-modal-dialog
          "
        >

          <div className="modal-content medical-modal-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="medical-modal-header">

              <div className="medical-modal-header-left">

                <div className="medical-modal-icon">
                  <i className="bi bi-heart-pulse"></i>
                </div>

                <div>

                  <h5 className="medical-modal-title">
                    Form Pengajuan Sakit
                  </h5>

                  <p className="medical-modal-subtitle">
                    Lengkapi data pengajuan sakit Anda.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="medical-close-button"
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

              <div className="medical-modal-body">

                {/* TANGGAL SAKIT */}

                <div className="mb-3">

                  <label className="medical-form-label">

                    Tanggal Sakit

                    <span className="medical-required">
                      {' '}*
                    </span>

                  </label>

                  <input
                    type="date"
                    className="medical-form-control"
                    value={sickDate}
                    onChange={(e) =>
                      setSickDate(e.target.value)
                    }
                    disabled={loading}
                    required
                  />

                </div>


                {/* ALASAN */}

                <div className="mb-3">

                  <label className="medical-form-label">

                    Alasan / Diagnosa

                    <span className="medical-required">
                      {' '}*
                    </span>

                  </label>

                  <textarea
                    className="medical-form-control"
                    rows="4"
                    placeholder="Contoh: Demam tinggi dan flu berat..."
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    disabled={loading}
                    required
                  />

                </div>


                {/* SURAT DOKTER */}

                <div>

                  <label className="medical-form-label">

                    Surat Dokter

                    <span className="text-muted fw-normal">
                      {' '}(Opsional)
                    </span>

                  </label>

                  <input
                    type="file"
                    className="medical-form-control"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                  />

                  <div className="medical-file-info">
                    JPG, JPEG, PNG atau PDF. Maksimal 2 MB.
                  </div>

                  {doctorNote && (
                    <div className="medical-file-selected">
                      <i className="bi bi-paperclip me-1"></i>
                      {doctorNote.name}
                    </div>
                  )}

                </div>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="medical-modal-footer">

                <button
                  type="button"
                  className="
                    medical-modal-button
                    medical-cancel-button
                  "
                  onClick={handleClose}
                  disabled={loading}
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="
                    medical-modal-button
                    medical-submit-button
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

export default MedicalModal;