import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// API
import {apiFetch} from "../api/apiFetch";

// Layout
import NavbarEmployee from "../layouts/NavbarEmployee";
import SidebarEmployee from "../components/SidebarEmployee";

// BPJS Components
import EmployeeBPJSStats from "../components/employeebpjs/EmployeeBPJSStats";
import EmployeeBPJSFilter from "../components/employeebpjs/EmployeeBPJSFilter";
import EmployeeBPJSTable from "../components/employeebpjs/EmployeeBPJSTable";
import EmployeeBPJSDetailModal from "../components/employeebpjs/EmployeeBPJSDetailModal";

const EmployeeBPJSPaymentProofPage = () => {
    // =====================================================
    // DATA
    // =====================================================

    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Loading khusus download
    const [downloadingId, setDownloadingId] = useState(null);

    // =====================================================
    // SIDEBAR
    // =====================================================

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // =====================================================
    // FILTER
    // =====================================================

    const [filters, setFilters] = useState({
        period: "",
        bpjs_type: "",
    });

    // =====================================================
    // MODAL
    // =====================================================

    const [selectedData, setSelectedData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // =====================================================
    // RESPONSIVE SIDEBAR
    // =====================================================

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 992) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // =====================================================
    // FETCH BPJS
    // =====================================================

    const fetchBPJSProofs = async () => {
        setLoading(true);

        try {
            const res = await apiFetch.get(
                "/employee/bpjs-payment-proofs"
            );

            const rawData = res.data?.data || [];

            setProofs(
                Array.isArray(rawData)
                    ? rawData
                    : []
            );
        } catch (err) {
            console.error(
                "Gagal memuat bukti BPJS:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                    "Gagal memuat bukti pembayaran BPJS."
            );

            setProofs([]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL FETCH
    // =====================================================

    useEffect(() => {
        fetchBPJSProofs();
    }, []);

    // =====================================================
    // GET FILE EXTENSION
    // =====================================================

    const getFileExtension = (
        item,
        contentType = ""
    ) => {
        const filePath =
            item?.file_path ||
            item?.file_url ||
            "";

        const cleanPath = String(filePath)
            .split("?")[0]
            .split("#")[0];

        const match = cleanPath.match(
            /\.([a-zA-Z0-9]+)$/
        );

        if (match?.[1]) {
            return match[1].toLowerCase();
        }

        const mimeMap = {
            "application/pdf": "pdf",

            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "image/bmp": "bmp",

            "application/octet-stream": "file",
        };

        return (
            mimeMap[contentType] ||
            "file"
        );
    };

    // =====================================================
    // GET FILE NAME
    // =====================================================

    const getFileName = (
        item,
        contentType = ""
    ) => {
        let fileName =
            item?.document_name ||
            item?.file_path
                ?.split("/")
                .pop() ||
            `Bukti_BPJS_${item?.id || ""}`;

        fileName = String(fileName)
            .trim()
            .replace(/[<>:"/\\|?*]+/g, "_");

        // Kalau sudah punya extension
        if (
            /\.[a-zA-Z0-9]+$/.test(fileName)
        ) {
            return fileName;
        }

        const extension =
            getFileExtension(
                item,
                contentType
            );

        if (
            extension &&
            extension !== "file"
        ) {
            return `${fileName}.${extension}`;
        }

        return fileName;
    };

    // =====================================================
    // DOWNLOAD FILE BPJS
    // =====================================================

    const handleDownload = async (item) => {
        if (!item?.id) {
            toast.error(
                "ID dokumen tidak ditemukan."
            );
            return;
        }

        try {
            setDownloadingId(item.id);

            console.log(
                "Download BPJS ID:",
                item.id
            );

            // =================================================
            // REQUEST KE CONTROLLER LARAVEL
            // =================================================

            const response =
                await apiFetch.get(
                    `/employee/bpjs-payment-proofs/${item.id}/download`,
                    {
                        responseType: "blob",

                        // Supaya Authorization / cookie
                        // tetap dikirim oleh apifetch
                        withCredentials: true,
                    }
                );

            // =================================================
            // CEK CONTENT TYPE
            // =================================================

            const contentType =
                response.headers[
                    "content-type"
                ] ||
                "application/octet-stream";

            console.log(
                "Content-Type:",
                contentType
            );

            // =================================================
            // CEK JIKA SERVER MENGIRIM ERROR JSON
            // =================================================

            if (
                contentType.includes(
                    "application/json"
                ) ||
                contentType.includes(
                    "text/html"
                )
            ) {
                const text =
                    await response.data.text();

                let message =
                    "Gagal mengunduh file BPJS.";

                try {
                    const json =
                        JSON.parse(text);

                    message =
                        json?.message ||
                        message;
                } catch {
                    // Bukan JSON
                }

                throw new Error(message);
            }

            // =================================================
            // BUAT BLOB
            // =================================================

            const blob =
                new Blob(
                    [response.data],
                    {
                        type: contentType,
                    }
                );

            // =================================================
            // BUAT URL SEMENTARA
            // =================================================

            const blobUrl =
                window.URL.createObjectURL(
                    blob
                );

            // =================================================
            // NAMA FILE
            // =================================================

            const fileName =
                getFileName(
                    item,
                    contentType
                );

            console.log(
                "Nama file:",
                fileName
            );

            // =================================================
            // DOWNLOAD
            // =================================================

            const link =
                document.createElement(
                    "a"
                );

            link.href = blobUrl;

            link.download =
                fileName;

            link.style.display =
                "none";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            // =================================================
            // HAPUS BLOB URL
            // =================================================

            setTimeout(() => {
                window.URL.revokeObjectURL(
                    blobUrl
                );
            }, 1000);

            toast.success(
                "File berhasil diunduh."
            );
        } catch (err) {
            console.error(
                "Gagal download file BPJS:",
                err
            );

            // fetch blob error biasanya tidak langsung
            // tersedia sebagai response.data.message
            let message =
                "Gagal mengunduh file BPJS.";

            if (
                err?.response?.data
                    instanceof Blob
            ) {
                try {
                    const text =
                        await err.response.data.text();

                    const json =
                        JSON.parse(text);

                    message =
                        json?.message ||
                        message;
                } catch {
                    // Abaikan
                }
            } else if (
                err?.response?.data?.message
            ) {
                message =
                    err.response.data.message;
            } else if (
                err?.message
            ) {
                message =
                    err.message;
            }

            toast.error(message);
        } finally {
            setDownloadingId(null);
        }
    };

    // =====================================================
    // FILTER DATA
    // =====================================================

    const filteredProofs =
        proofs.filter((item) => {
            if (!item) {
                return false;
            }

            const matchType =
                filters.bpjs_type
                    ? item.bpjs_type ===
                      filters.bpjs_type
                    : true;

            const matchPeriod =
                filters.period
                    ? item.period ===
                      filters.period
                    : true;

            return (
                matchType &&
                matchPeriod
            );
        });

    // =====================================================
    // RESET FILTER
    // =====================================================

    const handleResetFilter = () => {
        setFilters({
            period: "",
            bpjs_type: "",
        });
    };

    // =====================================================
    // DETAIL
    // =====================================================

    const handleOpenDetail = (item) => {
        setSelectedData(item);
        setShowDetailModal(true);
    };

    // =====================================================
    // CLOSE DETAIL
    // =====================================================

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedData(null);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="employee-bpjs-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <SidebarEmployee
                isOpen={isSidebarOpen}
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />

            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="employee-bpjs-main">

                {/* =================================================
                    NAVBAR
                ================================================= */}

                <NavbarEmployee
                    onToggleSidebar={() =>
                        setIsSidebarOpen(
                            !isSidebarOpen
                        )
                    }
                />

                {/* =================================================
                    CONTENT
                ================================================= */}

                <main className="employee-bpjs-content">

                    <div className="p-3 p-md-4">

                        {/* =============================================
                            HEADER
                        ============================================== */}

                        <div
                            className="
                                d-flex
                                flex-column
                                flex-sm-row
                                align-items-start
                                align-items-sm-center
                                justify-content-between
                                gap-3
                                mb-4
                            "
                        >

                            <div>

                                <h4 className="fw-bold text-dark mb-1">
                                    Bukti Pembayaran BPJS
                                </h4>

                                <p className="text-muted small mb-0">
                                    Lihat riwayat bukti pembayaran
                                    BPJS yang telah diunggah oleh
                                    Finance.
                                </p>

                            </div>

                            {/* Refresh */}

                            <button
                                type="button"
                                className="
                                    btn
                                    btn-outline-primary
                                    d-flex
                                    align-items-center
                                    justify-content-center
                                    gap-2
                                    flex-shrink-0
                                "
                                onClick={
                                    fetchBPJSProofs
                                }
                                disabled={loading}
                            >

                                <i
                                    className={`bi bi-arrow-clockwise ${
                                        loading
                                            ? "bpjs-spin"
                                            : ""
                                    }`}
                                ></i>

                                <span>
                                    Refresh
                                </span>

                            </button>

                        </div>

                        {/* =============================================
                            STATS
                        ============================================== */}

                        <div className="mb-4">

                            <EmployeeBPJSStats
                                proofs={proofs}
                            />

                        </div>

                        {/* =============================================
                            FILTER
                        ============================================== */}

                        <div className="mb-4">

                            <EmployeeBPJSFilter
                                filters={filters}
                                setFilters={
                                    setFilters
                                }
                                onReset={
                                    handleResetFilter
                                }
                            />

                        </div>

                        {/* =============================================
                            TABLE CARD
                        ============================================== */}

                        <div
                            className="
                                card
                                border-0
                                shadow-sm
                                rounded-4
                                bg-white
                                overflow-hidden
                            "
                        >

                            <div className="p-2 p-md-3">

                                {/* =================================
                                    LOADING
                                ================================== */}

                                {loading ? (

                                    <div className="text-center py-5">

                                        <div
                                            className="
                                                spinner-border
                                                text-primary
                                            "
                                            role="status"
                                        >
                                            <span className="visually-hidden">
                                                Loading...
                                            </span>
                                        </div>

                                        <p className="text-muted small mt-2 mb-0">
                                            Memuat bukti pembayaran BPJS...
                                        </p>

                                    </div>

                                ) : filteredProofs.length === 0 ? (

                                    /* =================================
                                       EMPTY
                                    ================================== */

                                    <div
                                        className="
                                            text-center
                                            text-muted
                                            py-5
                                            px-3
                                        "
                                    >

                                        <div
                                            className="
                                                bg-light
                                                d-inline-flex
                                                align-items-center
                                                justify-content-center
                                                p-3
                                                rounded-circle
                                                mb-3
                                            "
                                        >

                                            <i
                                                className="
                                                    bi
                                                    bi-folder-x
                                                    fs-1
                                                    text-secondary
                                                "
                                            ></i>

                                        </div>

                                        <h6 className="fw-bold text-dark mb-1">
                                            Belum ada bukti BPJS
                                        </h6>

                                        <p className="small text-muted mb-0">
                                            Tidak ada bukti pembayaran
                                            BPJS yang ditemukan.
                                        </p>

                                    </div>

                                ) : (

                                    /* =================================
                                       TABLE
                                    ================================== */

                                    <div className="employee-bpjs-table-wrapper">

                                        <EmployeeBPJSTable
                                            proofs={
                                                filteredProofs
                                            }
                                            onDetail={
                                                handleOpenDetail
                                            }
                                            onDownload={
                                                handleDownload
                                            }
                                            downloadingId={
                                                downloadingId
                                            }
                                        />

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </main>

            </div>

            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            <EmployeeBPJSDetailModal
                show={
                    showDetailModal
                }
                onClose={
                    handleCloseDetail
                }
                data={
                    selectedData
                }
                onDownload={
                    handleDownload
                }
                downloadingId={
                    downloadingId
                }
            />

            {/* =================================================
                PAGE STYLE
            ================================================= */}

            <style>{`

                /* ================================================
                   PAGE
                ================================================ */

                .employee-bpjs-page {
                    width: 100%;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    overflow-x: hidden;
                }


                /* ================================================
                   MAIN
                ================================================ */

                .employee-bpjs-main {
                    margin-left: 260px;
                    min-height: 100vh;
                    min-width: 0;
                    background-color: #f8fafc;

                    transition:
                        margin-left 0.3s ease;
                }


                /* ================================================
                   CONTENT
                ================================================ */

                .employee-bpjs-content {
                    width: 100%;
                    min-width: 0;
                    overflow-x: hidden;
                }


                /* ================================================
                   TABLE
                ================================================ */

                .employee-bpjs-table-wrapper {
                    width: 100%;
                    min-width: 0;
                    overflow-x: auto;
                    overflow-y: hidden;

                    -webkit-overflow-scrolling: touch;
                }

                .employee-bpjs-table-wrapper table {
                    min-width: 750px;
                    margin-bottom: 0;
                }


                /* ================================================
                   REFRESH SPINNER
                ================================================ */

                @keyframes bpjsSpin {

                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }

                }

                .bpjs-spin {
                    animation:
                        bpjsSpin
                        0.8s linear infinite;
                }


                /* ================================================
                   BUTTON
                ================================================ */

                .employee-bpjs-page button {
                    transition:
                        all 0.2s ease;
                }

                .employee-bpjs-page
                button:disabled {
                    cursor: not-allowed;
                }


                /* ================================================
                   TABLET
                ================================================ */

                @media (max-width: 991.98px) {

                    .employee-bpjs-main {
                        margin-left: 0 !important;
                    }

                    .employee-bpjs-content {
                        width: 100%;
                    }

                }


                /* ================================================
                   MOBILE
                ================================================ */

                @media (max-width: 575.98px) {

                    .employee-bpjs-content > div {
                        padding: 1rem !important;
                    }

                    .employee-bpjs-content h4 {
                        font-size: 1.15rem;
                    }

                    .employee-bpjs-content p {
                        font-size: 0.8rem;
                    }

                    .employee-bpjs-table-wrapper {
                        margin-left: -0.25rem;
                        margin-right: -0.25rem;
                    }

                    .employee-bpjs-table-wrapper table {
                        min-width: 700px;
                    }

                }

            `}</style>

        </div>
    );
};

export default EmployeeBPJSPaymentProofPage;