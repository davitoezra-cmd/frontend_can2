import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/apiFetch';
import Swal from 'sweetalert2';
import { FaUtensils } from 'react-icons/fa';

const MealAllowanceModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {

  const [form, setForm] = useState({
    meal_date: '',
    amount: '',
    reason: '',
  });

  const [saving, setSaving] = useState(false);


  // =========================================================
  // RESET FORM
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      setForm({
        meal_date: '',
        amount: '',
        reason: '',
      });

      setSaving(false);
    }
  }, [isOpen]);


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.meal_date) {
      await Swal.fire({
        icon: 'warning',
        title: 'Tanggal belum diisi',
        text: 'Silakan pilih tanggal uang makan.',
      });

      return;
    }


    if (
      form.amount === '' ||
      Number(form.amount) < 0
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nominal belum valid',
        text: 'Silakan masukkan nominal uang makan yang valid.',
      });

      return;
    }


    setSaving(true);

    try {

      const response = await apiFetch.post(
        '/employee/meal-allowance',
        {
          meal_date: form.meal_date,
          amount: form.amount,
          reason: form.reason || null,
        }
      );


      if (response.data?.success) {

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text:
            response.data.message ||
            'Pengajuan uang makan berhasil dikirim.',
          confirmButtonText: 'OK',
        });

        onClose();

        if (onSuccess) {
          await onSuccess();
        }

      } else {

        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text:
            response.data?.message ||
            'Pengajuan uang makan gagal dikirim.',
        });

      }

    } catch (error) {

      console.error(
        'Gagal mengirim pengajuan uang makan:',
        error
      );


      const validationErrors =
        error.response?.data?.errors;


      let message =
        error.response?.data?.message ||
        'Terjadi kesalahan saat mengirim pengajuan uang makan.';


      if (validationErrors) {

        const firstError = Object.values(
          validationErrors
        )?.[0]?.[0];

        if (firstError) {
          message = firstError;
        }

      }


      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: message,
      });

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // NOT OPEN
  // =========================================================

  if (!isOpen) {
    return null;
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>{`

        .meal-request-dialog {
          width: 100%;
          max-width: 560px;
          margin: 1.75rem auto;
        }


        .meal-request-content {
          border: none !important;

          border-radius: 18px !important;

          overflow: hidden;

          background: #FFFFFF;

          box-shadow:
            0 20px 50px rgba(15, 23, 42, 0.20);
        }


        .meal-request-header {
          padding: 20px 24px;

          border-bottom: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .meal-request-header-left {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .meal-request-icon {
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


        .meal-request-title {
          margin: 0;

          color: #111827;

          font-size: 18px;

          font-weight: 700;
        }


        .meal-request-subtitle {
          margin: 3px 0 0;

          color: #6B7280;

          font-size: 12px;
        }


        .meal-request-close {
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


        .meal-request-close:hover {
          background: #E5E7EB;

          color: #111827;
        }


        .meal-request-body {
          padding: 24px;

          background: #FFFFFF;
        }


        .meal-request-label {
          display: block;

          margin-bottom: 7px;

          color: #374151;

          font-size: 13px;

          font-weight: 600;
        }


        .meal-request-required {
          color: #DC2626;
        }


        .meal-request-input {
          min-height: 44px;

          border: 1px solid #D1D5DB;

          border-radius: 10px;

          color: #111827;

          font-size: 14px;

          transition: all 0.2s ease;
        }


        .meal-request-input:focus {
          border-color: #4F46E5;

          box-shadow:
            0 0 0 3px rgba(79, 70, 229, 0.10);
        }


        .meal-request-textarea {
          min-height: 110px;

          resize: vertical;
        }


        .meal-request-footer {
          padding: 14px 24px;

          border-top: 1px solid #E5E7EB;

          background: #FFFFFF;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 10px;
        }


        .meal-request-cancel {
          min-height: 42px;

          padding: 9px 18px;

          border: none;

          border-radius: 9px;

          background: #F3F4F6;

          color: #374151;

          font-size: 13px;

          font-weight: 600;

          transition: all 0.2s ease;
        }


        .meal-request-cancel:hover {
          background: #E5E7EB;

          color: #111827;
        }


        .meal-request-submit {
          min-height: 42px;

          padding: 9px 20px;

          border: none;

          border-radius: 9px;

          background: #4F46E5;

          color: #FFFFFF;

          font-size: 13px;

          font-weight: 600;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          transition: all 0.2s ease;
        }


        .meal-request-submit:hover {
          background: #4338CA;
        }


        .meal-request-submit:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }


        .meal-request-help {
          margin-top: 6px;

          color: #6B7280;

          font-size: 11px;
        }


        @media (max-width: 767.98px) {

          .meal-request-dialog {
            max-width: calc(100% - 24px);

            margin: 12px auto;
          }


          .meal-request-content {
            border-radius: 14px !important;
          }


          .meal-request-header {
            padding: 16px;
          }


          .meal-request-body {
            padding: 18px;
          }


          .meal-request-footer {
            padding: 13px 16px;
          }


          .meal-request-icon {
            width: 38px;
            height: 38px;

            font-size: 16px;
          }


          .meal-request-title {
            font-size: 16px;
          }


          .meal-request-subtitle {
            font-size: 11px;
          }
        }


        @media (max-width: 400px) {

          .meal-request-dialog {
            max-width: calc(100% - 16px);

            margin: 8px auto;
          }


          .meal-request-body {
            padding: 14px;
          }


          .meal-request-footer {
            padding: 12px;
          }


          .meal-request-footer button {
            flex: 1;
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
            meal-request-dialog
          "
        >

          <div className="modal-content meal-request-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="meal-request-header">

              <div className="meal-request-header-left">

                <div className="meal-request-icon">
                  <FaUtensils />
                </div>

                <div>

                  <h5 className="meal-request-title">
                    Ajukan Uang Makan
                  </h5>

                  <p className="meal-request-subtitle">
                    Silakan isi data pengajuan uang makan.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="meal-request-close"
                onClick={onClose}
                disabled={saving}
                title="Tutup"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <form onSubmit={handleSubmit}>

              <div className="meal-request-body">

                <div className="row g-3">

                  {/* TANGGAL */}

                  <div className="col-12">

                    <label
                      htmlFor="meal_date"
                      className="meal-request-label"
                    >
                      Tanggal Uang Makan
                      <span className="meal-request-required">
                        {' '}*
                      </span>
                    </label>

                    <input
                      id="meal_date"
                      type="date"
                      name="meal_date"
                      className="form-control meal-request-input"
                      value={form.meal_date}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />

                  </div>


                  {/* NOMINAL */}

                  <div className="col-12">

                    <label
                      htmlFor="amount"
                      className="meal-request-label"
                    >
                      Nominal Uang Makan
                      <span className="meal-request-required">
                        {' '}*
                      </span>
                    </label>

                    <input
                      id="amount"
                      type="number"
                      name="amount"
                      className="form-control meal-request-input"
                      placeholder="Contoh: 25000"
                      min="0"
                      step="1"
                      value={form.amount}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />

                    <div className="meal-request-help">
                      Masukkan nominal uang makan yang diajukan.
                    </div>

                  </div>


                  {/* ALASAN */}

                  <div className="col-12">

                    <label
                      htmlFor="reason"
                      className="meal-request-label"
                    >
                      Alasan
                    </label>

                    <textarea
                      id="reason"
                      name="reason"
                      className="
                        form-control
                        meal-request-input
                        meal-request-textarea
                      "
                      placeholder="Masukkan alasan pengajuan uang makan..."
                      value={form.reason}
                      onChange={handleChange}
                      disabled={saving}
                    />

                  </div>

                </div>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="meal-request-footer">

                <button
                  type="button"
                  className="meal-request-cancel"
                  onClick={onClose}
                  disabled={saving}
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="meal-request-submit"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />

                      Mengirim...
                    </>

                  ) : (

                    <>
                      <i className="bi bi-send-fill"></i>

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

export default MealAllowanceModal;