import React, { useState, useEffect } from 'react';

const BPJSPaymentFormModal = ({
  show,
  onClose,
  onSubmit,
  editData,
  employees
}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    bpjs_type: 'kesehatan',
    period: '',
    document_name: '',
    file: null,
    notes: '',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        employee_id: editData.employee_id || '',
        bpjs_type: editData.bpjs_type || 'kesehatan',
        period: editData.period || '',
        document_name: editData.document_name || '',
        file: null,
        notes: editData.notes || '',
      });
    } else {
      setFormData({
        employee_id: '',
        bpjs_type: 'kesehatan',
        period: '',
        document_name: '',
        file: null,
        notes: '',
      });
    }
  }, [editData, show]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'file') {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <>
      {/* =====================================================
          MODAL BACKDROP
      ====================================================== */}

      <div className="bpjs-modal-backdrop">

        {/* =====================================================
            MODAL
        ====================================================== */}

        <div className="bpjs-modal-dialog">

          <div className="bpjs-modal-content">

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="bpjs-modal-header">

              <div className="d-flex align-items-center gap-3">

                <div className="bpjs-modal-icon">
                  <i className="bi bi-file-earmark-medical-fill"></i>
                </div>

                <div>
                  <h5 className="bpjs-modal-title">
                    {editData
                      ? 'Edit Bukti Pembayaran BPJS'
                      : 'Upload Bukti Pembayaran BPJS'}
                  </h5>

                  <small className="text-muted">
                    {editData
                      ? 'Perbarui informasi pembayaran BPJS'
                      : 'Tambahkan bukti pembayaran BPJS'}
                  </small>
                </div>

              </div>

              <button
                type="button"
                className="btn-close shadow-none"
                onClick={onClose}
              ></button>

            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form onSubmit={handleSubmit}>

              {/* =================================================
                  BODY
              ================================================== */}

              <div className="bpjs-modal-body">

                <div className="row g-3">

                  {/* =================================================
                      PEGAWAI
                  ================================================== */}

                  <div className="col-12 col-md-6">

                    <label className="bpjs-form-label">
                      Pegawai
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <select
                      className="form-select bpjs-form-control"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        -- Pilih Pegawai --
                      </option>

                      {(employees || []).map((emp) => (
                        <option
                          key={emp.id}
                          value={emp.id}
                        >
                          {emp.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* =================================================
                      JENIS BPJS
                  ================================================== */}

                  <div className="col-12 col-md-6">

                    <label className="bpjs-form-label">
                      Jenis BPJS
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <select
                      className="form-select bpjs-form-control"
                      name="bpjs_type"
                      value={formData.bpjs_type}
                      onChange={handleChange}
                      required
                    >

                      <option value="kesehatan">
                        BPJS Kesehatan
                      </option>

                      <option value="ketenagakerjaan">
                        BPJS Ketenagakerjaan
                      </option>

                    </select>

                  </div>

                  {/* =================================================
                      PERIODE
                  ================================================== */}

                  <div className="col-12 col-md-6">

                    <label className="bpjs-form-label">
                      Periode Bulan
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <input
                      type="month"
                      className="form-control bpjs-form-control"
                      name="period"
                      value={formData.period}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* =================================================
                      NAMA DOKUMEN
                  ================================================== */}

                  <div className="col-12 col-md-6">

                    <label className="bpjs-form-label">
                      Nama Dokumen
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control bpjs-form-control"
                      placeholder="Contoh: Bukti Transfer BPJS Jan 2026"
                      name="document_name"
                      value={formData.document_name}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* =================================================
                      UPLOAD FILE
                  ================================================== */}

                  <div className="col-12">

                    <label className="bpjs-form-label">

                      Upload File Dokumen

                      {editData && (
                        <span className="text-muted fw-normal ms-1">
                          (Kosongkan jika tidak diubah)
                        </span>
                      )}

                    </label>

                    <input
                      type="file"
                      className="form-control bpjs-form-control"
                      name="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      required={!editData}
                    />

                    <div className="bpjs-file-info">
                      <i className="bi bi-info-circle me-1"></i>
                      Format: PDF, JPG, PNG · Maksimal 5MB
                    </div>

                  </div>

                  {/* =================================================
                      CATATAN
                  ================================================== */}

                  <div className="col-12">

                    <label className="bpjs-form-label">
                      Catatan Tambahan
                    </label>

                    <textarea
                      className="form-control bpjs-form-control"
                      rows="3"
                      placeholder="Tambahkan catatan jika diperlukan..."
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>

                  </div>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <div className="bpjs-modal-footer">

                <button
                  type="button"
                  className="btn btn-light bpjs-cancel-btn"
                  onClick={onClose}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary bpjs-save-btn"
                >
                  <i className="bi bi-save me-2"></i>
                  Simpan
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

      {/* =====================================================
          STYLE
      ====================================================== */}

      <style>{`

        /* =====================================================
           BACKDROP
        ====================================================== */

        .bpjs-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background: rgba(15, 23, 42, 0.55);

          overflow-y: auto;
        }


        /* =====================================================
           MODAL DIALOG
        ====================================================== */

        .bpjs-modal-dialog {
          position: relative;

          width: 100%;
          max-width: 680px;

          margin: auto;

          flex-shrink: 0;
        }


        /* =====================================================
           MODAL CONTENT
        ====================================================== */

        .bpjs-modal-content {
          width: 100%;

          background: #ffffff;

          border-radius: 18px;

          border: 0;

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.20);

          overflow: hidden;
        }


        /* =====================================================
           HEADER
        ====================================================== */

        .bpjs-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 20px 24px;

          border-bottom: 1px solid #eef0f2;

          background: #ffffff;
        }


        .bpjs-modal-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #e8f1ff;

          color: #0d6efd;

          font-size: 20px;
        }


        .bpjs-modal-title {
          margin: 0;

          font-size: 18px;

          font-weight: 700;

          color: #212529;
        }


        /* =====================================================
           BODY
        ====================================================== */

        .bpjs-modal-body {
          padding: 22px 24px;

          max-height: calc(100vh - 210px);

          overflow-y: auto;

          overflow-x: hidden;
        }


        /* =====================================================
           FORM
        ====================================================== */

        .bpjs-form-label {
          display: block;

          margin-bottom: 7px;

          font-size: 13px;

          font-weight: 600;

          color: #343a40;
        }


        .bpjs-form-control {
          min-height: 42px;

          border-radius: 9px;

          border-color: #dfe3e7;

          font-size: 14px;
        }


        .bpjs-form-control:focus {
          border-color: #86b7fe;

          box-shadow:
            0 0 0 0.2rem rgba(13, 110, 253, 0.12);
        }


        textarea.bpjs-form-control {
          min-height: 90px;

          resize: vertical;
        }


        /* =====================================================
           FILE INFO
        ====================================================== */

        .bpjs-file-info {
          margin-top: 6px;

          font-size: 12px;

          color: #6c757d;
        }


        /* =====================================================
           FOOTER
        ====================================================== */

        .bpjs-modal-footer {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 10px;

          padding: 16px 24px 20px;

          border-top: 1px solid #eef0f2;

          background: #ffffff;
        }


        .bpjs-cancel-btn,
        .bpjs-save-btn {
          min-width: 100px;

          min-height: 40px;

          border-radius: 9px;

          font-size: 14px;

          font-weight: 500;
        }


        /* =====================================================
           DESKTOP
        ====================================================== */

        @media (min-width: 992px) {

          .bpjs-modal-dialog {
            max-width: 680px;
          }

          .bpjs-modal-body {
            padding: 22px 26px;
          }

        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (min-width: 768px) and (max-width: 991.98px) {

          .bpjs-modal-dialog {
            max-width: 620px;
          }

        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 767.98px) {

          .bpjs-modal-backdrop {
            padding: 12px;
            align-items: center;
          }

          .bpjs-modal-dialog {
            max-width: 100%;
          }

          .bpjs-modal-content {
            border-radius: 14px;
          }

          .bpjs-modal-header {
            padding: 16px 18px;
          }

          .bpjs-modal-body {
            padding: 18px;

            max-height: calc(100vh - 180px);
          }

          .bpjs-modal-footer {
            padding: 14px 18px 16px;
          }

          .bpjs-modal-title {
            font-size: 16px;
          }

          .bpjs-modal-icon {
            width: 38px;
            height: 38px;

            font-size: 18px;
          }

          .bpjs-cancel-btn,
          .bpjs-save-btn {
            flex: 1;
          }

        }

      `}</style>
    </>
  );
};

export default BPJSPaymentFormModal;