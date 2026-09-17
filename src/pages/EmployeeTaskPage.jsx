import React, { useEffect, useState } from "react";
import {apiFetch} from "../api/apiFetch";
import SidebarEmployee from "../components/SidebarEmployee";
import NavbarEmployee from "../layouts/NavbarEmployee";


const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [completionNote, setCompletionNote] = useState("");

  // =====================================================
  // GET TASKS
  // =====================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const url = statusFilter
        ? `/employee/tasks?status=${statusFilter}`
        : `/employee/tasks`;

      const response = await apiFetch.get(url);

      setTasks(response.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil task:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil daftar tugas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  // =====================================================
  // GET DETAIL TASK
  // =====================================================

  const handleShowDetail = async (id) => {
    try {
      setDetailLoading(true);
      setError("");

      const response = await apiFetch.get(
        `/employee/tasks/${id}`
      );

      const task = response.data?.data;

      setSelectedTask(task);

      setStatus(task?.status || "");
      setCompletionNote(task?.completion_note || "");
    } catch (err) {
      console.error("Gagal mengambil detail task:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil detail tugas."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleUpdateStatus = async () => {
    if (!selectedTask) return;

    try {
      setSaving(true);
      setError("");

      const response = await apiFetch.put(
        `/employee/tasks/${selectedTask.id}/status`,
        {
          status,
          completion_note:
            status === "completed"
              ? completionNote
              : null,
        }
      );

      const updatedTask = response.data?.data;

      setSelectedTask(updatedTask);

      // Update data di tabel tanpa reload
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id
            ? {
                ...task,
                ...updatedTask,
              }
            : task
        )
      );

      alert("Status tugas berhasil diperbarui.");
    } catch (err) {
      console.error("Gagal update status:", err);

      setError(
        err.response?.data?.message ||
          "Gagal memperbarui status tugas."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (taskStatus) => {
    switch (taskStatus) {
      case "pending":
        return (
          <span className="badge bg-warning text-dark">
            Pending
          </span>
        );

      case "in_progress":
        return (
          <span className="badge bg-primary">
            Sedang Dikerjakan
          </span>
        );

      case "completed":
        return (
          <span className="badge bg-success">
            Selesai
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary">
            {taskStatus || "-"}
          </span>
        );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  // =====================================================
  // CLOSE DETAIL
  // =====================================================

  const closeDetail = () => {
    setSelectedTask(null);
    setStatus("");
    setCompletionNote("");
  };

 
  return (
  <div className="d-flex min-vh-100 bg-light">
    <style>{`
      .employee-task-main {
        width: 100%;
        margin-left: 0;
        min-width: 0;
      }
      @media (min-width: 992px) {
        .employee-task-main {
          margin-left: 260px;
          width: calc(100% - 260px);
        }
      }
    `}</style>

    {/* ================= SIDEBAR ================= */}
    <SidebarEmployee
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
    />

    {/* ================= MAIN CONTENT ================= */}
    <div className="flex-grow-1 employee-task-main" style={{ minWidth: 0 }}>

      {/* ================= NAVBAR ================= */}
      <NavbarEmployee
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* ================= PAGE CONTENT ================= */}
      <main className="p-3 p-md-4">

        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h3 className="fw-bold mb-1">
              Tugas Saya
            </h3>

            <p className="text-muted mb-0">
              Lihat dan kelola tugas yang diberikan kepada Anda.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={fetchTasks}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}

            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {/* STAT CARD */}
        <div className="row g-3 mb-4">

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Total Tugas
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {tasks.length}
                    </h3>
                  </div>

                  <div
                    className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <i className="bi bi-list-task fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Pending
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {
                        tasks.filter(
                          (task) => task.status === "pending"
                        ).length
                      }
                    </h3>
                  </div>

                  <div
                    className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <i className="bi bi-hourglass-split fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Dikerjakan
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {
                        tasks.filter(
                          (task) => task.status === "in_progress"
                        ).length
                      }
                    </h3>
                  </div>

                  <div
                    className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <i className="bi bi-arrow-repeat fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      Selesai
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {
                        tasks.filter(
                          (task) => task.status === "completed"
                        ).length
                      }
                    </h3>
                  </div>

                  <div
                    className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <i className="bi bi-check-circle fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MAIN CARD */}
        <div className="card border-0 shadow-sm">

          <div className="card-body">

            {/* FILTER */}
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">

              <div>
                <h5 className="fw-bold mb-1">
                  Daftar Tugas
                </h5>

                <small className="text-muted">
                  Semua tugas yang diberikan kepada Anda.
                </small>
              </div>

              <div style={{ minWidth: "200px" }}>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="">
                    Semua Status
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="in_progress">
                    Sedang Dikerjakan
                  </option>

                  <option value="completed">
                    Selesai
                  </option>
                </select>
              </div>

            </div>

            {/* LOADING */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>

                <p className="text-muted mt-3 mb-0">
                  Memuat tugas...
                </p>
              </div>

            ) : tasks.length === 0 ? (

              /* EMPTY */
              <div className="text-center py-5">

                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <i className="bi bi-clipboard-x fs-2 text-muted"></i>
                </div>

                <h6 className="fw-bold">
                  Belum ada tugas
                </h6>

                <p className="text-muted mb-0">
                  Tidak ada tugas yang tersedia saat ini.
                </p>

              </div>

            ) : (

              /* TABLE */
              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: "220px" }}>
                        Tugas
                      </th>

                      <th style={{ minWidth: "180px" }}>
                        Pemberi Tugas
                      </th>

                      <th>
                        Team
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Dibuat
                      </th>

                      <th className="text-end">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {tasks.map((task) => (
                      <tr key={task.id}>

                        <td>
                          <div className="fw-semibold">
                            {task.title ||
                              task.name ||
                              `Tugas #${task.id}`}
                          </div>

                          {task.description && (
                            <div
                              className="text-muted small mt-1"
                              style={{
                                maxWidth: "300px",
                              }}
                            >
                              {task.description.length > 80
                                ? `${task.description.substring(
                                    0,
                                    80
                                  )}...`
                                : task.description}
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {task.assigner?.name || "-"}
                          </div>

                          {task.assigner?.email && (
                            <small className="text-muted">
                              {task.assigner.email}
                            </small>
                          )}
                        </td>

                        <td>
                          {task.team?.name || "-"}
                        </td>

                        <td>
                          {getStatusBadge(task.status)}
                        </td>

                        <td>
                          <small className="text-muted">
                            {formatDate(task.created_at)}
                          </small>
                        </td>

                        <td className="text-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleShowDetail(task.id)
                            }
                          >
                            <i className="bi bi-eye me-1"></i>
                            Detail
                          </button>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </div>

      </main>

    </div>

    {/* RESPONSIVE STYLE */}
    <style>{`
      @media (max-width: 767.98px) {
        .flex-grow-1 {
          margin-left: 0 !important;
        }
      }
    `}</style>

    {/* DETAIL MODAL */}
    {selectedTask && (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 2000,
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">

            <div className="modal-header">

              <div>
                <h5 className="modal-title fw-bold">
                  Detail Tugas
                </h5>

                <small className="text-muted">
                  Tugas #{selectedTask.id}
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={closeDetail}
              ></button>

            </div>

            <div className="modal-body">

              {detailLoading ? (

                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>

                  <p className="text-muted mt-3">
                    Memuat detail...
                  </p>
                </div>

              ) : (

                <>

                  <div className="mb-4">

                    <h4 className="fw-bold mb-2">
                      {selectedTask.title ||
                        selectedTask.name ||
                        `Tugas #${selectedTask.id}`}
                    </h4>

                    {getStatusBadge(selectedTask.status)}

                  </div>

                  <div className="row g-3 mb-4">

                    <div className="col-12 col-md-6">
                      <div className="bg-light rounded-3 p-3 h-100">

                        <small className="text-muted d-block mb-1">
                          Pemberi Tugas
                        </small>

                        <div className="fw-semibold">
                          {selectedTask.assigner?.name || "-"}
                        </div>

                        <small className="text-muted">
                          {selectedTask.assigner?.email || ""}
                        </small>

                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="bg-light rounded-3 p-3 h-100">

                        <small className="text-muted d-block mb-1">
                          Team
                        </small>

                        <div className="fw-semibold">
                          {selectedTask.team?.name || "-"}
                        </div>

                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="bg-light rounded-3 p-3">

                        <small className="text-muted d-block mb-1">
                          Dibuat
                        </small>

                        <div className="fw-semibold">
                          {formatDate(
                            selectedTask.created_at
                          )}
                        </div>

                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="bg-light rounded-3 p-3">

                        <small className="text-muted d-block mb-1">
                          Selesai
                        </small>

                        <div className="fw-semibold">
                          {formatDate(
                            selectedTask.completed_at
                          )}
                        </div>

                      </div>
                    </div>

                  </div>

                  <div className="mb-4">

                    <label className="fw-semibold mb-2">
                      Deskripsi Tugas
                    </label>

                    <div className="border rounded-3 p-3 bg-light">
                      {selectedTask.description ||
                        "Tidak ada deskripsi."}
                    </div>

                  </div>

                  <div>

                    <label className="fw-semibold mb-2">
                      Update Status
                    </label>

                    <select
                      className="form-select mb-3"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value)
                      }
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="in_progress">
                        Sedang Dikerjakan
                      </option>

                      <option value="completed">
                        Selesai
                      </option>

                    </select>

                    {status === "completed" && (
                      <div>

                        <label className="fw-semibold mb-2">
                          Catatan Penyelesaian
                        </label>

                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Tulis catatan penyelesaian tugas..."
                          value={completionNote}
                          onChange={(e) =>
                            setCompletionNote(
                              e.target.value
                            )
                          }
                        />

                      </div>
                    )}

                  </div>

                </>
              )}

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-light"
                onClick={closeDetail}
              >
                Tutup
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={saving || detailLoading}
              >

                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2 me-2"></i>
                    Simpan Status
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      </div>
    )}

  </div>
);
}
export default EmployeeTaskPage;