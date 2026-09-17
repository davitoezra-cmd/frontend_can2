import React, { useEffect, useState } from 'react';

const EMPTY_FORM = {
  employee_id: '',
  supervisor_id: '',
  title: '',
  category: '',
  description: '',
  target_value: 1,
  start_date: '',
  end_date: '',
  status: 'ongoing',
  notes: '',
};

const EmployeeTargetFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  employees = [],
  supervisors = [],
}) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // INITIAL DATA
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        employee_id:
          initialData.employee?.id ||
          initialData.employee_id ||
          '',

        supervisor_id:
          initialData.supervisor?.id ||
          initialData.supervisor_id ||
          '',

        title:
          initialData.title ||
          '',

        category:
          initialData.category ||
          '',

        description:
          initialData.description ||
          '',

        target_value:
          initialData.target_value ??
          1,

        start_date:
          initialData.start_date
            ? String(initialData.start_date).substring(0, 10)
            : '',

        end_date:
          initialData.end_date
            ? String(initialData.end_date).substring(0, 10)
            : '',

        status:
          initialData.status ||
          'ongoing',

        notes:
          initialData.notes ||
          '',
      });
    } else {
      setFormData({
        ...EMPTY_FORM,
      });
    }
  }, [initialData, isOpen]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id) {
      alert('Silakan pilih pegawai.');
      return;
    }

    if (!formData.supervisor_id) {
      alert('Silakan pilih supervisor.');
      return;
    }

    if (!formData.title.trim()) {
      alert('Judul target wajib diisi.');
      return;
    }

    if (!formData.target_value || Number(formData.target_value) < 1) {
      alert('Nilai target minimal 1.');
      return;
    }

    if (!formData.start_date) {
      alert('Tanggal mulai wajib diisi.');
      return;
    }

    if (!formData.end_date) {
      alert('Tanggal selesai wajib diisi.');
      return;
    }

    if (formData.end_date < formData.start_date) {
      alert(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
      );
      return;
    }

    const payload = {
      employee_id: Number(formData.employee_id),

      supervisor_id: Number(formData.supervisor_id),

      title: formData.title.trim(),

      description:
        formData.description?.trim() || null,

      category:
        formData.category?.trim() || null,

      target_value:
        Number(formData.target_value),

      start_date:
        formData.start_date,

      end_date:
        formData.end_date,

      notes:
        formData.notes?.trim() || null,
    };

    if (initialData) {
      payload.status = formData.status;
    }

    try {
      setSubmitting(true);

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    if (submitting) return;

    setFormData({
      ...EMPTY_FORM,
    });

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>
        {`
          .employee-target-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            z-index: 1050;
          }

          .employee-target-modal-wrapper {
            position: fixed;
            inset: 0;
            z-index: 1055;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .employee-target-modal {
            width: 100%;
            max-width: 1050px;
            max-height: calc(100vh - 40px);
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
            display: flex;
            flex-direction: column;
          }

          .employee-target-modal-header {
            padding: 20px 28px;
            border-bottom: 1px solid #edf0f2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-shrink: 0;
          }

          .employee-target-modal-header h5 {
            font-size: 18px;
            margin: 0 0 4px;
            font-weight: 700;
            color: #212529;
          }

          .employee-target-modal-header p {
            margin: 0;
            font-size: 12px;
            color: #8a9199;
          }

          .employee-target-modal-close {
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 9px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: 0.2s ease;
          }

          .employee-target-modal-close:hover {
            background: #e9ecef;
          }

          .employee-target-modal-body {
            padding: 24px 28px;
            overflow-y: auto;
            flex: 1;
          }

          .employee-target-modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .employee-target-modal-body::-webkit-scrollbar-track {
            background: #f8f9fa;
          }

          .employee-target-modal-body::-webkit-scrollbar-thumb {
            background: #ced4da;
            border-radius: 10px;
          }

          .employee-target-modal .form-label {
            font-size: 12px;
            margin-bottom: 6px;
          }

          .employee-target-modal .form-control,
          .employee-target-modal .form-select {
            min-height: 42px;
            font-size: 13px;
            border-radius: 9px;
          }

          .employee-target-modal textarea.form-control {
            min-height: 100px;
            resize: vertical;
          }

          .employee-target-modal-footer {
            padding: 15px 28px;
            border-top: 1px solid #edf0f2;
            background: #ffffff;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          .employee-target-modal-footer .btn {
            min-height: 40px;
            padding: 8px 18px;
            border-radius: 9px;
            font-size: 13px;
          }

          @media (max-width: 767.98px) {
            .employee-target-modal-wrapper {
              padding: 10px;
            }

            .employee-target-modal {
              max-height: calc(100vh - 20px);
              border-radius: 13px;
            }

            .employee-target-modal-header {
              padding: 16px 18px;
            }

            .employee-target-modal-body {
              padding: 18px;
            }

            .employee-target-modal-footer {
              padding: 12px 18px;
              flex-wrap: wrap;
            }

            .employee-target-modal-footer .btn {
              flex: 1;
            }
          }
        `}
      </style>

      {/* BACKDROP */}
      <div className="employee-target-modal-backdrop" />

      {/* MODAL */}
      <div
        className="employee-target-modal-wrapper"
        role="dialog"
        aria-modal="true"
      >
        <div className="employee-target-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="employee-target-modal-header">

            <div>
              <h5>
                {initialData
                  ? 'Edit Target Kinerja'
                  : 'Tambah Target Kinerja Baru'}
              </h5>

              <p>
                {initialData
                  ? 'Perbarui informasi target kinerja pegawai.'
                  : 'Buat target kinerja baru untuk pegawai.'}
              </p>
            </div>

            <button
              type="button"
              className="employee-target-modal-close"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column flex-grow-1"
            style={{ minHeight: 0 }}
          >

            {/* =================================================
                BODY
            ================================================= */}

            <div className="employee-target-modal-body">

              <div className="row g-4">

                {/* =================================================
                    PEGAWAI
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label
                    htmlFor="employee_id"
                    className="form-label fw-semibold"
                  >
                    Pegawai
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <select
                    id="employee_id"
                    name="employee_id"
                    className="form-select"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="">
                      -- Pilih Pegawai --
                    </option>

                    {employees.map((emp) => (
                      <option
                        key={emp.id}
                        value={emp.id}
                      >
                        {emp.name}
                        {emp.employee_code
                          ? ` (${emp.employee_code})`
                          : ''}
                      </option>
                    ))}
                  </select>

                </div>

                {/* =================================================
                    SUPERVISOR
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label
                    htmlFor="supervisor_id"
                    className="form-label fw-semibold"
                  >
                    Supervisor
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <select
                    id="supervisor_id"
                    name="supervisor_id"
                    className="form-select"
                    value={formData.supervisor_id}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="">
                      -- Pilih Supervisor --
                    </option>

                    {supervisors.map((supervisor) => (
                      <option
                        key={supervisor.id}
                        value={supervisor.id}
                      >
                        {supervisor.name}
                        {supervisor.email
                          ? ` (${supervisor.email})`
                          : ''}
                      </option>
                    ))}
                  </select>

                  {supervisors.length === 0 && (
                    <div className="form-text text-danger">
                      Data supervisor belum tersedia.
                    </div>
                  )}

                </div>

                {/* =================================================
                    KATEGORI
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label
                    htmlFor="category"
                    className="form-label fw-semibold"
                  >
                    Kategori Target
                  </label>

                  <input
                    id="category"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Sales, Project, KPI"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={submitting}
                  />

                </div>

                {/* =================================================
                    NILAI TARGET
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label
                    htmlFor="target_value"
                    className="form-label fw-semibold"
                  >
                    Nilai Target
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <input
                    id="target_value"
                    type="number"
                    min="1"
                    className="form-control"
                    name="target_value"
                    value={formData.target_value}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />

                </div>

                {/* =================================================
                    JUDUL TARGET
                ================================================= */}

                <div className="col-12">

                  <label
                    htmlFor="title"
                    className="form-label fw-semibold"
                  >
                    Judul Target
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="Masukkan judul target"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />

                </div>

                {/* =================================================
                    TANGGAL MULAI
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label
                    htmlFor="start_date"
                    className="form-label fw-semibold"
                  >
                    Tanggal Mulai
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <input
                    id="start_date"
                    type="date"
                    className="form-control"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />

                </div>

                {/* =================================================
                    TANGGAL SELESAI
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label
                    htmlFor="end_date"
                    className="form-label fw-semibold"
                  >
                    Tanggal Selesai
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <input
                    id="end_date"
                    type="date"
                    className="form-control"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date || undefined}
                    required
                    disabled={submitting}
                  />

                </div>

                {/* =================================================
                    STATUS - EDIT SAJA
                ================================================= */}

                {initialData && (
                  <div className="col-12 col-md-6">

                    <label
                      htmlFor="status"
                      className="form-label fw-semibold"
                    >
                      Status Target
                    </label>

                    <select
                      id="status"
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="ongoing">
                        Ongoing
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                      <option value="not_achieved">
                        Not Achieved
                      </option>
                    </select>

                  </div>
                )}

                {/* =================================================
                    DESKRIPSI
                ================================================= */}

                <div className="col-12">

                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    Deskripsi
                  </label>

                  <textarea
                    id="description"
                    className="form-control"
                    rows="3"
                    placeholder="Deskripsi detail target..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitting}
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="employee-target-modal-footer">

              <button
                type="button"
                className="btn btn-light border"
                onClick={handleClose}
                disabled={submitting}
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  submitting ||
                  employees.length === 0 ||
                  supervisors.length === 0
                }
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
                      aria-hidden="true"
                    />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" />

                    {initialData
                      ? 'Simpan Perubahan'
                      : 'Simpan Target'}
                  </>
                )}
              </button>

            </div>

          </form>

        </div>
      </div>
    </>
  );
};

export default React.memo(EmployeeTargetFormModal);
