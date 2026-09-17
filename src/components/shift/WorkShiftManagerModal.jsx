import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import {apiFetch} from "../../api/apiFetch";

const EMPTY_FORM = {
  code: "",
  name: "",
  jam_masuk: "08:00",
  jam_pulang: "17:00",
  late_tolerance_minutes: 10,
  is_active: true,
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const timeValue = (value) => (value ? String(value).slice(0, 5) : "");

export default function WorkShiftManagerModal({ open, onClose, onChanged }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const lateLimitPreview = useMemo(() => {
    if (!form.jam_masuk) return "-";
    const [hours, minutes] = form.jam_masuk.split(":").map(Number);
    const total = hours * 60 + minutes + Number(form.late_tolerance_minutes || 0);
    const normalized = ((total % 1440) + 1440) % 1440;
    return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
  }, [form.jam_masuk, form.late_tolerance_minutes]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get("/admin/work-shifts");
      setShifts(normalizeList(response.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchShifts();
  }, [open]);

  if (!open) return null;

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const editShift = (shift) => {
    setEditingId(shift.id);
    setErrors({});
    setForm({
      code: shift.code || "",
      name: shift.name || "",
      jam_masuk: timeValue(shift.jam_masuk),
      jam_pulang: timeValue(shift.jam_pulang),
      late_tolerance_minutes: shift.late_tolerance_minutes ?? 10,
      is_active: Boolean(shift.is_active),
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      late_tolerance_minutes: Number(form.late_tolerance_minutes || 0),
    };

    try {
      if (editingId) {
        await apiFetch.put(`/admin/work-shifts/${editingId}`, payload);
      } else {
        await apiFetch.post("/admin/work-shifts", payload);
      }
      resetForm();
      await fetchShifts();
      await onChanged?.();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response?.data?.errors || {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeShift = async (shift) => {
    const result = await Swal.fire({
      title: "Hapus work shift?",
      text: `${shift.name} akan dihapus jika belum digunakan oleh schedule.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc3545",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch.delete(`/admin/work-shifts/${shift.id}`);
      await fetchShifts();
      await onChanged?.();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Shift tidak dapat dihapus",
        text: error.response?.data?.message || "Terjadi kesalahan saat menghapus shift.",
      });
    }
  };

  return (
    <div className="shift-modal-backdrop" role="presentation">
      <div className="shift-modal-card shift-modal-xl" role="dialog" aria-modal="true">
        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom p-3 p-md-4">
          <div>
            <h5 className="fw-bold mb-1">Master Work Shift</h5>
            <p className="text-muted small mb-0">
              Jam masuk dan pulang diinput manual. Toleransi telat default 10 menit dan dapat diubah per shift.
            </p>
          </div>
          <button type="button" className="btn btn-light rounded-circle" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="shift-modal-body">
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <form onSubmit={submit} className="border rounded-4 p-3 bg-light-subtle">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-bold">{editingId ? "Edit Shift" : "Tambah Shift"}</div>
                  {editingId ? (
                    <button type="button" className="btn btn-sm btn-link text-decoration-none" onClick={resetForm}>
                      Batal edit
                    </button>
                  ) : null}
                </div>

                <div className="row g-3">
                  <div className="col-5">
                    <label className="form-label fw-semibold">Kode</label>
                    <input
                      className={`form-control ${errors.code ? "is-invalid" : ""}`}
                      value={form.code}
                      onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="PAGI"
                    />
                    {errors.code ? <div className="invalid-feedback">{errors.code[0]}</div> : null}
                  </div>
                  <div className="col-7">
                    <label className="form-label fw-semibold">Nama Shift</label>
                    <input
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Shift Pagi"
                    />
                    {errors.name ? <div className="invalid-feedback">{errors.name[0]}</div> : null}
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-semibold">Jam Masuk</label>
                    <input
                      type="time"
                      className={`form-control ${errors.jam_masuk ? "is-invalid" : ""}`}
                      value={form.jam_masuk}
                      onChange={(e) => setForm((prev) => ({ ...prev, jam_masuk: e.target.value }))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold">Jam Pulang</label>
                    <input
                      type="time"
                      className={`form-control ${errors.jam_pulang ? "is-invalid" : ""}`}
                      value={form.jam_pulang}
                      onChange={(e) => setForm((prev) => ({ ...prev, jam_pulang: e.target.value }))}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Toleransi Keterlambatan</label>
                    <div className="input-group">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        className={`form-control ${errors.late_tolerance_minutes ? "is-invalid" : ""}`}
                        value={form.late_tolerance_minutes}
                        onChange={(e) => setForm((prev) => ({ ...prev, late_tolerance_minutes: e.target.value }))}
                      />
                      <span className="input-group-text">menit</span>
                    </div>
                    <div className="form-text">
                      Dengan jam masuk {form.jam_masuk || "--:--"}, terlambat mulai setelah <strong>{lateLimitPreview}</strong>.
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        id="shift-active"
                        className="form-check-input"
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="shift-active">Shift aktif</label>
                    </div>
                  </div>

                  <div className="col-12 d-grid">
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <Plus size={16} className="me-2" />}
                      {editingId ? "Simpan Perubahan" : "Tambah Work Shift"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-12 col-lg-7">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="fw-bold">Daftar Work Shift</div>
                  <small className="text-muted">Deadline telat dihitung otomatis dari toleransi.</small>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={fetchShifts} disabled={loading}>
                  <RefreshCw size={15} className="me-1" /> Refresh
                </button>
              </div>

              <div className="table-responsive border rounded-4 overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Shift</th>
                      <th>Jam</th>
                      <th>Toleransi</th>
                      <th>Status</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-4">Memuat...</td></tr>
                    ) : !shifts.length ? (
                      <tr><td colSpan="5" className="text-center text-muted py-4">Belum ada work shift.</td></tr>
                    ) : shifts.map((shift) => (
                      <tr key={shift.id}>
                        <td>
                          <div className="fw-semibold">{shift.name}</div>
                          <small className="text-muted">{shift.code}</small>
                        </td>
                        <td>{timeValue(shift.jam_masuk)} - {timeValue(shift.jam_pulang)}</td>
                        <td>
                          <div>{shift.late_tolerance_minutes ?? 10} menit</div>
                          <small className="text-muted">Batas {timeValue(shift.batas_telat)}</small>
                        </td>
                        <td>
                          <span className={`badge ${shift.is_active ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                            {shift.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-light me-1" onClick={() => editShift(shift)} title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button className="btn btn-sm btn-light text-danger" onClick={() => removeShift(shift)} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
