import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import { toast } from "react-toastify";
import {apiFetch} from "../api/apiFetch";

import NavbarEmployee from "../layouts/NavbarEmployee";
import SidebarEmployee from "../components/SidebarEmployee";

import EmployeeTargetStats from "../components/employeetarget/EmployeeTargetStats";
import EmployeeTargetFilter from "../components/employeetarget/EmployeeTargetFilter";
import EmployeeTargetTable from "../components/employeetarget/EmployeeTargetTable";
import EmployeeTargetDetailModal from "../components/employeetarget/EmployeeTargetDetailModal";
import EmployeeTargetProgressModal from "../components/employeetarget/EmployeeTargetProgressModal";

const PortalTargetPage = () => {
    // =====================================================
    // DATA
    // =====================================================

    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // =====================================================
    // SIDEBAR
    // =====================================================

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // =====================================================
    // FILTER
    // =====================================================

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        category: "",
    });

    // =====================================================
    // MODAL
    // =====================================================

    const [selectedTarget, setSelectedTarget] = useState(null);

    const [showDetailModal, setShowDetailModal] =
        useState(false);

    const [showProgressModal, setShowProgressModal] =
        useState(false);

    const [submittingProgress, setSubmittingProgress] =
        useState(false);

    // =====================================================
    // RESPONSIVE SIDEBAR
    // =====================================================

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, []);

    // =====================================================
    // TOGGLE SIDEBAR
    // =====================================================

    const handleToggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const handleCloseSidebar = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    // =====================================================
    // FETCH TARGET
    // =====================================================

    const fetchTargets = useCallback(
        async (isSilent = false) => {
            if (!isSilent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            try {
                const res =
                    await apiFetch.get(
                        "/employee/my-targets"
                    );

                const rawData =
                    res.data?.data || [];

                setTargets(
                    Array.isArray(rawData)
                        ? rawData
                        : []
                );
            } catch (err) {
                console.error(
                    "Gagal memuat target:",
                    err
                );

                toast.error(
                    err.response?.data?.message ||
                        "Gagal memuat data target kinerja."
                );

                setTargets([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    // =====================================================
    // INITIAL FETCH
    // =====================================================

    useEffect(() => {
        fetchTargets();
    }, [fetchTargets]);

    // =====================================================
    // CATEGORY
    // =====================================================

    const categories = useMemo(() => {
        const setCat = new Set();

        targets.forEach((item) => {
            const category =
                item.category ||
                item.kategori;

            if (category) {
                setCat.add(category);
            }
        });

        return Array.from(setCat);
    }, [targets]);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredTargets = useMemo(() => {
        return targets.filter((item) => {
            const title = (
                item.title ||
                item.judul ||
                ""
            ).toLowerCase();

            const search =
                filters.search
                    .trim()
                    .toLowerCase();

            const matchSearch =
                !search ||
                title.includes(search);

            const matchStatus =
                filters.status
                    ? item.status ===
                      filters.status
                    : true;

            const category =
                item.category ||
                item.kategori ||
                "";

            const matchCategory =
                filters.category
                    ? category ===
                      filters.category
                    : true;

            return (
                matchSearch &&
                matchStatus &&
                matchCategory
            );
        });
    }, [targets, filters]);

    // =====================================================
    // RESET FILTER
    // =====================================================

    const handleResetFilter =
        useCallback(() => {
            setFilters({
                search: "",
                status: "",
                category: "",
            });
        }, []);

    // =====================================================
    // DETAIL
    // =====================================================

    const handleOpenDetail =
        useCallback((item) => {
            setSelectedTarget(item);
            setShowDetailModal(true);
        }, []);

    // =====================================================
    // PROGRESS
    // =====================================================

    const handleOpenProgress =
        useCallback((item) => {
            setSelectedTarget(item);
            setShowProgressModal(true);
        }, []);

    // =====================================================
    // UPDATE PROGRESS
    // =====================================================

    const handleSubmitProgress = async (
        id,
        currentValue
    ) => {
        setSubmittingProgress(true);

        try {
            const res =
                await apiFetch.put(
                    `/employee/my-targets/${id}/progress`,
                    {
                        current_value:
                            currentValue,
                    }
                );

            if (res.data?.success) {
                toast.success(
                    res.data?.message ||
                        "Progress target berhasil diperbarui!"
                );

                setShowProgressModal(false);
                setSelectedTarget(null);

                await fetchTargets(true);
            } else {
                toast.error(
                    res.data?.message ||
                        "Gagal memperbarui progress."
                );
            }
        } catch (err) {
            console.error(
                "Update progress error:",
                err
            );

            toast.error(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengupdate progress."
            );
        } finally {
            setSubmittingProgress(false);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="portal-target-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <SidebarEmployee
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
            />

            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div
                className={`portal-target-main ${
                    isSidebarOpen
                        ? "sidebar-is-open"
                        : "sidebar-is-closed"
                }`}
            >

                {/* =================================================
                    NAVBAR
                ================================================= */}

                <NavbarEmployee
                    onToggleSidebar={
                        handleToggleSidebar
                    }
                />

                {/* =================================================
                    CONTENT
                ================================================= */}

                <main className="portal-target-content">

                    <div className="portal-target-inner">

                        {/* =========================================
                            HEADER
                        ========================================= */}

                        <div className="portal-target-header">

                            <div className="portal-target-title">

                                <h4 className="fw-bold text-dark mb-1">
                                    Target Kinerja Saya
                                </h4>

                                <p className="text-muted small mb-0">
                                    Lihat seluruh target yang
                                    diberikan supervisor dan
                                    update progres pekerjaan Anda.
                                </p>

                            </div>

                            {/* REFRESH */}

                            <button
                                type="button"
                                className="btn btn-light bg-white border shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2 text-dark px-3 py-2 flex-shrink-0"
                                onClick={() =>
                                    fetchTargets(true)
                                }
                                disabled={
                                    loading ||
                                    refreshing
                                }
                            >

                                <i
                                    className={`bi bi-arrow-clockwise ${
                                        refreshing
                                            ? "portal-target-spin"
                                            : ""
                                    }`}
                                ></i>

                                <span className="fw-medium small">
                                    Refresh Data
                                </span>

                            </button>

                        </div>

                        {/* =========================================
                            STATISTICS
                        ========================================= */}

                        <div className="mb-4">
                            <EmployeeTargetStats
                                targets={targets}
                            />
                        </div>

                        {/* =========================================
                            FILTER
                        ========================================= */}

                        <div className="mb-4">
                            <EmployeeTargetFilter
                                filters={filters}
                                setFilters={
                                    setFilters
                                }
                                onReset={
                                    handleResetFilter
                                }
                                categories={
                                    categories
                                }
                            />
                        </div>

                        {/* =========================================
                            TABLE CARD
                        ========================================= */}

                        <div className="card border-0 shadow-sm rounded-4 bg-white">

                            <div className="p-3 p-md-4">

                                {loading ? (

                                    /* LOADING */

                                    <div className="text-center py-5">

                                        <div
                                            className="spinner-border text-primary"
                                            role="status"
                                        >
                                            <span className="visually-hidden">
                                                Loading...
                                            </span>
                                        </div>

                                        <p className="text-muted small mt-2 mb-0">
                                            Memuat target kinerja...
                                        </p>

                                    </div>

                                ) : filteredTargets.length === 0 ? (

                                    /* EMPTY */

                                    <div className="text-center text-muted py-5 px-3">

                                        <div className="bg-light d-inline-flex p-3 rounded-circle mb-3">

                                            <i className="bi bi-bullseye fs-1 text-secondary"></i>

                                        </div>

                                        <h6 className="fw-bold text-dark mb-1">
                                            Belum ada target yang
                                            diberikan supervisor.
                                        </h6>

                                        <p className="small text-muted mb-0">
                                            Target kerja yang
                                            ditugaskan kepada Anda
                                            akan ditampilkan di
                                            halaman ini.
                                        </p>

                                    </div>

                                ) : (

                                    /* TABLE */

                                    <div className="portal-target-table-wrapper">

                                        <EmployeeTargetTable
                                            targets={
                                                filteredTargets
                                            }
                                            onDetail={
                                                handleOpenDetail
                                            }
                                            onUpdateProgress={
                                                handleOpenProgress
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

            <EmployeeTargetDetailModal
                show={
                    showDetailModal
                }
                onClose={() => {
                    setShowDetailModal(
                        false
                    );
                    setSelectedTarget(
                        null
                    );
                }}
                data={
                    selectedTarget
                }
            />

            {/* =================================================
                PROGRESS MODAL
            ================================================= */}

            <EmployeeTargetProgressModal
                show={
                    showProgressModal
                }
                onClose={() => {
                    setShowProgressModal(
                        false
                    );
                    setSelectedTarget(
                        null
                    );
                }}
                data={
                    selectedTarget
                }
                onSubmit={
                    handleSubmitProgress
                }
                submitting={
                    submittingProgress
                }
            />

            {/* =================================================
                PAGE STYLE
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                .portal-target-page {
                    width: 100%;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    overflow-x: hidden;
                }

                /* ============================================
                   MAIN DESKTOP
                ============================================ */

                .portal-target-main {
                    min-height: 100vh;
                    min-width: 0;
                    background-color: #f8fafc;

                    margin-left: 260px;

                    transition:
                        margin-left 0.3s ease;
                }

                /*
                 * Ketika sidebar terbuka desktop
                 */

                .portal-target-main.sidebar-is-open {
                    margin-left: 260px;
                }

                /*
                 * Ketika sidebar ditutup
                 */

                .portal-target-main.sidebar-is-closed {
                    margin-left: 260px;
                }

                /* ============================================
                   CONTENT
                ============================================ */

                .portal-target-content {
                    width: 100%;
                    min-width: 0;
                    overflow-x: hidden;
                }

                .portal-target-inner {
                    width: 100%;
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 24px;
                }

                /* ============================================
                   HEADER
                ============================================ */

                .portal-target-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .portal-target-title {
                    min-width: 0;
                }

                /* ============================================
                   TABLE
                ============================================ */

                .portal-target-table-wrapper {
                    width: 100%;
                    min-width: 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                }

                .portal-target-table-wrapper table {
                    min-width: 850px;
                    margin-bottom: 0;
                }

                /* ============================================
                   SPINNER
                ============================================ */

                @keyframes portalTargetSpin {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                .portal-target-spin {
                    animation:
                        portalTargetSpin
                        0.8s linear infinite;
                }

                /* ============================================
                   TABLET
                ============================================ */

                @media (max-width: 991.98px) {

                    /* SidebarEmployee berubah menjadi drawer pada breakpoint lg. */
                    .portal-target-main,
                    .portal-target-main.sidebar-is-open,
                    .portal-target-main.sidebar-is-closed {
                        margin-left: 0 !important;
                        width: 100%;
                    }

                    .portal-target-inner {
                        padding: 20px;
                    }

                }

                /* ============================================
                   MOBILE
                ============================================ */

                @media (max-width: 767.98px) {

                    .portal-target-inner {
                        width: 100%;
                        max-width: 100%;
                        padding: 16px;
                    }

                    /*
                     * Header menjadi vertikal
                     */

                    .portal-target-header {
                        align-items: stretch;
                        flex-direction: column;
                        gap: 14px;
                        margin-bottom: 20px;
                    }

                    .portal-target-title h4 {
                        font-size: 20px;
                    }

                    .portal-target-title p {
                        font-size: 13px;
                        line-height: 1.5;
                    }

                    /*
                     * Tombol refresh full width
                     */

                    .portal-target-header button {
                        width: 100%;
                    }

                    /*
                     * Card
                     */

                    .portal-target-inner .card {
                        border-radius: 14px !important;
                    }

                    /*
                     * Table tetap scroll horizontal
                     */

                    .portal-target-table-wrapper {
                        margin-left: -4px;
                        margin-right: -4px;
                        width: calc(100% + 8px);
                    }

                }

                /* ============================================
                   MOBILE KECIL
                ============================================ */

                @media (max-width: 575.98px) {

                    .portal-target-inner {
                        padding: 12px;
                    }

                    .portal-target-header {
                        margin-bottom: 16px;
                    }

                    .portal-target-title h4 {
                        font-size: 18px;
                    }

                    .portal-target-inner .card-body,
                    .portal-target-inner .card .p-3 {
                        padding: 12px !important;
                    }

                }

            `}</style>

        </div>
    );
};

export default PortalTargetPage;