import React, { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../api/apiFetch";

const API_URL = "/admin/task-assignments";

const TaskAssignmentPage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState({
    team_id: "",
    title: "",
    description: "",
    status: "pending",
    deadline: "",
  });

  // =====================================================
  // FETCH TASK
  // =====================================================

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = statusFilter
        ? `?${new URLSearchParams({
            status: statusFilter,
          }).toString()}`
        : "";

      const response = await apiFetch.get(`${API_URL}${query}`);

      setTasks(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Gagal memuat data penugasan:", err);

      setError(
        err.response?.data?.message || "Gagal memuat data penugasan."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // =====================================================
  // FETCH TEAM
  // =====================================================

  const fetchTeams = useCallback(async () => {
    try {
      const response = await apiFetch.get(`${API_URL}/available-teams`);

      setTeams(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Gagal mengambil team:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchTeams();
  }, [fetchTasks, fetchTeams]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return tasks.filter((task) => {
      return (
        task.title?.toLowerCase().includes(keyword) ||
        task.team?.name?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword)
      );
    });
  }, [tasks, search]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    return {
      total: tasks.length,

      pending: tasks.filter((task) => task.status === "pending").length,

      inProgress: tasks.filter((task) => task.status === "in_progress").length,

      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  // =====================================================
  // FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      team_id: "",
      title: "",
      description: "",
      status: "pending",
      deadline: "",
    });
  };

  const openCreate = () => {
    setSelectedTask(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (task) => {
    setSelectedTask(task);

    setForm({
      team_id: task.team_id || task.team?.id || "",

      title: task.title || "",

      description: task.description || "",

      status: task.status || "pending",

      deadline: task.deadline
        ? String(task.deadline).substring(0, 16)
        : "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedTask(null);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.team_id) {
      alert("Silakan pilih tim terlebih dahulu.");
      return;
    }

    if (!form.title.trim()) {
      alert("Judul tugas wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        team_id: Number(form.team_id),

        title: form.title.trim(),

        description: form.description.trim() || null,

        ...(selectedTask
          ? {
              status: form.status,
            }
          : {}),

        deadline: form.deadline || null,
      };

      if (selectedTask) {
        await apiFetch.put(`${API_URL}/${selectedTask.id}`, payload);
      } else {
        await apiFetch.post(API_URL, payload);
      }

      setShowModal(false);
      setSelectedTask(null);
      resetForm();

      await fetchTasks();
    } catch (err) {
      console.error("Gagal menyimpan penugasan:", err);

      alert(
        err.response?.data?.message || "Gagal menyimpan penugasan."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DETAIL
  // =====================================================

  const handleDetail = async (task) => {
    try {
      const response = await apiFetch.get(`${API_URL}/${task.id}`);

      setSelectedTask(
        response.data?.data || response.data || task
      );

      setShowDetailModal(true);
    } catch (err) {
      console.error("Gagal mengambil detail penugasan:", err);

      setSelectedTask(task);
      setShowDetailModal(true);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const openDelete = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    try {
      await apiFetch.delete(`${API_URL}/${selectedTask.id}`);

      setShowDeleteModal(false);
      setSelectedTask(null);

      await fetchTasks();
    } catch (err) {
      console.error("Gagal menghapus penugasan:", err);

      alert(
        err.response?.data?.message || "Gagal menghapus penugasan."
      );
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        label: "Pending",
        className: "task-status pending",
      },

      in_progress: {
        label: "In Progress",
        className: "task-status progress",
      },

      completed: {
        label: "Completed",
        className: "task-status completed",
      },

      cancelled: {
        label: "Cancelled",
        className: "task-status cancelled",
      },
    };

    const item = config[status] || config.pending;

    return (
      <span className={item.className}>
        <span className="status-dot"></span>
        {item.label}
      </span>
    );
  };

  const getTaskInitial = (title = "") => {
    return title.trim().charAt(0).toUpperCase() || "T";
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "-";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>
        {`
          .task-page {
              min-height: 100vh;
              background: #f7f8fa;
              color: #212529;
          }

          /* ================================
             HEADER
          ================================= */

          .task-header {
              padding-bottom: 22px;
              border-bottom: 1px solid #e9ecef;
          }

          .task-title {
              font-size: 1.4rem;
              font-weight: 700;
              color: #212529;
              margin-bottom: 4px;
          }

          .task-description {
              color: #6c757d;
              font-size: .875rem;
              margin: 0;
          }

          .header-actions {
              display: flex;
              align-items: center;
              gap: 8px;
          }

          /* ================================
             STATISTIC CARD
          ================================= */

          .task-stat-card {
              position: relative;
              background: #ffffff;
              border: 1px solid #e9ecef;
              border-radius: 12px;
              padding: 17px;
              height: 100%;
              overflow: hidden;
              transition: .2s ease;
          }

          .task-stat-card:hover {
              transform: translateY(-2px);
              box-shadow:
                  0 6px 18px
                  rgba(0, 0, 0, .05);
          }

          .task-stat-label {
              font-size: .68rem;
              font-weight: 700;
              color: #6c757d;
              text-transform: uppercase;
              letter-spacing: .04em;
          }

          .task-stat-value {
              font-size: 1.45rem;
              font-weight: 700;
              line-height: 1;
              margin-top: 7px;
              color: #212529;
          }

          .task-stat-icon {
              width: 40px;
              height: 40px;
              min-width: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1rem;
          }

          .stat-total {
              border-left: 4px solid #4f46e5;
          }

          .stat-total .task-stat-icon {
              background: #eef2ff;
              color: #4f46e5;
          }

          .stat-pending {
              border-left: 4px solid #f0ad00;
          }

          .stat-pending .task-stat-icon {
              background: #fff8df;
              color: #b58100;
          }

          .stat-progress {
              border-left: 4px solid #0d6efd;
          }

          .stat-progress .task-stat-icon {
              background: #eaf2ff;
              color: #0d6efd;
          }

          .stat-completed {
              border-left: 4px solid #198754;
          }

          .stat-completed .task-stat-icon {
              background: #e9f7ef;
              color: #198754;
          }

          /* ================================
             CONTENT CARD
          ================================= */

          .task-card {
              background: #ffffff;
              border: 1px solid #e9ecef;
              border-radius: 12px;
              overflow: hidden;
          }

          .task-card-header {
              padding: 16px 18px;
              border-bottom: 1px solid #edf0f2;
          }

          /* ================================
             FILTER
          ================================= */

          .filter-card {
              background: #ffffff;
              border: 1px solid #e9ecef;
              border-radius: 12px;
              padding: 16px;
          }

          .filter-label {
              font-size: .72rem;
              font-weight: 600;
              color: #495057;
              margin-bottom: 6px;
          }

          .filter-input,
          .filter-select {
              border-color: #dee2e6;
              border-radius: 8px;
              box-shadow: none !important;
          }

          .filter-input:focus,
          .filter-select:focus {
              border-color: #86b7fe;
          }

          .search-box {
              position: relative;
          }

          .search-box i {
              position: absolute;
              left: 13px;
              top: 50%;
              transform:
                  translateY(-50%);
              color: #adb5bd;
              z-index: 2;
          }

          .search-box input {
              padding-left: 38px;
          }

          /* ================================
             TABLE
          ================================= */

          .task-table {
              margin-bottom: 0;
          }

          .task-table thead th {
              background: #f8f9fa;
              color: #6c757d;
              border-bottom:
                  1px solid #e9ecef;
              font-size: .69rem;
              font-weight: 700;
              text-transform:
                  uppercase;
              letter-spacing: .025em;
              padding:
                  12px 16px;
              white-space:
                  nowrap;
          }

          .task-table tbody td {
              padding:
                  14px 16px;
              border-bottom:
                  1px solid #f0f1f3;
              vertical-align:
                  middle;
          }

          .task-table tbody tr:last-child td {
              border-bottom: 0;
          }

          .task-table tbody tr {
              transition: .15s ease;
          }

          .task-table tbody tr:hover {
              background:
                  #fafbfc;
          }

          /* ================================
             TASK ICON
          ================================= */

          .task-icon {
              width: 38px;
              height: 38px;
              min-width: 38px;
              border-radius: 9px;
              background: #eef2ff;
              color: #4f46e5;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: .8rem;
              font-weight: 700;
          }

          .task-name {
              font-size: .875rem;
              font-weight: 600;
              color: #212529;
          }

          .task-subtitle {
              display: block;
              max-width: 280px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: .75rem;
              color: #8a9199;
              margin-top: 2px;
          }

          .team-name {
              font-size: .82rem;
              font-weight: 600;
              color: #495057;
          }

          .deadline-text {
              font-size: .78rem;
              color: #6c757d;
              white-space: nowrap;
          }

          /* ================================
             STATUS
          ================================= */

          .task-status {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 5px 9px;
              border-radius: 20px;
              font-size: .68rem;
              font-weight: 600;
              white-space: nowrap;
          }

          .status-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              display: inline-block;
          }

          .task-status.pending {
              background: #fff8df;
              color: #997404;
          }

          .task-status.pending .status-dot {
              background: #f0ad00;
          }

          .task-status.progress {
              background: #eaf2ff;
              color: #0d6efd;
          }

          .task-status.progress .status-dot {
              background: #0d6efd;
          }

          .task-status.completed {
              background: #e9f7ef;
              color: #198754;
          }

          .task-status.completed .status-dot {
              background: #198754;
          }

          .task-status.cancelled {
              background: #fdecec;
              color: #dc3545;
          }

          .task-status.cancelled .status-dot {
              background: #dc3545;
          }

          /* ================================
             ACTION BUTTON
          ================================= */

          .task-action {
              width: 32px;
              height: 32px;
              min-width: 32px;
              padding: 0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 7px;
          }

          .task-action i {
              line-height: 1;
          }

          .task-actions {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 5px;
          }

          /* ================================
             EMPTY STATE
          ================================= */

          .empty-state {
              padding: 55px 20px;
              text-align: center;
          }

          .empty-icon {
              width: 52px;
              height: 52px;
              margin: 0 auto;
              border-radius: 12px;
              background: #f1f3f5;
              color: #adb5bd;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.3rem;
          }

          /* ================================
             MODAL
          ================================= */

          .task-modal-backdrop {
              position: fixed;
              inset: 0;

              z-index: 2000;

              background: rgba(0, 0, 0, .4);

              overflow-y: auto;

              padding: 1rem;

              display: flex;
              align-items: center;
              justify-content: center;

              box-sizing: border-box;
          }

          .task-modal-dialog {
              width: 100%;
              max-width: 520px;

              margin: auto;

              display: flex;
              align-items: center;
              justify-content: center;

              max-height: calc(100dvh - 2rem);

              box-sizing: border-box;
          }

          .task-modal-dialog.modal-sm-custom {
              max-width: 400px;
          }

          .task-modal {
              width: 100%;

              max-height: calc(100dvh - 2rem);

              border: 0 !important;
              border-radius: 14px !important;

              overflow: hidden;

              display: flex;
              flex-direction: column;

              background: #fff;

              box-sizing: border-box;
          }

          /* ================================
             MODAL HEADER
          ================================= */

          .task-modal .modal-header {
              padding: 17px 20px;

              border-bottom: 1px solid #edf0f2;

              flex: 0 0 auto;

              background: #fff;
          }

          /* ================================
             FORM
          ================================= */

          .task-modal form {
              width: 100%;

              display: flex;
              flex-direction: column;

              min-height: 0;

              flex: 1 1 auto;

              overflow: hidden;

              box-sizing: border-box;
          }

          /* ================================
             MODAL BODY
          ================================= */

          .task-modal .modal-body {
              padding: 20px;

              overflow-y: auto;
              overflow-x: hidden;

              min-height: 0;

              flex: 1 1 auto;

              display: block;

              box-sizing: border-box;

              background: #fff;

              /*
               * Scrollbar tetap berada di dalam
               * body modal.
               */
              overscroll-behavior: contain;
          }

          .task-modal > .modal-body {
              flex: 1 1 auto;
          }

          /* ================================
             MODAL FOOTER
          ================================= */

          .task-modal .modal-footer {
              padding: 14px 20px;

              border-top: 1px solid #edf0f2;

              flex: 0 0 auto;

              background: #fff;

              box-sizing: border-box;
          }

          .task-modal form .modal-footer {
              flex: 0 0 auto;
          }

          /* ================================
             MODAL LABEL
          ================================= */

          .modal-label {
              font-size: .76rem;
              font-weight: 600;
              margin-bottom: 6px;
              color: #343a40;
          }

          /* ================================
             MODAL INPUT
          ================================= */

          .modal-input {
              border-radius: 8px;
              border-color: #dee2e6;
              box-shadow: none !important;

              width: 100%;
              box-sizing: border-box;
          }

          .modal-input:focus {
              border-color: #86b7fe;
          }

          .task-modal textarea {
              resize: vertical;
              max-width: 100%;
          }

          .task-modal input,
          .task-modal select,
          .task-modal textarea {
              max-width: 100%;
          }

          /* ================================
             DETAIL
          ================================= */

          .detail-task-icon {
              width: 48px;
              height: 48px;
              min-width: 48px;
              border-radius: 11px;
              background: #eef2ff;
              color: #4f46e5;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .detail-info {
              border: 1px solid #e9ecef;
              border-radius: 10px;
              overflow: hidden;
          }

          .detail-row {
              display: flex;
              justify-content:
                  space-between;
              align-items:
                  flex-start;
              gap: 15px;
              padding: 12px 14px;
              border-bottom:
                  1px solid #f0f1f3;
          }

          .detail-row:last-child {
              border-bottom: 0;
          }

          .detail-label {
              color: #6c757d;
              font-size: .78rem;
              flex-shrink: 0;
          }

          .detail-value {
              font-size: .8rem;
              font-weight: 600;
              text-align: right;
              overflow-wrap: anywhere;
          }

          /* ================================
             MOBILE
          ================================= */

          @media (max-width: 576px) {

              .task-page {
                  padding: 1rem !important;
              }

              .header-actions {
                  width: 100%;
              }

              .header-actions .btn {
                  width: 100%;
                  justify-content: center;
              }

              /* ================================
                 MOBILE MODAL
              ================================= */

              .task-modal-backdrop {
                  padding: .5rem;

                  align-items: center;

                  overflow-y: auto;
              }

              .task-modal-dialog {
                  width: 100%;
                  max-width: 100%;

                  max-height: calc(100dvh - 1rem);

                  margin: auto;
              }

              .task-modal {
                  width: 100%;

                  max-height: calc(100dvh - 1rem);

                  border-radius: 12px !important;

                  overflow: hidden;
              }

              .task-modal .modal-header {
                  padding: 14px 16px;
              }

              .task-modal .modal-body {
                  padding: 16px;

                  overflow-y: auto;
                  overflow-x: hidden;

                  min-height: 0;
              }

              .task-modal .modal-footer {
                  padding: 12px 16px;
              }

              .detail-row {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 4px;
              }

              .detail-value {
                  text-align: left;
              }
          }

          /* ================================
             VERY SMALL SCREEN
          ================================= */

          @media (max-width: 400px) {

              .task-modal-backdrop {
                  padding: .35rem;
              }

              .task-modal {
                  max-height: calc(100dvh - .7rem);
              }

              .task-modal .modal-header {
                  padding: 12px 14px;
              }

              .task-modal .modal-body {
                  padding: 14px;
              }

              .task-modal .modal-footer {
                  padding: 10px 14px;
              }

              .task-modal .modal-footer .btn {
                  padding-left: 12px !important;
                  padding-right: 12px !important;
              }
          }
        `}
      </style>

      <div className="task-page p-4">
        <div className="container-fluid max-w-7xl">

          {/* HEADER */}

          <div className="task-header d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">

            <div>
              <h1 className="task-title">
                Penugasan Tim
              </h1>

              <p className="task-description">
                Kelola pengerjaan tugas dan alokasi ke tim dengan efisien.
              </p>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 font-medium"
                onClick={openCreate}
              >
                <i className="bi bi-plus-lg"></i>

                <span>
                  Buat Penugasan
                </span>
              </button>
            </div>
          </div>

          {/* STATISTIC CARDS */}

          <div className="row g-3 mb-4">

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="task-stat-card stat-total d-flex justify-content-between align-items-center">

                <div>
                  <div className="task-stat-label">
                    Total Penugasan
                  </div>

                  <div className="task-stat-value">
                    {statistics.total}
                  </div>
                </div>

                <div className="task-stat-icon">
                  <i className="bi bi-journal-text"></i>
                </div>

              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="task-stat-card stat-pending d-flex justify-content-between align-items-center">

                <div>
                  <div className="task-stat-label">
                    Pending
                  </div>

                  <div className="task-stat-value">
                    {statistics.pending}
                  </div>
                </div>

                <div className="task-stat-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="task-stat-card stat-progress d-flex justify-content-between align-items-center">

                <div>
                  <div className="task-stat-label">
                    In Progress
                  </div>

                  <div className="task-stat-value">
                    {statistics.inProgress}
                  </div>
                </div>

                <div className="task-stat-icon">
                  <i className="bi bi-arrow-repeat"></i>
                </div>

              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="task-stat-card stat-completed d-flex justify-content-between align-items-center">

                <div>
                  <div className="task-stat-label">
                    Selesai
                  </div>

                  <div className="task-stat-value">
                    {statistics.completed}
                  </div>
                </div>

                <div className="task-stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>

              </div>
            </div>

          </div>

          {/* FILTER & SEARCH */}

          <div className="filter-card mb-4">

            <div className="row g-3">

              <div className="col-12 col-md-8">

                <div className="filter-label">
                  Cari Penugasan / Tim
                </div>

                <div className="search-box">

                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    className="form-control filter-input"
                    placeholder="Cari berdasarkan judul, nama tim, atau deskripsi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                </div>

              </div>

              <div className="col-12 col-md-4">

                <div className="filter-label">
                  Filter Status
                </div>

                <select
                  className="form-select filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >

                  <option value="">
                    Semua Status
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ERROR ALERT */}

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 mb-4"
              role="alert"
            >

              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>

              <div>
                {error}
              </div>

            </div>
          )}

          {/* TABLE DATA */}

          <div className="task-card">

            {loading ? (

              <div className="p-5 text-center text-secondary">

                <div
                  className="spinner-border spinner-border-sm text-primary mb-2"
                  role="status"
                ></div>

                <p className="mb-0 fs-7">
                  Memuat data penugasan...
                </p>

              </div>

            ) : filteredTasks.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon mb-3">
                  <i className="bi bi-inbox"></i>
                </div>

                <h6 className="fw-bold mb-1">
                  Belum ada penugasan
                </h6>

                <p className="text-muted fs-7 mb-0">

                  {search || statusFilter
                    ? "Tidak ada data yang sesuai dengan pencarian / filter."
                    : "Silakan tambahkan data penugasan baru."}

                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table task-table align-middle">

                  <thead>

                    <tr>

                      <th>
                        Tugas
                      </th>

                      <th>
                        Tim Penanggung Jawab
                      </th>

                      <th>
                        Batas Waktu
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-end">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredTasks.map((task) => (

                      <tr key={task.id}>

                        <td>

                          <div className="d-flex align-items-center gap-3">

                            <div className="task-icon">
                              {getTaskInitial(task.title)}
                            </div>

                            <div>

                              <div className="task-name">
                                {task.title}
                              </div>

                              {task.description && (
                                <span className="task-subtitle">
                                  {task.description}
                                </span>
                              )}

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="team-name">
                            {task.team?.name || "Unassigned"}
                          </span>

                        </td>

                        <td>

                          <span className="deadline-text">
                            {formatDeadline(task.deadline)}
                          </span>

                        </td>

                        <td>
                          {getStatusBadge(task.status)}
                        </td>

                        <td>

                          <div className="task-actions">

                            <button
                              type="button"
                              className="btn btn-sm btn-light task-action text-secondary"
                              title="Detail"
                              onClick={() => handleDetail(task)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-light task-action text-primary"
                              title="Edit"
                              onClick={() => openEdit(task)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-light task-action text-danger"
                              title="Hapus"
                              onClick={() => openDelete(task)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>
      </div>

      {/* =====================================================
          MODAL CREATE / EDIT
      ===================================================== */}

      {showModal && (
        <div
          className="task-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >

          <div className="task-modal-dialog">

            <div className="modal-content task-modal">

              {/* HEADER */}

              <div className="modal-header">

                <h5
                  id="task-modal-title"
                  className="modal-title fw-bold fs-6"
                >
                  {selectedTask
                    ? "Edit Penugasan"
                    : "Buat Penugasan Baru"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Tutup"
                ></button>

              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit}>

                {/* BODY FORM */}

                <div className="modal-body">

                  <div className="mb-3">

                    <label className="modal-label">
                      Pilih Tim{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <select
                      name="team_id"
                      className="form-select modal-input"
                      value={form.team_id}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        -- Pilih Tim --
                      </option>

                      {teams.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                        >
                          {t.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div className="mb-3">

                    <label className="modal-label">
                      Judul Tugas{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      className="form-control modal-input"
                      placeholder="Masukkan judul tugas..."
                      value={form.title}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="modal-label">
                      Deskripsi
                    </label>

                    <textarea
                      name="description"
                      rows="3"
                      className="form-control modal-input"
                      placeholder="Penjelasan ringkas tugas..."
                      value={form.description}
                      onChange={handleChange}
                    ></textarea>

                  </div>

                  {selectedTask && (
                    <div className="mb-3">

                      <label className="modal-label">
                        Status
                      </label>

                      <select
                        name="status"
                        className="form-select modal-input"
                        value={form.status}
                        onChange={handleChange}
                      >

                        <option value="pending">
                          Pending
                        </option>

                        <option value="in_progress">
                          In Progress
                        </option>

                        <option value="completed">
                          Completed
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>

                      </select>

                    </div>
                  )}

                  <div className="mb-3">

                    <label className="modal-label">
                      Batas Waktu (Deadline)
                    </label>

                    <input
                      type="datetime-local"
                      name="deadline"
                      className="form-control modal-input"
                      value={form.deadline}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-3"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 px-4"
                    disabled={saving}
                  >
                    {saving
                      ? "Menyimpan..."
                      : "Simpan"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL DETAIL
      ===================================================== */}

      {showDetailModal && selectedTask && (
        <div
          className="task-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-detail-title"
        >

          <div className="task-modal-dialog">

            <div className="modal-content task-modal">

              <div className="modal-header">

                <h5
                  id="task-detail-title"
                  className="modal-title fw-bold fs-6"
                >
                  Detail Penugasan
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetail}
                  aria-label="Tutup"
                ></button>

              </div>

              <div className="modal-body">

                <div className="d-flex align-items-center gap-3 mb-4">

                  <div className="detail-task-icon fs-4 font-bold">
                    {getTaskInitial(selectedTask.title)}
                  </div>

                  <div>

                    <h6 className="fw-bold mb-1">
                      {selectedTask.title}
                    </h6>

                    <div className="mt-1">
                      {getStatusBadge(selectedTask.status)}
                    </div>

                  </div>

                </div>

                <div className="detail-info">

                  <div className="detail-row">

                    <span className="detail-label">
                      Tim Pelaksana
                    </span>

                    <span className="detail-value text-dark">
                      {selectedTask.team?.name ||
                        "Unassigned"}
                    </span>

                  </div>

                  <div className="detail-row">

                    <span className="detail-label">
                      Deadline
                    </span>

                    <span className="detail-value text-dark">
                      {formatDeadline(
                        selectedTask.deadline
                      )}
                    </span>

                  </div>

                  <div className="detail-row">

                    <span className="detail-label">
                      Deskripsi
                    </span>

                    <span className="detail-value text-dark fw-normal">
                      {selectedTask.description || "-"}
                    </span>

                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary rounded-3 px-4"
                  onClick={closeDetail}
                >
                  Tutup
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL DELETE
      ===================================================== */}

      {showDeleteModal && selectedTask && (
        <div
          className="task-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-delete-title"
        >

          <div className="task-modal-dialog modal-sm-custom">

            <div className="modal-content task-modal text-center p-3">

              <div className="modal-body">

                <div className="text-danger mb-3">

                  <i className="bi bi-exclamation-circle display-5"></i>

                </div>

                <h6
                  id="task-delete-title"
                  className="fw-bold mb-2"
                >
                  Hapus Penugasan?
                </h6>

                <p className="text-muted fs-7 mb-0">

                  Tindakan ini tidak dapat dibatalkan.
                  Anda yakin ingin menghapus tugas{" "}

                  <strong>
                    "{selectedTask.title}"
                  </strong>
                  ?

                </p>

              </div>

              <div className="d-flex justify-content-center gap-2 pt-2">

                <button
                  type="button"
                  className="btn btn-light rounded-3 px-3"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTask(null);
                  }}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className="btn btn-danger rounded-3 px-3"
                  onClick={handleDelete}
                >
                  Hapus
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </>
  );
};

export default TaskAssignmentPage;