import React from "react";

const RequestDetailModal = ({ item, activeTab, onClose }) => {
    if (!item) return null;

    const empName =
        item.employee?.name ||
        item.employee_name ||
        "Karyawan";

    const attachment =
        item.attachment ||
        item.file_proof ||
        item.lampiran;

    const isImage = (url) => {
        if (!url || typeof url !== "string") {
            return false;
        }

        return /\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(
            url.split("?")[0]
        );
    };

    const getBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-warning text-dark";

            case "approved":
                return "bg-success text-white";

            case "rejected":
                return "bg-danger text-white";

            case "completed":
                return "bg-primary text-white";

            default:
                return "bg-secondary text-white";
        }
    };

    const getRequestType = () => {
        return (
            item.request_type ||
            activeTab ||
            "-"
        );
    };

    const getDate = () => {
        if (item.start_date) {
            return `${item.start_date} s/d ${
                item.end_date || item.start_date
            }`;
        }

        if (item.created_at) {
            const date = new Date(item.created_at);

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString(
                    "id-ID",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    }
                );
            }
        }

        return "-";
    };

    const getReason = () => {
        return (
            item.reason ||
            item.notes ||
            item.keterangan ||
            "Tidak ada alasan tertulis."
        );
    };

    const getApprovalNote = () => {
        return (
            item.approval_note ||
            item.catatan_approval ||
            "Belum ada catatan."
        );
    };

    return (
        <>
            <style>
                {`
                    /* =====================================================
                       FULLSCREEN MODAL
                    ===================================================== */

                    .request-detail-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 1060;
                        background: rgba(0, 0, 0, .55);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }

                    .request-detail-modal {
                        width: 100%;
                        height: calc(100vh - 40px);
                        max-width: 1200px;
                        background: #fff;
                        border-radius: 16px;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        box-shadow:
                            0 20px 60px rgba(0, 0, 0, .18);
                    }


                    /* =====================================================
                       HEADER
                    ===================================================== */

                    .request-detail-header {
                        flex-shrink: 0;
                        min-height: 72px;
                        padding: 18px 24px;
                        background: #fff;
                        border-bottom: 1px solid #e9ecef;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                    }

                    .request-detail-header-title {
                        margin: 0;
                        color: #212529;
                        font-size: 1.1rem;
                        font-weight: 700;
                    }

                    .request-detail-header-subtitle {
                        margin: 3px 0 0;
                        color: #8a9199;
                        font-size: .76rem;
                    }


                    /* =====================================================
                       BODY
                    ===================================================== */

                    .request-detail-body {
                        flex: 1;
                        min-height: 0;
                        overflow-y: auto;
                        padding: 28px;
                        background: #f8f9fa;
                    }

                    .request-detail-container {
                        width: 100%;
                        max-width: 1100px;
                        margin: 0 auto;
                    }


                    /* =====================================================
                       SECTION CARD
                    ===================================================== */

                    .request-detail-card {
                        background: #fff;
                        border: 1px solid #e9ecef;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 16px;
                    }

                    .request-detail-card:last-child {
                        margin-bottom: 0;
                    }

                    .request-detail-card-title {
                        margin-bottom: 18px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #f0f1f3;
                        color: #212529;
                        font-size: .85rem;
                        font-weight: 700;
                    }


                    /* =====================================================
                       INFORMATION
                    ===================================================== */

                    .request-detail-info {
                        height: 100%;
                        padding: 14px;
                        background: #f8f9fa;
                        border: 1px solid #edf0f2;
                        border-radius: 10px;
                    }

                    .request-detail-label {
                        display: block;
                        margin-bottom: 5px;
                        color: #8a9199;
                        font-size: .7rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: .025em;
                    }

                    .request-detail-value {
                        color: #212529;
                        font-size: .84rem;
                        font-weight: 600;
                        line-height: 1.5;
                        word-break: break-word;
                    }


                    /* =====================================================
                       STATUS
                    ===================================================== */

                    .request-detail-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 6px 11px;
                        border-radius: 20px;
                        font-size: .7rem;
                        font-weight: 600;
                        text-transform: capitalize;
                    }


                    /* =====================================================
                       DESCRIPTION / NOTE
                    ===================================================== */

                    .request-detail-text-box {
                        min-height: 70px;
                        padding: 14px;
                        background: #f8f9fa;
                        border: 1px solid #edf0f2;
                        border-radius: 10px;
                        color: #495057;
                        font-size: .8rem;
                        line-height: 1.6;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }

                    .request-detail-text-box.approval {
                        background: #f8f9fa;
                        color: #6c757d;
                    }


                    /* =====================================================
                       ATTACHMENT
                    ===================================================== */

                    .request-detail-attachment {
                        padding: 18px;
                        background: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                    }

                    .request-detail-image-wrapper {
                        width: 100%;
                        min-height: 180px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 10px;
                        background: #fff;
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                    }

                    .request-detail-image {
                        display: block;
                        max-width: 100%;
                        max-height: 400px;
                        object-fit: contain;
                        border-radius: 8px;
                    }

                    .request-detail-file {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 15px;
                        padding: 12px;
                        background: #fff;
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                    }

                    .request-detail-file-info {
                        min-width: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .request-detail-file-icon {
                        width: 38px;
                        height: 38px;
                        min-width: 38px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 8px;
                        background: #fdecec;
                        color: #dc3545;
                        font-size: 1rem;
                    }

                    .request-detail-file-name {
                        min-width: 0;
                        color: #495057;
                        font-size: .78rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }


                    /* =====================================================
                       FOOTER
                    ===================================================== */

                    .request-detail-footer {
                        flex-shrink: 0;
                        padding: 14px 24px;
                        background: #fff;
                        border-top: 1px solid #e9ecef;
                        display: flex;
                        justify-content: flex-end;
                    }

                    .request-detail-close-btn {
                        min-width: 90px;
                        border-radius: 8px;
                    }


                    /* =====================================================
                       SCROLLBAR
                    ===================================================== */

                    .request-detail-body::-webkit-scrollbar {
                        width: 6px;
                    }

                    .request-detail-body::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .request-detail-body::-webkit-scrollbar-thumb {
                        background: #ced4da;
                        border-radius: 10px;
                    }


                    /* =====================================================
                       TABLET
                    ===================================================== */

                    @media (max-width: 991.98px) {

                        .request-detail-overlay {
                            padding: 12px;
                        }

                        .request-detail-modal {
                            height: calc(100vh - 24px);
                            max-width: 100%;
                            border-radius: 12px;
                        }

                        .request-detail-body {
                            padding: 20px;
                        }

                        .request-detail-header {
                            padding: 16px 18px;
                        }

                        .request-detail-footer {
                            padding: 12px 18px;
                        }
                    }


                    /* =====================================================
                       MOBILE
                    ===================================================== */

                    @media (max-width: 767.98px) {

                        .request-detail-overlay {
                            padding: 0;
                            align-items: stretch;
                        }

                        .request-detail-modal {
                            width: 100%;
                            height: 100vh;
                            max-width: none;
                            border-radius: 0;
                        }

                        .request-detail-header {
                            min-height: 62px;
                            padding: 14px 15px;
                        }

                        .request-detail-header-title {
                            font-size: .95rem;
                        }

                        .request-detail-header-subtitle {
                            font-size: .68rem;
                        }

                        .request-detail-body {
                            padding: 14px;
                        }

                        .request-detail-card {
                            padding: 14px;
                            border-radius: 10px;
                            margin-bottom: 12px;
                        }

                        .request-detail-card-title {
                            margin-bottom: 13px;
                            padding-bottom: 10px;
                        }

                        .request-detail-info {
                            padding: 12px;
                        }

                        .request-detail-label {
                            font-size: .64rem;
                        }

                        .request-detail-value {
                            font-size: .78rem;
                        }

                        .request-detail-text-box {
                            padding: 12px;
                            font-size: .76rem;
                        }

                        .request-detail-attachment {
                            padding: 12px;
                        }

                        .request-detail-image-wrapper {
                            min-height: 130px;
                        }

                        .request-detail-image {
                            max-height: 280px;
                        }

                        .request-detail-file {
                            align-items: flex-start;
                            flex-direction: column;
                        }

                        .request-detail-file-info {
                            width: 100%;
                        }

                        .request-detail-file .btn {
                            width: 100%;
                        }

                        .request-detail-footer {
                            padding: 11px 14px;
                        }

                        .request-detail-close-btn {
                            width: 100%;
                        }
                    }
                `}
            </style>

            <div
                className="request-detail-overlay"
                onClick={(e) => {
                    if (
                        e.target ===
                        e.currentTarget
                    ) {
                        onClose();
                    }
                }}
            >
                <div
                    className="request-detail-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="request-detail-title"
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="request-detail-header">

                        <div>
                            <h5
                                id="request-detail-title"
                                className="request-detail-header-title"
                            >
                                Detail Pengajuan
                            </h5>

                            <p className="request-detail-header-subtitle">
                                Informasi lengkap pengajuan karyawan
                            </p>
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

                    <div className="request-detail-body">

                        <div className="request-detail-container">

                            {/* =========================================
                                INFORMASI UTAMA
                            ========================================= */}

                            <div className="request-detail-card">

                                <div className="request-detail-card-title">
                                    Informasi Pengajuan
                                </div>

                                <div className="row g-3">

                                    <div className="col-12 col-md-6">

                                        <div className="request-detail-info">

                                            <span className="request-detail-label">
                                                Nama Karyawan
                                            </span>

                                            <div className="request-detail-value">
                                                {empName}
                                            </div>

                                        </div>

                                    </div>


                                    <div className="col-12 col-md-6">

                                        <div className="request-detail-info">

                                            <span className="request-detail-label">
                                                Jenis Pengajuan
                                            </span>

                                            <div className="request-detail-value text-capitalize">
                                                {getRequestType()}
                                            </div>

                                        </div>

                                    </div>


                                    <div className="col-12 col-md-6">

                                        <div className="request-detail-info">

                                            <span className="request-detail-label">
                                                Tanggal Pengajuan / Pelaksanaan
                                            </span>

                                            <div className="request-detail-value">
                                                {getDate()}
                                            </div>

                                        </div>

                                    </div>


                                    <div className="col-12 col-md-6">

                                        <div className="request-detail-info">

                                            <span className="request-detail-label">
                                                Status
                                            </span>

                                            <div>
                                                <span
                                                    className={`request-detail-status ${getBadgeClass(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status ||
                                                        "Pending"}
                                                </span>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =========================================
                                ALASAN
                            ========================================= */}

                            <div className="request-detail-card">

                                <div className="request-detail-card-title">
                                    Alasan / Keterangan
                                </div>

                                <div className="request-detail-text-box">
                                    {getReason()}
                                </div>

                            </div>


                            {/* =========================================
                                APPROVAL
                            ========================================= */}

                            <div className="request-detail-card">

                                <div className="request-detail-card-title">
                                    Catatan Approval
                                </div>

                                <div className="request-detail-text-box approval">
                                    {getApprovalNote()}
                                </div>

                            </div>


                            {/* =========================================
                                ATTACHMENT
                            ========================================= */}

                            <div className="request-detail-card">

                                <div className="request-detail-card-title">
                                    Lampiran
                                </div>

                                {attachment ? (

                                    <div className="request-detail-attachment">

                                        {isImage(
                                            attachment
                                        ) ? (

                                            <div className="request-detail-image-wrapper">

                                                <img
                                                    src={
                                                        attachment
                                                    }
                                                    alt="Lampiran"
                                                    className="request-detail-image"
                                                />

                                            </div>

                                        ) : (

                                            <div className="request-detail-file">

                                                <div className="request-detail-file-info">

                                                    <div className="request-detail-file-icon">

                                                        <i className="bi bi-file-earmark-pdf"></i>

                                                    </div>

                                                    <span className="request-detail-file-name">
                                                        Dokumen Lampiran
                                                    </span>

                                                </div>

                                                <a
                                                    href={
                                                        attachment
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-primary rounded-3 d-inline-flex align-items-center justify-content-center gap-1"
                                                >
                                                    <i className="bi bi-download"></i>

                                                    <span>
                                                        Download File
                                                    </span>
                                                </a>

                                            </div>

                                        )}

                                    </div>

                                ) : (

                                    <div className="text-muted small">
                                        <i className="bi bi-paperclip me-1"></i>
                                        Tidak ada lampiran diunggah.
                                    </div>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="request-detail-footer">

                        <button
                            type="button"
                            className="btn btn-secondary request-detail-close-btn"
                            onClick={onClose}
                        >
                            Tutup
                        </button>

                    </div>

                </div>
            </div>
        </>
    );
};

export default RequestDetailModal;
