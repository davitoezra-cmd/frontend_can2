import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  Send,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import {apiFetch} from "../api/apiFetch";
import SidebarEmployee from "../components/SidebarEmployee";
import NavbarEmployee from "../layouts/NavbarEmployee";
import "../asset/lifecycle.css";

const statusMeta = {
  SUBMITTED: ["Menunggu approval", "info"],
  APPROVED: ["Disetujui", "success"],
  REJECTED: ["Ditolak", "danger"],
  CANCELLED: ["Dibatalkan", "neutral"],
  COMPLETED: ["Selesai", "neutral"],
};

const Badge = ({ status }) => {
  const [label, tone] = statusMeta[status] || [status || "-", "neutral"];
  return <span className={`lc-badge ${tone}`}>{label}</span>;
};

const fmtDate = (value, withTime = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const getLocalToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

export default function EmployeeResignationPage() {
  const storedUser = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 992);
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const today = getLocalToday();
  const [form, setForm] = useState({
    reason: "",
    last_working_date: today,
    effective_date: today,
    notes: "",
  });

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchResignation = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get("/employee/resignation");
      setResignation(response.data?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResignation(); }, []);

  useEffect(() => {
    if (!resignation) setShowForm(true);
  }, [resignation]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.effective_date < form.last_working_date) {
      Swal.fire({ icon: "error", title: "Tanggal tidak valid", text: "Effective date tidak boleh lebih awal dari last working date." });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Ajukan pengunduran diri?",
      text: "Pastikan tanggal dan alasan yang Anda masukkan sudah benar.",
      showCancelButton: true,
      confirmButtonText: "Ya, ajukan",
      cancelButtonText: "Periksa lagi",
      reverseButtons: true,
      customClass: { popup: "rounded-4" },
    });
    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      await apiFetch.post("/employee/resignation", {
        reason: form.reason,
        last_working_date: form.last_working_date,
        effective_date: form.effective_date,
        notes: form.notes || null,
      });
      setShowForm(false);
      await fetchResignation();
    } finally {
      setSubmitting(false);
    }
  };

  const canReapply = resignation && ["REJECTED", "CANCELLED"].includes(resignation.process_status);
  const timeline = resignation ? [
    { label: "Pengajuan dikirim", date: resignation.submitted_at, done: true },
    { label: resignation.process_status === "REJECTED" ? "Pengajuan ditolak" : "Pengajuan disetujui", date: resignation.approved_at, done: ["APPROVED", "COMPLETED", "REJECTED"].includes(resignation.process_status), current: resignation.process_status === "SUBMITTED" },
    { label: "Offboarding dimulai", date: resignation.offboarding_started_at, done: Boolean(resignation.offboarding_started_at), current: resignation.process_status === "APPROVED" && !resignation.offboarding_started_at },
    { label: "Offboarding selesai", date: resignation.offboarding_completed_at, done: Boolean(resignation.offboarding_completed_at), current: Boolean(resignation.offboarding_started_at) && !resignation.offboarding_completed_at },
  ] : [];

  return (
    <div className="lifecycle-page min-vh-100" style={{ background: "#f1f5f9" }}>
      <style>{`
        .employee-lifecycle-sidebar { width: 260px; height: 100vh; position: fixed; inset: 0 auto 0 0; z-index: 1050; transition: transform .3s ease; }
        .employee-lifecycle-main { min-height: 100vh; transition: margin-left .3s ease; }
        .employee-lifecycle-backdrop { position: fixed; inset: 0; z-index: 1040; background: rgba(15,23,42,.45); }
        @media (min-width: 992px) { .employee-lifecycle-main { margin-left: 260px; } .employee-lifecycle-sidebar { transform: translateX(0) !important; } }
        @media (max-width: 991.98px) { .employee-lifecycle-sidebar.closed { transform: translateX(-100%); } .employee-lifecycle-sidebar.open { transform: translateX(0); } }
      `}</style>

      {isSidebarOpen && <div className="employee-lifecycle-backdrop d-lg-none" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`employee-lifecycle-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <SidebarEmployee isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} showBackdrop={false} showMobileClose={false} />
      </aside>

      <div className="employee-lifecycle-main d-flex flex-column">
        <NavbarEmployee user={storedUser} onToggleSidebar={() => setIsSidebarOpen((v) => !v)} />
        <main className="container-fluid p-3 p-md-4" style={{ maxWidth: 1500 }}>
          <div className="mb-4">
            <span className="lc-badge info mb-2">Employee Lifecycle</span>
            <h2 className="lc-title h3 mb-1">Pengajuan Resign</h2>
            <p className="lc-subtitle mb-0">Ajukan pengunduran diri dan pantau status approval serta proses offboarding Anda.</p>
          </div>

          {loading ? (
            <div className="lc-card lc-empty"><div><div className="spinner-border text-primary mb-3" /><div>Memuat pengajuan resign...</div></div></div>
          ) : showForm ? (
            <div className="row g-4">
              <div className="col-12 col-xl-8">
                <div className="lc-card p-3 p-md-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="lc-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}><FileText size={20} /></div>
                    <div><h5 className="fw-bold mb-1">Form Pengunduran Diri</h5><div className="small text-secondary">Isi tanggal dan alasan pengunduran diri dengan lengkap.</div></div>
                  </div>

                  {canReapply && <div className="alert alert-warning border-warning-subtle small">Pengajuan sebelumnya berstatus <strong>{resignation.process_status}</strong>. Anda dapat mengajukan kembali.</div>}

                  <form onSubmit={submit}>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Hari kerja terakhir *</label>
                        <input type="date" className="form-control" required min={today} value={form.last_working_date} onChange={(e) => setForm((p) => ({ ...p, last_working_date: e.target.value, effective_date: p.effective_date < e.target.value ? e.target.value : p.effective_date }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Tanggal efektif resign *</label>
                        <input type="date" className="form-control" required min={form.last_working_date || today} value={form.effective_date} onChange={(e) => setForm((p) => ({ ...p, effective_date: e.target.value }))} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Alasan pengunduran diri *</label>
                        <textarea className="form-control" rows="4" required maxLength={500} placeholder="Tuliskan alasan pengunduran diri..." value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
                        <div className="text-end small text-secondary mt-1">{form.reason.length}/500</div>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Catatan tambahan</label>
                        <textarea className="form-control" rows="3" placeholder="Catatan tambahan (opsional)" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                      </div>
                    </div>
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4 pt-3 border-top">
                      {canReapply && <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Lihat pengajuan sebelumnya</button>}
                      <button type="submit" disabled={submitting} className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2">
                        {submitting ? <span className="spinner-border spinner-border-sm" /> : <Send size={16} />}
                        {submitting ? "Mengirim..." : "Ajukan Resign"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-12 col-xl-4">
                <div className="lc-card p-3 p-md-4 h-100">
                  <h6 className="fw-bold d-flex align-items-center gap-2"><Info size={18} className="text-primary" /> Informasi proses</h6>
                  <div className="small text-secondary lh-lg mt-3">
                    <div className="d-flex gap-2 mb-2"><ShieldCheck size={17} className="text-success mt-1 flex-shrink-0" /><span>Pengajuan akan masuk ke admin untuk proses approval.</span></div>
                    <div className="d-flex gap-2 mb-2"><Clock3 size={17} className="text-warning mt-1 flex-shrink-0" /><span>Setelah disetujui, status employment masuk ke notice period.</span></div>
                    <div className="d-flex gap-2"><CheckCircle2 size={17} className="text-primary mt-1 flex-shrink-0" /><span>Admin akan menjalankan checklist offboarding sebelum separation diselesaikan.</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : resignation ? (
            <div className="row g-4">
              <div className="col-12 col-xl-7">
                <div className="lc-card p-3 p-md-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
                    <div><div className="small text-secondary mb-1">Status pengajuan</div><Badge status={resignation.process_status} /></div>
                    <div className="text-sm-end"><div className="small text-secondary mb-1">Diajukan</div><div className="fw-semibold">{fmtDate(resignation.submitted_at, true)}</div></div>
                  </div>

                  <div className="row g-3 mb-4">
                    <InfoBox label="Hari kerja terakhir" value={fmtDate(resignation.last_working_date)} />
                    <InfoBox label="Efektif resign" value={fmtDate(resignation.effective_date)} />
                  </div>

                  <div className="border rounded-3 p-3 mb-3">
                    <div className="small text-secondary mb-1">Alasan</div>
                    <div>{resignation.reason || "-"}</div>
                  </div>
                  {resignation.notes && <div className="border rounded-3 p-3"><div className="small text-secondary mb-1">Catatan</div><div>{resignation.notes}</div></div>}

                  {canReapply && <div className="mt-4 pt-3 border-top"><button className="btn btn-primary" onClick={() => setShowForm(true)}>Ajukan Kembali</button></div>}
                </div>
              </div>

              <div className="col-12 col-xl-5">
                <div className="lc-card p-3 p-md-4">
                  <h6 className="fw-bold mb-4">Progress Lifecycle</h6>
                  <div className="lc-timeline">
                    {timeline.map((item) => (
                      <div key={item.label} className={`lc-timeline-item ${item.done ? "done" : item.current ? "current" : ""}`}>
                        <span className="lc-timeline-dot" />
                        <div className="fw-semibold small">{item.label}</div>
                        <div className="small text-secondary mt-1">{item.date ? fmtDate(item.date, true) : item.current ? "Sedang menunggu proses" : "Belum diproses"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return <div className="col-12 col-sm-6"><div className="border rounded-3 p-3 h-100"><div className="small text-secondary mb-1">{label}</div><div className="fw-semibold">{value}</div></div></div>;
}
