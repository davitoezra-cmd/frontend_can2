import React, { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../api/apiFetch";

const API_URL = "/supervisor";

const SupervisorTaskPage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const [statusForm, setStatusForm] = useState({
    status: "",
    completion_note: "",
  });

  // =====================================================
  // FETCH TASKS
  // =====================================================

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiFetch.get(`${API_URL}/tasks`, {
        params,
      });

      setTasks(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Gagal mengambil task:", err);

      setError(err.response?.data?.message || "Gagal memuat tugas.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // =====================================================
  // FETCH TEAM MEMBERS
  // =====================================================

  const fetchTeamMembers = useCallback(async () => {
    setLoadingMembers(true);

    try {
      const response = await apiFetch.get(`${API_URL}/team-members`);

      setTeamMembers(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Gagal mengambil anggota team:", err);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [fetchTasks, fetchTeamMembers]);

  // =====================================================
  // FILTER TASK
  // =====================================================

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";

      const description = task.description?.toLowerCase() || "";

      const team = task.team?.name?.toLowerCase() || "";

      const assigner = task.assigner?.name?.toLowerCase() || "";

      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        team.includes(keyword) ||
        assigner.includes(keyword)
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

      cancelled: tasks.filter((task) => task.status === "cancelled").length,
    };
  }, [tasks]);

  // =====================================================
  // DETAIL
  // =====================================================

  const handleDetail = async (task) => {
    try {
      const response = await apiFetch.get(`${API_URL}/tasks/${task.id}`);

      setSelectedTask(response.data?.data || task);

      setShowDetailModal(true);
    } catch (err) {
      console.error("Gagal mengambil detail task:", err);

      setSelectedTask(task);
      setShowDetailModal(true);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  // =====================================================
  // OPEN STATUS MODAL
  // =====================================================

  const openStatusModal = (task) => {
    setSelectedTask(task);

    setStatusForm({
      status: task.status || "pending",
      completion_note: task.completion_note || "",
    });

    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (updating) return;

    setShowStatusModal(false);
    setSelectedTask(null);

    setStatusForm({
      status: "",
      completion_note: "",
    });
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!selectedTask) return;

    setUpdating(true);

    try {
      const response = await apiFetch.put(
        `${API_URL}/tasks/${selectedTask.id}/status`,
        {
          status: statusForm.status,

          completion_note:
            statusForm.status === "completed"
              ? statusForm.completion_note || null
              : null,
        },
      );

      const updatedTask = response.data?.data;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                ...(updatedTask || {
                  status: statusForm.status,
                  completion_note: statusForm.completion_note,
                }),
              }
            : task,
        ),
      );

      setShowStatusModal(false);

      setSelectedTask(null);

      setStatusForm({
        status: "",
        completion_note: "",
      });
    } catch (err) {
      console.error("Gagal update status:", err);

      alert(err.response?.data?.message || "Gagal memperbarui status tugas.");
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatusConfig = (status) => {
    const config = {
      pending: {
        label: "Pending",
        className: "supervisor-status pending",
      },

      in_progress: {
        label: "In Progress",
        className: "supervisor-status progress",
      },

      completed: {
        label: "Completed",
        className: "supervisor-status completed",
      },

      cancelled: {
        label: "Cancelled",
        className: "supervisor-status cancelled",
      },
    };

    return config[status] || config.pending;
  };

  const getStatusBadge = (status) => {
    const item = getStatusConfig(status);

    return (
      <span className={item.className}>
        <span className="supervisor-status-dot"></span>

        {item.label}
      </span>
    );
  };

  const getTaskInitial = (title = "") => {
    return title.trim().charAt(0).toUpperCase() || "T";
  };

  const getMemberName = (item) => {
    return (
      item.member?.name ||
      item.member?.full_name ||
      item.member_name ||
      "Anggota Team"
    );
  };

  const getMemberEmail = (item) => {
    return item.member?.email || "-";
  };

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return "-";
    }

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

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>
        {`
                /* =====================================================
                   PAGE
                ===================================================== */

                .supervisor-task-page {
                    min-height: 100vh;
                    width: 100%;
                    background: #f7f8fa;
                    color: #212529;
                    overflow-x: hidden;
                }

                .supervisor-task-page main {
                    width: 100%;
                }


                /* =====================================================
                   HEADER
                ===================================================== */

                .supervisor-task-header {
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .supervisor-task-title {
                    font-size: 1.45rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: #212529;
                }

                .supervisor-task-description {
                    color: #6c757d;
                    font-size: .86rem;
                    margin: 0;
                }

                .supervisor-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }


                /* =====================================================
                   STATISTICS
                ===================================================== */

                .supervisor-stat-card {
                    position: relative;
                    height: 100%;
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    padding: 17px;
                    overflow: hidden;
                    transition: .2s ease;
                }

                .supervisor-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow:
                        0 6px 18px
                        rgba(0, 0, 0, .05);
                }

                .supervisor-stat-label {
                    color: #6c757d;
                    font-size: .67rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: .04em;
                }

                .supervisor-stat-value {
                    color: #212529;
                    font-size: 1.45rem;
                    font-weight: 700;
                    line-height: 1;
                    margin-top: 7px;
                }

                .supervisor-stat-icon {
                    width: 40px;
                    height: 40px;
                    min-width: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    font-size: 1rem;
                }

                .supervisor-stat-total {
                    border-left: 4px solid #4f46e5;
                }

                .supervisor-stat-total
                .supervisor-stat-icon {
                    background: #eef2ff;
                    color: #4f46e5;
                }

                .supervisor-stat-pending {
                    border-left: 4px solid #f0ad00;
                }

                .supervisor-stat-pending
                .supervisor-stat-icon {
                    background: #fff8df;
                    color: #b58100;
                }

                .supervisor-stat-progress {
                    border-left: 4px solid #0d6efd;
                }

                .supervisor-stat-progress
                .supervisor-stat-icon {
                    background: #eaf2ff;
                    color: #0d6efd;
                }

                .supervisor-stat-completed {
                    border-left: 4px solid #198754;
                }

                .supervisor-stat-completed
                .supervisor-stat-icon {
                    background: #e9f7ef;
                    color: #198754;
                }


                /* =====================================================
                   CONTENT
                ===================================================== */

                .supervisor-content-card {
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .supervisor-content-header {
                    padding: 16px 18px;
                    border-bottom: 1px solid #edf0f2;
                }


                /* =====================================================
                   FILTER
                ===================================================== */

                .supervisor-filter-card {
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    padding: 16px;
                }

                .supervisor-filter-label {
                    color: #495057;
                    font-size: .72rem;
                    font-weight: 600;
                    margin-bottom: 6px;
                }

                .supervisor-filter-input,
                .supervisor-filter-select {
                    border-color: #dee2e6;
                    border-radius: 8px;
                    box-shadow: none !important;
                }

                .supervisor-filter-input:focus,
                .supervisor-filter-select:focus {
                    border-color: #86b7fe;
                }

                .supervisor-search {
                    position: relative;
                }

                .supervisor-search i {
                    position: absolute;
                    left: 13px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #adb5bd;
                    z-index: 2;
                }

                .supervisor-search input {
                    padding-left: 38px;
                }


                /* =====================================================
                   TABLE
                ===================================================== */

                .supervisor-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                }

                .supervisor-task-table {
                    width: 100%;
                    min-width: 1080px;
                    margin-bottom: 0;
                    table-layout: fixed;
                }

                /*
                 * Lebar kolom dibuat stabil agar Team tidak gepeng.
                 */

                .supervisor-task-table col.col-number {
                    width: 55px;
                }

                .supervisor-task-table col.col-task {
                    width: 34%;
                }

                .supervisor-task-table col.col-team {
                    width: 15%;
                }

                .supervisor-task-table col.col-assigner {
                    width: 16%;
                }

                .supervisor-task-table col.col-deadline {
                    width: 14%;
                }

                .supervisor-task-table col.col-status {
                    width: 10%;
                }

                .supervisor-task-table col.col-action {
                    width: 100px;
                }

                .supervisor-task-table thead th {
                    background: #f8f9fa;
                    color: #6c757d;
                    border-bottom: 1px solid #e9ecef;
                    padding: 12px 16px;
                    font-size: .68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: .025em;
                    white-space: nowrap;
                }

                .supervisor-task-table tbody td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f0f1f3;
                    vertical-align: middle;
                }

                .supervisor-task-table tbody tr:last-child td {
                    border-bottom: 0;
                }

                .supervisor-task-table tbody tr {
                    transition: .15s ease;
                }

                .supervisor-task-table tbody tr:hover {
                    background: #fafbfc;
                }


                /* =====================================================
                   TASK
                ===================================================== */

                .supervisor-task-cell {
                    min-width: 0;
                }

                .supervisor-task-info {
                    min-width: 0;
                    width: 100%;
                }

                .supervisor-task-icon {
                    width: 38px;
                    height: 38px;
                    min-width: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9px;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: .8rem;
                    font-weight: 700;
                }

                .supervisor-task-name {
                    color: #212529;
                    font-size: .85rem;
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .supervisor-task-subtitle {
                    display: block;
                    max-width: 100%;
                    margin-top: 2px;
                    overflow: hidden;
                    color: #8a9199;
                    font-size: .72rem;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }


                /* =====================================================
                   TEAM
                ===================================================== */

                .supervisor-team-cell {
                    min-width: 0;
                }

                .supervisor-team-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
                }

                .supervisor-team-wrapper i {
                    flex-shrink: 0;
                }

                .supervisor-team-name {
                    color: #495057;
                    font-size: .8rem;
                    font-weight: 600;
                    line-height: 1.35;
                    white-space: normal;
                    overflow-wrap: break-word;
                    word-break: normal;
                }


                /* =====================================================
                   ASSIGNER
                ===================================================== */

                .supervisor-assigner-cell {
                    min-width: 0;
                }

                .supervisor-assigner-name {
                    color: #495057;
                    font-size: .8rem;
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .supervisor-assigner {
                    color: #6c757d;
                    font-size: .72rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }


                /* =====================================================
                   DEADLINE
                ===================================================== */

                .supervisor-deadline-cell {
                    min-width: 0;
                }

                .supervisor-deadline {
                    color: #6c757d;
                    font-size: .75rem;
                    line-height: 1.4;
                    white-space: normal;
                }


                /* =====================================================
                   STATUS
                ===================================================== */

                .supervisor-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 9px;
                    border-radius: 20px;
                    font-size: .66rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .supervisor-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    display: inline-block;
                    flex-shrink: 0;
                }

                .supervisor-status.pending {
                    background: #fff8df;
                    color: #997404;
                }

                .supervisor-status.pending
                .supervisor-status-dot {
                    background: #f0ad00;
                }

                .supervisor-status.progress {
                    background: #eaf2ff;
                    color: #0d6efd;
                }

                .supervisor-status.progress
                .supervisor-status-dot {
                    background: #0d6efd;
                }

                .supervisor-status.completed {
                    background: #e9f7ef;
                    color: #198754;
                }

                .supervisor-status.completed
                .supervisor-status-dot {
                    background: #198754;
                }

                .supervisor-status.cancelled {
                    background: #fdecec;
                    color: #dc3545;
                }

                .supervisor-status.cancelled
                .supervisor-status-dot {
                    background: #dc3545;
                }


                /* =====================================================
                   ACTION
                ===================================================== */

                .supervisor-task-actions {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 5px;
                    white-space: nowrap;
                }

                .supervisor-task-action {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    padding: 0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 7px;
                }


                /* =====================================================
                   TEAM MEMBERS
                ===================================================== */

                .supervisor-member-card {
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    padding: 12px;
                    transition: .2s ease;
                    background: #fff;
                }

                .supervisor-member-card:hover {
                    border-color: #d9dce1;
                    box-shadow:
                        0 5px 15px
                        rgba(0, 0, 0, .04);
                }

                .supervisor-member-avatar {
                    width: 38px;
                    height: 38px;
                    min-width: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: .78rem;
                    font-weight: 700;
                }

                .supervisor-member-name {
                    font-size: .8rem;
                    font-weight: 600;
                    color: #212529;
                }

                .supervisor-member-email {
                    font-size: .68rem;
                    color: #8a9199;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }


                /* =====================================================
                   EMPTY
                ===================================================== */

                .supervisor-empty {
                    padding: 55px 20px;
                    text-align: center;
                }

                .supervisor-empty-icon {
                    width: 52px;
                    height: 52px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: #f1f3f5;
                    color: #adb5bd;
                    font-size: 1.3rem;
                }


                /* =====================================================
                   MODAL
                ===================================================== */

                .supervisor-modal {
                    width: 100%;
                    max-width: 650px;
                    margin: 0 auto;
                    border: 0 !important;
                    border-radius: 14px !important;
                    overflow: hidden;
                    box-shadow:
                        0 20px 50px rgba(0, 0, 0, .18) !important;
                }

                /* Modal Detail */
                .modal-dialog.modal-lg .supervisor-modal {
                    max-width: 680px;
                }

                /* Modal Team */
                .modal-dialog.modal-lg.modal-dialog-scrollable
                .supervisor-modal {
                    max-width: 700px;
                }

                /* Modal Update Status */
                .modal-dialog:not(.modal-lg) .supervisor-modal {
                    max-width: 480px;
                }


                /* =====================================================
                   MODAL DIALOG
                ===================================================== */

                .supervisor-task-page .modal-dialog {
                    width: auto;
                    max-width: calc(100% - 32px);
                    margin-left: auto;
                    margin-right: auto;
                }

                .supervisor-task-page
                .modal-dialog.modal-dialog-centered {
                    min-height: calc(100% - 32px);
                }

                .supervisor-task-page
                .modal-dialog.modal-dialog-centered
                .supervisor-modal {
                    max-height: calc(100vh - 32px);
                }


                /* =====================================================
                   MODAL HEADER
                ===================================================== */

                .supervisor-modal .modal-header {
                    padding: 16px 20px;
                    background: #fff;
                    border-bottom: 1px solid #edf0f2;
                }

                .supervisor-modal .modal-title {
                    color: #212529;
                    font-size: 1rem;
                }

                .supervisor-modal .modal-header small {
                    font-size: .72rem;
                }


                /* =====================================================
                   MODAL BODY
                ===================================================== */

                .supervisor-modal .modal-body {
                    padding: 20px;
                    background: #fff;
                    overflow-y: auto;
                    max-height: calc(100vh - 180px);
                }


                /* =====================================================
                   MODAL FOOTER
                ===================================================== */

                .supervisor-modal .modal-footer {
                    padding: 13px 20px;
                    background: #fff;
                    border-top: 1px solid #edf0f2;
                }


                /* =====================================================
                   MODAL INPUT
                ===================================================== */

                .supervisor-modal-label {
                    color: #343a40;
                    font-size: .75rem;
                    font-weight: 600;
                    margin-bottom: 6px;
                }

                .supervisor-modal-input {
                    border-radius: 8px;
                    border-color: #dee2e6;
                    box-shadow: none !important;
                    font-size: .82rem;
                }

                .supervisor-modal-input:focus {
                    border-color: #86b7fe;
                }


                /* =====================================================
                   DETAIL BOX
                ===================================================== */

                .supervisor-detail-box {
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .supervisor-detail-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 11px 14px;
                    border-bottom: 1px solid #f0f1f3;
                }

                .supervisor-detail-row:last-child {
                    border-bottom: 0;
                }

                .supervisor-detail-label {
                    color: #6c757d;
                    font-size: .75rem;
                    flex-shrink: 0;
                }

                .supervisor-detail-value {
                    color: #212529;
                    font-size: .78rem;
                    font-weight: 600;
                    text-align: right;
                    max-width: 65%;
                    overflow-wrap: break-word;
                }


                /* =====================================================
                   MODAL BACKDROP
                ===================================================== */

                .supervisor-task-page
                .modal.fade.show {
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    padding: 16px;
                    overflow-x: hidden;
                    overflow-y: auto;
                }


                /* =====================================================
                   MOBILE
                ===================================================== */

                @media (max-width: 767.98px) {

                    .supervisor-task-page
                    .modal.fade.show {
                        padding: 10px;
                    }

                    .supervisor-task-page
                    .modal-dialog {
                        width: 100%;
                        max-width: 100%;
                        margin: 10px auto;
                    }

                    .supervisor-task-page
                    .modal-dialog.modal-dialog-centered {
                        min-height: calc(100% - 20px);
                    }

                    .supervisor-modal,
                    .modal-dialog.modal-lg .supervisor-modal,
                    .modal-dialog.modal-lg.modal-dialog-scrollable
                    .supervisor-modal,
                    .modal-dialog:not(.modal-lg) .supervisor-modal {
                        width: 100%;
                        max-width: 100%;
                        border-radius: 12px !important;
                    }

                    .supervisor-modal {
                        max-height: calc(100vh - 20px);
                    }

                    .supervisor-modal .modal-header {
                        padding: 13px 15px;
                    }

                    .supervisor-modal .modal-body {
                        padding: 15px;
                        max-height: calc(100vh - 145px);
                    }

                    .supervisor-modal .modal-footer {
                        padding: 11px 15px;
                    }

                    .supervisor-detail-row {
                        align-items: flex-start;
                        padding: 10px 12px;
                        gap: 10px;
                    }

                    .supervisor-detail-value {
                        max-width: 60%;
                        word-break: break-word;
                    }

                    .supervisor-modal .modal-footer button {
                        min-height: 36px;
                    }
                }


                /* =====================================================
                   EXTRA SMALL MOBILE
                ===================================================== */

                @media (max-width: 400px) {

                    .supervisor-task-page
                    .modal.fade.show {
                        padding: 7px;
                    }

                    .supervisor-task-page
                    .modal-dialog {
                        margin: 7px auto;
                    }

                    .supervisor-modal {
                        border-radius: 10px !important;
                    }

                    .supervisor-modal .modal-header {
                        padding: 12px;
                    }

                    .supervisor-modal .modal-body {
                        padding: 12px;
                    }

                    .supervisor-modal .modal-footer {
                        padding: 10px 12px;
                    }

                    .supervisor-detail-row {
                        padding: 9px 10px;
                    }
                }

                /* =====================================================
                   TABLET
                ===================================================== */

                @media (max-width: 1199.98px) {

                    .supervisor-task-table {
                        min-width: 1000px;
                    }

                    .supervisor-task-table col.col-task {
                        width: 31%;
                    }

                    .supervisor-task-table col.col-team {
                        width: 15%;
                    }

                    .supervisor-task-table col.col-assigner {
                        width: 16%;
                    }

                    .supervisor-task-table col.col-deadline {
                        width: 15%;
                    }

                    .supervisor-task-table col.col-status {
                        width: 11%;
                    }
                }


                /* =====================================================
                   MOBILE
                ===================================================== */

                @media (max-width: 767.98px) {

                    .supervisor-task-page main {
                        padding: 14px !important;
                    }

                    .supervisor-task-title {
                        font-size: 1.2rem;
                    }

                    .supervisor-task-description {
                        font-size: .78rem;
                        line-height: 1.5;
                    }

                    .supervisor-header-actions {
                        width: 100%;
                    }

                    .supervisor-header-actions button {
                        flex: 1;
                        min-height: 38px;
                    }

                    .supervisor-stat-card {
                        padding: 13px;
                        border-radius: 10px;
                    }

                    .supervisor-stat-label {
                        font-size: .6rem;
                    }

                    .supervisor-stat-value {
                        font-size: 1.2rem;
                    }

                    .supervisor-stat-icon {
                        width: 34px;
                        height: 34px;
                        min-width: 34px;
                        border-radius: 8px;
                    }

                    .supervisor-filter-card {
                        padding: 13px;
                        border-radius: 10px;
                    }

                    .supervisor-filter-input,
                    .supervisor-filter-select {
                        font-size: .8rem;
                        min-height: 38px;
                    }

                    .supervisor-content-card {
                        border-radius: 10px;
                    }

                    .supervisor-content-header {
                        padding: 13px 14px;
                    }

                    /*
                     * Mobile tetap menggunakan card.
                     * Tidak menggunakan tabel horizontal di HP.
                     */

                    .supervisor-table-wrapper {
                        overflow-x: visible;
                    }

                    .supervisor-task-table {
                        width: 100% !important;
                        min-width: 0 !important;
                        display: block;
                        table-layout: auto;
                    }

                    .supervisor-task-table colgroup {
                        display: none;
                    }

                    .supervisor-task-table thead {
                        display: none;
                    }

                    .supervisor-task-table tbody {
                        display: block;
                        width: 100%;
                        padding: 8px;
                    }

                    .supervisor-task-table tbody tr {
                        display: block;
                        width: 100%;
                        margin-bottom: 10px;
                        padding: 4px 0;
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                        background: #fff;
                        box-shadow:
                            0 2px 8px
                            rgba(0, 0, 0, .03);
                    }

                    .supervisor-task-table tbody td {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        padding: 8px 12px;
                        gap: 10px;
                        border: 0 !important;
                    }

                    .supervisor-task-table
                    tbody td:first-child {
                        display: none;
                    }

                    .supervisor-task-table
                    tbody td:nth-child(2) {
                        display: block;
                        padding: 12px;
                        border-bottom:
                            1px solid #f0f1f3 !important;
                    }

                    .supervisor-task-table
                    tbody td:nth-child(3),
                    .supervisor-task-table
                    tbody td:nth-child(4),
                    .supervisor-task-table
                    tbody td:nth-child(5),
                    .supervisor-task-table
                    tbody td:nth-child(6) {
                        min-height: 42px;
                    }

                    .supervisor-task-name {
                        max-width:
                            calc(100vw - 105px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .supervisor-task-subtitle {
                        max-width:
                            calc(100vw - 105px);
                    }

                    .supervisor-task-info {
                        min-width: 0;
                    }

                    .supervisor-task-table
                    tbody td:nth-child(3)::before {
                        content: "Team";
                    }

                    .supervisor-task-table
                    tbody td:nth-child(4)::before {
                        content: "Dibuat oleh";
                    }

                    .supervisor-task-table
                    tbody td:nth-child(5)::before {
                        content: "Deadline";
                    }

                    .supervisor-task-table
                    tbody td:nth-child(6)::before {
                        content: "Status";
                    }

                    .supervisor-task-table
                    tbody td:nth-child(7)::before {
                        content: "Aksi";
                    }

                    .supervisor-task-table
                    tbody td:nth-child(3)::before,
                    .supervisor-task-table
                    tbody td:nth-child(4)::before,
                    .supervisor-task-table
                    tbody td:nth-child(5)::before,
                    .supervisor-task-table
                    tbody td:nth-child(6)::before,
                    .supervisor-task-table
                    tbody td:nth-child(7)::before {
                        color: #8a9199;
                        font-size: .67rem;
                        font-weight: 600;
                        flex-shrink: 0;
                    }

                    .supervisor-team-cell {
                        min-width: 0;
                        max-width: 70%;
                    }

                    .supervisor-team-wrapper {
                        justify-content: flex-end;
                    }

                    .supervisor-team-name {
                        font-size: .74rem;
                        text-align: right;
                    }

                    .supervisor-assigner-cell {
                        max-width: 70%;
                    }

                    .supervisor-assigner-name,
                    .supervisor-assigner {
                        text-align: right;
                    }

                    .supervisor-deadline-cell {
                        max-width: 70%;
                    }

                    .supervisor-deadline {
                        font-size: .7rem;
                        white-space: normal;
                        text-align: right;
                    }

                    .supervisor-task-table
                    tbody td:nth-child(7) {
                        min-height: 45px;
                        border-top:
                            1px solid #f0f1f3 !important;
                    }

                    .supervisor-task-actions {
                        gap: 6px;
                    }

                    .supervisor-task-action {
                        width: 34px;
                        height: 34px;
                        min-width: 34px;
                    }

                    /* Modal */

                    .supervisor-modal {
                        border-radius: 12px !important;
                    }

                    .modal-dialog {
                        margin: 10px !important;
                    }

                    .supervisor-modal
                    .modal-header {
                        padding: 14px 15px;
                    }

                    .supervisor-modal
                    .modal-body {
                        padding: 15px;
                    }

                    .supervisor-modal
                    .modal-footer {
                        padding: 12px 15px;
                    }

                    .supervisor-detail-row {
                        align-items: flex-start;
                        padding: 10px 12px;
                    }

                    .supervisor-detail-value {
                        max-width: 60%;
                        word-break: break-word;
                    }

                    .supervisor-modal
                    .modal-footer button {
                        flex: 1;
                    }
                }
                `}
      </style>

      <div className="supervisor-task-page">
        <main className="p-3 p-md-4">
          {/* =================================================
                        HEADER
                    ================================================= */}

          <div className="supervisor-task-header mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h1 className="supervisor-task-title">Tugas Saya</h1>

                <p className="supervisor-task-description">
                  Pantau dan kelola tugas yang diberikan kepada team Anda.
                </p>
              </div>

              <div className="supervisor-header-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm bg-white"
                  onClick={() => {
                    fetchTasks();
                    fetchTeamMembers();
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowTeamModal(true)}
                >
                  <i className="bi bi-people me-1"></i>
                  Team
                  <span className="ms-1">({teamMembers.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
                        ERROR
                    ================================================= */}

          {error && (
            <div className="alert alert-danger border-0 mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>

              {error}
            </div>
          )}

          {/* =================================================
                        STATISTICS
                    ================================================= */}

          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <div className="supervisor-stat-card supervisor-stat-total">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="supervisor-stat-label">Total Tugas</div>

                    <div className="supervisor-stat-value">
                      {statistics.total}
                    </div>
                  </div>

                  <div className="supervisor-stat-icon">
                    <i className="bi bi-clipboard-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="supervisor-stat-card supervisor-stat-pending">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="supervisor-stat-label">Pending</div>

                    <div className="supervisor-stat-value">
                      {statistics.pending}
                    </div>
                  </div>

                  <div className="supervisor-stat-icon">
                    <i className="bi bi-clock"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="supervisor-stat-card supervisor-stat-progress">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="supervisor-stat-label">In Progress</div>

                    <div className="supervisor-stat-value">
                      {statistics.inProgress}
                    </div>
                  </div>

                  <div className="supervisor-stat-icon">
                    <i className="bi bi-arrow-repeat"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="supervisor-stat-card supervisor-stat-completed">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="supervisor-stat-label">Completed</div>

                    <div className="supervisor-stat-value">
                      {statistics.completed}
                    </div>
                  </div>

                  <div className="supervisor-stat-icon">
                    <i className="bi bi-check2-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
                        FILTER
                    ================================================= */}

          <div className="supervisor-filter-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-7">
                <label className="supervisor-filter-label">Cari Tugas</label>

                <div className="supervisor-search">
                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    className="form-control supervisor-filter-input"
                    placeholder="Cari judul, team, deskripsi, atau pemberi tugas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-3">
                <label className="supervisor-filter-label">Status</label>

                <select
                  className="form-select supervisor-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Semua Status</option>

                  <option value="pending">Pending</option>

                  <option value="in_progress">In Progress</option>

                  <option value="completed">Completed</option>

                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-12 col-md-2">
                <label className="supervisor-filter-label">Ditampilkan</label>

                <div className="form-control bg-light border-0">
                  {filteredTasks.length} Tugas
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
                        TASK LIST
                    ================================================= */}

          <div className="supervisor-content-card">
            <div className="supervisor-content-header">
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div>
                  <h6 className="fw-bold mb-1">Daftar Task</h6>

                  <small className="text-muted">
                    Task yang tersedia untuk team Anda.
                  </small>
                </div>

                <span className="badge bg-light text-dark border">
                  {filteredTasks.length} Task
                </span>
              </div>
            </div>

            {loading ? (
              <div className="supervisor-empty">
                <div className="spinner-border spinner-border-sm text-primary"></div>

                <div className="text-muted small mt-3">Memuat task...</div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="supervisor-empty">
                <div className="supervisor-empty-icon">
                  <i className="bi bi-clipboard-x"></i>
                </div>

                <h6 className="fw-semibold mt-3 mb-1">
                  {search ? "Task tidak ditemukan" : "Belum ada task"}
                </h6>

                <p className="text-muted small mb-0">
                  {search
                    ? "Coba gunakan kata kunci lain."
                    : "Belum ada penugasan untuk team Anda."}
                </p>
              </div>
            ) : (
              <div className="supervisor-table-wrapper">
                <table className="table supervisor-task-table align-middle">
                  {/* =================================================
                                        COLUMN WIDTH
                                    ================================================= */}

                  <colgroup>
                    <col className="col-number" />
                    <col className="col-task" />
                    <col className="col-team" />
                    <col className="col-assigner" />
                    <col className="col-deadline" />
                    <col className="col-status" />
                    <col className="col-action" />
                  </colgroup>

                  <thead>
                    <tr>
                      <th className="ps-3">#</th>

                      <th>Task</th>

                      <th>Team</th>

                      <th>Dibuat Oleh</th>

                      <th>Deadline</th>

                      <th>Status</th>

                      <th className="text-end pe-3">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTasks.map((task, index) => (
                      <tr key={task.id}>
                        {/* NUMBER */}

                        <td className="ps-3 text-muted small">{index + 1}</td>

                        {/* TASK */}

                        <td className="supervisor-task-cell">
                          <div className="d-flex align-items-center gap-3">
                            <div className="supervisor-task-icon">
                              {getTaskInitial(task.title)}
                            </div>

                            <div className="supervisor-task-info">
                              <div className="supervisor-task-name">
                                {task.title || "Tanpa judul"}
                              </div>

                              <span className="supervisor-task-subtitle">
                                {task.description || "Tidak ada deskripsi"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* TEAM */}

                        <td className="supervisor-team-cell">
                          <div className="supervisor-team-wrapper">
                            <i className="bi bi-diagram-3 text-muted"></i>

                            <span className="supervisor-team-name">
                              {task.team?.name || "-"}
                            </span>
                          </div>
                        </td>

                        {/* ASSIGNER */}

                        <td className="supervisor-assigner-cell">
                          <div>
                            <div className="supervisor-assigner-name">
                              {task.assigner?.name || "-"}
                            </div>

                            <div className="supervisor-assigner">
                              {task.assigner?.email || ""}
                            </div>
                          </div>
                        </td>

                        {/* DEADLINE */}

                        <td className="supervisor-deadline-cell">
                          <span className="supervisor-deadline">
                            <i className="bi bi-calendar3 me-1"></i>

                            {formatDeadline(task.deadline)}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>{getStatusBadge(task.status)}</td>

                        {/* ACTION */}

                        <td className="pe-3">
                          <div className="supervisor-task-actions">
                            <button
                              type="button"
                              className="btn btn-outline-secondary supervisor-task-action"
                              title="Detail"
                              onClick={() => handleDetail(task)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-primary supervisor-task-action"
                              title="Update Status"
                              onClick={() => openStatusModal(task)}
                            >
                              <i className="bi bi-pencil"></i>
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
        </main>

        {/* =====================================================
                    DETAIL MODAL
                ===================================================== */}

        {showDetailModal && selectedTask && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,.45)",
              zIndex: 1055,
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content supervisor-modal shadow">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">Detail Task</h5>

                    <small className="text-muted">
                      Informasi lengkap penugasan.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDetail}
                  />
                </div>

                <div className="modal-body">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="supervisor-task-icon">
                      {getTaskInitial(selectedTask.title)}
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">{selectedTask.title}</h5>

                      <small className="text-muted">
                        {selectedTask.team?.name || "Team belum ditentukan"}
                      </small>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="small fw-semibold mb-2">Deskripsi</div>

                    <div className="text-muted small">
                      {selectedTask.description || "Tidak ada deskripsi."}
                    </div>
                  </div>

                  <div className="supervisor-detail-box">
                    <div className="supervisor-detail-row">
                      <span className="supervisor-detail-label">Team</span>

                      <span className="supervisor-detail-value">
                        {selectedTask.team?.name || "-"}
                      </span>
                    </div>

                    <div className="supervisor-detail-row">
                      <span className="supervisor-detail-label">
                        Dibuat Oleh
                      </span>

                      <span className="supervisor-detail-value">
                        {selectedTask.assigner?.name || "-"}
                      </span>
                    </div>

                    <div className="supervisor-detail-row">
                      <span className="supervisor-detail-label">
                        Email Pemberi
                      </span>

                      <span className="supervisor-detail-value">
                        {selectedTask.assigner?.email || "-"}
                      </span>
                    </div>

                    <div className="supervisor-detail-row">
                      <span className="supervisor-detail-label">Status</span>

                      {getStatusBadge(selectedTask.status)}
                    </div>

                    <div className="supervisor-detail-row">
                      <span className="supervisor-detail-label">Deadline</span>

                      <span className="supervisor-detail-value">
                        {formatDeadline(selectedTask.deadline)}
                      </span>
                    </div>

                    <div className="supervisor-detail-row">
                      <span className="supervisor-detail-label">
                        Selesai Pada
                      </span>

                      <span className="supervisor-detail-value">
                        {formatDate(selectedTask.completed_at)}
                      </span>
                    </div>
                  </div>

                  {selectedTask.completion_note && (
                    <div className="mt-4">
                      <div className="small fw-semibold mb-2">
                        Catatan Penyelesaian
                      </div>

                      <div className="p-3 bg-light rounded-3 small text-muted">
                        {selectedTask.completion_note}
                      </div>
                    </div>
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
                    onClick={() => {
                      const task = selectedTask;

                      closeDetail();

                      setTimeout(() => openStatusModal(task), 100);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
                    UPDATE STATUS MODAL
                ===================================================== */}

        {showStatusModal && selectedTask && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,.45)",
              zIndex: 1060,
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content supervisor-modal shadow">
                <form onSubmit={handleStatusUpdate}>
                  <div className="modal-header">
                    <div>
                      <h5 className="modal-title fw-bold mb-1">
                        Update Status
                      </h5>

                      <small className="text-muted">
                        Perbarui progres task.
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeStatusModal}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="supervisor-modal-label">Task</label>

                      <div className="form-control bg-light">
                        {selectedTask.title}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="supervisor-modal-label">Status</label>

                      <select
                        className="form-select supervisor-modal-input"
                        value={statusForm.status}
                        onChange={(e) =>
                          setStatusForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        required
                      >
                        <option value="pending">Pending</option>

                        <option value="in_progress">In Progress</option>

                        <option value="completed">Completed</option>

                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {statusForm.status === "completed" && (
                      <div className="mb-0">
                        <label className="supervisor-modal-label">
                          Catatan Penyelesaian
                        </label>

                        <textarea
                          className="form-control supervisor-modal-input"
                          rows="4"
                          placeholder="Tulis catatan penyelesaian..."
                          value={statusForm.completion_note}
                          onChange={(e) =>
                            setStatusForm((prev) => ({
                              ...prev,
                              completion_note: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={closeStatusModal}
                      disabled={updating}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1"></i>
                          Simpan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
                    TEAM MEMBERS MODAL
                ===================================================== */}

        {showTeamModal && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,.45)",
              zIndex: 1055,
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
              <div className="modal-content supervisor-modal shadow">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">Anggota Team</h5>

                    <small className="text-muted">
                      Anggota team yang terhubung dengan Anda.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowTeamModal(false)}
                  />
                </div>

                <div className="modal-body">
                  {loadingMembers ? (
                    <div className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary"></div>

                      <div className="small text-muted mt-3">
                        Memuat anggota team...
                      </div>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="supervisor-empty">
                      <div className="supervisor-empty-icon">
                        <i className="bi bi-people"></i>
                      </div>

                      <h6 className="fw-semibold mt-3 mb-1">
                        Belum ada anggota
                      </h6>

                      <p className="text-muted small mb-0">
                        Belum ada anggota team yang terhubung.
                      </p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {teamMembers.map((item, index) => {
                        const name = getMemberName(item);

                        return (
                          <div
                            className="col-12 col-md-6"
                            key={item.id || index}
                          >
                            <div className="supervisor-member-card">
                              <div className="d-flex align-items-center gap-3">
                                <div className="supervisor-member-avatar">
                                  {name.trim().charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <div className="supervisor-member-name">
                                    {name}
                                  </div>

                                  <div className="supervisor-member-email">
                                    {getMemberEmail(item)}
                                  </div>
                                </div>
                              </div>

                              {item.team?.name && (
                                <div className="mt-2 small text-muted">
                                  <i className="bi bi-diagram-3 me-1"></i>

                                  {item.team.name}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowTeamModal(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupervisorTaskPage;
