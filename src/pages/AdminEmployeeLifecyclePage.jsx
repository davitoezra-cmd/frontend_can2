
import React, { useCallback, useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";

import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  History,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  UserMinus,
  UserRoundPlus,
  UserX,
  X,
} from "lucide-react";

import "../asset/lifecycle.css";

// ============================================================
// API HELPER
// ============================================================
import { apiFetch } from "../api/apiFetch";

// ============================================================
// CONSTANTS
// ============================================================

const TABS = [
  {
    key: "onboarding",
    label: "Onboarding",
  },
  {
    key: "resignation",
    label: "Resignation",
  },
  {
    key: "termination",
    label: "Termination",
  },
  {
    key: "offboarding",
    label: "Offboarding",
  },
  {
    key: "history",
    label: "Status History",
  },
];

const statusMeta = {
  ONBOARDING: ["Onboarding", "info"],
  ACTIVE: ["Aktif", "success"],
  SUSPENDED: ["Suspended", "warning"],
  NOTICE_PERIOD: ["Notice Period", "warning"],
  RESIGNED: ["Resigned", "neutral"],
  TERMINATED: ["Terminated", "danger"],

  SUBMITTED: ["Diajukan", "info"],
  APPROVED: ["Disetujui", "success"],
  REJECTED: ["Ditolak", "danger"],
  CANCELLED: ["Dibatalkan", "neutral"],
  COMPLETED: ["Selesai", "neutral"],

  PENDING: ["Pending", "neutral"],
  IN_PROGRESS: ["Dikerjakan", "warning"],
  SKIPPED: ["Dilewati", "neutral"],
};

// ============================================================
// HELPERS
// ============================================================

const fmtDate = (value, withTime = false) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",

    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
};

const todayJakarta = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

const Badge = ({ status }) => {
  const [label, tone] = statusMeta[status] || [status || "-", "neutral"];

  return <span className={`lc-badge ${tone}`}>{label}</span>;
};

const EmployeeCell = ({ employee }) => (
  <div className="min-w-0">
    <div
      className="fw-semibold text-dark text-truncate"
      style={{
        maxWidth: 210,
      }}
    >
      {employee?.name || "Employee"}
    </div>

    <div className="small text-secondary font-monospace">
      {employee?.employee_code || "-"}
    </div>
  </div>
);

function InfoBox({ label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="border rounded-3 p-3 h-100">
        <div className="small text-secondary mb-1">{label}</div>

        <div className="fw-semibold">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div
      className="lc-empty"
      style={{
        minHeight: 220,
      }}
    >
      <div>
        <div className="lc-empty-icon">
          <UserRoundPlus size={24} />
        </div>

        <div className="fw-semibold text-dark">{title}</div>

        <div className="small mt-1">{text}</div>
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING MODAL
// ============================================================

function OnboardingModal({ employee, onClose, onSaved }) {
  const today = todayJakarta();

  const [form, setForm] = useState({
    start_date: today,
    end_date: "",
  });

  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await apiFetch.post(`/admin/employees/${employee.id}/onboarding`, {
        start_date: form.start_date,
        end_date: form.end_date || null,
      });

      await onSaved();

      onClose();
    } catch (error) {
      console.error("Gagal memulai onboarding:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal memulai onboarding",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan pada server.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lc-modal-backdrop">
      <div className="lc-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom p-3 p-md-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <UserRoundPlus size={20} className="text-primary" />

              <h5 className="mb-0 fw-bold">Mulai Onboarding</h5>
            </div>

            <div className="small text-secondary">
              {employee.name} • {employee.employee_code}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="lc-modal-body">
            <div className="lc-info-strip small mb-4">
              Employee tetap nonaktif sampai onboarding selesai. Backend hanya
              mengizinkan onboarding satu kali untuk employee yang belum
              memiliki employment history.
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">
                  Tanggal mulai kerja *
                </label>

                <input
                  className="form-control"
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      start_date: e.target.value,
                      end_date:
                        p.end_date && p.end_date < e.target.value
                          ? ""
                          : p.end_date,
                    }))
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">
                  Tanggal akhir employment
                </label>

                <input
                  className="form-control"
                  type="date"
                  min={form.start_date}
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      end_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 border-top p-3 p-md-4 bg-light">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              {saving && <span className="spinner-border spinner-border-sm" />}
              Mulai Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// TERMINATION MODAL
// ============================================================

function TerminationModal({ employees, onClose, onSaved }) {
  const today = todayJakarta();

  const [form, setForm] = useState({
    employee_id: employees[0]?.id ? String(employees[0].id) : "",
    last_working_date: today,
    effective_date: today,
    reason: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const selectedEmployee = employees.find(
    (item) => String(item.id) === String(form.employee_id),
  );

  const submit = async (e) => {
    e.preventDefault();

    if (!form.employee_id) {
      Swal.fire({
        icon: "warning",
        title: "Employee belum dipilih",
      });

      return;
    }

    setSaving(true);

    try {
      await apiFetch.post(`/admin/employees/${form.employee_id}/termination`, {
        reason: form.reason,
        last_working_date: form.last_working_date || null,
        effective_date: form.effective_date,
        notes: form.notes || null,
      });

      await onSaved();

      onClose();

      Swal.fire({
        icon: "success",
        title: "Termination diajukan",
        text: "Pengajuan termination berhasil dibuat.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal membuat termination:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal membuat termination",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan pada server.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lc-modal-backdrop">
      <div
        className="lc-modal lc-modal-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom p-3 p-md-4">
          <div>
            <div className="small text-danger fw-semibold mb-1">
              Admin / HR
            </div>

            <h5 className="mb-1 fw-bold">Buat Termination Employee</h5>

            <div className="small text-secondary">
              Termination dibuat oleh Admin dan tetap membutuhkan approval
              sebelum offboarding.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="lc-modal-body">
            <div className="alert alert-danger-subtle border-danger-subtle small d-flex gap-2 align-items-start">
              <ShieldAlert
                size={18}
                className="text-danger mt-1 flex-shrink-0"
              />

              <span>
                Gunakan hanya untuk employee aktif dengan employment berstatus
                ACTIVE atau SUSPENDED. Employee dengan separation yang masih
                berjalan tidak ditampilkan sebagai kandidat.
              </span>
            </div>

            {employees.length === 0 ? (
              <div
                className="lc-empty"
                style={{
                  minHeight: 180,
                }}
              >
                <div>
                  <div className="lc-empty-icon">
                    <UserX size={24} />
                  </div>

                  <div className="fw-semibold text-dark">
                    Tidak ada employee yang eligible
                  </div>

                  <div className="small mt-1">
                    Tidak ada employee ACTIVE/SUSPENDED tanpa separation
                    terbuka.
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    Employee *
                  </label>

                  <select
                    className="form-select"
                    required
                    value={form.employee_id}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        employee_id: e.target.value,
                      }))
                    }
                  >
                    {employees.map((employee) => (
                      <option value={employee.id} key={employee.id}>
                        {employee.employee_code} — {employee.name} (
                        {employee.currentEmploymentStatus})
                      </option>
                    ))}
                  </select>

                  {selectedEmployee && (
                    <div className="small text-secondary mt-2">
                      {selectedEmployee.email || "-"} • Status employment:{" "}
                      {selectedEmployee.currentEmploymentStatus}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">
                    Hari kerja terakhir
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    max={form.effective_date || undefined}
                    value={form.last_working_date}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        last_working_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">
                    Tanggal efektif termination *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    min={today}
                    required
                    value={form.effective_date}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        effective_date: e.target.value,
                        last_working_date:
                          p.last_working_date &&
                          p.last_working_date > e.target.value
                            ? e.target.value
                            : p.last_working_date,
                      }))
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    Alasan termination *
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    required
                    maxLength={500}
                    placeholder="Tuliskan alasan termination..."
                    value={form.reason}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        reason: e.target.value,
                      }))
                    }
                  />

                  <div className="small text-secondary text-end mt-1">
                    {form.reason.length}
                    /500
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    Catatan internal
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Catatan tambahan (opsional)"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 border-top p-3 p-md-4 bg-light">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving || employees.length === 0}
              className="btn btn-danger d-inline-flex align-items-center gap-2"
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <UserX size={16} />
              )}
              Ajukan Termination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// TASK MODAL
// ============================================================

function TaskModal({ context, tasks, onClose, onChanged }) {
  const [form, setForm] = useState({
    task_name: "",
    description: "",
    due_date: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const relevantTasks = tasks.filter((task) => {
    if (context.phase === "ONBOARDING") {
      return (
        task.phase === "ONBOARDING" &&
        Number(task.employment_id) === Number(context.employmentId)
      );
    }

    return (
      task.phase === "OFFBOARDING" &&
      Number(task.separation_id) === Number(context.separationId)
    );
  });

  const createTask = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await apiFetch.post("/admin/employee-lifecycle-tasks", {
        employment_id: context.employmentId,

        separation_id:
          context.phase === "OFFBOARDING" ? context.separationId : null,

        phase: context.phase,

        task_name: form.task_name,

        description: form.description || null,

        due_date: form.due_date || null,

        notes: form.notes || null,
      });

      setForm({
        task_name: "",
        description: "",
        due_date: "",
        notes: "",
      });

      await onChanged();

      Swal.fire({
        icon: "success",
        title: "Checklist ditambahkan",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal menambahkan task:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal menambahkan task",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan pada server.",
      });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (task, status) => {
    setUpdatingId(task.id);

    try {
      await apiFetch.patch(`/admin/employee-lifecycle-tasks/${task.id}`, {
        status,
      });

      await onChanged();
    } catch (error) {
      console.error("Gagal mengubah status task:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal mengubah task",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan pada server.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="lc-modal-backdrop">
      <div
        className="lc-modal lc-modal-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom p-3 p-md-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <ClipboardCheck size={20} className="text-primary" />

              <h5 className="mb-0 fw-bold">
                Checklist{" "}
                {context.phase === "ONBOARDING"
                  ? "Onboarding"
                  : "Offboarding"}
              </h5>
            </div>

            <div className="small text-secondary mt-1">
              {context.employeeName}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <div className="lc-modal-body">
          <div className="d-grid gap-2 mb-4">
            {relevantTasks.length === 0 ? (
              <div className="text-center border rounded-3 p-4 text-secondary small">
                Belum ada checklist. Jika tidak ada task wajib, lifecycle dapat
                diselesaikan langsung sesuai business rule backend.
              </div>
            ) : (
              relevantTasks.map((task) => (
                <div className="lc-task-row" key={task.id}>
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{task.task_name}</div>

                      {task.description && (
                        <div className="small text-secondary mt-1">
                          {task.description}
                        </div>
                      )}

                      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                        <Badge status={task.status} />

                        {task.due_date && (
                          <span className="small text-secondary">
                            Due: {fmtDate(task.due_date)}
                          </span>
                        )}

                        {task.completed_at && (
                          <span className="small text-success">
                            Completed: {fmtDate(task.completed_at, true)}
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <div className="small text-secondary mt-2">
                          Catatan: {task.notes}
                        </div>
                      )}
                    </div>

                    <select
                      className="form-select form-select-sm align-self-md-start"
                      style={{
                        width: 165,
                      }}
                      value={task.status}
                      disabled={updatingId === task.id}
                      onChange={(e) => changeStatus(task, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>

                      <option value="IN_PROGRESS">Dikerjakan</option>

                      <option value="COMPLETED">Selesai</option>

                      <option value="SKIPPED">Dilewati</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={createTask} className="border-top pt-4">
            <h6 className="fw-bold mb-3">Tambah checklist</h6>

            <div className="row g-2">
              <div className="col-12 col-md-7">
                <input
                  className="form-control"
                  placeholder="Nama task"
                  required
                  maxLength={255}
                  value={form.task_name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      task_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-12 col-md-5">
                <input
                  className="form-control"
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      due_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Deskripsi (opsional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Catatan (opsional)"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                  type="submit"
                  disabled={saving}
                >
                  <Plus size={15} />

                  {saving ? "Menyimpan..." : "Tambah Task"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="border-top p-3 bg-light d-flex justify-content-end">
          <button className="btn btn-dark" type="button" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL MODAL
// ============================================================

function DetailModal({ context, onClose }) {
  const [loading, setLoading] = useState(true);

  const [record, setRecord] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        let endpoint;

        if (context.type === "employment") {
          endpoint = `/admin/employee-employments/${context.id}`;
        } else if (context.type === "history") {
          endpoint = `/admin/employee-status-histories/${context.id}`;
        } else {
          endpoint = `/admin/employee-separations/${context.id}`;
        }

        const response = await apiFetch.get(endpoint);

        if (active) {
          setRecord(response.data?.data || null);
        }
      } catch (error) {
        console.error("Gagal memuat detail lifecycle:", error);

        if (active) {
          setRecord(null);

          Swal.fire({
            icon: "error",
            title: "Gagal memuat detail",
            text:
              error?.data?.message ||
              error?.response?.data?.message ||
              error?.message ||
              "Terjadi kesalahan pada server.",
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [context]);

  const employee = record?.employee || record?.employment?.employee;

  return (
    <div className="lc-modal-backdrop">
      <div
        className="lc-modal lc-modal-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom p-3 p-md-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <Eye size={20} className="text-primary" />

              <h5 className="mb-0 fw-bold">Detail Lifecycle</h5>
            </div>

            {employee && (
              <div className="small text-secondary mt-1">
                {employee.name} • {employee.employee_code}
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <div className="lc-modal-body">
          {loading ? (
            <div
              className="lc-empty"
              style={{
                minHeight: 220,
              }}
            >
              <div>
                <div className="spinner-border text-primary mb-3" />

                <div>Memuat detail...</div>
              </div>
            </div>
          ) : !record ? (
            <div
              className="lc-empty"
              style={{
                minHeight: 220,
              }}
            >
              <div>Data tidak ditemukan.</div>
            </div>
          ) : context.type === "employment" ? (
            <EmploymentDetail record={record} employee={employee} />
          ) : context.type === "history" ? (
            <HistoryDetail record={record} employee={employee} />
          ) : (
            <SeparationDetail record={record} employee={employee} />
          )}
        </div>

        <div className="border-top p-3 bg-light d-flex justify-content-end">
          <button className="btn btn-dark" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EMPLOYMENT DETAIL
// ============================================================

function EmploymentDetail({ record, employee }) {
  return (
    <div className="d-grid gap-4">
      {employee && (
        <div className="border rounded-3 p-3">
          <div className="small text-secondary mb-1">Employee</div>

          <div className="fw-semibold">{employee.name}</div>

          <div className="small text-secondary">{employee.employee_code}</div>
        </div>
      )}

      <div className="row g-3">
        <InfoBox label="Start Date" value={fmtDate(record.start_date)} />

        <InfoBox label="End Date" value={fmtDate(record.end_date)} />

        <InfoBox
          label="Onboarding Started"
          value={fmtDate(record.onboarding_started_at, true)}
        />

        <InfoBox
          label="Onboarding Completed"
          value={fmtDate(record.onboarding_completed_at, true)}
        />
      </div>

      <div>
        <h6 className="fw-bold mb-3">Status History</h6>

        <div className="lc-timeline">
          {(record.status_histories || []).map((item) => (
            <div className="lc-timeline-item done" key={item.id}>
              <span className="lc-timeline-dot" />

              <div className="d-flex flex-wrap align-items-center gap-2">
                <Badge status={item.status} />

                <span className="small text-secondary">
                  {fmtDate(item.effective_from, true)}
                </span>
              </div>

              <div className="small text-secondary mt-1">
                {item.reason || "Tidak ada alasan"}
              </div>
            </div>
          ))}

          {(record.status_histories || []).length === 0 && (
            <div className="small text-secondary">
              Belum ada status history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SEPARATION DETAIL
// ============================================================

function SeparationDetail({ record, employee }) {
  return (
    <div className="d-grid gap-4">
      {employee && (
        <div className="border rounded-3 p-3">
          <div className="small text-secondary mb-1">Employee</div>

          <div className="fw-semibold">{employee.name}</div>

          <div className="small text-secondary">{employee.employee_code}</div>
        </div>
      )}

      <div>
        <div className="d-flex gap-2 flex-wrap">
          <span
            className={`lc-badge ${
              record.separation_type === "RESIGNATION" ? "purple" : "danger"
            }`}
          >
            {record.separation_type}
          </span>

          <Badge status={record.process_status} />
        </div>
      </div>

      <div className="row g-3">
        <InfoBox label="Notice Date" value={fmtDate(record.notice_date)} />

        <InfoBox
          label="Last Working Date"
          value={fmtDate(record.last_working_date)}
        />

        <InfoBox
          label="Effective Date"
          value={fmtDate(record.effective_date)}
        />

        <InfoBox
          label="Submitted At"
          value={fmtDate(record.submitted_at, true)}
        />

        <InfoBox
          label="Approved At"
          value={fmtDate(record.approved_at, true)}
        />

        <InfoBox
          label="Processed At"
          value={fmtDate(record.processed_at, true)}
        />

        <InfoBox
          label="Offboarding Started"
          value={fmtDate(record.offboarding_started_at, true)}
        />

        <InfoBox
          label="Offboarding Completed"
          value={fmtDate(record.offboarding_completed_at, true)}
        />
      </div>

      <div className="border rounded-3 p-3">
        <div className="small text-secondary mb-1">Alasan</div>

        <div>{record.reason || "-"}</div>
      </div>

      {record.notes && (
        <div className="border rounded-3 p-3">
          <div className="small text-secondary mb-1">Catatan</div>

          <div>{record.notes}</div>
        </div>
      )}

      <div>
        <h6 className="fw-bold mb-3">Offboarding Tasks</h6>

        <div className="d-grid gap-2">
          {(record.lifecycle_tasks || []).length === 0 ? (
            <div className="small text-secondary">
              Belum ada lifecycle task.
            </div>
          ) : (
            (record.lifecycle_tasks || []).map((task) => (
              <div className="lc-task-row" key={task.id}>
                <div className="d-flex justify-content-between gap-2 flex-wrap">
                  <div className="fw-semibold">{task.task_name}</div>

                  <Badge status={task.status} />
                </div>

                {task.description && (
                  <div className="small text-secondary mt-1">
                    {task.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HISTORY DETAIL
// ============================================================

function HistoryDetail({ record, employee }) {
  return (
    <div className="d-grid gap-4">
      {employee && (
        <div className="border rounded-3 p-3">
          <div className="small text-secondary mb-1">Employee</div>

          <div className="fw-semibold">{employee.name}</div>

          <div className="small text-secondary">{employee.employee_code}</div>
        </div>
      )}

      <div>
        <Badge status={record.status} />
      </div>

      <div className="row g-3">
        <InfoBox
          label="Effective From"
          value={fmtDate(record.effective_from, true)}
        />

        <InfoBox
          label="Effective To"
          value={fmtDate(record.effective_to, true)}
        />
      </div>

      <div className="border rounded-3 p-3">
        <div className="small text-secondary mb-1">
          Alasan perubahan status
        </div>

        <div>{record.reason || "-"}</div>
      </div>

      <div className="small text-secondary">
        Diubah oleh:{" "}
        {record.changed_by?.name ||
          record.changedBy?.name ||
          "System / tidak tersedia"}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function AdminEmployeeLifecyclePage() {
  const [tab, setTab] = useState("onboarding");

  const [employees, setEmployees] = useState([]);

  const [employments, setEmployments] = useState([]);

  const [separations, setSeparations] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [histories, setHistories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [onboardingEmployee, setOnboardingEmployee] = useState(null);

  const [terminationOpen, setTerminationOpen] = useState(false);

  const [taskContext, setTaskContext] = useState(null);

  const [detailContext, setDetailContext] = useState(null);

  // ========================================================
  // LOAD DATA
  // ========================================================

  const loadData = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [employeeRes, employmentRes, separationRes, taskRes, historyRes] =
        await Promise.all([
          apiFetch.get("/admin/employees"),

          apiFetch.get("/admin/employee-employments"),

          apiFetch.get("/admin/employee-separations"),

          apiFetch.get("/admin/employee-lifecycle-tasks"),

          apiFetch.get("/admin/employee-status-histories"),
        ]);

      setEmployees(employeeRes.data?.data || []);

      setEmployments(employmentRes.data?.data || []);

      setSeparations(separationRes.data?.data || []);

      setTasks(taskRes.data?.data || []);

      setHistories(historyRes.data?.data || []);
    } catch (error) {
      console.error("Gagal memuat employee lifecycle:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Tidak dapat mengambil data employee lifecycle.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========================================================
  // SEARCH
  // ========================================================

  const searchMatch = useCallback(
    (employee) => {
      if (!search.trim()) {
        return true;
      }

      const q = search.toLowerCase();

      return [employee?.name, employee?.employee_code, employee?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    },
    [search],
  );

  // ========================================================
  // EMPLOYMENT MAP
  // ========================================================

  const employmentByEmployee = useMemo(() => {
    const map = new Map();

    employments.forEach((item) => {
      const current = map.get(Number(item.employee_id));

      if (!current || Number(item.id) > Number(current.id)) {
        map.set(Number(item.employee_id), item);
      }
    });

    return map;
  }, [employments]);

  // ========================================================
  // OPEN SEPARATIONS
  // ========================================================

  const openEmploymentIds = useMemo(
    () =>
      new Set(
        separations
          .filter((item) =>
            ["SUBMITTED", "APPROVED"].includes(item.process_status),
          )
          .map((item) => Number(item.employment_id)),
      ),
    [separations],
  );

  // ========================================================
  // ONBOARDING
  // ========================================================

  const onboardingRows = useMemo(
    () =>
      employees
        .map((employee) => ({
          employee,
          employment:
            employmentByEmployee.get(Number(employee.id)) ||
            employee.current_employment ||
            null,
        }))
        .filter(
          ({ employment }) =>
            !employment || employment.current_status === "ONBOARDING",
        )
        .filter(({ employee }) => searchMatch(employee)),
    [employees, employmentByEmployee, searchMatch],
  );

  // ========================================================
  // RESIGNATION
  // ========================================================

  const resignationRows = useMemo(
    () =>
      separations
        .filter((item) => item.separation_type === "RESIGNATION")
        .filter((item) => searchMatch(item.employment?.employee)),
    [separations, searchMatch],
  );

  // ========================================================
  // TERMINATION
  // ========================================================

  const terminationRows = useMemo(
    () =>
      separations
        .filter((item) => item.separation_type === "TERMINATION")
        .filter((item) => searchMatch(item.employment?.employee)),
    [separations, searchMatch],
  );

  // ========================================================
  // OFFBOARDING
  // ========================================================

  const offboardingRows = useMemo(
    () =>
      separations
        .filter(
          (item) =>
            item.process_status === "APPROVED" ||
            item.offboarding_started_at ||
            item.offboarding_completed_at ||
            item.process_status === "COMPLETED",
        )
        .filter((item) => searchMatch(item.employment?.employee)),
    [separations, searchMatch],
  );

  // ========================================================
  // HISTORY
  // ========================================================

  const historyRows = useMemo(
    () => histories.filter((item) => searchMatch(item.employment?.employee)),
    [histories, searchMatch],
  );

  // ========================================================
  // TERMINATION CANDIDATES
  // ========================================================

  const terminationCandidates = useMemo(
    () =>
      employees
        .map((employee) => {
          const employment =
            employmentByEmployee.get(Number(employee.id)) ||
            employee.current_employment ||
            null;

          return {
            ...employee,

            lifecycleEmployment: employment,

            currentEmploymentStatus: employment?.current_status || "-",
          };
        })
        .filter((employee) => employee.is_active)
        .filter((employee) =>
          ["ACTIVE", "SUSPENDED"].includes(employee.currentEmploymentStatus),
        )
        .filter(
          (employee) =>
            !openEmploymentIds.has(
              Number(employee.lifecycleEmployment?.id),
            ),
        )
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        ),
    [employees, employmentByEmployee, openEmploymentIds],
  );

  // ========================================================
  // TASK STATS
  // ========================================================

  const taskStats = (phase, employmentId, separationId = null) => {
    const list = tasks.filter(
      (task) =>
        task.phase === phase &&
        Number(task.employment_id) === Number(employmentId) &&
        (phase === "ONBOARDING" ||
          Number(task.separation_id) === Number(separationId)),
    );

    return {
      total: list.length,

      open: list.filter(
        (task) => !["COMPLETED", "SKIPPED"].includes(task.status),
      ).length,
    };
  };

  // ========================================================
  // CONFIRM ACTION
  // ========================================================

  const confirmAction = async ({
    title,
    text,
    confirmText,
    icon = "question",
    request,
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-4",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await request();

      await loadData(true);
    } catch (error) {
      console.error("Lifecycle action error:", error);

      Swal.fire({
        icon: "error",
        title: "Aksi gagal",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan pada server.",
      });
    }
  };

  // ========================================================
  // COMPLETE ONBOARDING
  // ========================================================

  const completeOnboarding = (employment) =>
    confirmAction({
      title: "Selesaikan onboarding?",

      text: "Employee akan menjadi ACTIVE dan dapat menggunakan portal employee. Backend akan menolak jika start date belum tercapai atau checklist masih terbuka.",

      confirmText: "Ya, selesaikan",

      request: () =>
        apiFetch.post(
          `/admin/employee-employments/${employment.id}/onboarding/complete`,
        ),
    });

  // ========================================================
  // APPROVE SEPARATION
  // ========================================================

  const approveSeparation = (separation) =>
    confirmAction({
      title:
        separation.separation_type === "RESIGNATION"
          ? "Setujui pengajuan resign?"
          : "Setujui termination?",

      text:
        separation.separation_type === "RESIGNATION"
          ? "Employment akan masuk NOTICE PERIOD dan offboarding dapat dimulai."
          : "Termination menjadi APPROVED dan proses offboarding dapat dimulai.",

      confirmText: "Setujui",

      request: () =>
        apiFetch.post(
          `/admin/employee-separations/${separation.id}/approve`,
        ),
    });

  // ========================================================
  // REJECT SEPARATION
  // ========================================================

  const rejectSeparation = async (separation) => {
    const typeLabel =
      separation.separation_type === "RESIGNATION"
        ? "resign"
        : "termination";

    const result = await Swal.fire({
      title: `Tolak ${typeLabel}`,

      input: "textarea",

      inputLabel: "Catatan penolakan (opsional)",

      inputPlaceholder: "Tambahkan alasan/catatan...",

      showCancelButton: true,

      confirmButtonText: "Tolak",

      cancelButtonText: "Batal",

      confirmButtonColor: "#dc3545",

      customClass: {
        popup: "rounded-4",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await apiFetch.post(
        `/admin/employee-separations/${separation.id}/reject`,
        {
          notes: result.value || null,
        },
      );

      await loadData(true);
    } catch (error) {
      console.error("Gagal reject separation:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal menolak",
        text:
          error?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan pada server.",
      });
    }
  };

  // ========================================================
  // START OFFBOARDING
  // ========================================================

  const startOffboarding = (separation) =>
    confirmAction({
      title: "Mulai offboarding?",

      text: "Offboarding hanya dapat dimulai dari separation APPROVED. Tambahkan checklist aset/akses bila diperlukan.",

      confirmText: "Mulai Offboarding",

      request: () =>
        apiFetch.post(
          `/admin/employee-separations/${separation.id}/offboarding/start`,
        ),
    });

  // ========================================================
  // COMPLETE OFFBOARDING
  // ========================================================

  const completeOffboarding = (separation) =>
    confirmAction({
      title: "Selesaikan offboarding?",

      text: "Employee akan menjadi RESIGNED/TERMINATED, account dinonaktifkan, dan token login dicabut. Backend hanya mengizinkan setelah effective date dan semua task selesai/di-skip.",

      confirmText: "Selesaikan",

      icon: "warning",

      request: () =>
        apiFetch.post(
          `/admin/employee-separations/${separation.id}/offboarding/complete`,
        ),
    });

  // ========================================================
  // METRICS
  // ========================================================

  const metrics = [
    {
      label: "Belum Onboarding",

      value: employees.filter(
        (e) =>
          !employmentByEmployee.get(Number(e.id)) &&
          !e.current_employment,
      ).length,

      icon: UserRoundPlus,

      bg: "#eff6ff",

      color: "#2563eb",
    },

    {
      label: "Sedang Onboarding",

      value: employments.filter(
        (e) => e.current_status === "ONBOARDING",
      ).length,

      icon: Clock3,

      bg: "#fffbeb",

      color: "#b45309",
    },

    {
      label: "Resign Pending",

      value: separations.filter(
        (s) =>
          s.separation_type === "RESIGNATION" &&
          s.process_status === "SUBMITTED",
      ).length,

      icon: UserMinus,

      bg: "#faf5ff",

      color: "#7e22ce",
    },

    {
      label: "Termination Pending",

      value: separations.filter(
        (s) =>
          s.separation_type === "TERMINATION" &&
          s.process_status === "SUBMITTED",
      ).length,

      icon: UserX,

      bg: "#fef2f2",

      color: "#b91c1c",
    },

    {
      label: "Offboarding Berjalan",

      value: separations.filter(
        (s) =>
          s.process_status === "APPROVED" &&
          s.offboarding_started_at &&
          !s.offboarding_completed_at,
      ).length,

      icon: ClipboardCheck,

      bg: "#f0fdf4",

      color: "#15803d",
    },
  ];

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="lifecycle-page container-fluid py-3 py-md-4">
      {/* HEADER */}

      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div>
          <div className="small text-primary fw-semibold mb-1">
            HR Lifecycle
          </div>

          <h2 className="lc-title h3 mb-1">Employee Lifecycle</h2>

          <p className="lc-subtitle mb-0">
            Kelola onboarding, resignation, termination, offboarding, checklist,
            dan status history menggunakan state dan endpoint backend yang sama.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 align-self-start align-self-lg-center">
          <button
            className="btn btn-danger d-inline-flex align-items-center gap-2"
            onClick={() => {
              setTab("termination");

              setTerminationOpen(true);
            }}
          >
            <UserX size={16} />
            Terminate Employee
          </button>

          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* METRICS */}

      <div className="row g-3 mb-4">
        {metrics.map(({ label, value, icon: Icon, bg, color }) => (
          <div className="col-6 col-md-4 col-xl" key={label}>
            <div className="lc-card lc-stat-card p-3 p-md-4 h-100">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="small text-secondary mb-2">{label}</div>

                  <div className="h3 fw-bold mb-0">
                    {loading ? "–" : value}
                  </div>
                </div>

                <div
                  className="lc-stat-icon"
                  style={{
                    background: bg,
                    color,
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CARD */}

      <div className="lc-card overflow-hidden">
        <div className="p-3 p-md-4 border-bottom">
          <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3">
            <div className="lc-tabs">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`lc-tab ${tab === item.key ? "active" : ""}`}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2">
              {tab === "termination" && (
                <button
                  className="btn btn-sm btn-danger d-inline-flex align-items-center justify-content-center gap-1"
                  onClick={() => setTerminationOpen(true)}
                >
                  <Plus size={15} />
                  Termination Baru
                </button>
              )}

              <div
                className="input-group"
                style={{
                  minWidth: 260,
                  maxWidth: 330,
                }}
              >
                <span className="input-group-text bg-white border-end-0">
                  <Search size={15} className="text-secondary" />
                </span>

                <input
                  className="form-control border-start-0 ps-0"
                  placeholder="Cari employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="lc-empty">
            <div>
              <div className="spinner-border text-primary mb-3" />

              <div>Memuat employee lifecycle...</div>
            </div>
          </div>
        ) : tab === "onboarding" ? (
          <OnboardingTable
            rows={onboardingRows}
            taskStats={taskStats}
            onStart={setOnboardingEmployee}
            onComplete={completeOnboarding}
            onChecklist={(employee, employment) =>
              setTaskContext({
                phase: "ONBOARDING",

                employmentId: employment.id,

                employeeName: employee.name,
              })
            }
            onDetail={(employment) =>
              setDetailContext({
                type: "employment",
                id: employment.id,
              })
            }
          />
        ) : tab === "resignation" ? (
          <SeparationTable
            rows={resignationRows}
            emptyTitle="Belum ada pengajuan resign"
            emptyText="Pengajuan resign dari portal employee akan tampil di sini."
            onApprove={approveSeparation}
            onReject={rejectSeparation}
            onStartOffboarding={(item) => {
              setTab("offboarding");

              startOffboarding(item);
            }}
            onDetail={(item) =>
              setDetailContext({
                type: "separation",
                id: item.id,
              })
            }
          />
        ) : tab === "termination" ? (
          <SeparationTable
            rows={terminationRows}
            emptyTitle="Belum ada termination"
            emptyText="Gunakan tombol Termination Baru untuk membuat termination dari sisi Admin/HR."
            onApprove={approveSeparation}
            onReject={rejectSeparation}
            onStartOffboarding={(item) => {
              setTab("offboarding");

              startOffboarding(item);
            }}
            onDetail={(item) =>
              setDetailContext({
                type: "separation",
                id: item.id,
              })
            }
          />
        ) : tab === "offboarding" ? (
          <OffboardingTable
            rows={offboardingRows}
            taskStats={taskStats}
            onStart={startOffboarding}
            onComplete={completeOffboarding}
            onChecklist={(item) =>
              setTaskContext({
                phase: "OFFBOARDING",

                employmentId: item.employment_id,

                separationId: item.id,

                employeeName:
                  item.employment?.employee?.name || "Employee",
              })
            }
            onDetail={(item) =>
              setDetailContext({
                type: "separation",
                id: item.id,
              })
            }
          />
        ) : (
          <HistoryTable
            rows={historyRows}
            onDetail={(item) =>
              setDetailContext({
                type: "history",
                id: item.id,
              })
            }
          />
        )}
      </div>

      {/* MODALS */}

      {onboardingEmployee && (
        <OnboardingModal
          employee={onboardingEmployee}
          onClose={() => setOnboardingEmployee(null)}
          onSaved={() => loadData(true)}
        />
      )}

      {terminationOpen && (
        <TerminationModal
          employees={terminationCandidates}
          onClose={() => setTerminationOpen(false)}
          onSaved={() => loadData(true)}
        />
      )}

      {taskContext && (
        <TaskModal
          context={taskContext}
          tasks={tasks}
          onClose={() => setTaskContext(null)}
          onChanged={() => loadData(true)}
        />
      )}

      {detailContext && (
        <DetailModal
          context={detailContext}
          onClose={() => setDetailContext(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// ONBOARDING TABLE
// ============================================================

function OnboardingTable({
  rows,
  taskStats,
  onStart,
  onComplete,
  onChecklist,
  onDetail,
}) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="py-3">Status</th>
            <th className="py-3">Start Date</th>
            <th className="py-3">Checklist</th>
            <th className="py-3 text-end px-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="5">
                <EmptyState
                  title="Tidak ada onboarding pending"
                  text="Employee baru yang belum memiliki employment akan muncul di sini."
                />
              </td>
            </tr>
          ) : (
            rows.map(({ employee, employment }) => {
              const stats = employment
                ? taskStats("ONBOARDING", employment.id)
                : {
                    total: 0,
                    open: 0,
                  };

              return (
                <tr key={employee.id}>
                  <td className="px-4 py-3">
                    <EmployeeCell employee={employee} />
                  </td>

                  <td className="py-3">
                    {employment ? (
                      <Badge status={employment.current_status} />
                    ) : (
                      <span className="lc-badge neutral">
                        Belum dimulai
                      </span>
                    )}
                  </td>

                  <td className="py-3 small text-secondary">
                    {employment ? fmtDate(employment.start_date) : "-"}
                  </td>

                  <td className="py-3">
                    {employment ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          onChecklist(employee, employment)
                        }
                      >
                        {stats.total === 0
                          ? "Checklist"
                          : `${
                              stats.total - stats.open
                            }/${stats.total} selesai`}
                      </button>
                    ) : (
                      <span className="small text-secondary">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-end">
                    <div className="d-inline-flex flex-wrap justify-content-end gap-2">
                      {employment && (
                        <button
                          className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                          onClick={() => onDetail(employment)}
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                      )}

                      {!employment ? (
                        <button
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                          onClick={() => onStart(employee)}
                        >
                          <UserRoundPlus size={14} />
                          Mulai
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                          disabled={stats.open > 0}
                          onClick={() => onComplete(employment)}
                          title={
                            stats.open > 0
                              ? "Selesaikan checklist terlebih dahulu"
                              : "Selesaikan onboarding"
                          }
                        >
                          <CheckCircle2 size={14} />
                          Selesaikan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// SEPARATION TABLE
// ============================================================

function SeparationTable({
  rows,
  emptyTitle,
  emptyText,
  onApprove,
  onReject,
  onStartOffboarding,
  onDetail,
}) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="py-3">Reason</th>
            <th className="py-3">Submitted</th>
            <th className="py-3">Last Working</th>
            <th className="py-3">Effective</th>
            <th className="py-3">Status</th>
            <th className="py-3 text-end px-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="7">
                <EmptyState
                  title={emptyTitle}
                  text={emptyText}
                />
              </td>
            </tr>
          ) : (
            rows.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <EmployeeCell
                    employee={item.employment?.employee}
                  />
                </td>

                <td className="py-3">
                  <div
                    className="small text-secondary text-truncate"
                    style={{
                      maxWidth: 220,
                    }}
                    title={item.reason}
                  >
                    {item.reason || "-"}
                  </div>
                </td>

                <td className="py-3 small text-secondary">
                  {fmtDate(item.submitted_at, true)}
                </td>

                <td className="py-3 small">
                  {fmtDate(item.last_working_date)}
                </td>

                <td className="py-3 small">
                  {fmtDate(item.effective_date)}
                </td>

                <td className="py-3">
                  <Badge status={item.process_status} />
                </td>

                <td className="px-4 py-3 text-end">
                  <div className="d-inline-flex flex-wrap justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                      onClick={() => onDetail(item)}
                    >
                      <Eye size={14} />
                      Detail
                    </button>

                    {item.process_status === "SUBMITTED" ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onReject(item)}
                        >
                          Tolak
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => onApprove(item)}
                        >
                          Approve
                        </button>
                      </>
                    ) : item.process_status === "APPROVED" &&
                      !item.offboarding_started_at ? (
                      <button
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                        onClick={() =>
                          onStartOffboarding(item)
                        }
                      >
                        Mulai Offboarding
                        <ArrowRight size={14} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// OFFBOARDING TABLE
// ============================================================

function OffboardingTable({
  rows,
  taskStats,
  onStart,
  onComplete,
  onChecklist,
  onDetail,
}) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="py-3">Type</th>
            <th className="py-3">Effective</th>
            <th className="py-3">Progress</th>
            <th className="py-3">Checklist</th>
            <th className="py-3 text-end px-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6">
                <EmptyState
                  title="Tidak ada offboarding"
                  text="Separation yang APPROVED akan masuk ke antrean offboarding."
                />
              </td>
            </tr>
          ) : (
            rows.map((item) => {
              const stats = taskStats(
                "OFFBOARDING",
                item.employment_id,
                item.id,
              );

              const completed =
                item.process_status === "COMPLETED" ||
                Boolean(item.offboarding_completed_at);

              const started = Boolean(
                item.offboarding_started_at,
              );

              return (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <EmployeeCell
                      employee={item.employment?.employee}
                    />
                  </td>

                  <td className="py-3">
                    <span
                      className={`lc-badge ${
                        item.separation_type === "RESIGNATION"
                          ? "purple"
                          : "danger"
                      }`}
                    >
                      {item.separation_type === "RESIGNATION"
                        ? "Resignation"
                        : "Termination"}
                    </span>
                  </td>

                  <td className="py-3 small">
                    {fmtDate(item.effective_date)}
                  </td>

                  <td className="py-3">
                    {completed ? (
                      <span className="lc-badge success">
                        Offboarding selesai
                      </span>
                    ) : started ? (
                      <span className="lc-badge warning">
                        Sedang offboarding
                      </span>
                    ) : (
                      <span className="lc-badge info">
                        Siap dimulai
                      </span>
                    )}
                  </td>

                  <td className="py-3">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={completed}
                      onClick={() => onChecklist(item)}
                    >
                      {stats.total === 0
                        ? "Checklist"
                        : `${stats.total - stats.open}/${stats.total} selesai`}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-end">
                    <div className="d-inline-flex flex-wrap justify-content-end gap-2">
                      <button
                        className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                        onClick={() => onDetail(item)}
                      >
                        <Eye size={14} />
                        Detail
                      </button>

                      {completed ? (
                        <span className="small text-secondary d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={14} />
                          Selesai
                        </span>
                      ) : !started ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => onStart(item)}
                        >
                          Mulai Offboarding
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success"
                          disabled={stats.open > 0}
                          onClick={() => onComplete(item)}
                        >
                          Selesaikan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// HISTORY TABLE
// ============================================================

function HistoryTable({ rows, onDetail }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="py-3">Status</th>
            <th className="py-3">Effective From</th>
            <th className="py-3">Effective To</th>
            <th className="py-3">Reason</th>
            <th className="py-3 text-end px-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6">
                <EmptyState
                  title="Belum ada status history"
                  text="Perubahan status lifecycle akan tercatat otomatis oleh backend."
                />
              </td>
            </tr>
          ) : (
            rows.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <EmployeeCell
                    employee={item.employment?.employee}
                  />
                </td>

                <td className="py-3">
                  <Badge status={item.status} />
                </td>

                <td className="py-3 small">
                  {fmtDate(item.effective_from, true)}
                </td>

                <td className="py-3 small text-secondary">
                  {fmtDate(item.effective_to, true)}
                </td>

                <td className="py-3">
                  <div
                    className="small text-secondary text-truncate"
                    style={{
                      maxWidth: 260,
                    }}
                    title={item.reason}
                  >
                    {item.reason || "-"}
                  </div>
                </td>

                <td className="px-4 py-3 text-end">
                  <button
                    className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                    onClick={() => onDetail(item)}
                  >
                    <History size={14} />
                    Detail
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

