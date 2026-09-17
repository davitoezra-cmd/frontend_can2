// src/pages/MeetingFinancePage.jsx

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {apiFetch} from "../api/apiFetch";

import SidebarFinance from "../layouts/SidebarFinance";
import NavbarFinance from "../layouts/NavbarFinance";

const MeetingFinancePage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // =====================================================
  // GET MEETINGS
  // =====================================================

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch.get(
        "/finance/meetings"
      );

      const data =
        response?.data?.data ??
        response?.data ??
        [];

      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Gagal mengambil data meeting:",
        error
      );

      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // =====================================================
  // DETAIL MEETING
  // =====================================================

  const openDetail = async (meeting) => {
    try {
      const response = await apiFetch.get(
        `/finance/meetings/${meeting.id}`
      );

      const data =
        response?.data?.data ??
        response?.data ??
        meeting;

      setSelectedMeeting(data);
      setShowDetailModal(true);

      document.body.classList.add(
        "meeting-finance-modal-open"
      );
    } catch (error) {
      console.error(
        "Gagal mengambil detail meeting:",
        error
      );

      setSelectedMeeting(meeting);
      setShowDetailModal(true);

      document.body.classList.add(
        "meeting-finance-modal-open"
      );
    }
  };

  const closeDetail = () => {
    setSelectedMeeting(null);
    setShowDetailModal(false);

    document.body.classList.remove(
      "meeting-finance-modal-open"
    );
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
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) return "-";

    return String(time).slice(0, 5);
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (meeting) => {
    if (meeting?.status) {
      return meeting.status;
    }

    if (!meeting?.meeting_date) {
      return "scheduled";
    }

    const meetingDate = new Date(
      `${meeting.meeting_date}T${
        meeting.start_time || "00:00"
      }`
    );

    const now = new Date();

    if (meetingDate > now) {
      return "scheduled";
    }

    if (meeting.end_time) {
      const endDate = new Date(
        `${meeting.meeting_date}T${meeting.end_time}`
      );

      if (now <= endDate) {
        return "ongoing";
      }
    }

    return "completed";
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
      case "upcoming":
        return (
          <span className="badge rounded-pill bg-primary-subtle text-primary">
            Akan Datang
          </span>
        );

      case "ongoing":
        return (
          <span className="badge rounded-pill bg-success-subtle text-success">
            Berlangsung
          </span>
        );

      case "completed":
      case "finished":
        return (
          <span className="badge rounded-pill bg-secondary-subtle text-secondary">
            Selesai
          </span>
        );

      case "cancelled":
        return (
          <span className="badge rounded-pill bg-danger-subtle text-danger">
            Dibatalkan
          </span>
        );

      default:
        return (
          <span className="badge rounded-pill bg-light text-dark border">
            {status || "-"}
          </span>
        );
    }
  };

  // =====================================================
  // PARTICIPANT NAME
  // =====================================================

  const getParticipantName = (participant) => {
    const person = participant?.participant;

    if (!person) {
      return "-";
    }

    return (
      person.name ||
      person.full_name ||
      person.email ||
      "-"
    );
  };

  // =====================================================
  // PARTICIPANT TYPE
  // =====================================================

  const getParticipantType = (participant) => {
    const type =
      participant?.participant_type || "";

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

  // =====================================================
  // STATISTIC
  // =====================================================

  const totalMeetings = meetings.length;

  const upcomingMeetings = meetings.filter(
    (meeting) => {
      const status = getStatus(meeting);

      return (
        status === "scheduled" ||
        status === "upcoming"
      );
    }
  ).length;

  const completedMeetings = meetings.filter(
    (meeting) => {
      const status = getStatus(meeting);

      return (
        status === "completed" ||
        status === "finished"
      );
    }
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="meeting-finance-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <SidebarFinance
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        mobile={sidebarOpen}
      />

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="meeting-finance-main">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <NavbarFinance
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="container-fluid meeting-finance-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="meeting-page-header mb-4">

            <div>

              <div className="d-flex align-items-center gap-2 mb-1">

                <div className="meeting-page-icon">
                  <i className="bi bi-calendar-event"></i>
                </div>

                <h4 className="fw-bold mb-0">
                  Meeting
                </h4>

              </div>

              <p className="text-muted small mb-0">
                Lihat jadwal dan informasi meeting
                yang diikuti Finance.
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

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3 mb-4">

            {/* TOTAL */}

            <div className="col-12 col-md-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex align-items-center gap-3">

                    <div className="finance-stat-icon bg-primary-subtle text-primary">
                      <i className="bi bi-calendar-event"></i>
                    </div>

                    <div>

                      <div className="text-muted small">
                        Total Meeting
                      </div>

                      <div className="fs-4 fw-bold mt-1">
                        {totalMeetings}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* UPCOMING */}

            <div className="col-12 col-md-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex align-items-center gap-3">

                    <div className="finance-stat-icon bg-warning-subtle text-warning">
                      <i className="bi bi-calendar-plus"></i>
                    </div>

                    <div>

                      <div className="text-muted small">
                        Akan Datang
                      </div>

                      <div className="fs-4 fw-bold mt-1">
                        {upcomingMeetings}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="col-12 col-md-4">

              <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-3 p-md-4">

                  <div className="d-flex align-items-center gap-3">

                    <div className="finance-stat-icon bg-success-subtle text-success">
                      <i className="bi bi-check-circle"></i>
                    </div>

                    <div>

                      <div className="text-muted small">
                        Selesai
                      </div>

                      <div className="fs-4 fw-bold mt-1">
                        {completedMeetings}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            {/* HEADER */}

            <div className="card-header bg-white border-0 p-3 p-md-4">

              <h5 className="fw-bold mb-1">
                Daftar Meeting
              </h5>

              <small className="text-muted">
                Daftar kegiatan meeting yang tersedia
                untuk Finance.
              </small>

            </div>

            {/* BODY */}

            <div className="card-body p-0">

              {loading ? (

                <div className="text-center py-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  />

                  <p className="text-muted small mt-3 mb-0">
                    Memuat data meeting...
                  </p>

                </div>

              ) : meetings.length === 0 ? (

                <div className="text-center py-5 px-3">

                  <div className="empty-meeting-icon mx-auto mb-3">
                    <i className="bi bi-calendar-x"></i>
                  </div>

                  <h6 className="fw-bold">
                    Belum ada meeting
                  </h6>

                  <p className="text-muted small mb-0">
                    Belum terdapat jadwal meeting
                    untuk Finance.
                  </p>

                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover align-middle mb-0 meeting-finance-table">

                    <thead className="table-light">

                      <tr>

                        <th className="px-3 px-md-4 py-3">
                          Meeting
                        </th>

                        <th className="py-3">
                          Tanggal
                        </th>

                        <th className="py-3">
                          Waktu
                        </th>

                        <th className="py-3">
                          Lokasi
                        </th>

                        <th className="py-3">
                          Status
                        </th>

                        <th className="text-end px-3 px-md-4 py-3">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {meetings.map(
                        (meeting) => {

                          const status =
                            getStatus(meeting);

                          return (
                            <tr
                              key={meeting.id}
                            >

                              {/* TITLE */}

                              <td className="px-3 px-md-4">

                                <div className="fw-semibold text-dark">

                                  {meeting.title ||
                                    "Meeting"}

                                </div>

                                {meeting.agenda && (
                                  <div
                                    className="text-muted small text-truncate mt-1"
                                    style={{
                                      maxWidth: 280,
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

                                <div className="d-flex align-items-center gap-1">

                                  <i className="bi bi-clock text-muted"></i>

                                  <span>

                                    {formatTime(
                                      meeting.start_time
                                    )}

                                    {meeting.end_time && (
                                      <>
                                        {" - "}
                                        {formatTime(
                                          meeting.end_time
                                        )}
                                      </>
                                    )}

                                  </span>

                                </div>

                              </td>

                              {/* LOCATION */}

                              <td>

                                {meeting.location ? (
                                  <div
                                    className="d-flex align-items-center gap-1 small"
                                    style={{
                                      maxWidth: 180,
                                    }}
                                  >

                                    <i className="bi bi-geo-alt text-muted"></i>

                                    <span className="text-truncate">
                                      {meeting.location}
                                    </span>

                                  </div>
                                ) : (
                                  <span className="small text-muted">
                                    -
                                  </span>
                                )}

                              </td>

                              {/* STATUS */}

                              <td>
                                {getStatusBadge(
                                  status
                                )}
                              </td>

                              {/* ACTION */}

                              <td className="text-end px-3 px-md-4">

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                  onClick={() =>
                                    openDetail(
                                      meeting
                                    )
                                  }
                                >

                                  <i className="bi bi-eye"></i>

                                  <span className="d-none d-sm-inline">
                                    Detail
                                  </span>

                                </button>

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

          </div>

        </main>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetailModal &&
        selectedMeeting && (

          <div
            className="meeting-finance-modal-backdrop"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeDetail();
              }
            }}
          >

            <div className="meeting-finance-modal">

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="meeting-finance-modal-header">

                <div className="min-w-0">

                  <h5 className="fw-bold mb-1 text-truncate">

                    {selectedMeeting.title ||
                      "Detail Meeting"}

                  </h5>

                  <div className="text-muted small">
                    Informasi meeting
                  </div>

                </div>

                <button
                  type="button"
                  className="btn-close flex-shrink-0"
                  aria-label="Tutup"
                  onClick={closeDetail}
                />

              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="meeting-finance-modal-body">

                {/* STATUS */}

                <div className="meeting-detail-top">

                  <div>

                    <div className="text-muted small mb-1">
                      Status Meeting
                    </div>

                    {getStatusBadge(
                      getStatus(
                        selectedMeeting
                      )
                    )}

                  </div>

                </div>

                {/* INFORMATION GRID */}

                <div className="row g-2 mb-3">

                  {/* DATE */}

                  <div className="col-12 col-md-6">

                    <div className="meeting-info-box">

                      <div className="meeting-info-icon">
                        <i className="bi bi-calendar3"></i>
                      </div>

                      <div className="min-w-0">

                        <div className="text-muted small">
                          Tanggal
                        </div>

                        <div className="fw-semibold small mt-1">
                          {formatDate(
                            selectedMeeting.meeting_date
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* TIME */}

                  <div className="col-12 col-md-6">

                    <div className="meeting-info-box">

                      <div className="meeting-info-icon">
                        <i className="bi bi-clock"></i>
                      </div>

                      <div className="min-w-0">

                        <div className="text-muted small">
                          Waktu
                        </div>

                        <div className="fw-semibold small mt-1">

                          {formatTime(
                            selectedMeeting.start_time
                          )}

                          {selectedMeeting.end_time && (
                            <>
                              {" - "}
                              {formatTime(
                                selectedMeeting.end_time
                              )}
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* LOCATION */}

                  <div className="col-12">

                    <div className="meeting-info-box">

                      <div className="meeting-info-icon">
                        <i className="bi bi-geo-alt"></i>
                      </div>

                      <div className="min-w-0">

                        <div className="text-muted small">
                          Lokasi
                        </div>

                        <div className="fw-semibold small mt-1 text-break">
                          {selectedMeeting.location ||
                            "-"}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    AGENDA
                ================================================= */}

                <div className="meeting-detail-section">

                  <div className="meeting-section-title">

                    <i className="bi bi-list-task"></i>

                    <span>
                      Agenda
                    </span>

                  </div>

                  <div className="meeting-detail-text">

                    {selectedMeeting.agenda ||
                      "Tidak ada agenda."}

                  </div>

                </div>

                {/* =================================================
                    MINUTES
                ================================================= */}

                <div className="meeting-detail-section">

                  <div className="meeting-section-title">

                    <i className="bi bi-journal-text"></i>

                    <span>
                      Notulen
                    </span>

                  </div>

                  <div className="meeting-detail-text">

                    {selectedMeeting.minutes ||
                      "Notulen belum tersedia."}

                  </div>

                </div>

                {/* =================================================
                    PARTICIPANTS
                ================================================= */}

                <div className="meeting-detail-section">

                  <div className="d-flex justify-content-between align-items-center mb-2">

                    <div className="meeting-section-title mb-0">

                      <i className="bi bi-people"></i>

                      <span>
                        Peserta
                      </span>

                    </div>

                    <span className="badge bg-light text-secondary border rounded-pill">

                      {selectedMeeting
                        .participants
                        ?.length || 0}{" "}
                      peserta

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

                              <div className="meeting-participant">

                                <div className="participant-avatar">

                                  <i className="bi bi-person"></i>

                                </div>

                                <div className="min-w-0">

                                  <div className="fw-semibold small text-truncate">

                                    {getParticipantName(
                                      participant
                                    )}

                                  </div>

                                  <div className="text-muted small">

                                    {getParticipantType(
                                      participant
                                    )}

                                  </div>

                                </div>

                              </div>

                            </div>

                          )
                        )}

                    </div>

                  ) : (

                    <div className="meeting-no-participant">

                      <i className="bi bi-people me-2"></i>

                      Tidak ada data peserta.

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="meeting-finance-modal-footer">

                <button
                  type="button"
                  className="btn btn-light border px-4"
                  onClick={closeDetail}
                >
                  Tutup
                </button>

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

        .meeting-finance-page {
          min-height: 100vh;
          width: 100%;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .meeting-finance-main {
          min-width: 0;
          width: calc(100% - 250px);
          margin-left: 250px;
        }

        .meeting-finance-content {
          padding: 1rem;
        }

        /* =================================================
           HEADER
        ================================================= */

        .meeting-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .meeting-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #e0f2fe;
          color: #0284c7;

          flex-shrink: 0;
        }

        /* =================================================
           STATISTICS
        ================================================= */

        .finance-stat-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;

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
          width: 64px;
          height: 64px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #f1f5f9;
          color: #64748b;

          font-size: 1.5rem;
        }

        /* =================================================
           TABLE
        ================================================= */

        .meeting-finance-table {
          min-width: 900px;
        }

        .meeting-finance-table th {
          white-space: nowrap;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        .meeting-finance-table td {
          font-size: 0.875rem;
          vertical-align: middle;
        }

        .meeting-finance-page
          .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* =================================================
           MODAL BACKDROP
        ================================================= */

        .meeting-finance-modal-backdrop {
          position: fixed;
          inset: 0;

          z-index: 3000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 1.25rem;

          background: rgba(
            15,
            23,
            42,
            0.55
          );

          overflow-y: auto;
        }

        /* =================================================
           MODAL
        ================================================= */

        .meeting-finance-modal {
          position: relative;

          width: min(
            680px,
            100%
          );

          max-height: calc(100vh - 40px);

          display: flex;
          flex-direction: column;

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px rgba(
              15,
              23,
              42,
              0.20
            );

          overflow: hidden;
        }

        /* =================================================
           MODAL HEADER
        ================================================= */

        .meeting-finance-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 1rem;

          padding: 1rem 1.25rem;

          border-bottom: 1px solid #e5e7eb;

          flex-shrink: 0;
        }

        .meeting-finance-modal-header h5 {
          font-size: 1rem;
        }

        /* =================================================
           MODAL BODY
        ================================================= */

        .meeting-finance-modal-body {
          padding: 1rem 1.25rem;

          overflow-y: auto;

          min-height: 0;
        }

        /* =================================================
           MODAL TOP
        ================================================= */

        .meeting-detail-top {
          padding: 0.75rem;

          margin-bottom: 0.75rem;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 12px;
        }

        /* =================================================
           INFORMATION BOX
        ================================================= */

        .meeting-info-box {
          display: flex;
          align-items: center;

          gap: 0.7rem;

          height: 100%;

          padding: 0.75rem;

          border: 1px solid #e5e7eb;

          border-radius: 11px;

          background: #ffffff;
        }

        .meeting-info-icon {
          width: 34px;
          height: 34px;
          min-width: 34px;

          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #eff6ff;
          color: #2563eb;

          font-size: 0.9rem;
        }

        /* =================================================
           DETAIL SECTION
        ================================================= */

        .meeting-detail-section {
          padding: 0.8rem;

          margin-bottom: 0.75rem;

          border: 1px solid #e5e7eb;

          border-radius: 11px;

          background: #ffffff;
        }

        .meeting-section-title {
          display: flex;
          align-items: center;

          gap: 0.5rem;

          margin-bottom: 0.5rem;

          font-size: 0.8rem;

          font-weight: 600;

          color: #334155;
        }

        .meeting-section-title i {
          color: #2563eb;
        }

        .meeting-detail-text {
          color: #64748b;

          font-size: 0.8rem;

          line-height: 1.6;

          white-space: pre-wrap;

          word-break: break-word;
        }

        /* =================================================
           PARTICIPANT
        ================================================= */

        .meeting-participant {
          display: flex;
          align-items: center;

          gap: 0.65rem;

          min-width: 0;

          padding: 0.65rem;

          border: 1px solid #e5e7eb;

          border-radius: 10px;

          background: #fff;
        }

        .participant-avatar {
          width: 32px;
          height: 32px;

          min-width: 32px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #eff6ff;
          color: #2563eb;

          font-size: 0.8rem;
        }

        .meeting-no-participant {
          padding: 0.7rem;

          border-radius: 9px;

          background: #f8fafc;

          color: #64748b;

          font-size: 0.8rem;
        }

        /* =================================================
           MODAL FOOTER
        ================================================= */

        .meeting-finance-modal-footer {
          display: flex;
          justify-content: flex-end;

          padding: 0.75rem 1.25rem;

          border-top: 1px solid #e5e7eb;

          flex-shrink: 0;

          background: #fff;
        }

        /* =================================================
           BODY LOCK
        ================================================= */

        body.meeting-finance-modal-open {
          overflow: hidden;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 991.98px) {

          .meeting-finance-main {
            width: 100%;
            margin-left: 0;
          }

          .meeting-finance-content {
            padding: 1rem;
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 767.98px) {

          .meeting-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .meeting-page-header
            > .btn {
            width: 100%;
          }

          .meeting-finance-content {
            padding: 0.75rem;
          }

          .meeting-finance-table {
            min-width: 850px;
          }

          /* MODAL */

          .meeting-finance-modal-backdrop {
            align-items: center;

            padding: 0.75rem;
          }

          .meeting-finance-modal {
            width: 100%;

            max-height: calc(
              100vh - 24px
            );

            border-radius: 15px;
          }

          .meeting-finance-modal-header {
            padding: 0.85rem 1rem;
          }

          .meeting-finance-modal-body {
            padding: 0.85rem 1rem;
          }

          .meeting-finance-modal-footer {
            padding: 0.7rem 1rem;
          }

        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 575.98px) {

          .meeting-finance-content {
            padding: 0.65rem;
          }

          .meeting-page-icon {
            width: 38px;
            height: 38px;
          }

          .meeting-page-header h4 {
            font-size: 1.25rem;
          }

          .finance-stat-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
          }

          /* MODAL */

          .meeting-finance-modal-backdrop {
            padding: 0.5rem;
          }

          .meeting-finance-modal {
            max-height: calc(
              100vh - 16px
            );

            border-radius: 13px;
          }

          .meeting-finance-modal-header {
            padding: 0.75rem 0.85rem;
          }

          .meeting-finance-modal-body {
            padding: 0.75rem 0.85rem;
          }

          .meeting-finance-modal-footer {
            padding: 0.65rem 0.85rem;
          }

          .meeting-detail-section {
            padding: 0.7rem;
          }

          .meeting-info-box {
            padding: 0.65rem;
          }

        }

      `}</style>

    </div>
  );
};

export default MeetingFinancePage;