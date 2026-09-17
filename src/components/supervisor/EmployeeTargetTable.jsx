import React from "react";

const EmployeeTargetTable = ({
  targets = [],
  onDetail,
}) => {
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
  // STATUS
  // =====================================================

  const renderStatusBadge = (status) => {
    const normalizedStatus =
      String(status || "ongoing").toLowerCase();

    switch (normalizedStatus) {
      case "completed":
        return (
          <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-2 text-nowrap">
            <i className="bi bi-check-circle-fill me-1"></i>
            Selesai
          </span>
        );

      case "not_achieved":
        return (
          <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2 py-2 text-nowrap">
            <i className="bi bi-x-circle-fill me-1"></i>
            Tidak Tercapai
          </span>
        );

      case "ongoing":
        return (
          <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2 py-2 text-nowrap">
            <i className="bi bi-hourglass-split me-1"></i>
            Berjalan
          </span>
        );

      case "pending":
        return (
          <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-2 text-nowrap">
            <i className="bi bi-clock-fill me-1"></i>
            Menunggu
          </span>
        );

      default:
        return (
          <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-2 text-nowrap">
            {status || "-"}
          </span>
        );
    }
  };

  // =====================================================
  // INITIAL
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "EP";
    }

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
  // EMPTY STATE
  // =====================================================

  if (!targets || targets.length === 0) {
    return (
      <div
        className="w-100 d-flex flex-column align-items-center justify-content-center text-center"
        style={{
          minHeight: "280px",
          padding: "30px 20px",
        }}
      >
        <div
          className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mb-3"
          style={{
            width: "60px",
            height: "60px",
          }}
        >
          <i
            className="bi bi-bullseye"
            style={{
              fontSize: "24px",
            }}
          ></i>
        </div>

        <h6 className="fw-semibold mb-1">
          Belum Ada Target
        </h6>

        <p className="text-muted small mb-0">
          Belum ada target kinerja anggota tim Anda.
        </p>
      </div>
    );
  }

  // =====================================================
  // TABLE
  // =====================================================

  return (
    <div
      className="w-100"
      style={{
        minWidth: 0,
      }}
    >
      <div
        className="table-responsive"
        style={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table
          className="table table-hover align-middle mb-0"
          style={{
            minWidth: "1050px",
          }}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <thead className="table-light">
            <tr>
              {/* NO */}
              <th
                className="ps-3 text-nowrap"
                style={{
                  width: "55px",
                }}
              >
                No
              </th>

              {/* PEGAWAI */}
              <th
                className="text-nowrap"
                style={{
                  width: "180px",
                  minWidth: "180px",
                }}
              >
                Pegawai
              </th>

              {/* SUPERVISOR */}
              <th
                className="text-nowrap"
                style={{
                  width: "170px",
                  minWidth: "170px",
                }}
              >
                Supervisor
              </th>

              {/* JUDUL */}
              <th
                className="text-nowrap"
                style={{
                  width: "220px",
                  minWidth: "220px",
                }}
              >
                Judul Target
              </th>

              {/* KATEGORI */}
              <th
                className="text-nowrap"
                style={{
                  width: "120px",
                  minWidth: "120px",
                }}
              >
                Kategori
              </th>

              {/* NILAI TARGET */}
              <th
                className="text-center text-nowrap"
                style={{
                  width: "100px",
                  minWidth: "100px",
                }}
              >
                Nilai Target
              </th>

              {/* PERIODE */}
              <th
                className="text-nowrap"
                style={{
                  width: "165px",
                  minWidth: "165px",
                }}
              >
                Periode
              </th>

              {/* STATUS */}
              <th
                className="text-nowrap"
                style={{
                  width: "140px",
                  minWidth: "140px",
                }}
              >
                Status
              </th>

              {/* AKSI */}
              <th
                className="text-center text-nowrap pe-3"
                style={{
                  width: "75px",
                  minWidth: "75px",
                }}
              >
                Aksi
              </th>
            </tr>
          </thead>

          {/* =================================================
              BODY
          ================================================= */}

          <tbody>
            {targets.map((item, index) => {
              const employeeName =
                item.employee?.name ||
                item.employee?.nama ||
                "Karyawan";

              const employeeCode =
                item.employee?.employee_code ||
                item.employee?.employeeCode ||
                "-";

              const supervisorName =
                item.supervisor?.name ||
                item.supervisor?.nama ||
                "-";

              const targetValue =
                Number(item.target_value) || 0;

              return (
                <tr key={item.id || index}>

                  {/* =========================================
                      NO
                  ========================================= */}

                  <td className="ps-3 text-muted small">
                    {index + 1}
                  </td>

                  {/* =========================================
                      PEGAWAI
                  ========================================= */}

                  <td>
                    <div className="d-flex align-items-center gap-2">

                      {/* INITIAL */}
                      <div
                        className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "38px",
                          height: "38px",
                          fontSize: "11px",
                        }}
                      >
                        {getInitials(employeeName)}
                      </div>

                      {/* NAME */}
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          className="fw-semibold text-dark text-truncate"
                          style={{
                            maxWidth: "125px",
                            fontSize: "13px",
                          }}
                          title={employeeName}
                        >
                          {employeeName}
                        </div>

                        <small
                          className="text-muted d-block text-truncate"
                          style={{
                            maxWidth: "125px",
                            fontSize: "10px",
                          }}
                          title={employeeCode}
                        >
                          {employeeCode}
                        </small>
                      </div>

                    </div>
                  </td>

                  {/* =========================================
                      SUPERVISOR
                  ========================================= */}

                  <td>
                    <div className="d-flex align-items-center gap-2">

                      <div
                        className="bg-light text-secondary border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "34px",
                          height: "34px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(supervisorName)}
                      </div>

                      <div
                        className="text-dark text-truncate"
                        style={{
                          maxWidth: "115px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                        title={supervisorName}
                      >
                        {supervisorName}
                      </div>

                    </div>
                  </td>

                  {/* =========================================
                      JUDUL TARGET
                  ========================================= */}

                  <td>
                    <div
                      className="fw-semibold text-dark"
                      style={{
                        maxWidth: "200px",
                        fontSize: "13px",
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                      }}
                      title={item.title || ""}
                    >
                      {item.title || "-"}
                    </div>

                    {/* DESCRIPTION */}
                    {item.description && (
                      <div
                        className="text-muted mt-1 text-truncate"
                        style={{
                          maxWidth: "200px",
                          fontSize: "10px",
                        }}
                        title={item.description}
                      >
                        {item.description}
                      </div>
                    )}
                  </td>

                  {/* =========================================
                      KATEGORI
                  ========================================= */}

                  <td>
                    {item.category ? (
                      <span
                        className="badge bg-light text-dark border rounded-pill px-2 py-2"
                        style={{
                          maxWidth: "105px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "10px",
                        }}
                        title={item.category}
                      >
                        <i className="bi bi-tag me-1"></i>
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-muted small">
                        Umum
                      </span>
                    )}
                  </td>

                  {/* =========================================
                      NILAI TARGET
                  ========================================= */}

                  <td className="text-center">
                    <span
                      className="fw-bold text-primary"
                      style={{
                        fontSize: "15px",
                      }}
                    >
                      {targetValue}
                    </span>
                  </td>

                  {/* =========================================
                      PERIODE
                  ========================================= */}

                  <td>
                    <div
                      className="small"
                      style={{
                        lineHeight: "1.6",
                      }}
                    >
                      <div className="text-dark">
                        <i className="bi bi-calendar-event me-1 text-primary"></i>
                        {formatDate(item.start_date)}
                      </div>

                      <div className="text-muted">
                        <i className="bi bi-arrow-down-short me-1"></i>
                        {formatDate(item.end_date)}
                      </div>
                    </div>
                  </td>

                  {/* =========================================
                      STATUS
                  ========================================= */}

                  <td>
                    {renderStatusBadge(item.status)}
                  </td>

                  {/* =========================================
                      AKSI
                  ========================================= */}

                  <td className="pe-3">
                    <div className="d-flex justify-content-center">

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center justify-content-center"
                        title="Lihat Detail Target"
                        onClick={() => onDetail?.(item)}
                        style={{
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <i className="bi bi-eye"></i>
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          RESPONSIVE
      ===================================================== */}

      <style>
        {`
          .employee-target-table-wrapper {
            width: 100%;
            overflow-x: auto;
          }

          .employee-target-table-wrapper table {
            margin-bottom: 0;
          }

          .employee-target-table-wrapper th {
            font-size: 11px;
            font-weight: 700;
            color: #495057;
            white-space: nowrap;
            vertical-align: middle;
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .employee-target-table-wrapper td {
            font-size: 12px;
            vertical-align: middle;
            padding-top: 11px;
            padding-bottom: 11px;
          }

          @media (max-width: 768px) {
            .employee-target-table-wrapper table {
              min-width: 1050px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default React.memo(EmployeeTargetTable);
