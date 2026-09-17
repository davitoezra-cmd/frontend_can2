import React, { useState, useEffect } from 'react';

const EmployeePerformanceFormModal = ({
  show,
  onClose,
  onSubmit,
  isEdit,
  initialData,
  employees,
  targets,
  submitting,
}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_target_id: '',
    score: '',
    grade: 'A',
    feedback: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        employee_id: initialData.employee_id || '',
        employee_target_id: initialData.employee_target_id || '',
        score: initialData.score || '',
        grade: initialData.grade || 'A',
        feedback: initialData.feedback || '',
      });
    } else {
      setFormData({
        employee_id: '',
        employee_target_id: '',
        score: '',
        grade: 'A',
        feedback: '',
      });
    }

    setErrors({});
  }, [initialData, isEdit, show]);

  if (!show) return null;

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = {
      ...formData,
      [name]: value,
    };

    if (name === 'score') {
      const val = parseFloat(value);

      if (!isNaN(val)) {
        if (val >= 85) {
          updated.grade = 'A';
        } else if (val >= 75) {
          updated.grade = 'B';
        } else if (val >= 65) {
          updated.grade = 'C';
        } else if (val >= 50) {
          updated.grade = 'D';
        } else {
          updated.grade = 'E';
        }
      }
    }

    setFormData(updated);

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!isEdit && !formData.employee_id) {
      newErrors.employee_id = 'Pilih karyawan.';
    }

    if (!isEdit && !formData.employee_target_id) {
      newErrors.employee_target_id = 'Pilih target.';
    }

    if (formData.score === '') {
      newErrors.score = 'Score wajib diisi.';
    }

    if (formData.score < 0 || formData.score > 100) {
      newErrors.score = 'Nilai antara 0 - 100.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      <style>
        {`
          .performance-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1060;
            background: rgba(15, 23, 42, 0.50);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .performance-modal-dialog {
            width: 100%;
            max-width: 720px;
            max-height: calc(100vh - 40px);
            margin: 0;
            display: flex;
            flex-direction: column;
          }

          .performance-modal-content {
            width: 100%;
            max-height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border: 0;
            border-radius: 14px;
            overflow: hidden;
            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.18);
          }

          .performance-modal-header {
            flex-shrink: 0;
            padding: 18px 24px;
            border-bottom: 1px solid #edf0f2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .performance-modal-title {
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            color: #212529;
          }

          .performance-modal-subtitle {
            margin: 3px 0 0;
            font-size: 12px;
            color: #8a9199;
          }

          .performance-modal-close {
            flex-shrink: 0;
          }

          .performance-modal-body {
            padding: 22px 24px;
            overflow-y: auto;
            flex: 1 1 auto;
          }

          .performance-modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .performance-modal-body::-webkit-scrollbar-track {
            background: #f8f9fa;
          }

          .performance-modal-body::-webkit-scrollbar-thumb {
            background: #ced4da;
            border-radius: 10px;
          }

          .performance-form-label {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            font-weight: 600;
            color: #6c757d;
          }

          .performance-form-control {
            min-height: 42px;
            font-size: 13px;
            border-radius: 8px;
          }

          .performance-form-control:focus {
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.10);
          }

          .performance-feedback {
            min-height: 100px;
            resize: vertical;
          }

          .performance-score-row {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(120px, 1fr);
            gap: 14px;
          }

          .performance-modal-footer {
            flex-shrink: 0;
            padding: 14px 24px;
            border-top: 1px solid #edf0f2;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
          }

          .performance-modal-footer .btn {
            min-height: 40px;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
          }

          @media (max-width: 767.98px) {
            .performance-modal-backdrop {
              padding: 12px;
            }

            .performance-modal-dialog {
              max-height: calc(100vh - 24px);
            }

            .performance-modal-content {
              max-height: calc(100vh - 24px);
              border-radius: 12px;
            }

            .performance-modal-header {
              padding: 15px 17px;
            }

            .performance-modal-body {
              padding: 18px 17px;
            }

            .performance-modal-footer {
              padding: 12px 17px;
            }

            .performance-score-row {
              grid-template-columns: 1fr;
              gap: 12px;
            }
          }

          @media (max-width: 575.98px) {
            .performance-modal-backdrop {
              padding: 8px;
            }

            .performance-modal-dialog {
              max-height: calc(100vh - 16px);
            }

            .performance-modal-content {
              max-height: calc(100vh - 16px);
              border-radius: 10px;
            }

            .performance-modal-title {
              font-size: 15px;
            }

            .performance-modal-subtitle {
              font-size: 11px;
            }

            .performance-modal-body {
              padding: 15px;
            }

            .performance-modal-footer {
              padding: 11px 15px;
              flex-wrap: wrap;
            }

            .performance-modal-footer .btn {
              flex: 1;
            }
          }
        `}
      </style>

      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="performance-modal-backdrop"
        role="dialog"
        aria-modal="true"
      >
        <div className="performance-modal-dialog">
          <div className="performance-modal-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="performance-modal-header">
              <div>
                <h5 className="performance-modal-title">
                  {isEdit
                    ? 'Edit Penilaian Kinerja'
                    : 'Tambah Penilaian Kinerja'}
                </h5>

                <p className="performance-modal-subtitle">
                  {isEdit
                    ? 'Perbarui hasil penilaian kinerja pegawai.'
                    : 'Tambahkan penilaian kinerja untuk pegawai.'}
                </p>
              </div>

              <button
                type="button"
                className="btn-close performance-modal-close"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close"
              />
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="d-flex flex-column flex-grow-1 overflow-hidden"
            >

              {/* =================================================
                  BODY
              ================================================= */}

              <div className="performance-modal-body">

                {/* EMPLOYEE */}
                {!isEdit && (
                  <div className="mb-3">
                    <label className="performance-form-label">
                      Employee
                    </label>

                    <select
                      name="employee_id"
                      className={`form-select performance-form-control ${
                        errors.employee_id
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={formData.employee_id}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">
                        -- Pilih Karyawan --
                      </option>

                      {employees.map((emp) => (
                        <option
                          key={emp.id}
                          value={emp.id}
                        >
                          {emp.name || emp.nama}
                        </option>
                      ))}
                    </select>

                    {errors.employee_id && (
                      <div className="invalid-feedback">
                        {errors.employee_id}
                      </div>
                    )}
                  </div>
                )}

                {/* EMPLOYEE TARGET */}
                {!isEdit && (
                  <div className="mb-3">
                    <label className="performance-form-label">
                      Employee Target
                    </label>

                    <select
                      name="employee_target_id"
                      className={`form-select performance-form-control ${
                        errors.employee_target_id
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={formData.employee_target_id}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">
                        -- Pilih Target --
                      </option>

                      {targets.map((tgt) => (
                        <option
                          key={tgt.id}
                          value={tgt.id}
                        >
                          {tgt.title ||
                            tgt.target_name ||
                            `Target ID #${tgt.id}`}
                        </option>
                      ))}
                    </select>

                    {errors.employee_target_id && (
                      <div className="invalid-feedback">
                        {errors.employee_target_id}
                      </div>
                    )}
                  </div>
                )}

                {/* SCORE + GRADE */}
                <div className="performance-score-row mb-3">

                  {/* SCORE */}
                  <div>
                    <label className="performance-form-label">
                      Score (0-100)
                    </label>

                    <input
                      type="number"
                      name="score"
                      min="0"
                      max="100"
                      className={`form-control performance-form-control ${
                        errors.score
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="Contoh: 85"
                      value={formData.score}
                      onChange={handleChange}
                      disabled={submitting}
                    />

                    {errors.score && (
                      <div className="invalid-feedback">
                        {errors.score}
                      </div>
                    )}
                  </div>

                  {/* GRADE */}
                  <div>
                    <label className="performance-form-label">
                      Grade
                    </label>

                    <select
                      name="grade"
                      className="form-select performance-form-control fw-bold"
                      value={formData.grade}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>

                </div>

                {/* FEEDBACK */}
                <div className="mb-1">
                  <label className="performance-form-label">
                    Feedback
                  </label>

                  <textarea
                    name="feedback"
                    rows="4"
                    className="form-control performance-form-control performance-feedback"
                    placeholder="Catatan umpan balik..."
                    value={formData.feedback}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="performance-modal-footer">

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
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

export default EmployeePerformanceFormModal;
