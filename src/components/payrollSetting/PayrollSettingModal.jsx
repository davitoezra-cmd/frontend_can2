import React, { useEffect, useState } from 'react';

const PayrollSettingModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedItem,
  employees,
  loading,
}) => {

  const initialFormState = {
    employee_id: '',
    gaji_harian: '',
    bonus_datang_awal: 0,
    bonus_kedisiplinan: 0,
    tarif_lembur: 0,
    uang_makan: 0,
    potongan_terlambat: 0,
    potongan_izin: 0,
    potongan_cuti: 0,
    jatah_cuti: 12,
    tanggal_gajian: 25,
    aktif: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // =========================================================
  // LOAD DATA SAAT EDIT
  // =========================================================

  useEffect(() => {

    if (selectedItem) {

      setFormData({

        employee_id:
          selectedItem.employee_id ?? '',

        gaji_harian:
          selectedItem.gaji_harian !== null &&
          selectedItem.gaji_harian !== undefined
            ? String(Number(selectedItem.gaji_harian))
            : '',

        bonus_datang_awal:
          selectedItem.bonus_datang_awal !== null &&
          selectedItem.bonus_datang_awal !== undefined
            ? String(Number(selectedItem.bonus_datang_awal))
            : '0',

        // BONUS KEDISIPLINAN
        bonus_kedisiplinan:
          selectedItem.bonus_kedisiplinan !== null &&
          selectedItem.bonus_kedisiplinan !== undefined
            ? String(Number(selectedItem.bonus_kedisiplinan))
            : '0',

        tarif_lembur:
          selectedItem.tarif_lembur !== null &&
          selectedItem.tarif_lembur !== undefined
            ? String(Number(selectedItem.tarif_lembur))
            : '0',

        // UANG MAKAN
        uang_makan:
          selectedItem.uang_makan !== null &&
          selectedItem.uang_makan !== undefined
            ? String(Number(selectedItem.uang_makan))
            : '0',

        potongan_terlambat:
          selectedItem.potongan_terlambat !== null &&
          selectedItem.potongan_terlambat !== undefined
            ? String(Number(selectedItem.potongan_terlambat))
            : '0',

        potongan_izin:
          selectedItem.potongan_izin !== null &&
          selectedItem.potongan_izin !== undefined
            ? String(Number(selectedItem.potongan_izin))
            : '0',

        potongan_cuti:
          selectedItem.potongan_cuti !== null &&
          selectedItem.potongan_cuti !== undefined
            ? String(Number(selectedItem.potongan_cuti))
            : '0',

        jatah_cuti:
          selectedItem.jatah_cuti ?? 12,

        tanggal_gajian:
          selectedItem.tanggal_gajian ?? 25,

        aktif:
          selectedItem.aktif ?? true,
      });

    } else {

      setFormData(initialFormState);

    }

  }, [selectedItem, isOpen]);

  if (!isOpen) return null;

  // =========================================================
  // FIELD NOMINAL
  // =========================================================

  const numberFields = [
    'gaji_harian',
    'bonus_datang_awal',
    'bonus_kedisiplinan',
    'tarif_lembur',
    'uang_makan',
    'potongan_terlambat',
    'potongan_izin',
    'potongan_cuti',
  ];

  // =========================================================
  // FORMAT ANGKA
  // =========================================================
  //
  // 1000      -> 1.000
  // 15000     -> 15.000
  // 150000    -> 150.000
  // 1500000   -> 1.500.000
  //
  // Hanya untuk tampilan.
  // =========================================================

  const formatNumber = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return '';
    }

    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0,
    }).format(number);

  };

  // =========================================================
  // PARSE INPUT
  // =========================================================
  //
  // Input:
  // 15.000
  //
  // Disimpan sebagai:
  // 15000
  //
  // Input:
  // 1.500.000
  //
  // Disimpan sebagai:
  // 1500000
  // =========================================================

  const parseNumber = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '';
    }

    return String(value)
      .replace(/\./g, '')
      .replace(/\D/g, '');

  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    // =======================================================
    // CHECKBOX
    // =======================================================

    if (type === 'checkbox') {

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    // =======================================================
    // FIELD NOMINAL
    // =======================================================

    if (numberFields.includes(name)) {

      const rawValue = parseNumber(value);

      setFormData((prev) => ({
        ...prev,
        [name]: rawValue,
      }));

      return;
    }

    // =======================================================
    // FIELD BIASA
    // =======================================================

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (event) => {

    event.preventDefault();

    const submitData = {
      ...formData,
    };

    // =======================================================
    // KONVERSI NOMINAL KE NUMBER
    // =======================================================

    numberFields.forEach((field) => {

      if (
        submitData[field] === '' ||
        submitData[field] === null ||
        submitData[field] === undefined
      ) {

        submitData[field] = 0;

      } else {

        submitData[field] = Number(
          String(submitData[field])
            .replace(/\./g, '')
            .replace(/\D/g, '')
        );

      }

    });

    onSubmit(submitData);

  };

  return (
    <>
      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: 'rgba(0,0,0,.5)',
          zIndex: 1050,
        }}
        onClick={loading ? undefined : onClose}
      />

      {/* =====================================================
          MODAL CONTAINER
      ===================================================== */}

      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          zIndex: 1055,
          padding: 16,
          pointerEvents: 'none',
        }}
      >

        <div
          className="bg-white shadow-lg rounded-4 d-flex flex-column"
          style={{
            width: '100%',
            maxWidth: 900,
            maxHeight: '88vh',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="d-flex justify-content-between align-items-center border-bottom px-3 px-md-4 py-3">

            <div>

              <h5 className="fw-bold mb-0">

                {selectedItem
                  ? 'Edit Payroll Setting'
                  : 'Tambah Payroll Setting'}

              </h5>

              <small className="text-muted">

                Jam kerja dan batas terlambat mengikuti Work Shift,
                bukan payroll setting.

              </small>

            </div>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            />

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column overflow-hidden"
          >

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="p-3 p-md-4 overflow-auto">

              <div className="alert alert-info border mb-4">

                <strong>Shift modular aktif.</strong>{' '}

                Jam masuk, jam pulang, dan toleransi keterlambatan
                dikelola di menu{' '}

                <em>
                  Shift Schedules → Master Work Shift
                </em>.

              </div>

              <div className="row g-3">

                {/* =================================================
                    EMPLOYEE
                ================================================= */}

                <div className="col-12">

                  <label className="form-label fw-semibold">
                    Employee
                  </label>

                  <select
                    name="employee_id"
                    className="form-select"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    disabled={Boolean(selectedItem)}
                  >

                    <option value="">
                      Pilih employee
                    </option>

                    {employees.map((employee) => (

                      <option
                        key={employee.id}
                        value={employee.id}
                      >

                        {employee.name}{' '}
                        (
                        {employee.email ||
                          `#${employee.id}`}
                        )

                      </option>

                    ))}

                  </select>

                </div>

                {/* =================================================
                    GAJI HARIAN
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Gaji Harian (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="gaji_harian"
                    className="form-control"
                    placeholder="Contoh: 15.000"
                    value={formatNumber(
                      formData.gaji_harian
                    )}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    BONUS DATANG AWAL
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Bonus Datang Awal (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="bonus_datang_awal"
                    className="form-control"
                    placeholder="Contoh: 5.000"
                    value={formatNumber(
                      formData.bonus_datang_awal
                    )}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    BONUS KEDISIPLINAN
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Bonus Kedisiplinan (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="bonus_kedisiplinan"
                    className="form-control"
                    placeholder="Contoh: 100.000"
                    value={formatNumber(
                      formData.bonus_kedisiplinan
                    )}
                    onChange={handleChange}
                  />

                  <small className="text-muted">

                    Bonus diberikan otomatis jika selama
                    periode payroll tidak pernah terlambat.

                  </small>

                </div>

                {/* =================================================
                    TARIF LEMBUR
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Tarif Lembur / Jam (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="tarif_lembur"
                    className="form-control"
                    placeholder="Contoh: 20.000"
                    value={formatNumber(
                      formData.tarif_lembur
                    )}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    UANG MAKAN
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Uang Makan (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="uang_makan"
                    className="form-control"
                    placeholder="Contoh: 10.000"
                    value={formatNumber(
                      formData.uang_makan
                    )}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    POTONGAN TERLAMBAT
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Potongan Terlambat / Menit (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="potongan_terlambat"
                    className="form-control"
                    placeholder="Contoh: 1.000"
                    value={formatNumber(
                      formData.potongan_terlambat
                    )}
                    onChange={handleChange}
                  />

                  <small className="text-muted">

                    Contoh: terlambat 60 menit × Rp1.000 =
                    Rp60.000.

                  </small>

                </div>

                {/* =================================================
                    POTONGAN IZIN
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Potongan Izin (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="potongan_izin"
                    className="form-control"
                    placeholder="Contoh: 15.000"
                    value={formatNumber(
                      formData.potongan_izin
                    )}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    POTONGAN CUTI
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Potongan Cuti (Rp)
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="potongan_cuti"
                    className="form-control"
                    placeholder="Contoh: 15.000"
                    value={formatNumber(
                      formData.potongan_cuti
                    )}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    JATAH CUTI
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Jatah Cuti
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="jatah_cuti"
                    className="form-control"
                    value={formData.jatah_cuti}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    TANGGAL GAJIAN
                ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Tanggal Gajian
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="31"
                    name="tanggal_gajian"
                    className="form-control"
                    value={formData.tanggal_gajian}
                    onChange={handleChange}
                  />

                </div>

                {/* =================================================
                    STATUS AKTIF
                ================================================= */}

                <div className="col-12">

                  <div className="form-check form-switch">

                    <input
                      className="form-check-input"
                      id="payroll-active"
                      type="checkbox"
                      name="aktif"
                      checked={formData.aktif}
                      onChange={handleChange}
                    />

                    <label
                      className="form-check-label"
                      htmlFor="payroll-active"
                    >
                      Setting aktif
                    </label>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="border-top bg-light px-3 px-md-4 py-3 d-flex justify-content-end gap-2">

              <button
                type="button"
                className="btn btn-light border"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >

                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : null}

                Simpan

              </button>

            </div>

          </form>

        </div>

      </div>

    </>
  );
};

export default PayrollSettingModal;