import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "../api/apiFetch";

const API_URL = "/admin/teams";

const TeamManagementPage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [teams, setTeams] = useState([]);

  const [members, setMembers] = useState({
    supervisors: [],
    employees: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    supervisor_id: "",
    employee_ids: [],
    is_active: true,
  });

  // =====================================================
  // FETCH TEAMS
  // =====================================================

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch.get(API_URL);

      setTeams(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Gagal mengambil team:", err);

      setError(
        err.response?.data?.message ||
          err.data?.message ||
          err.message ||
          "Gagal memuat data team."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // FETCH MEMBERS
  // =====================================================

  const fetchMembers = useCallback(async () => {
    try {
      const response = await apiFetch.get(
        `${API_URL}/available-members`
      );

      setMembers({
        supervisors:
          response.data?.data?.supervisors || [],
        employees:
          response.data?.data?.employees || [],
      });
    } catch (err) {
      console.error(
        "Gagal mengambil anggota:",
        err
      );
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchTeams();
    fetchMembers();
  }, [fetchTeams, fetchMembers]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTeams = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return teams;
    }

    return teams.filter((team) => {
      return (
        team.name
          ?.toLowerCase()
          .includes(keyword) ||
        team.description
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [teams, search]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const activeTeams = teams.filter(
      (team) => team.is_active
    ).length;

    const totalEmployees = teams.reduce(
      (total, team) => {
        const count = (team.members || []).filter(
          (member) =>
            member.member_type?.includes("Employee")
        ).length;

        return total + count;
      },
      0
    );

    const totalSupervisors = teams.reduce(
      (total, team) => {
        const count = (team.members || []).filter(
          (member) =>
            member.member_type?.includes("Supervisor")
        ).length;

        return total + count;
      },
      0
    );

    return {
      totalTeams: teams.length,
      activeTeams,
      totalEmployees,
      totalSupervisors,
    };
  }, [teams]);

  // =====================================================
  // FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      supervisor_id: "",
      employee_ids: [],
      is_active: true,
    });
  };

  // =====================================================
  // OPEN CREATE
  // =====================================================

  const openCreate = () => {
    setSelectedTeam(null);
    resetForm();
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit = (team) => {
    const teamMembers = team.members || [];

    const supervisor = teamMembers.find(
      (member) =>
        member.member_type?.includes("Supervisor")
    );

    const employeeIds = teamMembers
      .filter((member) =>
        member.member_type?.includes("Employee")
      )
      .map((member) => Number(member.member_id));

    setSelectedTeam(team);

    setForm({
      name: team.name || "",
      description: team.description || "",
      supervisor_id:
        supervisor?.member_id
          ? Number(supervisor.member_id)
          : "",
      employee_ids: employeeIds,
      is_active: team.is_active !== false,
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedTeam(null);
    resetForm();
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // EMPLOYEE CHECKBOX
  // =====================================================

  const handleEmployeeChange = (employeeId) => {
    const id = Number(employeeId);

    setForm((prev) => {
      const exists =
        prev.employee_ids.includes(id);

      return {
        ...prev,
        employee_ids: exists
          ? prev.employee_ids.filter(
              (item) => item !== id
            )
          : [...prev.employee_ids, id],
      };
    });
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama team wajib diisi.");
      return;
    }

    if (!form.supervisor_id) {
      alert("Supervisor wajib dipilih.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        supervisor_id: Number(
          form.supervisor_id
        ),
        employee_ids:
          form.employee_ids.map(Number),
        is_active: Boolean(form.is_active),
      };

      // =================================================
      // UPDATE
      // =================================================

      if (selectedTeam) {
        await apiFetch.put(
          `${API_URL}/${selectedTeam.id}`,
          payload
        );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        await apiFetch.post(
          API_URL,
          payload
        );
      }

      setShowModal(false);
      setSelectedTeam(null);
      resetForm();

      await fetchTeams();
      await fetchMembers();

      alert(
        selectedTeam
          ? "Team berhasil diperbarui."
          : "Team berhasil ditambahkan."
      );
    } catch (err) {
      console.error(
        "Gagal menyimpan team:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.data?.message ||
          err.message ||
          "Gagal menyimpan team."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DETAIL
  // =====================================================

  const handleDetail = async (team) => {
    try {
      const response = await apiFetch.get(
        `${API_URL}/${team.id}`
      );

      setSelectedTeam(
        response.data?.data || team
      );

      setShowDetailModal(true);
    } catch (err) {
      console.error(
        "Gagal mengambil detail:",
        err
      );

      setSelectedTeam(team);
      setShowDetailModal(true);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedTeam(null);
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!selectedTeam) return;

    try {
      await apiFetch.delete(
        `${API_URL}/${selectedTeam.id}`
      );

      setShowDeleteModal(false);
      setSelectedTeam(null);

      await fetchTeams();
      await fetchMembers();

      alert("Team berhasil dihapus.");
    } catch (err) {
      console.error(
        "Gagal menghapus team:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.data?.message ||
          err.message ||
          "Gagal menghapus team."
      );
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getMemberName = (member) => {
    return (
      member.member?.name ||
      member.name ||
      "-"
    );
  };

  const getInitials = (name = "") => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "T"
    );
  };

  const getSupervisor = (team) => {
    return (team.members || []).find(
      (member) =>
        member.member_type?.includes(
          "Supervisor"
        )
    );
  };

  const getEmployeeCount = (team) => {
    return (team.members || []).filter(
      (member) =>
        member.member_type?.includes(
          "Employee"
        )
    ).length;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <style>{`
        /* =================================================
           PAGE
        ================================================= */

        .team-page {
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          background: #f8fafc;
        }

        .team-main {
          width: 100%;
          max-width: 100%;
          padding: 24px;
          box-sizing: border-box;
        }

        /* =================================================
           HEADER
        ================================================= */

        .team-page-header {
          width: 100%;
        }

        .team-page-title {
          margin: 0;
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f172a;
        }

        .team-page-description {
          margin-top: 5px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .team-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* =================================================
           BUTTON
        ================================================= */

        .team-btn-add {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 38px;
          padding: 8px 16px;
          background: #0d6efd !important;
          border: 1px solid #0d6efd !important;
          color: #fff !important;
          border-radius: 7px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: none;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .team-btn-add:hover {
          background: #0b5ed7 !important;
          border-color: #0a58ca !important;
        }

        .team-btn-refresh {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 38px;
          padding: 8px 14px;
          background: #fff !important;
          border: 1px solid #cbd5e1 !important;
          color: #475569 !important;
          border-radius: 7px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
        }

        .team-btn-refresh:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
        }

        /* =================================================
           STAT CARD
        ================================================= */

        .team-stat-card {
          position: relative;
          min-height: 110px;
          padding: 18px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .team-stat-label {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .team-stat-number {
          margin: 0;
          color: #0f172a;
          font-size: 1.65rem;
          font-weight: 700;
        }

        .team-stat-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-blue .team-stat-icon {
          background: #e8f1ff;
          color: #0d6efd;
        }

        .stat-green .team-stat-icon {
          background: #e8f8ef;
          color: #198754;
        }

        .stat-orange .team-stat-icon {
          background: #fff2df;
          color: #fd7e14;
        }

        .stat-purple .team-stat-icon {
          background: #f2eaff;
          color: #6f42c1;
        }

        /* =================================================
           CONTENT
        ================================================= */

        .team-content-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04);
        }

        /* =================================================
           SEARCH
        ================================================= */

        .team-search-wrapper {
          position: relative;
          width: 100%;
        }

        .team-search-wrapper i {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          z-index: 2;
        }

        .team-search-input {
          width: 100%;
          height: 40px;
          padding-left: 38px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          color: #0f172a;
          background: #fff;
          outline: none;
        }

        .team-search-input:focus {
          border-color: #86b7fe;
          box-shadow:
            0 0 0 0.2rem
            rgba(13, 110, 253, 0.1);
        }

        /* =================================================
           TABLE
        ================================================= */

        .team-table {
          margin-bottom: 0;
          min-width: 850px;
        }

        .team-table thead th {
          background: #f8fafc;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
          padding-top: 13px;
          padding-bottom: 13px;
        }

        .team-table tbody td {
          color: #334155;
          border-color: #edf2f7;
          padding-top: 14px;
          padding-bottom: 14px;
        }

        .team-table tbody tr:hover {
          background: #f8fafc;
        }

        /* =================================================
           AVATAR
        ================================================= */

        .team-avatar {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8f1ff;
          color: #0d6efd;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .supervisor-avatar {
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f2eaff;
          color: #6f42c1;
          font-size: 0.95rem;
        }

        /* =================================================
           ACTION
        ================================================= */

        .team-action-btn {
          width: 34px;
          height: 34px;
          padding: 0 !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
        }

        /* =================================================
           EMPLOYEE LIST
        ================================================= */

        .employee-list {
          width: 100%;
          max-height: 260px;
          overflow-y: auto;
          overflow-x: hidden;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: #fff;
        }

        .employee-item {
          padding: 10px 12px;
          border-bottom: 1px solid #edf2f7;
          transition: background 0.15s ease;
        }

        .employee-item:last-child {
          border-bottom: none;
        }

        .employee-item:hover {
          background: #f8fafc;
        }

        .employee-item .form-check {
          margin: 0;
        }

        .employee-item .form-check-input {
          cursor: pointer;
        }

        .employee-item .form-check-label {
          cursor: pointer;
        }

        /* =================================================
           DETAIL
        ================================================= */

        .team-detail-box {
          height: 100%;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #f8fafc;
        }

        .team-detail-label {
          display: block;
          margin-bottom: 5px;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .team-detail-member {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #fff;
        }

        /* =================================================
           MODAL BACKDROP
        ================================================= */

        .team-modal-backdrop {
          position: fixed !important;
          inset: 0 !important;

          width: 100vw;
          height: 100vh;

          background: rgba(15, 23, 42, 0.55);

          z-index: 99999 !important;

          overflow-y: auto;
          overflow-x: hidden;

          padding: 20px;

          box-sizing: border-box;

          display: block;
        }

        /* =================================================
           MODAL CONTAINER
        ================================================= */

        .team-modal-container {
          width: 100%;
          min-height: calc(100vh - 40px);

          display: flex;
          align-items: center;
          justify-content: center;

          box-sizing: border-box;
        }

        /* =================================================
           MODAL DIALOG
        ================================================= */

        .team-modal-container .modal-dialog {
          position: relative;

          width: 100%;

          max-width: 760px;

          margin: 0 auto;

          pointer-events: auto;
        }

        .team-modal-container .modal-content {
          position: relative;

          width: 100%;

          background: #fff !important;

          border: 0;

          border-radius: 12px;

          overflow: hidden;

          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.25);

          opacity: 1 !important;

          color: #212529;
        }

        .team-modal-container .modal-header {
          background: #fff !important;

          border-bottom: 1px solid #e5e7eb;

          padding: 18px 22px;
        }

        .team-modal-container .modal-body {
          background: #fff !important;
        }

        .team-modal-container .modal-footer {
          background: #fff !important;

          border-top: 1px solid #e5e7eb;

          padding: 14px 22px;
        }

        .team-modal-container .form-control,
        .team-modal-container .form-select {
          background-color: #fff !important;

          color: #212529 !important;

          border-color: #ced4da;

          opacity: 1 !important;
        }

        .team-modal-container textarea {
          resize: vertical;
        }

        /* =================================================
           DELETE MODAL
        ================================================= */

        .team-delete-dialog {
          max-width: 420px !important;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 991.98px) {
          .team-main {
            padding: 20px;
          }

          .team-page-title {
            font-size: 1.45rem;
          }
        }

        @media (max-width: 767.98px) {
          .team-main {
            padding: 16px;
          }

          .team-header-actions {
            width: 100%;

            display: grid;

            grid-template-columns: 1fr 1.4fr;

            gap: 8px;
          }

          .team-btn-refresh,
          .team-btn-add {
            width: 100%;
          }

          .team-stat-card {
            min-height: 95px;
            padding: 14px;
          }

          .team-stat-number {
            font-size: 1.35rem;
          }

          .team-stat-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
            font-size: 1rem;
          }

          .team-content-card {
            border-radius: 10px;
          }

          .team-modal-backdrop {
            padding: 10px;
          }

          .team-modal-container {
            min-height: calc(100vh - 20px);
          }

          .team-modal-container .modal-dialog {
            max-width: 100%;
          }
        }

        @media (max-width: 575.98px) {
          .team-main {
            padding: 12px;
          }

          .team-page-title {
            font-size: 1.3rem;
          }

          .team-page-description {
            font-size: 0.82rem;
          }

          .team-header-actions {
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          .team-btn-refresh,
          .team-btn-add {
            width: 100% !important;
          }

          .team-stat-card {
            min-height: 90px;
            padding: 12px;
          }

          .team-stat-label {
            font-size: 0.72rem;
          }

          .team-stat-number {
            font-size: 1.2rem;
          }

          .team-stat-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
          }

          .team-modal-backdrop {
            padding: 0;
          }

          .team-modal-container {
            min-height: 100vh;
            align-items: flex-start;
          }

          .team-modal-container .modal-dialog {
            width: 100%;
            max-width: none;
            margin: 0;
          }

          .team-modal-container .modal-content {
            min-height: 100vh;
            border-radius: 0;
          }

          .team-modal-container .modal-header {
            padding: 16px;
          }

          .team-modal-container .modal-body {
            padding: 16px !important;
          }

          .team-modal-container .modal-footer {
            padding: 12px 16px;
          }
        }
      `}</style>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="team-page">
        <main className="team-main">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="team-page-header mb-4">
            <div
              className="
                d-flex
                flex-column
                flex-md-row
                justify-content-between
                align-items-md-center
                gap-3
              "
            >

              <div>
                <h1 className="team-page-title">
                  Team Management
                </h1>

                <p className="team-page-description mb-0">
                  Kelola tim, supervisor,
                  dan anggota employee.
                </p>
              </div>

              <div className="team-header-actions">

                <button
                  type="button"
                  className="team-btn-refresh"
                  onClick={() => {
                    fetchTeams();
                    fetchMembers();
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise"></i>

                  <span>
                    {loading
                      ? "Memuat..."
                      : "Refresh"}
                  </span>
                </button>

                <button
                  type="button"
                  className="team-btn-add"
                  onClick={openCreate}
                >
                  <i className="bi bi-plus-lg"></i>

                  <span>
                    Tambah Team
                  </span>
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
              <div className="team-stat-card stat-blue">

                <div>
                  <span className="team-stat-label">
                    Total Team
                  </span>

                  <h3 className="team-stat-number">
                    {statistics.totalTeams}
                  </h3>
                </div>

                <div className="team-stat-icon">
                  <i className="bi bi-diagram-3"></i>
                </div>

              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="team-stat-card stat-green">

                <div>
                  <span className="team-stat-label">
                    Team Aktif
                  </span>

                  <h3 className="team-stat-number">
                    {statistics.activeTeams}
                  </h3>
                </div>

                <div className="team-stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>

              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="team-stat-card stat-orange">

                <div>
                  <span className="team-stat-label">
                    Employee
                  </span>

                  <h3 className="team-stat-number">
                    {statistics.totalEmployees}
                  </h3>
                </div>

                <div className="team-stat-icon">
                  <i className="bi bi-people"></i>
                </div>

              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="team-stat-card stat-purple">

                <div>
                  <span className="team-stat-label">
                    Supervisor
                  </span>

                  <h3 className="team-stat-number">
                    {statistics.totalSupervisors}
                  </h3>
                </div>

                <div className="team-stat-icon">
                  <i className="bi bi-person-badge"></i>
                </div>

              </div>
            </div>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="team-content-card mb-4">

            <div className="p-3">

              <div className="row g-3 align-items-center">

                <div className="col-12 col-md-8">

                  <div className="team-search-wrapper">

                    <i className="bi bi-search"></i>

                    <input
                      type="text"
                      className="team-search-input"
                      placeholder="Cari nama team atau deskripsi..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />

                  </div>

                </div>

                <div className="col-12 col-md-4">

                  <div className="d-flex justify-content-md-end align-items-center gap-2">

                    <span className="text-muted small">
                      Menampilkan
                    </span>

                    <span className="badge bg-light text-dark border">
                      {filteredTeams.length} Team
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="team-content-card">

            <div className="p-3 border-bottom">

              <div className="d-flex justify-content-between align-items-center gap-3">

                <div>
                  <h6 className="fw-bold mb-1">
                    Daftar Team
                  </h6>

                  <small className="text-muted">
                    Data struktur team yang
                    terdaftar.
                  </small>
                </div>

                <small className="text-muted text-nowrap">
                  {filteredTeams.length} dari{" "}
                  {teams.length}
                </small>

              </div>

            </div>

            {loading ? (
              <div className="text-center py-5">

                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                />

                <div className="text-muted small mt-2">
                  Memuat data team...
                </div>

              </div>
            ) : filteredTeams.length === 0 ? (

              <div className="text-center py-5 px-3">

                <i className="bi bi-diagram-3 fs-2 text-muted"></i>

                <h6 className="fw-semibold mt-3">
                  {search
                    ? "Team tidak ditemukan"
                    : "Belum ada team"}
                </h6>

                <p className="text-muted small mb-3">
                  {search
                    ? "Coba gunakan kata kunci lain."
                    : "Buat team pertama untuk mulai mengelola struktur organisasi."}
                </p>

                {!search && (
                  <button
                    type="button"
                    className="team-btn-add"
                    onClick={openCreate}
                  >
                    <i className="bi bi-plus-lg"></i>

                    <span>
                      Tambah Team
                    </span>
                  </button>
                )}

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table team-table align-middle">

                  <thead>
                    <tr>
                      <th className="ps-3">#</th>
                      <th>Team</th>
                      <th>Supervisor</th>
                      <th>Anggota</th>
                      <th>Status</th>
                      <th className="text-end pe-3">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredTeams.map(
                      (team, index) => {

                        const supervisor =
                          getSupervisor(team);

                        const employeeCount =
                          getEmployeeCount(team);

                        return (
                          <tr key={team.id}>

                            <td className="ps-3 text-muted small">
                              {index + 1}
                            </td>

                            <td>
                              <div className="d-flex align-items-center gap-3">

                                <div className="team-avatar">
                                  {getInitials(
                                    team.name
                                  )}
                                </div>

                                <div>
                                  <div className="fw-semibold">
                                    {team.name}
                                  </div>

                                  <small className="text-muted">
                                    {team.description ||
                                      "Tidak ada deskripsi"}
                                  </small>
                                </div>

                              </div>
                            </td>

                            <td>
                              {supervisor ? (

                                <div className="d-flex align-items-center gap-2">

                                  <div className="supervisor-avatar">
                                    <i className="bi bi-person-badge"></i>
                                  </div>

                                  <span className="small fw-semibold">
                                    {getMemberName(
                                      supervisor
                                    )}
                                  </span>

                                </div>

                              ) : (
                                <span className="text-muted small">
                                  Belum ditentukan
                                </span>
                              )}
                            </td>

                            <td>
                              <span className="badge bg-primary-subtle text-primary">

                                <i className="bi bi-people me-1"></i>

                                {employeeCount}

                              </span>
                            </td>

                            <td>
                              {team.is_active ? (

                                <span className="badge bg-success-subtle text-success">
                                  Aktif
                                </span>

                              ) : (

                                <span className="badge bg-secondary-subtle text-secondary">
                                  Tidak Aktif
                                </span>

                              )}
                            </td>

                            <td className="text-end pe-3">

                              <div className="d-flex justify-content-end gap-1">

                                <button
                                  type="button"
                                  className="btn btn-outline-secondary team-action-btn"
                                  title="Detail"
                                  onClick={() =>
                                    handleDetail(team)
                                  }
                                >
                                  <i className="bi bi-eye"></i>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-outline-primary team-action-btn"
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(team)
                                  }
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-outline-danger team-action-btn"
                                  title="Hapus"
                                  onClick={() => {
                                    setSelectedTeam(team);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </main>

        {/* =====================================================
            CREATE / EDIT MODAL
        ===================================================== */}

        {showModal && (
          <div
            className="team-modal-backdrop"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget &&
                !saving
              ) {
                closeModal();
              }
            }}
          >

            <div className="team-modal-container">

              <div className="modal-dialog">

                <div className="modal-content">

                  <form onSubmit={handleSubmit}>

                    <div className="modal-header">

                      <div>
                        <h5 className="modal-title fw-bold mb-1">
                          {selectedTeam
                            ? "Edit Team"
                            : "Tambah Team"}
                        </h5>

                        <small className="text-muted">
                          Isi informasi team dan anggota.
                        </small>
                      </div>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                        disabled={saving}
                        aria-label="Close"
                      />

                    </div>

                    <div className="modal-body p-4">

                      <div className="row g-3">

                        <div className="col-12">

                          <label className="form-label small fw-semibold">
                            Nama Team
                          </label>

                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Contoh: Development Team"
                            required
                            autoComplete="off"
                          />

                        </div>

                        <div className="col-12">

                          <label className="form-label small fw-semibold">
                            Deskripsi
                          </label>

                          <textarea
                            name="description"
                            className="form-control"
                            rows="3"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Deskripsi team..."
                          />

                        </div>

                        <div className="col-12">

                          <label className="form-label small fw-semibold">
                            Supervisor
                          </label>

                          <select
                            name="supervisor_id"
                            className="form-select"
                            value={form.supervisor_id}
                            onChange={handleChange}
                            required
                          >

                            <option value="">
                              Pilih Supervisor
                            </option>

                            {members.supervisors.map(
                              (supervisor) => (
                                <option
                                  key={supervisor.id}
                                  value={supervisor.id}
                                >
                                  {supervisor.name}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <div className="col-12">

                          <div className="d-flex justify-content-between align-items-center mb-2">

                            <label className="form-label small fw-semibold mb-0">
                              Employee
                            </label>

                            <span className="text-muted small">
                              {form.employee_ids.length} dipilih
                            </span>

                          </div>

                          <div className="employee-list">

                            {members.employees.length === 0 ? (

                              <div className="text-center text-muted small py-4">
                                Tidak ada employee yang tersedia.
                              </div>

                            ) : (

                              members.employees.map(
                                (employee) => (

                                  <div
                                    className="employee-item"
                                    key={employee.id}
                                  >

                                    <div className="form-check">

                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`employee-${employee.id}`}
                                        checked={form.employee_ids.includes(
                                          Number(employee.id)
                                        )}
                                        onChange={() =>
                                          handleEmployeeChange(
                                            employee.id
                                          )
                                        }
                                      />

                                      <label
                                        className="form-check-label w-100"
                                        htmlFor={`employee-${employee.id}`}
                                      >

                                        <span className="fw-semibold">
                                          {employee.name}
                                        </span>

                                        {employee.employee_code && (
                                          <small className="text-muted ms-2">
                                            {employee.employee_code}
                                          </small>
                                        )}

                                      </label>

                                    </div>

                                  </div>

                                )
                              )
                            )}

                          </div>

                        </div>

                        {selectedTeam && (
                          <div className="col-12">

                            <div className="form-check form-switch">

                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                id="teamActive"
                              />

                              <label
                                className="form-check-label small fw-semibold"
                                htmlFor="teamActive"
                              >
                                Team Aktif
                              </label>

                            </div>

                          </div>
                        )}

                      </div>

                    </div>

                    <div className="modal-footer">

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={closeModal}
                        disabled={saving}
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >

                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
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

          </div>
        )}

        {/* =====================================================
            DETAIL MODAL
        ===================================================== */}

        {showDetailModal && selectedTeam && (
          <div className="team-modal-backdrop">

            <div className="team-modal-container">

              <div className="modal-dialog">

                <div className="modal-content">

                  <div className="modal-header">

                    <div>
                      <h5 className="modal-title fw-bold mb-1">
                        Detail Team
                      </h5>

                      <small className="text-muted">
                        Informasi team dan anggota.
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeDetail}
                      aria-label="Close"
                    />

                  </div>

                  <div className="modal-body p-4">

                    <div className="d-flex align-items-center gap-3 mb-4">

                      <div
                        className="team-avatar"
                        style={{
                          width: 52,
                          height: 52,
                        }}
                      >
                        {getInitials(
                          selectedTeam.name
                        )}
                      </div>

                      <div>

                        <h5 className="fw-bold mb-1">
                          {selectedTeam.name}
                        </h5>

                        <p className="text-muted small mb-0">
                          {selectedTeam.description ||
                            "Tidak ada deskripsi."}
                        </p>

                      </div>

                    </div>

                    <div className="row g-3 mb-4">

                      <div className="col-6 col-md-4">

                        <div className="team-detail-box">

                          <span className="team-detail-label">
                            Status
                          </span>

                          {selectedTeam.is_active ? (
                            <span className="text-success fw-semibold small">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-secondary fw-semibold small">
                              Tidak Aktif
                            </span>
                          )}

                        </div>

                      </div>

                      <div className="col-6 col-md-4">

                        <div className="team-detail-box">

                          <span className="team-detail-label">
                            Employee
                          </span>

                          <span className="fw-semibold small">
                            {getEmployeeCount(
                              selectedTeam
                            )}{" "}
                            Employee
                          </span>

                        </div>

                      </div>

                      <div className="col-12 col-md-4">

                        <div className="team-detail-box">

                          <span className="team-detail-label">
                            Supervisor
                          </span>

                          <span className="fw-semibold small">

                            {getSupervisor(
                              selectedTeam
                            )
                              ? getMemberName(
                                  getSupervisor(
                                    selectedTeam
                                  )
                                )
                              : "-"}

                          </span>

                        </div>

                      </div>

                    </div>

                    <h6 className="fw-semibold mb-3">
                      Anggota Team
                    </h6>

                    <div className="row g-2">

                      {(selectedTeam.members || [])
                        .length === 0 ? (

                        <div className="col-12">

                          <div className="text-center text-muted small py-4">
                            Belum ada anggota.
                          </div>

                        </div>

                      ) : (

                        (selectedTeam.members || []).map(
                          (member) => {

                            const isSupervisor =
                              member.member_type?.includes(
                                "Supervisor"
                              );

                            return (
                              <div
                                className="col-12 col-md-6"
                                key={member.id}
                              >

                                <div className="team-detail-member">

                                  <div
                                    className={
                                      isSupervisor
                                        ? "supervisor-avatar"
                                        : "team-avatar"
                                    }
                                    style={
                                      isSupervisor
                                        ? {}
                                        : {
                                            width: 32,
                                            height: 32,
                                            minWidth: 32,
                                          }
                                    }
                                  >

                                    <i
                                      className={
                                        isSupervisor
                                          ? "bi bi-person-badge"
                                          : "bi bi-person"
                                      }
                                    ></i>

                                  </div>

                                  <div>

                                    <div className="fw-semibold small">
                                      {getMemberName(
                                        member
                                      )}
                                    </div>

                                    <small className="text-muted">
                                      {isSupervisor
                                        ? "Supervisor"
                                        : "Employee"}
                                    </small>

                                  </div>

                                </div>

                              </div>
                            );
                          }
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            DELETE MODAL
        ===================================================== */}

        {showDeleteModal && selectedTeam && (
          <div
            className="team-modal-backdrop"
            style={{
              zIndex: 100000,
            }}
          >

            <div className="team-modal-container">

              <div className="modal-dialog team-delete-dialog">

                <div className="modal-content">

                  <div className="modal-body text-center p-4">

                    <div className="mb-3">

                      <i
                        className="bi bi-trash3 text-danger"
                        style={{
                          fontSize: "2rem",
                        }}
                      ></i>

                    </div>

                    <h5 className="fw-bold mb-2">
                      Hapus Team?
                    </h5>

                    <p className="text-muted small mb-4">

                      Team{" "}
                      <strong>
                        {selectedTeam.name}
                      </strong>{" "}
                      akan dihapus.

                    </p>

                    <div className="d-flex gap-2">

                      <button
                        type="button"
                        className="btn btn-light w-50"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setSelectedTeam(null);
                        }}
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger w-50"
                        onClick={handleDelete}
                      >
                        Hapus
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
};

export default TeamManagementPage;