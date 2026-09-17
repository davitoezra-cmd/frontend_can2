import React, { useState, useEffect } from 'react';
import apiFetch from '../../api/apiFetch';
import { toast } from 'react-toastify';

const PayrollCorrectionFormModal = ({ payroll, correctionData, onClose, onSuccess }) => {
  const isEdit = Boolean(correctionData);

  const [form, setForm] = useState({
    type: 'addition',
    amount: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && correctionData) {
      setForm({
        type: correctionData.type || 'addition',
        amount: correctionData.amount || '',
        reason: correctionData.reason || '',
      });
    } else {
      setForm({
        type: 'addition',
        amount: '',
        reason: '',
      });
    }
  }, [isEdit, correctionData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!form.amount || !form.reason) {
      toast.warning('Mohon lengkapi seluruh field.');
      return;
    }

    const numericAmount = parseFloat(form.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.warning('Nominal harus berupa angka lebih dari 0.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        // PUT update correction
        const payload = {
          type: form.type,
          amount: numericAmount,
          reason: form.reason.trim(),
        };

        const res = await apiFetch.put(
          `/finance/payroll-correction/${correctionData.id}`,
          payload
        );
        toast.success(res.data?.message || 'Payroll correction berhasil diperbarui.');
      } else {
        // POST create correction
        const payload = {
          payroll_id: payroll.id,
          employee_id: payroll.employee_id,
          type: form.type,
          amount: numericAmount,
          reason: form.reason.trim(),
        };

        const res = await apiFetch.post('/finance/payroll-correction', payload);
        toast.success(res.data?.message || 'Payroll correction berhasil ditambahkan.');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving correction:', err);
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 1060,
        overflowX: 'hidden',
        overflowY: 'auto' 
      }}
    >
      <div 
        className="modal-dialog modal-dialog-centered" 
        style={{ maxWidth: '500px', margin: '1.75rem auto' }}
      >
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom px-4 py-3">
            <h6 className="modal-title fw-bold text-dark m-0">
              {isEdit ? 'Edit Payroll Correction' : 'Tambah Payroll Correction'}
            </h6>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit} noValidate={false}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold text-secondary">Tipe Koreksi</label>
                <select
                  className="form-select bg-light border-0 shadow-none fs-7"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={submitting}
                >
                  <option value="addition">Penambahan (+)</option>
                  <option value="deduction">Potongan (-)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold text-secondary">Nominal (Rp)</label>
                <input
                  type="number"
                  className="form-control bg-light border-0 shadow-none fs-7"
                  placeholder="Masukkan nominal, cth: 100000"
                  min="1"
                  step="any"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold text-secondary">Alasan / Catatan</label>
                <textarea
                  className="form-control bg-light border-0 shadow-none fs-7"
                  rows="3"
                  placeholder="Alasan koreksi gaji..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  maxLength={1000}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3">
              <button
                type="button"
                className="btn btn-light rounded-3 px-3 fs-7"
                onClick={onClose}
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-4 fs-7 d-flex align-items-center gap-2"
                disabled={submitting}
              >
                {submitting && (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                )}
                <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayrollCorrectionFormModal;