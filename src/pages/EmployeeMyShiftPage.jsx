import React, { useEffect, useMemo, useState } from "react";
import {apiFetch} from "../api/apiFetch";
import SidebarEmployee from "../components/SidebarEmployee";
import NavbarEmployee from "../layouts/NavbarEmployee";

const padTime = (value) => {
  if (!value) return "-";
  const text = String(value);
  return text.length >= 5 ? text.slice(0, 5) : text;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const durationFromTimes = (start, end, crossesDay = false) => {
  if (!start || !end) return null;

  const [startHour = 0, startMinute = 0] = String(start)
    .split(":")
    .map(Number);
  const [endHour = 0, endMinute = 0] = String(end).split(":").map(Number);

  let startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  if (crossesDay || endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const total = endMinutes - startMinutes;
  if (total < 0) return null;

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours && minutes) return `${hours} jam ${minutes} menit`;
  if (hours) return `${hours} jam`;
  return `${minutes} menit`;
};

const EmployeeMyShiftPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 992 : true,
  );

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMyShift = async () => {
    setLoading(true);
    setError("");

    try {
      // apifetch baseURL sudah mengandung /api.
      // Request final: GET /api/employee/my-shift
      const response = await apiFetch.get("/employee/my-shift");
      setSchedule(response.data?.data ?? null);
    } catch (err) {
      console.error("Error fetching employee shift:", err);
      setError(
        err.response?.data?.message ||
          "Jadwal shift hari ini gagal dimuat. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShift();
  }, []);

  const shift = schedule?.shift || schedule?.work_shift || null;
  const status = String(schedule?.status || "").toLowerCase();
  const isOff = status === "off" || status === "libur";

  const startTime =
    shift?.jam_masuk || shift?.start_time || schedule?.start_time || null;
  const endTime =
    shift?.jam_pulang || shift?.end_time || schedule?.end_time || null;

  const duration =
    schedule?.duration ||
    shift?.duration ||
    durationFromTimes(
      startTime,
      endTime,
      Boolean(shift?.lintas_hari || shift?.crosses_day),
    );

  const employeeName =
    schedule?.employee?.name || schedule?.employee_name || loggedInUser?.name || "-";

  const workDate =
    schedule?.work_date || schedule?.date || new Date().toISOString().slice(0, 10);

  return (
    <div
      className="min-vh-100 position-relative"
      style={{ backgroundColor: "#f1f5f9" }}
    >
      <style>{`
        .shift-sidebar-backdrop {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(3px);
          z-index: 1040;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .shift-sidebar-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        .shift-sidebar-container {
          width: 260px;
          height: 100vh !important;
          max-height: 100vh !important;
          position: fixed !important;
          inset: 0 auto 0 0;
          z-index: 1050;
          background-color: #0f172a;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }

        .shift-main-content {
          min-height: 100vh;
          transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .my-shift-card {
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .my-shift-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          font-size: 1.35rem;
        }

        @media (max-width: 991.98px) {
          .shift-sidebar-container.closed { transform: translateX(-100%); }
          .shift-sidebar-container.open { transform: translateX(0); }
          .shift-main-content { margin-left: 0 !important; }
        }

        @media (min-width: 992px) {
          .shift-sidebar-container { transform: translateX(0) !important; }
          .shift-main-content { margin-left: 260px !important; }
        }
      `}</style>

      <div
        className={`shift-sidebar-backdrop d-lg-none ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`shift-sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
      >
        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showBackdrop={false}
          showMobileClose={false}
        />
      </aside>

      <div className="shift-main-content d-flex flex-column min-w-0">
        <NavbarEmployee
          user={loggedInUser}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="p-3 p-md-4 container-fluid" style={{ maxWidth: 1500 }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <p className="text-primary fw-semibold small mb-1">Employee</p>
              <h3 className="fw-bold text-dark mb-1">My Shift</h3>
              <p className="text-muted mb-0">
                Jadwal kerja Anda untuk hari ini.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary rounded-3 px-3 align-self-start align-self-md-center"
              onClick={fetchMyShift}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-2" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center justify-content-center py-5">
                <div className="text-center">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="fw-semibold">Memuat shift hari ini...</div>
                  <small className="text-muted">Mengambil jadwal terbaru dari server</small>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center py-5 px-3">
                <div
                  className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 58, height: 58 }}
                >
                  <i className="bi bi-exclamation-triangle fs-4" />
                </div>
                <h5 className="fw-bold">Gagal memuat jadwal</h5>
                <p className="text-muted mb-3">{error}</p>
                <button className="btn btn-primary" onClick={fetchMyShift}>
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : !schedule ? (
            <div className="card border-0 shadow-sm rounded-4 my-shift-card">
              <div className="card-body text-center py-5 px-3">
                <div
                  className="rounded-circle bg-light text-secondary d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64 }}
                >
                  <i className="bi bi-calendar2-x fs-3" />
                </div>
                <h5 className="fw-bold mb-2">Belum ada shift hari ini</h5>
                <p className="text-muted mb-0">
                  Anda belum memiliki mapping shift untuk tanggal hari ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-12 col-xl-8">
                <div className="card border-0 shadow-sm rounded-4 my-shift-card h-100">
                  <div className="card-body p-4 p-lg-5">
                    <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="my-shift-icon">
                          <i className="bi bi-calendar2-week" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Work Shift</small>
                          <h4 className="fw-bold mb-0">
                            {isOff ? "OFF" : shift?.name || shift?.code || "Shift Kerja"}
                          </h4>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            isOff
                              ? "bg-secondary-subtle text-secondary"
                              : "bg-success-subtle text-success"
                          }`}
                        >
                          <i
                            className={`bi ${isOff ? "bi-moon-stars" : "bi-check-circle"} me-1`}
                          />
                          {isOff ? "OFF" : schedule.status || "work"}
                        </span>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                          <small className="text-muted d-block mb-1">Nama Employee</small>
                          <div className="fw-semibold text-dark">{employeeName}</div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                          <small className="text-muted d-block mb-1">Tanggal</small>
                          <div className="fw-semibold text-dark">{formatDate(workDate)}</div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                            <i className="bi bi-box-arrow-in-right" />
                            <small className="fw-semibold">Jam Mulai</small>
                          </div>
                          <div className="fs-4 fw-bold">{isOff ? "-" : padTime(startTime)}</div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                            <i className="bi bi-box-arrow-right" />
                            <small className="fw-semibold">Jam Selesai</small>
                          </div>
                          <div className="fs-4 fw-bold">{isOff ? "-" : padTime(endTime)}</div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                            <i className="bi bi-hourglass-split" />
                            <small className="fw-semibold">Durasi</small>
                          </div>
                          <div className="fs-5 fw-bold">{isOff ? "-" : duration || "-"}</div>
                        </div>
                      </div>
                    </div>

                    {schedule.notes ? (
                      <div className="alert alert-light border rounded-4 mt-4 mb-0">
                        <div className="fw-semibold small mb-1">Catatan</div>
                        <div className="text-muted">{schedule.notes}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Ringkasan Hari Ini</h6>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center justify-content-between gap-3 border-bottom pb-3">
                        <span className="text-muted">Status</span>
                        <span className="fw-semibold">{isOff ? "OFF" : schedule.status || "work"}</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between gap-3 border-bottom pb-3">
                        <span className="text-muted">Shift</span>
                        <span className="fw-semibold text-end">
                          {isOff ? "Libur" : shift?.name || shift?.code || "-"}
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        <span className="text-muted">Waktu</span>
                        <span className="fw-semibold">
                          {isOff ? "-" : `${padTime(startTime)} - ${padTime(endTime)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeMyShiftPage;
