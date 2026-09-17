import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {apiFetch} from "../api/apiFetch";

// =====================================================
// LAYOUT
// =====================================================

import SidebarEmployee from "../components/SidebarEmployee";
import NavbarEmployee from "../layouts/NavbarEmployee";

// =====================================================
// CONSTANT
// =====================================================

const MEETING_URL = "/employee/meetings";

// =====================================================
// COMPONENT
// =====================================================

const MeetingEmployeePage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [meetings, setMeetings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // FETCH MEETINGS
  // =====================================================

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch.get(MEETING_URL);

      const data =
        response?.data?.data ??
        response?.data ??
        [];

      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Gagal mengambil data rapat:",
        err
      );

      setMeetings([]);

      setError(
        err?.response?.data?.message ||
          "Gagal mengambil data rapat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ).format(new Date(date));
    } catch {
      return date;
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) return "-";

    return String(time).substring(0, 5);
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "scheduled":
        return "Terjadwal";

      case "completed":
        return "Selesai";

      case "cancelled":
        return "Dibatalkan";

      default:
        return status || "-";
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-primary-subtle text-primary";

      case "completed":
        return "bg-success-subtle text-success";

      case "cancelled":
        return "bg-danger-subtle text-danger";

      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  // =====================================================
  // PARTICIPANT NAME
  // =====================================================

  const getParticipantName = (participant) => {
    if (!participant) {
      return "-";
    }

    const data = participant.participant;

    if (!data) {
      return `ID ${participant.participant_id}`;
    }

    return (
      data.name ||
      data.full_name ||
      `ID ${participant.participant_id}`
    );
  };

  // =====================================================
  // PARTICIPANT TYPE
  // =====================================================

  const getParticipantType = (participant) => {
    if (!participant?.participant_type) {
      return "";
    }

    const type = participant.participant_type;

    if (type.includes("Employee")) {
      return "Employee";
    }

    if (type.includes("Supervisor")) {
      return "Supervisor";
    }

    if (type.includes("Finance")) {
      return "Finance";
    }

    return "";
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredMeetings = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return meetings.filter((meeting) => {
      const title =
        meeting.title?.toLowerCase() || "";

      const location =
        meeting.location?.toLowerCase() || "";

      const agenda =
        meeting.agenda?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        location.includes(keyword) ||
        agenda.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        meeting.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    meetings,
    search,
    statusFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    return {
      total: meetings.length,

      scheduled: meetings.filter(
        (item) =>
          item.status === "scheduled"
      ).length,

      completed: meetings.filter(
        (item) =>
          item.status === "completed"
      ).length,

      cancelled: meetings.filter(
        (item) =>
          item.status === "cancelled"
      ).length,
    };
  }, [meetings]);

  // =====================================================
  // DETAIL MODAL
  // =====================================================

  const openDetailModal = (meeting) => {
    setSelectedMeeting(meeting);

    setShowDetailModal(true);

    document.body.classList.add(
      "meeting-modal-open"
    );
  };

  const closeDetailModal = () => {
    setSelectedMeeting(null);

    setShowDetailModal(false);

    document.body.classList.remove(
      "meeting-modal-open"
    );
  };

  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        showDetailModal
      ) {
        closeDetailModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showDetailModal]);

  // =====================================================
  // CLEANUP BODY
  // =====================================================

  useEffect(() => {
    return () => {
      document.body.classList.remove(
        "meeting-modal-open"
      );
    };
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="employee-meeting-page">

      {/* =================================================
          SIDEBAR EMPLOYEE
      ================================================= */}

      <SidebarEmployee
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="employee-meeting-main">

        {/* =================================================
            NAVBAR EMPLOYEE
        ================================================= */}

        <NavbarEmployee
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="container-fluid employee-meeting-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="meeting-header mb-4">

            <div>
              <h3 className="fw-bold mb-1">
                Rapat
              </h3>

              <p className="text-secondary small mb-0">
                Lihat jadwal dan informasi rapat
                yang melibatkan Anda.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={fetchMeetings}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>

              <span>
                {loading
                  ? "Memuat..."
                  : "Refresh"}
              </span>
            </button>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show small"
              role="alert"
            >
              <strong>
                Error:
              </strong>{" "}
              {error}

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setError("")
                }
              />
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3 mb-4">

            {/* TOTAL */}

            <div className="col-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100 rounded-4">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex justify-content-between align-items-start gap-2">

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Total Rapat
                      </div>

                      <div className="fs-3 fw-bold text-dark mt-2">
                        {statistics.total}
                      </div>
                    </div>

                    <div className="meeting-stat-icon bg-primary-subtle text-primary">
                      <i className="bi bi-calendar-event"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* SCHEDULED */}

            <div className="col-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100 rounded-4">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex justify-content-between align-items-start gap-2">

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Terjadwal
                      </div>

                      <div className="fs-3 fw-bold text-dark mt-2">
                        {statistics.scheduled}
                      </div>
                    </div>

                    <div className="meeting-stat-icon bg-info-subtle text-info">
                      <i className="bi bi-calendar-plus"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="col-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100 rounded-4">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex justify-content-between align-items-start gap-2">

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Selesai
                      </div>

                      <div className="fs-3 fw-bold text-dark mt-2">
                        {statistics.completed}
                      </div>
                    </div>

                    <div className="meeting-stat-icon bg-success-subtle text-success">
                      <i className="bi bi-check-circle"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* CANCELLED */}

            <div className="col-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100 rounded-4">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex justify-content-between align-items-start gap-2">

                    <div>
                      <div className="text-secondary small fw-semibold">
                        Dibatalkan
                      </div>

                      <div className="fs-3 fw-bold text-dark mt-2">
                        {statistics.cancelled}
                      </div>
                    </div>

                    <div className="meeting-stat-icon bg-danger-subtle text-danger">
                      <i className="bi bi-calendar-x"></i>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4 mb-3">

            <div className="card-body p-3">

              <div className="row g-2">

                {/* SEARCH */}

                <div className="col-12 col-md">

                  <div className="input-group">

                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-secondary"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control border-start-0 shadow-none"
                      placeholder="Cari judul, lokasi, atau agenda..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div className="col-12 col-md-auto">

                  <select
                    className="form-select shadow-none"
                    style={{
                      minWidth: 180,
                    }}
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="all">
                      Semua Status
                    </option>

                    <option value="scheduled">
                      Terjadwal
                    </option>

                    <option value="completed">
                      Selesai
                    </option>

                    <option value="cancelled">
                      Dibatalkan
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            {loading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />

                <div className="text-secondary small">
                  Memuat data rapat...
                </div>

              </div>

            ) : filteredMeetings.length === 0 ? (

              <div className="text-center py-5 px-3">

                <div className="empty-meeting-icon mx-auto mb-3">
                  <i className="bi bi-calendar-x"></i>
                </div>

                <h6 className="fw-semibold mb-1">
                  Belum ada data rapat
                </h6>

                <p className="text-secondary small mb-0">
                  Tidak ada rapat yang sesuai
                  dengan filter.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0 meeting-table">

                  <thead className="table-light">

                    <tr>

                      <th className="px-3 py-3 small text-secondary">
                        Rapat
                      </th>

                      <th className="py-3 small text-secondary">
                        Tanggal
                      </th>

                      <th className="py-3 small text-secondary">
                        Waktu
                      </th>

                      <th className="py-3 small text-secondary">
                        Lokasi
                      </th>

                      <th className="py-3 small text-secondary">
                        Peserta
                      </th>

                      <th className="py-3 small text-secondary">
                        Status
                      </th>

                      <th className="py-3 small text-secondary text-end pe-3">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredMeetings.map(
                      (meeting) => (

                        <tr
                          key={meeting.id}
                        >

                          {/* TITLE */}

                          <td className="px-3">

                            <div className="fw-semibold text-dark">
                              {meeting.title ||
                                "Rapat"}
                            </div>

                            {meeting.agenda && (

                              <div
                                className="text-secondary small text-truncate mt-1"
                                style={{
                                  maxWidth: 260,
                                }}
                              >
                                {meeting.agenda}
                              </div>

                            )}

                          </td>

                          {/* DATE */}

                          <td className="small text-nowrap">
                            {formatDate(
                              meeting.meeting_date
                            )}
                          </td>

                          {/* TIME */}

                          <td className="small text-nowrap">

                            {formatTime(
                              meeting.start_time
                            )}

                            {meeting.end_time &&
                              ` - ${formatTime(
                                meeting.end_time
                              )}`}

                          </td>

                          {/* LOCATION */}

                          <td>

                            <div
                              className="small text-truncate"
                              style={{
                                maxWidth: 160,
                              }}
                              title={
                                meeting.location ||
                                "-"
                              }
                            >
                              {meeting.location ||
                                "-"}
                            </div>

                          </td>

                          {/* PARTICIPANTS */}

                          <td className="small text-nowrap">

                            <span className="d-inline-flex align-items-center gap-1">

                              <i className="bi bi-people text-secondary"></i>

                              {meeting
                                .participants
                                ?.length ||
                                0}

                            </span>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`badge rounded-pill ${getStatusBadge(
                                meeting.status
                              )}`}
                            >
                              {getStatusLabel(
                                meeting.status
                              )}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="text-end pe-3">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                openDetailModal(
                                  meeting
                                )
                              }
                            >
                              <i className="bi bi-eye me-1"></i>

                              Detail
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetailModal &&
        selectedMeeting && (

          <div
            className="modal fade show d-block meeting-detail-modal"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                closeDetailModal();
              }
            }}
          >

            <div className="modal-dialog modal-dialog-centered meeting-detail-modal-dialog">

              <div className="modal-content border-0 shadow-lg rounded-4 meeting-detail-modal-content">

                {/* =================================================
                    MODAL HEADER
                ================================================= */}

                <div className="modal-header meeting-detail-modal-header">

                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      Detail Rapat
                    </h5>

                    <small className="text-secondary">
                      Informasi lengkap rapat
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={
                      closeDetailModal
                    }
                  />

                </div>

                {/* =================================================
                    MODAL BODY
                ================================================= */}

                <div className="modal-body meeting-detail-modal-body">

                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <div className="bg-light rounded-4 p-3 p-md-4 mb-3">

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2">

                      <div className="min-w-0">

                        <h5 className="fw-bold mb-1 text-break">

                          {selectedMeeting.title ||
                            "Rapat"}

                        </h5>

                        {selectedMeeting
                          .creator && (

                          <div className="text-secondary small">

                            Dibuat oleh{" "}

                            {selectedMeeting
                              .creator
                              .name ||
                              "-"}

                          </div>

                        )}

                      </div>

                      <div className="flex-shrink-0">

                        <span
                          className={`badge rounded-pill ${getStatusBadge(
                            selectedMeeting.status
                          )}`}
                        >
                          {getStatusLabel(
                            selectedMeeting.status
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      INFORMATION
                  ================================================= */}

                  <div className="row g-2 mb-4">

                    {/* DATE */}

                    <div className="col-12 col-md-6">

                      <div className="border rounded-3 p-3 h-100">

                        <div className="d-flex align-items-center gap-2 mb-1">

                          <i className="bi bi-calendar3 text-primary"></i>

                          <div className="text-secondary small fw-semibold">
                            Tanggal
                          </div>

                        </div>

                        <div className="fw-medium small">

                          {formatDate(
                            selectedMeeting.meeting_date
                          )}

                        </div>

                      </div>

                    </div>

                    {/* TIME */}

                    <div className="col-12 col-md-6">

                      <div className="border rounded-3 p-3 h-100">

                        <div className="d-flex align-items-center gap-2 mb-1">

                          <i className="bi bi-clock text-primary"></i>

                          <div className="text-secondary small fw-semibold">
                            Waktu
                          </div>

                        </div>

                        <div className="fw-medium small">

                          {formatTime(
                            selectedMeeting.start_time
                          )}

                          {" - "}

                          {selectedMeeting
                            .end_time
                            ? formatTime(
                                selectedMeeting.end_time
                              )
                            : "-"}

                        </div>

                      </div>

                    </div>

                    {/* LOCATION */}

                    <div className="col-12 col-md-6">

                      <div className="border rounded-3 p-3 h-100">

                        <div className="d-flex align-items-center gap-2 mb-1">

                          <i className="bi bi-geo-alt text-primary"></i>

                          <div className="text-secondary small fw-semibold">
                            Lokasi
                          </div>

                        </div>

                        <div className="fw-medium small text-break">

                          {
                            selectedMeeting.location ||
                            "-"
                          }

                        </div>

                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="col-12 col-md-6">

                      <div className="border rounded-3 p-3 h-100">

                        <div className="d-flex align-items-center gap-2 mb-2">

                          <i className="bi bi-info-circle text-primary"></i>

                          <div className="text-secondary small fw-semibold">
                            Status
                          </div>

                        </div>

                        <span
                          className={`badge rounded-pill ${getStatusBadge(
                            selectedMeeting.status
                          )}`}
                        >
                          {getStatusLabel(
                            selectedMeeting.status
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      AGENDA
                  ================================================= */}

                  <div className="border rounded-3 p-3 mb-3">

                    <div className="d-flex align-items-center gap-2 mb-2">

                      <i className="bi bi-list-task text-primary"></i>

                      <div className="fw-semibold small">
                        Agenda
                      </div>

                    </div>

                    <div className="text-secondary small meeting-text-content">

                      {
                        selectedMeeting.agenda ||
                        "-"
                      }

                    </div>

                  </div>

                  {/* =================================================
                      MINUTES
                  ================================================= */}

                  <div className="border rounded-3 p-3 mb-4">

                    <div className="d-flex align-items-center gap-2 mb-2">

                      <i className="bi bi-journal-text text-primary"></i>

                      <div className="fw-semibold small">
                        Notulen
                      </div>

                    </div>

                    <div className="text-secondary small meeting-text-content">

                      {
                        selectedMeeting.minutes ||
                        "-"
                      }

                    </div>

                  </div>

                  {/* =================================================
                      PARTICIPANTS
                  ================================================= */}

                  <div>

                    <div className="d-flex justify-content-between align-items-center mb-2 gap-2">

                      <h6 className="fw-bold mb-0">
                        Peserta Rapat
                      </h6>

                      <span className="badge bg-light text-secondary border flex-shrink-0">

                        {
                          selectedMeeting
                            .participants
                            ?.length ||
                          0
                        }{" "}
                        orang

                      </span>

                    </div>

                    {selectedMeeting
                      .participants
                      ?.length > 0 ? (

                      <div className="row g-2">

                        {selectedMeeting
                          .participants
                          .map(
                            (
                              participant
                            ) => (

                              <div
                                className="col-12 col-md-6"
                                key={
                                  participant.id
                                }
                              >

                                <div className="border rounded-3 p-3 h-100">

                                  <div className="d-flex align-items-center justify-content-between gap-2">

                                    <div className="d-flex align-items-center gap-2 min-w-0">

                                      <div className="participant-avatar">

                                        <i className="bi bi-person"></i>

                                      </div>

                                      <span className="small fw-semibold text-truncate">

                                        {getParticipantName(
                                          participant
                                        )}

                                      </span>

                                    </div>

                                    {getParticipantType(
                                      participant
                                    ) && (

                                      <span className="badge bg-light text-secondary border flex-shrink-0">

                                        {getParticipantType(
                                          participant
                                        )}

                                      </span>

                                    )}

                                  </div>

                                </div>

                              </div>

                            )
                          )}

                      </div>

                    ) : (

                      <div className="text-secondary small border rounded-3 p-3">

                        Tidak ada peserta.

                      </div>

                    )}

                  </div>

                </div>

                {/* =================================================
                    MODAL FOOTER
                ================================================= */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={
                      closeDetailModal
                    }
                  >
                    Tutup
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      {/* =====================================================
          STYLE
      ===================================================== */}

      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .employee-meeting-page {
          min-height: 100vh;
          background-color: #f8fafc;
          overflow-x: hidden;
        }

        .employee-meeting-main {
          min-width: 0;
          margin-left: 250px;
        }

        .employee-meeting-content {
          padding: 1rem;
        }

        /* =================================================
           HEADER
        ================================================= */

        .meeting-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* =================================================
           STAT ICON
        ================================================= */

        .meeting-stat-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 1.1rem;
        }

        /* =================================================
           EMPTY
        ================================================= */

        .empty-meeting-icon {
          width: 60px;
          height: 60px;

          border-radius: 50%;

          background-color: #f1f5f9;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #64748b;

          font-size: 1.5rem;
        }

        /* =================================================
           TABLE
        ================================================= */

        .meeting-table {
          min-width: 950px;
        }

        .meeting-table th {
          white-space: nowrap;
        }

        .meeting-table td {
          vertical-align: middle;
        }

        /* =================================================
           TEXT
        ================================================= */

        .meeting-text-content {
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          line-height: 1.7;
        }

        /* =================================================
           PARTICIPANT
        ================================================= */

        .participant-avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;

          border-radius: 50%;

          background-color: #eff6ff;

          color: #2563eb;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .min-w-0 {
          min-width: 0;
        }

        /* =================================================
           MEETING DETAIL MODAL
        ================================================= */

        .meeting-detail-modal {
          position: fixed;
          inset: 0;

          display: flex !important;

          align-items: center;
          justify-content: center;

          padding: 1rem;

          background-color: rgba(15, 23, 42, 0.55);

          z-index: 3000;

          overflow: hidden;
        }

        /* =================================================
           MODAL DIALOG
        ================================================= */

        .meeting-detail-modal-dialog {
          width: 100%;
          max-width: 760px;

          margin: 0 auto;

          max-height: calc(100vh - 2rem);
        }

        /* =================================================
           MODAL CONTENT
        ================================================= */

        .meeting-detail-modal-content {
          width: 100%;

          max-height: calc(100vh - 2rem);

          display: flex;
          flex-direction: column;

          overflow: hidden;

          border-radius: 1rem !important;
        }

        /* =================================================
           MODAL HEADER
        ================================================= */

        .meeting-detail-modal-header {
          flex-shrink: 0;

          padding: 1rem 1.25rem;

          background-color: #ffffff;

          border-bottom: 1px solid #e5e7eb;
        }

        /* =================================================
           MODAL BODY
        ================================================= */

        .meeting-detail-modal-body {
          flex: 1 1 auto;

          min-height: 0;

          overflow-y: auto;
          overflow-x: hidden;

          padding: 1.25rem;
        }

        /* =================================================
           MODAL BODY SCROLLBAR
        ================================================= */

        .meeting-detail-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .meeting-detail-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .meeting-detail-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        /* =================================================
           MODAL FOOTER
        ================================================= */

        .meeting-detail-modal-content .modal-footer {
          flex-shrink: 0;

          padding: 0.85rem 1.25rem;

          background-color: #ffffff;

          border-top: 1px solid #e5e7eb;
        }

        /* =================================================
           BODY MODAL
        ================================================= */

        body.meeting-modal-open {
          overflow: hidden;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 991.98px) {

          .employee-meeting-main {
            margin-left: 0;
          }

          .employee-meeting-content {
            padding: 1rem;
          }

          .meeting-detail-modal-dialog {
            max-width: 720px;
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 767.98px) {

          .meeting-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .meeting-header .btn {
            width: 100%;
            justify-content: center;
          }

          .employee-meeting-content {
            padding: 0.75rem;
          }

          .meeting-table {
            min-width: 900px;
          }

          .card-body {
            min-width: 0;
          }

          /* MODAL MOBILE */

          .meeting-detail-modal {
            padding: 0.75rem;
          }

          .meeting-detail-modal-dialog {
            max-width: 100%;

            max-height: calc(100vh - 1.5rem);
          }

          .meeting-detail-modal-content {
            max-height: calc(100vh - 1.5rem);

            border-radius: 0.9rem !important;
          }

          .meeting-detail-modal-header {
            padding: 0.9rem 1rem;
          }

          .meeting-detail-modal-body {
            padding: 1rem;
          }

          .meeting-detail-modal-content .modal-footer {
            padding: 0.75rem 1rem;
          }

        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 575.98px) {

          .employee-meeting-content {
            padding: 0.65rem;
          }

          .meeting-stat-icon {
            width: 36px;
            height: 36px;
            min-width: 36px;

            font-size: 0.95rem;
          }

          .meeting-header h3 {
            font-size: 1.35rem;
          }

          /* SMALL MODAL */

          .meeting-detail-modal {
            padding: 0.5rem;
          }

          .meeting-detail-modal-dialog {
            max-height: calc(100vh - 1rem);
          }

          .meeting-detail-modal-content {
            max-height: calc(100vh - 1rem);

            border-radius: 0.85rem !important;
          }

          .meeting-detail-modal-header {
            padding: 0.85rem 0.9rem;
          }

          .meeting-detail-modal-body {
            padding: 0.9rem;
          }

          .meeting-detail-modal-content .modal-footer {
            padding: 0.7rem 0.9rem;
          }

        }

      `}</style>

    </div>
  );
};

export default MeetingEmployeePage;