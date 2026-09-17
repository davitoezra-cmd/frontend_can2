import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {apiFetch} from "../api/apiFetch";

// =====================================================
// TARGET COMPONENTS
// =====================================================

import EmployeeTargetStats from "../components/supervisor/EmployeeTargetStats";
import EmployeeTargetFilter from "../components/supervisor/EmployeeTargetFilter";
import EmployeeTargetTable from "../components/supervisor/EmployeeTargetTable";
import EmployeeTargetFormModal from "../components/supervisor/EmployeeTargetFormModal";
import EmployeeTargetProgressModal from "../components/supervisor/EmployeeTargetProgressModal";
import EmployeeTargetDetailModal from "../components/supervisor/EmployeeTargetDetailModal";

// =====================================================
// PERFORMANCE COMPONENTS
// =====================================================

import EmployeePerformanceStats from "../components/supervisorperformance/EmployeePerformanceStats";
import EmployeePerformanceFilter from "../components/supervisorperformance/EmployeePerformanceFilter";
import EmployeePerformanceTable from "../components/supervisorperformance/EmployeePerformanceTable";
import EmployeePerformanceFormModal from "../components/supervisorperformance/EmployeePerformanceFormModal";
import EmployeePerformanceDetailModal from "../components/supervisorperformance/EmployeePerformanceDetailModal";

// =====================================================
// API ADMIN
// =====================================================

const TARGET_API = "/admin/performance/targets";
const PERFORMANCE_API = "/admin/performance/evaluations";
const EMPLOYEE_API = "/admin/performance/employees";
const SUPERVISOR_API = "/admin/performance/supervisors";

// =====================================================
// HELPERS
// =====================================================

const getResponseData = (response) => {
    return (
        response?.data?.data ??
        response?.data ??
        []
    );
};

const getErrorMessage = (
    error,
    fallback = "Terjadi kesalahan."
) => {
    if (!error) {
        return fallback;
    }

    // apiFetch error
    if (
        error.data &&
        typeof error.data === "object"
    ) {
        return (
            error.data.message ||
            error.data.error ||
            (
                error.data.errors &&
                typeof error.data.errors === "object"
                    ? Object.values(error.data.errors)
                        .flat()
                        .join(", ")
                    : null
            ) ||
            error.message ||
            fallback
        );
    }

    return error.message || fallback;
};

// =====================================================
// COMPONENT
// =====================================================

const AdminPerformanceTargetPage = () => {
    // =====================================================
    // TAB
    // =====================================================

    const [activeTab, setActiveTab] =
        useState("target");

    // =====================================================
    // COMMON DATA
    // =====================================================

    const [employees, setEmployees] =
        useState([]);

    const [supervisors, setSupervisors] =
        useState([]);

    const [targets, setTargets] =
        useState([]);

    const [performances, setPerformances] =
        useState([]);

    // =====================================================
    // LOADING
    // =====================================================

    const [loadingTargets, setLoadingTargets] =
        useState(true);

    const [loadingPerformances, setLoadingPerformances] =
        useState(true);

    const [loadingEmployees, setLoadingEmployees] =
        useState(true);

    const [error, setError] =
        useState("");

    // =====================================================
    // TARGET FILTER
    // =====================================================

    const [targetFilters, setTargetFilters] =
        useState({
            search: "",
            status: "",
            category: "",
            period: "",
        });

    // =====================================================
    // PERFORMANCE FILTER
    // =====================================================

    const [searchQuery, setSearchQuery] =
        useState("");

    const [selectedGrade, setSelectedGrade] =
        useState("ALL");

    const [selectedPeriod, setSelectedPeriod] =
        useState("");

    // =====================================================
    // TARGET MODAL
    // =====================================================

    const [showTargetForm, setShowTargetForm] =
        useState(false);

    const [showTargetProgress, setShowTargetProgress] =
        useState(false);

    const [showTargetDetail, setShowTargetDetail] =
        useState(false);

    const [showTargetDelete, setShowTargetDelete] =
        useState(false);

    const [selectedTarget, setSelectedTarget] =
        useState(null);

    // =====================================================
    // PERFORMANCE MODAL
    // =====================================================

    const [showPerformanceForm, setShowPerformanceForm] =
        useState(false);

    const [showPerformanceDetail, setShowPerformanceDetail] =
        useState(false);

    const [showPerformanceDelete, setShowPerformanceDelete] =
        useState(false);

    const [isPerformanceEdit, setIsPerformanceEdit] =
        useState(false);

    const [selectedPerformance, setSelectedPerformance] =
        useState(null);

    const [performanceDetail, setPerformanceDetail] =
        useState(null);

    const [
        performanceDetailLoading,
        setPerformanceDetailLoading,
    ] = useState(false);

    // =====================================================
    // SUBMIT / DELETE
    // =====================================================

    const [submitting, setSubmitting] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    // =====================================================
    // FETCH EMPLOYEES
    // =====================================================

    const fetchEmployees = useCallback(async () => {
        setLoadingEmployees(true);

        try {
            const response =
                await apiFetch.get(
                    EMPLOYEE_API
                );

            const data =
                getResponseData(response);

            setEmployees(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Gagal mengambil employee:",
                err
            );

            setEmployees([]);

            setError(
                getErrorMessage(
                    err,
                    "Gagal mengambil daftar employee."
                )
            );
        } finally {
            setLoadingEmployees(false);
        }
    }, []);

    // =====================================================
    // FETCH SUPERVISORS
    // =====================================================

    const fetchSupervisors =
        useCallback(async () => {
            try {
                const response =
                    await apiFetch.get(
                        SUPERVISOR_API
                    );

                const data =
                    getResponseData(response);

                setSupervisors(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (err) {
                console.error(
                    "Gagal mengambil supervisor:",
                    err
                );

                setSupervisors([]);

                setError(
                    getErrorMessage(
                        err,
                        "Gagal mengambil daftar supervisor."
                    )
                );
            }
        }, []);

    // =====================================================
    // FETCH TARGETS
    // =====================================================

    const fetchTargets =
        useCallback(async () => {
            setLoadingTargets(true);
            setError("");

            try {
                const response =
                    await apiFetch.get(
                        TARGET_API
                    );

                const data =
                    getResponseData(response);

                setTargets(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (err) {
                console.error(
                    "Gagal mengambil target:",
                    err
                );

                setTargets([]);

                setError(
                    getErrorMessage(
                        err,
                        "Gagal memuat data target."
                    )
                );
            } finally {
                setLoadingTargets(false);
            }
        }, []);

    // =====================================================
    // FETCH PERFORMANCE
    // =====================================================

    const fetchPerformances =
        useCallback(async () => {
            setLoadingPerformances(true);

            try {
                const response =
                    await apiFetch.get(
                        PERFORMANCE_API
                    );

                const data =
                    getResponseData(response);

                setPerformances(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (err) {
                console.error(
                    "Gagal mengambil performance:",
                    err
                );

                setPerformances([]);

                setError(
                    getErrorMessage(
                        err,
                        "Gagal memuat data penilaian kinerja."
                    )
                );
            } finally {
                setLoadingPerformances(false);
            }
        }, []);

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchEmployees();
        fetchSupervisors();
        fetchTargets();
        fetchPerformances();
    }, [
        fetchEmployees,
        fetchSupervisors,
        fetchTargets,
        fetchPerformances,
    ]);

    // =====================================================
    // TARGET CATEGORIES
    // =====================================================

    const targetCategories =
        useMemo(() => {
            const categories =
                targets
                    .map(
                        (target) =>
                            target.category
                    )
                    .filter(Boolean);

            return [
                ...new Set(categories),
            ];
        }, [targets]);

    // =====================================================
    // FILTER TARGET
    // =====================================================

    const filteredTargets =
        useMemo(() => {
            const search =
                targetFilters.search
                    ?.trim()
                    .toLowerCase() || "";

            return targets.filter(
                (item) => {
                    const employeeName =
                        item.employee?.name
                            ?.toLowerCase() ||
                        "";

                    const employeeCode =
                        item.employee
                            ?.employee_code
                            ?.toLowerCase() ||
                        "";

                    const title =
                        item.title
                            ?.toLowerCase() ||
                        "";

                    const category =
                        item.category
                            ?.toLowerCase() ||
                        "";

                    const supervisorName =
                        item.supervisor?.name
                            ?.toLowerCase() ||
                        "";

                    const matchesSearch =
                        !search ||
                        employeeName.includes(
                            search
                        ) ||
                        employeeCode.includes(
                            search
                        ) ||
                        title.includes(
                            search
                        ) ||
                        category.includes(
                            search
                        ) ||
                        supervisorName.includes(
                            search
                        );

                    const matchesStatus =
                        !targetFilters.status ||
                        item.status ===
                            targetFilters.status;

                    const matchesCategory =
                        !targetFilters.category ||
                        item.category ===
                            targetFilters.category;

                    let matchesPeriod =
                        true;

                    if (
                        targetFilters.period &&
                        item.start_date
                    ) {
                        matchesPeriod =
                            String(
                                item.start_date
                            ).startsWith(
                                targetFilters.period
                            );
                    }

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesCategory &&
                        matchesPeriod
                    );
                }
            );
        }, [
            targets,
            targetFilters,
        ]);

    // =====================================================
    // FILTER PERFORMANCE
    // =====================================================

    const filteredPerformances =
        useMemo(() => {
            const search =
                searchQuery
                    ?.trim()
                    .toLowerCase() || "";

            return performances.filter(
                (item) => {
                    const employeeName =
                        item.employee?.name
                            ?.toLowerCase() ||
                        "";

                    const employeeCode =
                        item.employee
                            ?.employee_code
                            ?.toLowerCase() ||
                        "";

                    const targetTitle =
                        item.employeeTarget
                            ?.title
                            ?.toLowerCase() ||
                        "";

                    const matchesSearch =
                        !search ||
                        employeeName.includes(
                            search
                        ) ||
                        employeeCode.includes(
                            search
                        ) ||
                        targetTitle.includes(
                            search
                        );

                    const matchesGrade =
                        selectedGrade === "ALL" ||
                        item.grade ===
                            selectedGrade;

                    let matchesPeriod =
                        true;

                    if (
                        selectedPeriod &&
                        item.created_at
                    ) {
                        matchesPeriod =
                            String(
                                item.created_at
                            ).startsWith(
                                selectedPeriod
                            );
                    }

                    return (
                        matchesSearch &&
                        matchesGrade &&
                        matchesPeriod
                    );
                }
            );
        }, [
            performances,
            searchQuery,
            selectedGrade,
            selectedPeriod,
        ]);

    // =====================================================
    // RESET TARGET FILTER
    // =====================================================

    const handleResetTargetFilter =
        useCallback(() => {
            setTargetFilters({
                search: "",
                status: "",
                category: "",
                period: "",
            });
        }, []);

    // =====================================================
    // RESET PERFORMANCE FILTER
    // =====================================================

    const handleResetPerformanceFilter =
        useCallback(() => {
            setSearchQuery("");
            setSelectedGrade("ALL");
            setSelectedPeriod("");
        }, []);

    // =====================================================
    // TARGET - CREATE
    // =====================================================

    const handleOpenTargetCreate =
        useCallback(() => {
            setSelectedTarget(null);
            setShowTargetForm(true);
        }, []);

    // =====================================================
    // TARGET - EDIT
    // =====================================================

    const handleOpenTargetEdit =
        useCallback((target) => {
            setSelectedTarget(target);
            setShowTargetForm(true);
        }, []);

    // =====================================================
    // TARGET - PROGRESS
    // =====================================================

    const handleOpenTargetProgress =
        useCallback((target) => {
            setSelectedTarget(target);
            setShowTargetProgress(true);
        }, []);

    // =====================================================
    // TARGET - DETAIL
    // =====================================================

    const handleOpenTargetDetail =
        useCallback(async (target) => {
            setSelectedTarget(target);
            setShowTargetDetail(true);

            try {
                const response =
                    await apiFetch.get(
                        `${TARGET_API}/${target.id}`
                    );

                const data =
                    response?.data?.data ??
                    response?.data;

                if (data) {
                    setSelectedTarget(
                        data
                    );
                }
            } catch (err) {
                console.error(
                    "Gagal mengambil detail target:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal mengambil detail target."
                    )
                );
            }
        }, []);

    // =====================================================
    // TARGET - DELETE OPEN
    // =====================================================

    const handleOpenTargetDelete =
        useCallback((target) => {
            setSelectedTarget(target);
            setShowTargetDelete(true);
        }, []);

    // =====================================================
    // TARGET - SUBMIT
    // =====================================================

    const handleTargetSubmit =
        async (formData) => {
            setSubmitting(true);
            setError("");

            try {
                let payload = {
                    ...formData,
                };

                if (
                    selectedTarget &&
                    !payload.supervisor_id
                ) {
                    payload.supervisor_id =
                        selectedTarget.supervisor_id;
                }

                if (
                    !payload.supervisor_id &&
                    supervisors.length === 1
                ) {
                    payload.supervisor_id =
                        supervisors[0].id;
                }

                if (
                    !payload.supervisor_id
                ) {
                    throw new Error(
                        "Supervisor target belum dipilih."
                    );
                }

                if (selectedTarget?.id) {
                    await apiFetch.put(
                        `${TARGET_API}/${selectedTarget.id}`,
                        payload
                    );
                } else {
                    await apiFetch.post(
                        TARGET_API,
                        payload
                    );
                }

                await fetchTargets();

                setShowTargetForm(
                    false
                );

                setSelectedTarget(null);
            } catch (err) {
                console.error(
                    "Gagal menyimpan target:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal menyimpan target."
                    )
                );
            } finally {
                setSubmitting(false);
            }
        };

    // =====================================================
    // TARGET - PROGRESS
    // =====================================================

    const handleTargetProgress =
        async (
            id,
            currentValue
        ) => {
            setSubmitting(true);
            setError("");

            try {
                await apiFetch.put(
                    `${TARGET_API}/${id}/progress`,
                    {
                        current_value:
                            Number(
                                currentValue
                            ),
                    }
                );

                await fetchTargets();

                setShowTargetProgress(
                    false
                );

                setSelectedTarget(null);
            } catch (err) {
                console.error(
                    "Gagal update progress:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal mengubah progress target."
                    )
                );
            } finally {
                setSubmitting(false);
            }
        };

    // =====================================================
    // TARGET - DELETE
    // =====================================================

    const handleTargetDelete =
        async () => {
            if (
                !selectedTarget?.id
            ) {
                return;
            }

            setDeleting(true);
            setError("");

            try {
                await apiFetch.delete(
                    `${TARGET_API}/${selectedTarget.id}`
                );

                await fetchTargets();

                setShowTargetDelete(
                    false
                );

                setSelectedTarget(null);
            } catch (err) {
                console.error(
                    "Gagal menghapus target:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal menghapus target."
                    )
                );
            } finally {
                setDeleting(false);
            }
        };

    // =====================================================
    // PERFORMANCE - CREATE
    // =====================================================

    const handleOpenPerformanceAdd =
        useCallback(() => {
            setIsPerformanceEdit(false);
            setSelectedPerformance(null);
            setShowPerformanceForm(true);
        }, []);

    // =====================================================
    // PERFORMANCE - EDIT
    // =====================================================

    const handleOpenPerformanceEdit =
        useCallback((item) => {
            setIsPerformanceEdit(true);
            setSelectedPerformance(item);
            setShowPerformanceForm(true);
        }, []);

    // =====================================================
    // PERFORMANCE - DETAIL
    // =====================================================

    const handleOpenPerformanceDetail =
        useCallback(async (id) => {
            setShowPerformanceDetail(true);
            setPerformanceDetailLoading(
                true
            );
            setPerformanceDetail(null);

            try {
                const response =
                    await apiFetch.get(
                        `${PERFORMANCE_API}/${id}`
                    );

                setPerformanceDetail(
                    response?.data?.data ??
                    response?.data ??
                    null
                );
            } catch (err) {
                console.error(
                    "Gagal mengambil detail performance:",
                    err
                );

                setPerformanceDetail(
                    null
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal mengambil detail penilaian."
                    )
                );
            } finally {
                setPerformanceDetailLoading(
                    false
                );
            }
        }, []);

    // =====================================================
    // PERFORMANCE - DELETE OPEN
    // =====================================================

    const handleOpenPerformanceDelete =
        useCallback((item) => {
            setSelectedPerformance(item);
            setShowPerformanceDelete(true);
        }, []);

    // =====================================================
    // PERFORMANCE - SUBMIT
    // =====================================================

    const handlePerformanceSubmit =
        async (formData) => {
            setSubmitting(true);
            setError("");

            try {
                let payload;

                // =========================================
                // EDIT
                // =========================================

                if (isPerformanceEdit) {
                    payload = {
                        score: Number(
                            formData.score
                        ),

                        grade:
                            formData.grade,

                        feedback:
                            formData.feedback ||
                            "",
                    };

                    await apiFetch.put(
                        `${PERFORMANCE_API}/${selectedPerformance.id}`,
                        payload
                    );
                }

                // =========================================
                // CREATE
                // =========================================

                else {
                    payload = {
                        ...formData,

                        score: Number(
                            formData.score
                        ),
                    };

                    // -------------------------------------
                    // AUTO SUPERVISOR DARI TARGET
                    // -------------------------------------

                    if (
                        !payload.supervisor_id &&
                        formData.employee_target_id
                    ) {
                        const selectedTargetData =
                            targets.find(
                                (target) =>
                                    Number(
                                        target.id
                                    ) ===
                                    Number(
                                        formData.employee_target_id
                                    )
                            );

                        if (
                            selectedTargetData?.supervisor_id
                        ) {
                            payload.supervisor_id =
                                selectedTargetData.supervisor_id;
                        }
                    }

                    // -------------------------------------
                    // AUTO SUPERVISOR JIKA CUMA SATU
                    // -------------------------------------

                    if (
                        !payload.supervisor_id &&
                        supervisors.length === 1
                    ) {
                        payload.supervisor_id =
                            supervisors[0].id;
                    }

                    // -------------------------------------
                    // VALIDASI SUPERVISOR
                    // -------------------------------------

                    if (
                        !payload.supervisor_id
                    ) {
                        throw new Error(
                            "Supervisor penilaian belum dipilih."
                        );
                    }

                    await apiFetch.post(
                        PERFORMANCE_API,
                        payload
                    );
                }

                await fetchPerformances();

                setShowPerformanceForm(
                    false
                );

                setSelectedPerformance(
                    null
                );

                setIsPerformanceEdit(
                    false
                );
            } catch (err) {
                console.error(
                    "Gagal menyimpan performance:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal menyimpan penilaian kinerja."
                    )
                );
            } finally {
                setSubmitting(false);
            }
        };

    // =====================================================
    // PERFORMANCE - DELETE
    // =====================================================

    const handlePerformanceDelete =
        async () => {
            if (
                !selectedPerformance?.id
            ) {
                return;
            }

            setDeleting(true);
            setError("");

            try {
                await apiFetch.delete(
                    `${PERFORMANCE_API}/${selectedPerformance.id}`
                );

                await fetchPerformances();

                setShowPerformanceDelete(
                    false
                );

                setSelectedPerformance(
                    null
                );
            } catch (err) {
                console.error(
                    "Gagal menghapus performance:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Gagal menghapus penilaian."
                    )
                );
            } finally {
                setDeleting(false);
            }
        };

    // =====================================================
    // CLOSE TARGET MODALS
    // =====================================================

    const closeTargetModals =
        useCallback(() => {
            setShowTargetForm(false);
            setShowTargetProgress(false);
            setShowTargetDetail(false);
            setShowTargetDelete(false);
            setSelectedTarget(null);
        }, []);

    // =====================================================
    // CLOSE PERFORMANCE FORM
    // =====================================================

    const closePerformanceForm =
        useCallback(() => {
            setShowPerformanceForm(false);
            setSelectedPerformance(null);
            setIsPerformanceEdit(false);
        }, []);

    // =====================================================
    // REFRESH ALL
    // =====================================================

    const handleRefresh =
        async () => {
            setError("");

            await Promise.all([
                fetchEmployees(),
                fetchSupervisors(),
                fetchTargets(),
                fetchPerformances(),
            ]);
        };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            <style>{`
                .admin-performance-page {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow-x: hidden !important;
                    box-sizing: border-box;
                }

                .admin-performance-page *,
                .admin-performance-page *::before,
                .admin-performance-page *::after {
                    box-sizing: border-box;
                }

                .admin-performance-content {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow-x: hidden !important;
                }

                .admin-performance-section {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    overflow-x: hidden !important;
                }

                .admin-performance-header {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                }

                .admin-performance-title-wrapper {
                    min-width: 0 !important;
                    max-width: 100%;
                }

                .admin-performance-title {
                    max-width: 100%;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                .admin-performance-subtitle {
                    max-width: 100%;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                .admin-performance-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    width: auto;
                    max-width: 100%;
                    min-width: 0 !important;
                }

                .admin-performance-actions .btn {
                    max-width: 100%;
                    min-width: 0 !important;
                    white-space: nowrap;
                }

                .admin-performance-tabs {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    overflow: hidden;
                }

                .admin-performance-tab-row {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    margin: 0 !important;
                }

                .admin-performance-tab-col {
                    min-width: 0 !important;
                    max-width: 100%;
                }

                .admin-performance-tab-col .btn {
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .admin-performance-section .card {
                    max-width: 100%;
                    min-width: 0 !important;
                }

                .admin-performance-table-wrapper {
                    display: block;
                    width: 100%;
                    max-width: 100%;
                    min-width: 0 !important;
                    overflow-x: auto !important;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                }

                .admin-performance-table-wrapper table {
                    min-width: 700px;
                }

                .admin-performance-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    max-width: 100%;
                    height: 100%;
                    max-height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 10px;
                }

                .admin-performance-section .employee-target-filter,
                .admin-performance-section .employee-target-filter * {
                    box-sizing: border-box;
                }

                .admin-performance-section .employee-target-filter .input-group {
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    width: 100% !important;
                    align-items: stretch !important;
                }

                .admin-performance-section .employee-target-filter .input-group > .form-control,
                .admin-performance-section .employee-target-filter .input-group > input {
                    flex: 1 1 auto !important;
                    width: 1% !important;
                    min-width: 0 !important;
                }

                .admin-performance-section .employee-target-filter .input-group > .btn,
                .admin-performance-section .employee-target-filter .input-group > button {
                    flex: 0 0 auto !important;
                    width: 42px !important;
                    min-width: 42px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }

                .admin-performance-section .employee-target-filter label {
                    display: block;
                    margin-bottom: 6px;
                }

                @media (max-width: 991.98px) {
                    .admin-performance-page {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-content {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-header {
                        width: 100% !important;
                        max-width: 100% !important;
                    }

                    .admin-performance-actions {
                        width: 100%;
                        max-width: 100%;
                    }
                }

                @media (max-width: 767.98px) {
                    html,
                    body {
                        max-width: 100%;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-page {
                        display: block !important;
                        width: 100vw !important;
                        max-width: 100vw !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow-x: hidden !important;
                        box-sizing: border-box !important;
                    }

                    .admin-performance-content {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-section {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-header {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        margin-bottom: 16px !important;
                    }

                    .admin-performance-title-wrapper {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                    }

                    .admin-performance-title {
                        font-size: 18px !important;
                        line-height: 1.3 !important;
                        max-width: 100% !important;
                        overflow-wrap: anywhere !important;
                        word-break: break-word !important;
                    }

                    .admin-performance-subtitle {
                        font-size: 12px !important;
                        line-height: 1.4 !important;
                        max-width: 100% !important;
                        overflow-wrap: anywhere !important;
                    }

                    .admin-performance-actions {
                        display: grid !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 8px !important;
                        margin-top: 12px;
                    }

                    .admin-performance-actions .btn {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        padding: 8px 6px !important;
                        font-size: 12px !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                    }

                    .admin-performance-actions .btn i {
                        flex-shrink: 0;
                    }

                    .admin-performance-actions .btn span {
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .admin-performance-tabs {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin-bottom: 16px !important;
                        overflow: hidden !important;
                    }

                    .admin-performance-tabs .card-body {
                        padding: 6px !important;
                    }

                    .admin-performance-tab-row {
                        display: flex !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        gap: 6px !important;
                    }

                    .admin-performance-tab-col {
                        width: 50% !important;
                        max-width: 50% !important;
                        flex: 0 0 50% !important;
                        padding: 0 !important;
                        min-width: 0 !important;
                    }

                    .admin-performance-tab-col .btn {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        padding: 8px 4px !important;
                        font-size: 11px !important;
                        white-space: nowrap !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                    }

                    .admin-performance-tab-col .btn i {
                        margin-right: 3px !important;
                    }

                    .admin-performance-section .card {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                    }

                    .admin-performance-table-wrapper {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-width: 0 !important;
                        overflow-x: auto !important;
                        overflow-y: hidden !important;
                    }

                    .admin-performance-table-wrapper table {
                        min-width: 700px !important;
                    }

                    .admin-performance-modal-backdrop {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        padding: 8px !important;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-modal-backdrop .modal-dialog {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 8px auto !important;
                    }

                    .admin-performance-section .employee-target-filter .input-group {
                        display: flex !important;
                        flex-wrap: nowrap !important;
                        width: 100% !important;
                    }

                    .admin-performance-section .employee-target-filter .input-group > .btn,
                    .admin-performance-section .employee-target-filter .input-group > button {
                        width: 42px !important;
                        min-width: 42px !important;
                        flex: 0 0 42px !important;
                    }

                    .admin-performance-section .employee-target-filter .input-group > .form-control,
                    .admin-performance-section .employee-target-filter .input-group > input {
                        flex: 1 1 auto !important;
                        width: auto !important;
                        min-width: 0 !important;
                    }
                }

                @media (max-width: 400px) {
                    .admin-performance-page {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        overflow-x: hidden !important;
                    }

                    .admin-performance-title {
                        font-size: 16px !important;
                    }

                    .admin-performance-subtitle {
                        font-size: 11px !important;
                    }

                    .admin-performance-actions {
                        grid-template-columns: repeat(
                            2,
                            minmax(0, 1fr)
                        ) !important;
                        gap: 6px !important;
                    }

                    .admin-performance-actions .btn {
                        font-size: 10px !important;
                        padding: 7px 4px !important;
                    }

                    .admin-performance-tab-col .btn {
                        font-size: 10px !important;
                        padding: 7px 2px !important;
                    }
                }

                @media (max-width: 320px) {
                    .admin-performance-actions {
                        grid-template-columns: 1fr !important;
                    }

                    .admin-performance-actions .btn {
                        font-size: 11px !important;
                    }

                    .admin-performance-tab-row {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 5px !important;
                    }

                    .admin-performance-tab-col {
                        width: 100% !important;
                        max-width: 100% !important;
                        flex: 0 0 100% !important;
                    }

                    .admin-performance-tab-col .btn {
                        width: 100% !important;
                        font-size: 11px !important;
                    }
                }
            `}</style>

            <div
                className="admin-performance-page d-flex flex-column"
                style={{
                    backgroundColor: "#f6f8fb",
                }}
            >
                <div className="admin-performance-content">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div
                        className="
                            admin-performance-header
                            d-flex
                            flex-column
                            flex-lg-row
                            justify-content-between
                            align-items-lg-center
                            gap-3
                            mb-4
                        "
                    >
                        <div className="admin-performance-title-wrapper">
                            <div className="d-flex align-items-center gap-2 mb-1">

                                <div
                                    className="
                                        rounded-3
                                        bg-primary
                                        bg-opacity-10
                                        text-primary
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                        flex-shrink-0
                                    "
                                    style={{
                                        width: 42,
                                        height: 42,
                                    }}
                                >
                                    <i className="bi bi-graph-up-arrow fs-5"></i>
                                </div>

                                <div className="admin-performance-title-wrapper">

                                    <h3 className="admin-performance-title fw-bold text-dark mb-0">
                                        Performance & Target
                                    </h3>

                                    <p className="admin-performance-subtitle text-muted small mb-0">
                                        Kelola target dan penilaian
                                        kinerja seluruh karyawan.
                                    </p>

                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            ACTION BUTTON
                        ================================================= */}

                        <div className="admin-performance-actions">

                            <button
                                type="button"
                                className="
                                    btn
                                    btn-outline-secondary
                                    bg-white
                                    shadow-sm
                                    d-flex
                                    align-items-center
                                    justify-content-center
                                    gap-2
                                "
                                onClick={
                                    handleRefresh
                                }
                                disabled={
                                    loadingTargets ||
                                    loadingPerformances ||
                                    loadingEmployees
                                }
                            >
                                <i className="bi bi-arrow-clockwise"></i>

                                <span>
                                    Refresh
                                </span>
                            </button>

                            {activeTab ===
                                "target" && (
                                <button
                                    type="button"
                                    className="
                                        btn
                                        btn-primary
                                        shadow-sm
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                        gap-2
                                    "
                                    onClick={
                                        handleOpenTargetCreate
                                    }
                                >
                                    <i className="bi bi-plus-lg"></i>

                                    <span>
                                        Tambah Target
                                    </span>
                                </button>
                            )}

                            {activeTab ===
                                "performance" && (
                                <button
                                    type="button"
                                    className="
                                        btn
                                        btn-primary
                                        shadow-sm
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                        gap-2
                                    "
                                    onClick={
                                        handleOpenPerformanceAdd
                                    }
                                >
                                    <i className="bi bi-plus-lg"></i>

                                    <span>
                                        Tambah Penilaian
                                    </span>
                                </button>
                            )}

                        </div>
                    </div>

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="
                                alert
                                alert-danger
                                border-0
                                shadow-sm
                                rounded-4
                                d-flex
                                align-items-start
                                gap-2
                                mb-4
                            "
                        >
                            <i className="bi bi-exclamation-triangle-fill mt-1"></i>

                            <div className="flex-grow-1 min-w-0">
                                <div className="fw-semibold">
                                    Terjadi kesalahan
                                </div>

                                <div className="small text-break">
                                    {error}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-close flex-shrink-0"
                                onClick={() =>
                                    setError("")
                                }
                            ></button>
                        </div>
                    )}

                    {/* =================================================
                        TABS
                    ================================================= */}

                    <div
                        className="
                            admin-performance-tabs
                            card
                            border-0
                            shadow-sm
                            rounded-4
                            mb-4
                        "
                    >
                        <div className="card-body p-2">

                            <div className="admin-performance-tab-row row g-2">

                                <div className="admin-performance-tab-col col-12 col-md-6">
                                    <button
                                        type="button"
                                        className={`
                                            btn
                                            w-100
                                            py-2
                                            rounded-3
                                            fw-semibold
                                            ${
                                                activeTab ===
                                                "target"
                                                    ? "btn-primary"
                                                    : "btn-light text-secondary"
                                            }
                                        `}
                                        onClick={() =>
                                            setActiveTab(
                                                "target"
                                            )
                                        }
                                    >
                                        <i className="bi bi-bullseye me-2"></i>

                                        Target Kinerja
                                    </button>
                                </div>

                                <div className="admin-performance-tab-col col-12 col-md-6">
                                    <button
                                        type="button"
                                        className={`
                                            btn
                                            w-100
                                            py-2
                                            rounded-3
                                            fw-semibold
                                            ${
                                                activeTab ===
                                                "performance"
                                                    ? "btn-primary"
                                                    : "btn-light text-secondary"
                                            }
                                        `}
                                        onClick={() =>
                                            setActiveTab(
                                                "performance"
                                            )
                                        }
                                    >
                                        <i className="bi bi-bar-chart-line me-2"></i>

                                        Penilaian Kinerja
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        TARGET TAB
                    ================================================= */}

                    {activeTab ===
                        "target" && (
                        <div className="admin-performance-section">

                            <EmployeeTargetStats
                                targets={
                                    targets
                                }
                            />

                            <EmployeeTargetFilter
                                filters={
                                    targetFilters
                                }
                                setFilters={
                                    setTargetFilters
                                }
                                categories={
                                    targetCategories
                                }
                                onReset={
                                    handleResetTargetFilter
                                }
                            />

                            {loadingTargets ? (
                                <div
                                    className="
                                        card
                                        border-0
                                        shadow-sm
                                        rounded-4
                                        bg-white
                                        p-5
                                        text-center
                                    "
                                >
                                    <div
                                        className="
                                            spinner-border
                                            text-primary
                                            mb-3
                                        "
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>

                                    <h6 className="fw-semibold mb-1">
                                        Memuat target
                                    </h6>

                                    <p className="text-muted small mb-0">
                                        Mengambil data target seluruh
                                        karyawan...
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className="
                                        card
                                        border-0
                                        shadow-sm
                                        rounded-4
                                        overflow-hidden
                                    "
                                >
                                    <div className="card-body p-0">

                                        <div className="admin-performance-table-wrapper">

                                            <EmployeeTargetTable
                                                targets={
                                                    filteredTargets
                                                }
                                                onDetail={
                                                    handleOpenTargetDetail
                                                }
                                                onProgress={
                                                    handleOpenTargetProgress
                                                }
                                                onEdit={
                                                    handleOpenTargetEdit
                                                }
                                                onDelete={
                                                    handleOpenTargetDelete
                                                }
                                            />

                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        PERFORMANCE TAB
                    ================================================= */}

                    {activeTab ===
                        "performance" && (
                        <div className="admin-performance-section">

                            <EmployeePerformanceStats
                                performances={
                                    performances
                                }
                            />

                            <EmployeePerformanceFilter
                                searchQuery={
                                    searchQuery
                                }
                                setSearchQuery={
                                    setSearchQuery
                                }
                                selectedGrade={
                                    selectedGrade
                                }
                                setSelectedGrade={
                                    setSelectedGrade
                                }
                                selectedPeriod={
                                    selectedPeriod
                                }
                                setSelectedPeriod={
                                    setSelectedPeriod
                                }
                                onReset={
                                    handleResetPerformanceFilter
                                }
                            />

                            <div
                                className="
                                    card
                                    border-0
                                    shadow-sm
                                    rounded-4
                                    overflow-hidden
                                "
                            >
                                <div className="card-body p-0">

                                    <div className="admin-performance-table-wrapper">

                                        <EmployeePerformanceTable
                                            performances={
                                                filteredPerformances
                                            }
                                            loading={
                                                loadingPerformances
                                            }
                                            onDetail={
                                                handleOpenPerformanceDetail
                                            }
                                            onEdit={
                                                handleOpenPerformanceEdit
                                            }
                                            onDelete={
                                                handleOpenPerformanceDelete
                                            }
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        TARGET FORM MODAL
                    ===================================================== */}

                    <EmployeeTargetFormModal
                        isOpen={
                            showTargetForm
                        }
                        onClose={
                            closeTargetModals
                        }
                        onSubmit={
                            handleTargetSubmit
                        }
                        initialData={
                            selectedTarget
                        }
                        employees={
                            employees
                        }
                        supervisors={
                            supervisors
                        }
                        submitting={
                            submitting
                        }
                    />

                    {/* =====================================================
                        TARGET PROGRESS MODAL
                    ===================================================== */}

                    <EmployeeTargetProgressModal
                        isOpen={
                            showTargetProgress
                        }
                        onClose={
                            closeTargetModals
                        }
                        onSubmit={
                            handleTargetProgress
                        }
                        data={
                            selectedTarget
                        }
                        submitting={
                            submitting
                        }
                    />

                    {/* =====================================================
                        TARGET DETAIL MODAL
                    ===================================================== */}

                    <EmployeeTargetDetailModal
                        isOpen={
                            showTargetDetail
                        }
                        onClose={
                            closeTargetModals
                        }
                        data={
                            selectedTarget
                        }
                    />

                    {/* =====================================================
                        TARGET DELETE MODAL
                    ===================================================== */}

                    {showTargetDelete &&
                        selectedTarget && (
                            <div
                                className="
                                    modal
                                    fade
                                    show
                                    d-block
                                    bg-dark
                                    bg-opacity-50
                                "
                                tabIndex="-1"
                                style={{
                                    zIndex: 1060,
                                }}
                            >
                                <div
                                    className="
                                        modal-dialog
                                        modal-dialog-centered
                                        modal-sm
                                    "
                                >
                                    <div
                                        className="
                                            modal-content
                                            border-0
                                            rounded-4
                                            shadow-lg
                                        "
                                    >
                                        <div className="modal-body p-4 text-center">

                                            <div
                                                className="
                                                    bg-danger
                                                    bg-opacity-10
                                                    text-danger
                                                    rounded-circle
                                                    d-flex
                                                    align-items-center
                                                    justify-content-center
                                                    mx-auto
                                                    mb-3
                                                "
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                }}
                                            >
                                                <i className="bi bi-trash3 fs-4"></i>
                                            </div>

                                            <h5 className="fw-bold mb-2">
                                                Hapus Target?
                                            </h5>

                                            <p className="text-muted small mb-1">
                                                Target berikut akan dihapus:
                                            </p>

                                            <div
                                                className="
                                                    bg-light
                                                    rounded-3
                                                    p-3
                                                    mb-4
                                                "
                                            >
                                                <div className="fw-semibold text-dark text-break">
                                                    {
                                                        selectedTarget.title
                                                    }
                                                </div>

                                                <small className="text-muted">
                                                    {
                                                        selectedTarget.employee
                                                            ?.name ||
                                                        "Employee"
                                                    }
                                                </small>
                                            </div>

                                            <div className="d-flex gap-2">

                                                <button
                                                    type="button"
                                                    className="
                                                        btn
                                                        btn-light
                                                        flex-fill
                                                        border
                                                    "
                                                    onClick={
                                                        closeTargetModals
                                                    }
                                                    disabled={
                                                        deleting
                                                    }
                                                >
                                                    Batal
                                                </button>

                                                <button
                                                    type="button"
                                                    className="
                                                        btn
                                                        btn-danger
                                                        flex-fill
                                                    "
                                                    onClick={
                                                        handleTargetDelete
                                                    }
                                                    disabled={
                                                        deleting
                                                    }
                                                >
                                                    {deleting ? (
                                                        <>
                                                            <span
                                                                className="
                                                                    spinner-border
                                                                    spinner-border-sm
                                                                    me-2
                                                                "
                                                            ></span>

                                                            Menghapus
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-trash3 me-1"></i>
                                                            Hapus
                                                        </>
                                                    )}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* =====================================================
                        PERFORMANCE FORM MODAL
                    ===================================================== */}

                    <EmployeePerformanceFormModal
                        show={
                            showPerformanceForm
                        }
                        onClose={
                            closePerformanceForm
                        }
                        onSubmit={
                            handlePerformanceSubmit
                        }
                        isEdit={
                            isPerformanceEdit
                        }
                        initialData={
                            selectedPerformance
                        }
                        employees={
                            employees
                        }
                        targets={
                            targets
                        }
                        supervisors={
                            supervisors
                        }
                        submitting={
                            submitting
                        }
                    />

                    {/* =====================================================
                        PERFORMANCE DETAIL
                    ===================================================== */}

                    <EmployeePerformanceDetailModal
                        show={
                            showPerformanceDetail
                        }
                        onClose={() =>
                            setShowPerformanceDetail(
                                false
                            )
                        }
                        detailData={
                            performanceDetail
                        }
                        loading={
                            performanceDetailLoading
                        }
                    />

                    {/* =====================================================
                        PERFORMANCE DELETE
                    ===================================================== */}

                    {showPerformanceDelete &&
                        selectedPerformance && (
                            <div
                                className="
                                    modal
                                    fade
                                    show
                                    d-block
                                    bg-dark
                                    bg-opacity-50
                                "
                                tabIndex="-1"
                                style={{
                                    zIndex: 1060,
                                }}
                            >
                                <div
                                    className="
                                        modal-dialog
                                        modal-dialog-centered
                                        modal-sm
                                    "
                                >
                                    <div
                                        className="
                                            modal-content
                                            border-0
                                            rounded-4
                                            shadow-lg
                                        "
                                    >
                                        <div className="modal-body p-4 text-center">

                                            <div
                                                className="
                                                    bg-danger
                                                    bg-opacity-10
                                                    text-danger
                                                    rounded-circle
                                                    d-flex
                                                    align-items-center
                                                    justify-content-center
                                                    mx-auto
                                                    mb-3
                                                "
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                }}
                                            >
                                                <i className="bi bi-trash3 fs-4"></i>
                                            </div>

                                            <h5 className="fw-bold mb-2">
                                                Hapus Penilaian?
                                            </h5>

                                            <p className="text-muted small mb-4">
                                                Penilaian kinerja untuk{" "}
                                                <strong>
                                                    {
                                                        selectedPerformance
                                                            .employee
                                                            ?.name
                                                    }
                                                </strong>{" "}
                                                akan dihapus.
                                            </p>

                                            <div className="d-flex gap-2">

                                                <button
                                                    type="button"
                                                    className="
                                                        btn
                                                        btn-light
                                                        border
                                                        flex-fill
                                                    "
                                                    onClick={() => {
                                                        setShowPerformanceDelete(
                                                            false
                                                        );

                                                        setSelectedPerformance(
                                                            null
                                                        );
                                                    }}
                                                    disabled={
                                                        deleting
                                                    }
                                                >
                                                    Batal
                                                </button>

                                                <button
                                                    type="button"
                                                    className="
                                                        btn
                                                        btn-danger
                                                        flex-fill
                                                    "
                                                    onClick={
                                                        handlePerformanceDelete
                                                    }
                                                    disabled={
                                                        deleting
                                                    }
                                                >
                                                    {deleting ? (
                                                        <>
                                                            <span
                                                                className="
                                                                    spinner-border
                                                                    spinner-border-sm
                                                                    me-2
                                                                "
                                                            ></span>

                                                            Menghapus
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-trash3 me-1"></i>
                                                            Hapus
                                                        </>
                                                    )}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                </div>
            </div>
        </>
    );
};

export default AdminPerformanceTargetPage;

