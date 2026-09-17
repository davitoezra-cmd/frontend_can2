import React from "react";

const EmployeeTargetDetailModal = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  // =====================================================
  // PROGRESS
  // =====================================================

  const targetValue = Number(data.target_value) || 0;
  const currentValue = Number(data.current_value) || 0;

  const percent =
    targetValue > 0
      ? Math.min(
          100,
          Math.round((currentValue / targetValue) * 100)
        )
      : 0;

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // =====================================================
  // INITIAL
  // =====================================================

  const getInitials = (name) => {
    if (!name) return "EP";

    const words = String(name)
      .trim()
      .split(/\s+/);

    if (words.length >= 2) {
      return (
        words[0].charAt(0) +
        words[1].charAt(0)
      ).toUpperCase();
    }

    return String(name)
      .substring(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // STATUS
  // =====================================================

  const renderStatus = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "completed":
        return (
          <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2">
            <i className="bi bi-check-circle-fill me-1"></i>
            Selesai
          </span>
        );

      case "ongoing":
        return (
          <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
            <i className="bi bi-hourglass-split me-1"></i>
            Berjalan
          </span>
        );

      case "not_achieved":
        return (
          <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
            <i className="bi bi-x-circle-fill me-1"></i>
            Tidak Tercapai
          </span>
        );

      case "pending":
        return (
          <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2">
            <i className="bi bi-clock-fill me-1"></i>
            Menunggu
          </span>
        );

      default:
        return (
          <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2">
            {status || "-"}
          </span>
        );
    }
  };

  // =====================================================
  // PROGRESS COLOR
  // =====================================================

  const getProgressClass = () => {
    if (percent >= 100) return "bg-success";
    if (percent >= 70) return "bg-primary";
    if (percent >= 40) return "bg-warning";
    return "bg-danger";
  };

  return (
    <>
      <style>
        {`
          .employee-target-detail-overlay {
            position: fixed;
            inset: 0;
            z-index: 1055;
            background: rgba(15, 23, 42, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .employee-target-detail-dialog {
            width: 100%;
            max-width: 1100px;
            max-height: calc(100vh - 40px);
            margin: 0;
            display: flex;
            flex-direction: column;
          }

          .employee-target-detail-content {
            width: 100%;
            max-height: calc(100vh - 40px);
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border: 0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.18);
          }

          .employee-target-detail-header {
            flex-shrink: 0;
            padding: 18px 24px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            background: #ffffff;
          }

          .employee-target-detail-header-icon {
            width: 44px;
            height: 44px;
            flex-shrink: 0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e7f1ff;
            color: #0d6efd;
            font-size: 18px;
          }

          .employee-target-detail-title {
            margin: 0;
            font-size: 17px;
            font-weight: 700;
            color: #212529;
          }

          .employee-target-detail-subtitle {
            margin: 3px 0 0;
            font-size: 12px;
            color: #8a9199;
          }

          .employee-target-detail-body {
            flex: 1 1 auto;
            overflow-y: auto;
            padding: 22px 24px;
          }

          .employee-target-detail-body::-webkit-scrollbar {
            width: 6px;
          }

          .employee-target-detail-body::-webkit-scrollbar-track {
            background: #f8f9fa;
          }

          .employee-target-detail-body::-webkit-scrollbar-thumb {
            background: #ced4da;
            border-radius: 10px;
          }

          .employee-target-profile {
            padding: 16px;
            border-radius: 10px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            margin-bottom: 16px;
          }

          .employee-target-avatar {
            width: 54px;
            height: 54px;
            flex-shrink: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0d6efd;
            color: #ffffff;
            font-weight: 700;
            font-size: 15px;
          }

          .employee-target-detail-card {
            height: 100%;
            padding: 16px;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            background: #ffffff;
          }

          .employee-target-detail-label {
            display: block;
            margin-bottom: 5px;
            font-size: 11px;
            color: #8a9199;
            font-weight: 600;
          }

          .employee-target-detail-value {
            font-size: 13px;
            color: #212529;
            line-height: 1.5;
          }

          .employee-target-progress-percent {
            font-size: 26px;
            font-weight: 700;
            color: #0d6efd;
          }

          .employee-target-progress {
            height: 10px;
            border-radius: 10px;
            overflow: hidden;
          }

          .employee-target-progress .progress-bar {
            border-radius: 10px;
          }

          .employee-target-notes {
            padding: 16px;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            background: #f8f9fa;
          }

          .employee-target-detail-footer {
            flex-shrink: 0;
            padding: 14px 24px;
            border-top: 1px solid #e9ecef;
            background: #ffffff;
            display: flex;
            justify-content: flex-end;
          }

          .employee-target-detail-footer .btn {
            min-height: 40px;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
          }

          @media (max-width: 991.98px) {
            .employee-target-detail-dialog {
              max-width: 900px;
            }
          }

          @media (max-width: 767.98px) {
            .employee-target-detail-overlay {
              padding: 12px;
            }

            .employee-target-detail-dialog {
              max-height: calc(100vh - 24px);
            }

            .employee-target-detail-content {
              max-height: calc(100vh - 24px);
              border-radius: 12px;
            }

            .employee-target-detail-header {
              padding: 15px 17px;
            }

            .employee-target-detail-body {
              padding: 17px;
            }

            .employee-target-detail-footer {
              padding: 12px 17px;
            }

            .employee-target-detail-title {
              font-size: 15px;
            }

            .employee-target-detail-subtitle {
              font-size: 11px;
            }

            .employee-target-profile {
              padding: 14px;
            }
          }

          @media (max-width: 575.98px) {
            .employee-target-detail-overlay {
              padding: 8px;
            }

            .employee-target-detail-dialog {
              max-height: calc(100vh - 16px);
            }

            .employee-target-detail-content {
              max-height: calc(100vh - 16px);
              border-radius: 10px;
            }

            .employee-target-detail-header {
              padding: 13px 15px;
            }

            .employee-target-detail-body {
              padding: 15px;
            }

            .employee-target-detail-footer {
              padding: 11px 15px;
            }

            .employee-target-detail-header-icon {
              width: 38px;
              height: 38px;
              font-size: 16px;
            }

            .employee-target-avatar {
              width: 46px;
              height: 46px;
            }
          }
        `}
      </style>

      <div
        className="employee-target-detail-overlay"
        onClick={onClose}
      >
        <div
          className="employee-target-detail-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="employee-target-detail-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-target-detail-header">

              <div className="d-flex align-items-center gap-3">

                <div className="employee-target-detail-header-icon">
                  <i className="bi bi-bullseye"></i>
                </div>

                <div>
                  <h5 className="employee-target-detail-title">
                    Detail Target Kinerja
                  </h5>

                  <p className="employee-target-detail-subtitle">
                    Informasi target pegawai
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />

            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="employee-target-detail-body">

              {/* =================================================
                  PROFIL
              ================================================= */}

              <div className="employee-target-profile">

                <div className="row align-items-center g-3">

                  <div className="col-12 col-md-7">

                    <div className="d-flex align-items-center gap-3">

                      <div className="employee-target-avatar">
                        {getInitials(data.employee?.name)}
                      </div>

                      <div>
                        <small className="text-muted d-block">
                          Pegawai
                        </small>

                        <h6 className="fw-bold text-dark mb-0">
                          {data.employee?.name || "Karyawan"}
                        </h6>

                        <small className="text-muted">
                          Kode:{" "}
                          {data.employee?.employee_code || "-"}
                        </small>
                      </div>

                    </div>

                  </div>

                  <div className="col-12 col-md-5">

                    <div className="text-md-end">

                      <small className="text-muted d-block">
                        Supervisor
                      </small>

                      <span className="fw-semibold text-dark">
                        {data.supervisor?.name || "-"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  INFORMASI TARGET
              ================================================= */}

              <div className="row g-3">

                {/* JUDUL */}

                <div className="col-12 col-lg-8">

                  <div className="employee-target-detail-card">

                    <span className="employee-target-detail-label">
                      <i className="bi bi-bullseye me-1"></i>
                      Judul Target
                    </span>

                    <div className="fw-bold text-dark">
                      {data.title || "-"}
                    </div>

                  </div>

                </div>

                {/* KATEGORI */}

                <div className="col-12 col-lg-4">

                  <div className="employee-target-detail-card">

                    <span className="employee-target-detail-label">
                      <i className="bi bi-tags me-1"></i>
                      Kategori
                    </span>

                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                      {data.category || "Umum"}
                    </span>

                  </div>

                </div>

                {/* DESKRIPSI */}

                <div className="col-12">

                  <div className="employee-target-detail-card">

                    <span className="employee-target-detail-label">
                      <i className="bi bi-card-text me-1"></i>
                      Deskripsi
                    </span>

                    <div
                      className="employee-target-detail-value"
                      style={{
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {data.description ||
                        "Tidak ada deskripsi."}
                    </div>

                  </div>

                </div>

                {/* =================================================
                    PROGRESS
                ================================================= */}

                <div className="col-12 col-lg-7">

                  <div className="employee-target-detail-card">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <div>
                        <span className="employee-target-detail-label mb-0">
                          Progress
                        </span>

                        <span className="fw-semibold">
                          Capaian Target
                        </span>
                      </div>

                      <strong className="employee-target-progress-percent">
                        {percent}%
                      </strong>

                    </div>

                    <div className="progress employee-target-progress">

                      <div
                        className={`progress-bar ${getProgressClass()}`}
                        style={{
                          width: `${percent}%`,
                        }}
                      />

                    </div>

                    <div className="d-flex justify-content-between mt-2 small">

                      <span className="text-muted">
                        Tercapai:{" "}
                        <strong className="text-dark">
                          {currentValue}
                        </strong>
                      </span>

                      <span className="text-muted">
                        Target:{" "}
                        <strong className="text-dark">
                          {targetValue}
                        </strong>
                      </span>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    PERIODE + STATUS
                ================================================= */}

                <div className="col-12 col-lg-5">

                  <div className="employee-target-detail-card">

                    <div className="row g-3">

                      <div className="col-6">

                        <span className="employee-target-detail-label">
                          <i className="bi bi-calendar-event me-1"></i>
                          Mulai
                        </span>

                        <span className="fw-semibold small">
                          {formatDate(data.start_date)}
                        </span>

                      </div>

                      <div className="col-6">

                        <span className="employee-target-detail-label">
                          <i className="bi bi-calendar-check me-1"></i>
                          Selesai
                        </span>

                        <span className="fw-semibold small">
                          {formatDate(data.end_date)}
                        </span>

                      </div>

                      <div className="col-12">

                        <span className="employee-target-detail-label mb-2">
                          <i className="bi bi-activity me-1"></i>
                          Status
                        </span>

                        {renderStatus(data.status)}

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    CATATAN
                ================================================= */}

                <div className="col-12">

                  <div className="employee-target-notes">

                    <span className="employee-target-detail-label">
                      <i className="bi bi-chat-left-text me-1"></i>
                      Catatan Supervisor
                    </span>

                    <div
                      className="small text-dark"
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.5",
                      }}
                    >
                      {data.notes || "-"}
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="employee-target-detail-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-2"></i>
                Tutup
              </button>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(EmployeeTargetDetailModal);
