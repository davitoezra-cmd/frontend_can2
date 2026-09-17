import React from "react";

const EmployeeTargetTable = ({
    targets = [],
    onDetail,
    onUpdateProgress,
}) => {

    // =====================================================
    // PROGRESS COLOR
    // =====================================================

    const getProgressBarClass = (percent) => {
        if (percent >= 80) return "bg-success";
        if (percent >= 40) return "bg-warning";
        return "bg-danger";
    };

    // =====================================================
    // STATUS BADGE
    // =====================================================

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1">
                        <i className="bi bi-check-circle me-1"></i>
                        Completed
                    </span>
                );

            case "ongoing":
                return (
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Ongoing
                    </span>
                );

            case "not_achieved":
                return (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                        <i className="bi bi-x-circle me-1"></i>
                        Not Achieved
                    </span>
                );

            default:
                return (
                    <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-1">
                        {status || "-"}
                    </span>
                );
        }
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (dateString) => {
        if (!dateString) return "-";

        return new Date(dateString).toLocaleDateString(
            "id-ID",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // EMPTY DATA
    // =====================================================

    if (!targets || targets.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                Tidak ada data target.
            </div>
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            {/* =================================================
                TABLE RESPONSIVE WRAPPER
            ================================================= */}

            <div className="employee-target-table-responsive">

                <table className="table table-hover align-middle mb-0 employee-target-table">

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead className="table-light">
                        <tr>

                            <th
                                style={{
                                    width: "55px",
                                    minWidth: "55px",
                                }}
                                className="ps-3"
                            >
                                No
                            </th>

                            <th
                                style={{
                                    minWidth: "220px",
                                }}
                            >
                                Judul Target
                            </th>

                            <th
                                style={{
                                    minWidth: "120px",
                                }}
                            >
                                Kategori
                            </th>

                            <th
                                style={{
                                    minWidth: "170px",
                                }}
                            >
                                Supervisor
                            </th>

                            <th
                                style={{
                                    minWidth: "190px",
                                }}
                            >
                                Periode
                            </th>

                            <th
                                style={{
                                    minWidth: "90px",
                                }}
                            >
                                Target
                            </th>

                            <th
                                style={{
                                    minWidth: "180px",
                                }}
                            >
                                Progress
                            </th>

                            <th
                                style={{
                                    minWidth: "130px",
                                }}
                            >
                                Status
                            </th>

                            <th
                                style={{
                                    minWidth: "145px",
                                }}
                                className="text-end pe-3"
                            >
                                Aksi
                            </th>

                        </tr>
                    </thead>

                    {/* =================================================
                        TABLE BODY
                    ================================================= */}

                    <tbody>

                        {targets.map((item, index) => {

                            const percent = Math.min(
                                100,
                                Math.max(
                                    0,
                                    Number(
                                        item.progress_percent
                                    ) || 0
                                )
                            );

                            const progressColor =
                                getProgressBarClass(
                                    percent
                                );

                            const supervisorName =
                                item.supervisor?.name ||
                                "-";

                            const supervisorInitial =
                                supervisorName !== "-"
                                    ? supervisorName
                                          .substring(0, 2)
                                          .toUpperCase()
                                    : "SP";

                            return (
                                <tr
                                    key={
                                        item.id ||
                                        index
                                    }
                                >

                                    {/* ==============================
                                        NO
                                    ============================== */}

                                    <td className="ps-3 fw-medium text-muted">
                                        {index + 1}
                                    </td>

                                    {/* ==============================
                                        JUDUL
                                    ============================== */}

                                    <td>
                                        <div
                                            className="
                                                employee-target-title
                                                fw-semibold
                                                text-dark
                                            "
                                            title={
                                                item.title ||
                                                item.judul ||
                                                "-"
                                            }
                                        >
                                            {item.title ||
                                                item.judul ||
                                                "-"}
                                        </div>
                                    </td>

                                    {/* ==============================
                                        KATEGORI
                                    ============================== */}

                                    <td>
                                        <span
                                            className="
                                                badge
                                                bg-light
                                                text-dark
                                                border
                                                px-2
                                                py-1
                                                rounded-2
                                            "
                                        >
                                            {item.category ||
                                                item.kategori ||
                                                "Umum"}
                                        </span>
                                    </td>

                                    {/* ==============================
                                        SUPERVISOR
                                    ============================== */}

                                    <td>
                                        <div className="d-flex align-items-center gap-2">

                                            <div
                                                className="
                                                    bg-primary
                                                    text-white
                                                    rounded-circle
                                                    d-flex
                                                    align-items-center
                                                    justify-content-center
                                                    fw-bold
                                                    flex-shrink-0
                                                "
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    fontSize:
                                                        "10px",
                                                }}
                                            >
                                                {
                                                    supervisorInitial
                                                }
                                            </div>

                                            <span
                                                className="
                                                    small
                                                    text-dark
                                                    fw-medium
                                                    employee-target-supervisor
                                                "
                                                title={
                                                    supervisorName
                                                }
                                            >
                                                {
                                                    supervisorName
                                                }
                                            </span>

                                        </div>
                                    </td>

                                    {/* ==============================
                                        PERIODE
                                    ============================== */}

                                    <td className="small text-muted">
                                        <div className="employee-target-period">
                                            {formatDate(
                                                item.start_date
                                            )}

                                            <span className="mx-1">
                                                -
                                            </span>

                                            {formatDate(
                                                item.end_date
                                            )}
                                        </div>
                                    </td>

                                    {/* ==============================
                                        TARGET
                                    ============================== */}

                                    <td>
                                        <span className="fw-semibold text-dark">
                                            {
                                                item.target_value
                                            }
                                        </span>
                                    </td>

                                    {/* ==============================
                                        PROGRESS
                                    ============================== */}

                                    <td>
                                        <div className="employee-target-progress">

                                            <div
                                                className="
                                                    d-flex
                                                    justify-content-between
                                                    align-items-center
                                                    mb-1
                                                "
                                            >

                                                <span
                                                    className="fw-bold"
                                                    style={{
                                                        fontSize:
                                                            "12px",
                                                    }}
                                                >
                                                    {percent}%
                                                </span>

                                                <span
                                                    className="text-muted"
                                                    style={{
                                                        fontSize:
                                                            "11px",
                                                    }}
                                                >
                                                    {item.current_value ||
                                                        0}{" "}
                                                    /{" "}
                                                    {
                                                        item.target_value
                                                    }
                                                </span>

                                            </div>

                                            <div
                                                className="
                                                    progress
                                                    rounded-pill
                                                "
                                                style={{
                                                    height:
                                                        "7px",
                                                }}
                                            >
                                                <div
                                                    className={`
                                                        progress-bar
                                                        ${progressColor}
                                                        progress-bar-striped
                                                    `}
                                                    role="progressbar"
                                                    style={{
                                                        width: `${percent}%`,
                                                    }}
                                                    aria-valuenow={
                                                        percent
                                                    }
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>

                                        </div>
                                    </td>

                                    {/* ==============================
                                        STATUS
                                    ============================== */}

                                    <td>
                                        {getStatusBadge(
                                            item.status
                                        )}
                                    </td>

                                    {/* ==============================
                                        AKSI
                                    ============================== */}

                                    <td className="text-end pe-3">

                                        <div
                                            className="
                                                d-inline-flex
                                                align-items-center
                                                gap-1
                                                employee-target-actions
                                            "
                                        >

                                            {/* DETAIL */}

                                            <button
                                                type="button"
                                                className="
                                                    btn
                                                    btn-sm
                                                    btn-outline-primary
                                                    rounded-3
                                                    d-inline-flex
                                                    align-items-center
                                                    justify-content-center
                                                    gap-1
                                                "
                                                onClick={() =>
                                                    onDetail &&
                                                    onDetail(
                                                        item
                                                    )
                                                }
                                                title="Lihat Detail"
                                            >
                                                <i className="bi bi-eye"></i>

                                                <span className="d-none d-lg-inline">
                                                    Detail
                                                </span>
                                            </button>

                                            {/* UPDATE */}

                                            <button
                                                type="button"
                                                className="
                                                    btn
                                                    btn-sm
                                                    btn-primary
                                                    rounded-3
                                                    d-inline-flex
                                                    align-items-center
                                                    justify-content-center
                                                    gap-1
                                                "
                                                onClick={() =>
                                                    onUpdateProgress &&
                                                    onUpdateProgress(
                                                        item
                                                    )
                                                }
                                                title="Update Progress"
                                            >
                                                <i className="bi bi-pencil-square"></i>

                                                <span className="d-none d-lg-inline">
                                                    Update
                                                </span>
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            );
                        })}

                    </tbody>

                </table>

            </div>

            {/* =================================================
                RESPONSIVE STYLE
            ================================================= */}

            <style>{`

                /* ================================================
                   DESKTOP
                ================================================ */

                .employee-target-table-responsive {
                    width: 100%;
                    max-width: 100%;
                    overflow-x: auto;
                    overflow-y: hidden;

                    -webkit-overflow-scrolling: touch;

                    scrollbar-width: thin;
                }

                .employee-target-table {
                    width: 100%;
                    min-width: 1200px;
                }

                .employee-target-table th,
                .employee-target-table td {
                    vertical-align: middle;
                    white-space: nowrap;
                }


                /* ================================================
                   TITLE
                ================================================ */

                .employee-target-title {
                    max-width: 220px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }


                /* ================================================
                   SUPERVISOR
                ================================================ */

                .employee-target-supervisor {
                    display: inline-block;
                    max-width: 130px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }


                /* ================================================
                   PERIOD
                ================================================ */

                .employee-target-period {
                    white-space: nowrap;
                }


                /* ================================================
                   PROGRESS
                ================================================ */

                .employee-target-progress {
                    width: 160px;
                    min-width: 160px;
                }


                /* ================================================
                   ACTION
                ================================================ */

                .employee-target-actions {
                    white-space: nowrap;
                }


                /* ================================================
                   TABLET
                ================================================ */

                @media (max-width: 991.98px) {

                    .employee-target-table {
                        min-width: 1150px;
                    }

                    .employee-target-table th,
                    .employee-target-table td {
                        font-size: 13px;
                    }

                    .employee-target-title {
                        max-width: 190px;
                    }

                }


                /* ================================================
                   MOBILE
                ================================================ */

                @media (max-width: 575.98px) {

                    .employee-target-table-responsive {
                        width: calc(100vw - 32px);
                        max-width: calc(100vw - 32px);

                        overflow-x: auto;
                        overflow-y: hidden;

                        border-radius: 8px;
                    }

                    .employee-target-table {
                        min-width: 1100px;
                    }

                    .employee-target-table th,
                    .employee-target-table td {
                        padding: 10px 8px;
                        font-size: 12px;
                    }

                    .employee-target-title {
                        max-width: 180px;
                    }

                    .employee-target-supervisor {
                        max-width: 110px;
                    }

                    .employee-target-progress {
                        width: 150px;
                        min-width: 150px;
                    }

                    .employee-target-actions {
                        gap: 4px !important;
                    }

                }

            `}</style>
        </>
    );
};

export default React.memo(
    EmployeeTargetTable
);