import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {apiFetch} from "../api/apiFetch";

const MEETING_URL = "/supervisor/meetings";

const MeetingSupervisorPage = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

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

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // =========================================================
  // MODAL BODY LOCK
  // =========================================================

  useEffect(() => {
    if (showDetailModal) {
      document.body.classList.add(
        "meeting-supervisor-modal-open"
      );
    } else {
      document.body.classList.remove(
        "meeting-supervisor-modal-open"
      );
    }

    return () => {
      document.body.classList.remove(
        "meeting-supervisor-modal-open"
      );
    };
  }, [showDetailModal]);

  // =========================================================
  // ESCAPE CLOSE MODAL
  // =========================================================

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

  // =========================================================
  // HELPERS
  // =========================================================

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

  const formatTime = (time) => {
    if (!time) return "-";

    return String(time).substring(0, 5);
  };

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

  const getParticipantName = (participant) => {
    if (!participant) {
      return "-";
    }

    const data = participant.participant;

    if (!data) {
      return participant.participant_id
        ? `ID ${participant.participant_id}`
        : "-";
    }

    return (
      data.name ||
      data.full_name ||
      data.email ||
      (participant.participant_id
        ? `ID ${participant.participant_id}`
        : "-")
    );
  };

  const getParticipantType = (participant) => {
    if (!participant?.participant_type) {
      return "Peserta";
    }

    const type =
      participant.participant_type;

    if (type.includes("Employee")) {
      return "Employee";
    }

    if (type.includes("Supervisor")) {
      return "Supervisor";
    }

    if (type.includes("Finance")) {
      return "Finance";
    }

    return "Peserta";
  };

  // =========================================================
  // FILTER
  // =========================================================

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

  // =========================================================
  // DETAIL
  // =========================================================

  const openDetailModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedMeeting(null);
    setShowDetailModal(false);
  };

  // =========================================================
  // STATISTICS
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="meeting-supervisor-page">

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="container-fluid meeting-supervisor-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="meeting-supervisor-header">

          <div>
            <h3 className="fw-bold mb-1 text-dark">
              Rapat
            </h3>

            <p className="text-secondary small mb-0">
              Lihat jadwal dan informasi rapat
              yang melibatkan Anda.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
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

        {/* =====================================================
            ERROR
        ===================================================== */}

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

        {/* =====================================================
            STATISTICS
        ===================================================== */}

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

        {/* =====================================================
            FILTER
        ===================================================== */}

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
                    onChange={(event) =>
                      setSearch(
                        event.target.value
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
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
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

        {/* =====================================================
            TABLE
        ===================================================== */}

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

              <table className="table table-hover align-middle mb-0 meeting-supervisor-table">

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

                          <span className="fw-medium">

                            {formatTime(
                              meeting.start_time
                            )}

                          </span>

                          {meeting.end_time && (
                            <>
                              {" - "}
                              {formatTime(
                                meeting.end_time
                              )}
                            </>
                          )}

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

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetailModal &&
        selectedMeeting && (

          <div
            className="meeting-detail-overlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeDetailModal();
              }

            }}
          >

            <div className="meeting-detail-dialog">

              <div className="meeting-detail-modal">

                {/* =================================================
                    MODAL HEADER
                ================================================= */}

                <div className="meeting-detail-header">

                  <div className="min-w-0">

                    <div className="d-flex align-items-center gap-2">

                      <div className="meeting-detail-icon">

                        <i className="bi bi-calendar-event"></i>

                      </div>

                      <div className="min-w-0">

                        <h5 className="fw-bold mb-0 text-truncate">
                          Detail Rapat
                        </h5>

                        <small className="text-secondary">
                          Informasi lengkap rapat
                        </small>

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="btn-close flex-shrink-0"
                    onClick={
                      closeDetailModal
                    }
                    aria-label="Tutup"
                  />

                </div>

                {/* =================================================
                    MODAL BODY
                ================================================= */}

                <div className="meeting-detail-body">

                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <div className="meeting-detail-title-box">

                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-3">

                      <div className="min-w-0">

                        <h5 className="fw-bold mb-1 meeting-detail-title">

                          {
                            selectedMeeting.title ||
                            "Rapat"
                          }

                        </h5>

                        {selectedMeeting.creator && (

                          <div className="text-secondary small">

                            Dibuat oleh{" "}

                            {
                              selectedMeeting
                                .creator
                                .name ||
                              "-"
                            }

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

                  <div className="row g-2 mb-3">

                    {/* DATE */}

                    <div className="col-12 col-md-6">

                      <div className="meeting-info-box h-100">

                        <div className="meeting-info-label">

                          <i className="bi bi-calendar3 text-primary"></i>

                          <span>
                            Tanggal
                          </span>

                        </div>

                        <div className="meeting-info-value">

                          {formatDate(
                            selectedMeeting.meeting_date
                          )}

                        </div>

                      </div>

                    </div>

                    {/* TIME */}

                    <div className="col-12 col-md-6">

                      <div className="meeting-info-box h-100">

                        <div className="meeting-info-label">

                          <i className="bi bi-clock text-primary"></i>

                          <span>
                            Waktu
                          </span>

                        </div>

                        <div className="meeting-info-value">

                          {formatTime(
                            selectedMeeting.start_time
                          )}

                          {" - "}

                          {selectedMeeting.end_time
                            ? formatTime(
                                selectedMeeting.end_time
                              )
                            : "-"}

                        </div>

                      </div>

                    </div>

                    {/* LOCATION */}

                    <div className="col-12">

                      <div className="meeting-info-box">

                        <div className="meeting-info-label">

                          <i className="bi bi-geo-alt text-primary"></i>

                          <span>
                            Lokasi
                          </span>

                        </div>

                        <div className="meeting-info-value meeting-break-word">

                          {
                            selectedMeeting.location ||
                            "-"
                          }

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      AGENDA
                  ================================================= */}

                  <div className="meeting-section-box">

                    <div className="meeting-section-title">

                      <i className="bi bi-list-task text-primary"></i>

                      <span>
                        Agenda
                      </span>

                    </div>

                    <div className="meeting-section-content">

                      {
                        selectedMeeting.agenda ||
                        "-"
                      }

                    </div>

                  </div>

                  {/* =================================================
                      MINUTES
                  ================================================= */}

                  <div className="meeting-section-box">

                    <div className="meeting-section-title">

                      <i className="bi bi-journal-text text-primary"></i>

                      <span>
                        Notulen
                      </span>

                    </div>

                    <div className="meeting-section-content">

                      {
                        selectedMeeting.minutes ||
                        "-"
                      }

                    </div>

                  </div>

                  {/* =================================================
                      PARTICIPANTS
                  ================================================= */}

                  <div className="meeting-participant-section">

                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">

                      <div className="meeting-section-title mb-0">

                        <i className="bi bi-people text-primary"></i>

                        <span>
                          Peserta Rapat
                        </span>

                      </div>

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
                              participant,
                              index
                            ) => (

                              <div
                                className="col-12 col-md-6"
                                key={
                                  participant.id ||
                                  index
                                }
                              >

                                <div className="meeting-participant-card">

                                  <div className="meeting-participant-avatar">

                                    <i className="bi bi-person"></i>

                                  </div>

                                  <div className="meeting-participant-info">

                                    <div className="meeting-participant-name">

                                      {
                                        getParticipantName(
                                          participant
                                        )
                                      }

                                    </div>

                                    <div className="meeting-participant-type">

                                      {
                                        getParticipantType(
                                          participant
                                        )
                                      }

                                    </div>

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

                <div className="meeting-detail-footer">

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

        /* =====================================================
           PAGE
        ===================================================== */

        .meeting-supervisor-page {
          width: 100%;
          min-height: 100%;
          background-color: #f8fafc;
          overflow-x: hidden;
        }

        .meeting-supervisor-content {
          padding: 1rem;
          max-width: 100%;
        }

        .meeting-supervisor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        /* =====================================================
           STAT ICON
        ===================================================== */

        .meeting-stat-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 1.05rem;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .empty-meeting-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;

          background-color: #f1f5f9;
          color: #64748b;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 1.35rem;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .meeting-supervisor-table {
          min-width: 950px;
        }

        .meeting-supervisor-table th {
          white-space: nowrap;
        }

        .meeting-supervisor-table td {
          vertical-align: middle;
        }

        /* =====================================================
           MODAL OVERLAY
        ===================================================== */

        .meeting-detail-overlay {
          position: fixed;
          inset: 0;

          width: 100vw;
          height: 100vh;

          background-color: rgba(
            15,
            23,
            42,
            0.55
          );

          z-index: 9999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 1rem;

          overflow: hidden;
        }

        /* =====================================================
           MODAL DIALOG
        ===================================================== */

        .meeting-detail-dialog {
          width: 100%;
          max-width: 700px;

          max-height: 85vh;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .meeting-detail-modal {
          width: 100%;
          max-height: 85vh;

          background-color: #ffffff;

          border-radius: 1rem;

          box-shadow:
            0 1rem 3rem
            rgba(15, 23, 42, 0.22);

          display: flex;
          flex-direction: column;

          overflow: hidden;
        }

        /* =====================================================
           MODAL HEADER
        ===================================================== */

        .meeting-detail-header {
          flex: 0 0 auto;

          min-height: 72px;

          padding: 1rem 1.25rem;

          border-bottom: 1px solid #e5e7eb;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 1rem;
        }

        .meeting-detail-icon {
          width: 38px;
          height: 38px;

          min-width: 38px;

          border-radius: 10px;

          background-color: #eff6ff;
          color: #2563eb;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* =====================================================
           MODAL BODY
        ===================================================== */

        .meeting-detail-body {
          flex: 1 1 auto;

          min-height: 0;

          overflow-y: auto;
          overflow-x: hidden;

          padding: 1rem 1.25rem;

          scrollbar-width: thin;
        }

        .meeting-detail-body::-webkit-scrollbar {
          width: 6px;
        }

        .meeting-detail-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .meeting-detail-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        /* =====================================================
           TITLE BOX
        ===================================================== */

        .meeting-detail-title-box {
          background-color: #f8fafc;

          border-radius: 0.85rem;

          padding: 1rem;

          margin-bottom: 0.75rem;

          border: 1px solid #f1f5f9;
        }

        .meeting-detail-title {
          word-break: break-word;
        }

        /* =====================================================
           INFO
        ===================================================== */

        .meeting-info-box {
          border: 1px solid #e5e7eb;

          border-radius: 0.7rem;

          padding: 0.8rem 0.9rem;

          background-color: #ffffff;
        }

        .meeting-info-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;

          color: #64748b;

          font-size: 0.75rem;

          font-weight: 600;

          margin-bottom: 0.3rem;
        }

        .meeting-info-value {
          font-size: 0.82rem;
          font-weight: 500;

          color: #1e293b;

          word-break: break-word;
        }

        .meeting-break-word {
          overflow-wrap: anywhere;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .meeting-section-box {
          border: 1px solid #e5e7eb;

          border-radius: 0.7rem;

          padding: 0.9rem;

          margin-bottom: 0.75rem;
        }

        .meeting-section-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          font-size: 0.82rem;

          font-weight: 600;

          color: #1e293b;

          margin-bottom: 0.5rem;
        }

        .meeting-section-content {
          color: #64748b;

          font-size: 0.8rem;

          line-height: 1.65;

          white-space: pre-wrap;

          word-break: break-word;

          overflow-wrap: anywhere;
        }

        /* =====================================================
           PARTICIPANTS
        ===================================================== */

        .meeting-participant-section {
          margin-bottom: 0.25rem;
        }

        .meeting-participant-card {
          min-width: 0;

          border: 1px solid #e5e7eb;

          border-radius: 0.7rem;

          padding: 0.65rem;

          display: flex;

          align-items: center;

          gap: 0.65rem;

          background-color: #ffffff;
        }

        .meeting-participant-avatar {
          width: 34px;
          height: 34px;

          min-width: 34px;

          border-radius: 50%;

          background-color: #eff6ff;
          color: #2563eb;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .meeting-participant-info {
          min-width: 0;
          flex: 1;
        }

        .meeting-participant-name {
          font-size: 0.78rem;

          font-weight: 600;

          color: #1e293b;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .meeting-participant-type {
          font-size: 0.7rem;

          color: #64748b;

          margin-top: 1px;
        }

        /* =====================================================
           MODAL FOOTER
        ===================================================== */

        .meeting-detail-footer {
          flex: 0 0 auto;

          min-height: 65px;

          padding: 0.75rem 1.25rem;

          border-top: 1px solid #e5e7eb;

          display: flex;

          justify-content: flex-end;

          align-items: center;
        }

        /* =====================================================
           BODY LOCK
        ===================================================== */

        body.meeting-supervisor-modal-open {
          overflow: hidden !important;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 991.98px) {

          .meeting-supervisor-content {
            padding: 1rem;
          }

          .meeting-detail-dialog {
            max-width: 680px;
          }

        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 767.98px) {

          .meeting-supervisor-content {
            padding: 0.75rem;
          }

          .meeting-supervisor-header {
            align-items: flex-start;

            flex-direction: column;
          }

          .meeting-supervisor-header .btn {
            width: 100%;
          }

          .meeting-supervisor-table {
            min-width: 900px;
          }

          .meeting-detail-overlay {
            padding: 0.65rem;
          }

          .meeting-detail-dialog {
            max-width: 100%;
            max-height: 90vh;
          }

          .meeting-detail-modal {
            max-height: 90vh;
            border-radius: 0.9rem;
          }

          .meeting-detail-header {
            padding: 0.85rem 1rem;
          }

          .meeting-detail-body {
            padding: 0.85rem 1rem;
          }

          .meeting-detail-footer {
            padding: 0.7rem 1rem;
          }

        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 575.98px) {

          .meeting-supervisor-content {
            padding: 0.65rem;
          }

          .meeting-stat-icon {
            width: 36px;
            height: 36px;

            min-width: 36px;

            font-size: 0.9rem;
          }

          .meeting-detail-overlay {
            padding: 0.4rem;
          }

          .meeting-detail-dialog {
            max-height: 92vh;
          }

          .meeting-detail-modal {
            max-height: 92vh;
            border-radius: 0.8rem;
          }

          .meeting-detail-header {
            min-height: 62px;

            padding: 0.75rem 0.85rem;
          }

          .meeting-detail-body {
            padding: 0.75rem 0.85rem;
          }

          .meeting-detail-footer {
            min-height: 58px;

            padding: 0.6rem 0.85rem;
          }

          .meeting-detail-title-box {
            padding: 0.8rem;
          }

          .meeting-info-box {
            padding: 0.7rem 0.75rem;
          }

          .meeting-section-box {
            padding: 0.75rem;
          }

        }

      `}</style>

    </div>
  );
};

export default MeetingSupervisorPage;