import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {apiFetch} from "../api/apiFetch";

import NavbarFinance from "../layouts/NavbarFinance";
import SidebarFinance from "../layouts/SidebarFinance";

/*
|--------------------------------------------------------------------------
| KATEGORI PENGELUARAN
|--------------------------------------------------------------------------
| Sesuaikan daftar ini dengan kategori yang sebenarnya dipakai di backend.
*/
const EXPENSE_CATEGORIES = [
    { value: "konsumsi", label: "Konsumsi" },
    { value: "transportasi", label: "Transportasi" },
    { value: "operasional_lapangan", label: "Operasional Lapangan" },
    { value: "lembur", label: "Lembur" },
    { value: "lainnya", label: "Lain-lain" },
];

/*
|--------------------------------------------------------------------------
| FORM DEFAULT
|--------------------------------------------------------------------------
*/
const EMPTY_FORM = {
    title: "",
    description: "",
    amount: "",
    period: "",
    expense_date: "",
    category: "",
    recipient_type: "all",
    employee_ids: [],
    proof: null,
};

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
const OperationalExpensePage = () => {
    // =========================================================
    // DATA
    // =========================================================
    const [expenses, setExpenses] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // =========================================================
    // FORM
    // =========================================================
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);

    // =========================================================
    // MODAL
    // =========================================================
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    // =========================================================
    // FILTER
    // =========================================================
    const [filterPeriod, setFilterPeriod] = useState("");

    // =========================================================
    // FETCH EXPENSES
    // =========================================================
    const fetchExpenses = async () => {
        try {
            setLoading(true);

            const response = await apiFetch.get(
                "/finance/operational-expenses"
            );

            const data = response.data?.data || [];

            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "Gagal mengambil pengeluaran operasional:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    "Gagal memuat data pengeluaran operasional."
            );

            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH EMPLOYEES
    // =========================================================
    const fetchEmployees = async () => {
        try {
            const response = await apiFetch.get(
                "/finance/employees"
            );

            const data = response.data?.data || [];

            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "Gagal mengambil data teknisi:",
                error
            );

            setEmployees([]);

            toast.error(
                error?.response?.data?.message ||
                    "Gagal memuat data teknisi."
            );
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================
    useEffect(() => {
        fetchExpenses();
        fetchEmployees();
    }, []);

    // =========================================================
    // HELPERS
    // =========================================================
    const getTitle = (item) => {
        return (
            item?.title ||
            item?.name ||
            item?.expense_name ||
            "Pengeluaran Operasional"
        );
    };

    const getCategoryLabel = (item) => {
        const found = EXPENSE_CATEGORIES.find(
            (cat) => cat.value === item?.category
        );

        return found?.label || item?.category || "-";
    };

    const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    };

    const formatPeriod = (period) => {
        if (!period) return "-";

        const [year, month] = String(period).split("-");

        if (!year || !month) {
            return period;
        }

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        return date.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        });
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getRecipientLabel = (item) => {
        if (item?.recipient_type === "all") {
            return "Semua Teknisi";
        }

        if (item?.recipient_type === "selected") {
            const list =
                item?.employees ||
                item?.employee_ids ||
                [];

            if (Array.isArray(list) && list.length > 0) {
                return `${list.length} Teknisi`;
            }

            return "Teknisi Terpilih";
        }

        return item?.recipient_label || "-";
    };

    const getEmployeeName = (employee) => {
        return (
            employee?.name ||
            employee?.employee_name ||
            employee?.full_name ||
            "Teknisi"
        );
    };

    // =========================================================
    // PROOF URL
    // =========================================================
    /*
     * Backend menyimpan proof_file sebagai path RELATIF
     * (contoh: "operational-expenses/xxxx.png") lewat
     * Storage::disk('public')->store(...). Path itu hanya bisa
     * diakses lewat "<domain-root>/storage/<path>" (butuh
     * `php artisan storage:link` di server) — BUKAN lewat
     * VITE_API_URL apa adanya, karena VITE_API_URL biasanya
     * berisi prefix "/api" (mis. https://domain.com/api),
     * yang kalau langsung ditempel akan jadi
     * ".../api/storage/..." dan 404. Di bawah ini kita ambil
     * origin (protocol + host) saja dari VITE_API_URL,
     * membuang path apa pun yang menempel di belakangnya.
     */
    const getStorageOrigin = () => {
        const apiUrl =
            import.meta.env.VITE_API_URL || "";

        if (!apiUrl) {
            return window.location.origin;
        }

        try {
            return new URL(apiUrl).origin;
        } catch (error) {
            // Fallback kalau VITE_API_URL bukan URL absolut yang valid.
            return apiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
        }
    };

    const buildStorageUrl = (path) => {
        if (!path) return null;

        const cleanPath = String(path).replace(/^\/+/, "");

        // Kalau path yang dikirim backend ternyata sudah berupa URL penuh.
        if (/^https?:\/\//i.test(cleanPath)) {
            return cleanPath;
        }

        return `${getStorageOrigin()}/storage/${cleanPath}`;
    };

    const getProofUrl = (item) => {
        if (!item) return null;

        if (item.proof_url) {
            return item.proof_url;
        }

        if (item.file_url) {
            return item.file_url;
        }

        if (item.proof_file) {
            return buildStorageUrl(item.proof_file);
        }

        if (item.proof_path) {
            return buildStorageUrl(item.proof_path);
        }

        if (item.file_path) {
            return buildStorageUrl(item.file_path);
        }

        return null;
    };

    const isImageProof = (item) => {
        const url = getProofUrl(item);

        if (!url) return false;

        return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(
            url
        );
    };

    const isPdfProof = (item) => {
        const url = getProofUrl(item);

        if (!url) return false;

        return /\.pdf(\?.*)?$/i.test(url);
    };

    // =========================================================
    // FILTER
    // =========================================================
    const filteredExpenses = useMemo(() => {
        if (!filterPeriod) {
            return expenses;
        }

        return expenses.filter(
            (item) =>
                String(item.period || "") ===
                filterPeriod
        );
    }, [expenses, filterPeriod]);

    // =========================================================
    // TOTAL
    // =========================================================
    const totalExpense = useMemo(() => {
        return filteredExpenses.reduce(
            (total, item) =>
                total + Number(item.amount || 0),
            0
        );
    }, [filteredExpenses]);

    // =========================================================
    // HANDLE FORM CHANGE
    // =========================================================
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================================================
    // HANDLE PROOF
    // =========================================================
    const handleProofChange = (event) => {
        const file =
            event.target.files?.[0] || null;

        if (!file) {
            setForm((prev) => ({
                ...prev,
                proof: null,
            }));

            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Format bukti harus JPG, JPEG, PNG, WEBP, atau PDF."
            );

            event.target.value = "";

            setForm((prev) => ({
                ...prev,
                proof: null,
            }));

            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error(
                "Ukuran bukti transaksi maksimal 5 MB."
            );

            event.target.value = "";

            setForm((prev) => ({
                ...prev,
                proof: null,
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            proof: file,
        }));
    };

    // =========================================================
    // HANDLE RECIPIENT TYPE
    // =========================================================
    const handleRecipientTypeChange = (event) => {
        const value = event.target.value;

        setForm((prev) => ({
            ...prev,
            recipient_type: value,
            employee_ids:
                value === "all"
                    ? []
                    : prev.employee_ids,
        }));
    };

    // =========================================================
    // HANDLE EMPLOYEE TOGGLE
    // =========================================================
    const handleEmployeeToggle = (employeeId) => {
        setForm((prev) => {
            const exists =
                prev.employee_ids.includes(employeeId);

            return {
                ...prev,
                employee_ids: exists
                    ? prev.employee_ids.filter(
                          (id) => id !== employeeId
                      )
                    : [
                          ...prev.employee_ids,
                          employeeId,
                      ],
            };
        });
    };

    // =========================================================
    // SELECT ALL EMPLOYEES
    // =========================================================
    const handleSelectAllEmployees = () => {
        if (employees.length === 0) {
            return;
        }

        const allIds = employees.map(
            (employee) => employee.id
        );

        const allSelected = allIds.every((id) =>
            form.employee_ids.includes(id)
        );

        setForm((prev) => ({
            ...prev,
            employee_ids: allSelected
                ? []
                : allIds,
        }));
    };

    // =========================================================
    // OPEN ADD MODAL
    // =========================================================
    const openAddModal = () => {
        setEditingId(null);

        const today = new Date()
            .toISOString()
            .slice(0, 10);

        setForm({
            ...EMPTY_FORM,
            period: today.slice(0, 7),
            expense_date: today,
        });

        setShowFormModal(true);
    };

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================
    const openEditModal = (item) => {
        setEditingId(item.id);

        setForm({
            title:
                item.title ||
                item.name ||
                item.expense_name ||
                "",

            description:
                item.description || "",

            amount:
                item.amount || "",

            period:
                item.period || "",

            expense_date:
                item.expense_date
                    ? String(item.expense_date).slice(0, 10)
                    : "",

            category:
                item.category || "",

            recipient_type:
                item.recipient_type ||
                "all",

            employee_ids:
                Array.isArray(item.employee_ids)
                    ? item.employee_ids
                    : Array.isArray(
                          item.employees
                      )
                    ? item.employees.map(
                          (employee) =>
                              typeof employee ===
                              "object"
                                  ? employee.id
                                  : employee
                      )
                    : [],

            proof: null,
        });

        setShowFormModal(true);
    };

    // =========================================================
    // CLOSE FORM MODAL
    // =========================================================
    const closeFormModal = () => {
        setShowFormModal(false);
        setEditingId(null);
        setForm({
            ...EMPTY_FORM,
        });
    };

    // =========================================================
    // SUBMIT
    // =========================================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.title.trim()) {
            toast.error(
                "Nama transaksi wajib diisi."
            );
            return;
        }

        if (
            !form.amount ||
            Number(form.amount) < 0
        ) {
            toast.error(
                "Nominal transaksi wajib diisi."
            );
            return;
        }

        if (!form.period) {
            toast.error(
                "Periode wajib dipilih."
            );
            return;
        }

        if (!form.expense_date) {
            toast.error(
                "Tanggal transaksi wajib diisi."
            );
            return;
        }

        if (!form.category) {
            toast.error(
                "Kategori wajib dipilih."
            );
            return;
        }

        if (
            form.recipient_type === "selected" &&
            form.employee_ids.length === 0
        ) {
            toast.error(
                "Pilih minimal satu teknisi."
            );
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append(
                "title",
                form.title.trim()
            );

            formData.append(
                "description",
                form.description || ""
            );

            formData.append(
                "amount",
                form.amount
            );

            formData.append(
                "period",
                form.period
            );

            formData.append(
                "expense_date",
                form.expense_date
            );

            formData.append(
                "category",
                form.category
            );

            formData.append(
                "recipient_type",
                form.recipient_type
            );

            if (
                form.recipient_type === "selected"
            ) {
                form.employee_ids.forEach(
                    (id) => {
                        formData.append(
                            "employee_ids[]",
                            id
                        );
                    }
                );
            }

            // NOTE: field name harus "proof_file" agar cocok
            // dengan yang divalidasi & disimpan oleh controller.
            if (form.proof) {
                formData.append(
                    "proof_file",
                    form.proof
                );
            }

            if (editingId) {
                formData.append(
                    "_method",
                    "PUT"
                );

                await apiFetch.post(
                    `/finance/operational-expenses/${editingId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                toast.success(
                    "Pengeluaran berhasil diperbarui."
                );
            } else {
                await apiFetch.post(
                    "/finance/operational-expenses",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                toast.success(
                    "Pengeluaran berhasil ditambahkan."
                );
            }

            /*
             * Tutup modal setelah berhasil.
             * Jangan panggil closeFormModal sebelum
             * saving=false karena sebelumnya bisa tertahan.
             */
            setShowFormModal(false);
            setEditingId(null);
            setForm({
                ...EMPTY_FORM,
            });

            await fetchExpenses();
        } catch (error) {
            console.error(
                "Gagal menyimpan pengeluaran:",
                error
            );

            const validationErrors =
                error?.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )[0]?.[0];

                toast.error(
                    firstError ||
                        "Data yang dimasukkan tidak valid."
                );
            } else {
                toast.error(
                    error?.response?.data
                        ?.message ||
                        "Gagal menyimpan pengeluaran."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================
    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Hapus transaksi "${getTitle(
                item
            )}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(item.id);

            await apiFetch.delete(
                `/finance/operational-expenses/${item.id}`
            );

            toast.success(
                "Pengeluaran berhasil dihapus."
            );

            await fetchExpenses();
        } catch (error) {
            console.error(
                "Gagal menghapus pengeluaran:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    "Gagal menghapus pengeluaran."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =========================================================
    // DETAIL
    // =========================================================
    const openDetailModal = (item) => {
        setSelectedExpense(item);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedExpense(null);
        setShowDetailModal(false);
    };

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <>
            {/* =====================================================
                FIX LAYOUT FINANCE
            ====================================================== */}
            <style>
                {`
                    .operational-expense-page {
                        min-height: 100vh;
                        width: 100%;
                        overflow-x: hidden;
                        background: #f8f9fa;
                    }

                    /*
                     * SidebarFinance biasanya fixed.
                     * Karena itu main harus diberi ruang
                     * sebesar lebar sidebar.
                     */
                    .operational-expense-main {
                        margin-left: 260px;
                        width: calc(100% - 260px);
                        min-width: 0;
                        min-height: 100vh;
                    }

                    .operational-expense-content {
                        width: 100%;
                        min-width: 0;
                        overflow-x: hidden;
                    }

                    .operational-expense-container {
                        width: 100%;
                        max-width: 100%;
                    }

                    .operational-expense-table th,
                    .operational-expense-table td {
                        white-space: nowrap;
                    }

                    /*
                     * Tablet
                     */
                    @media (max-width: 991.98px) {
                        .operational-expense-main {
                            margin-left: 0;
                            width: 100%;
                        }
                    }

                    /*
                     * Mobile
                     */
                    @media (max-width: 767.98px) {
                        .operational-expense-main {
                            margin-left: 0;
                            width: 100%;
                        }

                        .operational-expense-container {
                            padding-left: 12px !important;
                            padding-right: 12px !important;
                        }

                        .operational-expense-table th,
                        .operational-expense-table td {
                            font-size: 13px;
                        }
                    }
                `}
            </style>

            <div className="operational-expense-page d-flex">
                {/* =====================================================
                    SIDEBAR
                ====================================================== */}
                <SidebarFinance />

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <div className="operational-expense-main d-flex flex-column">
                    {/* =================================================
                        NAVBAR
                    ================================================== */}
                    <NavbarFinance />

                    {/* =================================================
                        CONTENT
                    ================================================== */}
                    <main className="operational-expense-content flex-grow-1">
                        <div className="operational-expense-container container-fluid py-4 px-3 px-md-4">
                            {/* =====================================================
                                HEADER
                            ====================================================== */}
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                                <div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white flex-shrink-0"
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                            }}
                                        >
                                            <i className="bi bi-wallet2 fs-5"></i>
                                        </div>

                                        <div
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <h4 className="fw-bold mb-1">
                                                Pengeluaran
                                                Operasional
                                            </h4>

                                            <div className="text-muted small">
                                                Kelola biaya
                                                operasional
                                                teknisi
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary rounded-3 px-4 py-2 fw-semibold shadow-sm"
                                    onClick={
                                        openAddModal
                                    }
                                >
                                    <i className="bi bi-plus-lg me-2"></i>
                                    Tambah Pengeluaran
                                </button>
                            </div>

                            {/* =====================================================
                                STATISTICS
                            ====================================================== */}
                            <div className="row g-3 mb-4">
                                {/* TOTAL TRANSAKSI */}
                                <div className="col-12 col-md-6 col-xl-4">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <div className="text-muted small mb-2">
                                                        Total
                                                        Transaksi
                                                    </div>

                                                    <div className="fw-bold fs-3">
                                                        {
                                                            filteredExpenses.length
                                                        }
                                                    </div>
                                                </div>

                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
                                                    style={{
                                                        width: "46px",
                                                        height: "46px",
                                                    }}
                                                >
                                                    <i className="bi bi-receipt fs-5"></i>
                                                </div>
                                            </div>

                                            {filterPeriod && (
                                                <div className="small text-muted mt-3">
                                                    Periode{" "}
                                                    <strong>
                                                        {formatPeriod(
                                                            filterPeriod
                                                        )}
                                                    </strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* TOTAL PENGELUARAN */}
                                <div className="col-12 col-md-6 col-xl-4">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div
                                                    style={{
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div className="text-muted small mb-2">
                                                        Total
                                                        Pengeluaran
                                                    </div>

                                                    <div className="fw-bold fs-3 text-primary text-break">
                                                        {formatRupiah(
                                                            totalExpense
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    className="rounded-3 d-flex align-items-center justify-content-center bg-success-subtle text-success flex-shrink-0"
                                                    style={{
                                                        width: "46px",
                                                        height: "46px",
                                                    }}
                                                >
                                                    <i className="bi bi-cash-stack fs-5"></i>
                                                </div>
                                            </div>

                                            {filterPeriod && (
                                                <div className="small text-muted mt-3">
                                                    Total berdasarkan
                                                    filter
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* =====================================================
                                FILTER
                            ====================================================== */}
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-body p-3 p-md-4">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-12 col-md-5 col-lg-4">
                                            <label className="form-label small fw-semibold text-muted">
                                                Filter Periode
                                            </label>

                                            <div className="input-group">
                                                <span className="input-group-text bg-white">
                                                    <i className="bi bi-calendar3 text-muted"></i>
                                                </span>

                                                <input
                                                    type="month"
                                                    className="form-control"
                                                    value={
                                                        filterPeriod
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setFilterPeriod(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-auto">
                                            <button
                                                type="button"
                                                className="btn btn-light border rounded-3 px-3"
                                                onClick={() =>
                                                    setFilterPeriod(
                                                        ""
                                                    )
                                                }
                                            >
                                                <i className="bi bi-arrow-counterclockwise me-2"></i>
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* =====================================================
                                TABLE
                            ====================================================== */}
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                {/* HEADER */}
                                <div className="card-header bg-white border-0 px-3 px-md-4 py-3">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                Riwayat Pengeluaran
                                            </h6>

                                            <div className="small text-muted">
                                                {
                                                    filteredExpenses.length
                                                }{" "}
                                                transaksi
                                                ditampilkan
                                            </div>
                                        </div>

                                        {filterPeriod && (
                                            <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {formatPeriod(
                                                    filterPeriod
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* BODY */}
                                <div className="card-body p-0">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            />

                                            <div className="text-muted small mt-3">
                                                Memuat data
                                                pengeluaran...
                                            </div>
                                        </div>
                                    ) : filteredExpenses.length ===
                                      0 ? (
                                        <div className="text-center py-5 px-3">
                                            <div
                                                className="mx-auto mb-3 rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "72px",
                                                    height: "72px",
                                                }}
                                            >
                                                <i className="bi bi-receipt text-muted fs-2"></i>
                                            </div>

                                            <h6 className="fw-bold">
                                                Belum ada
                                                transaksi
                                            </h6>

                                            <p className="text-muted small mb-4">
                                                Belum terdapat
                                                pengeluaran
                                                operasional
                                                {filterPeriod
                                                    ? ` pada ${formatPeriod(
                                                          filterPeriod
                                                      )}`
                                                    : "."}
                                            </p>

                                            {!filterPeriod && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded-3 px-4"
                                                    onClick={
                                                        openAddModal
                                                    }
                                                >
                                                    <i className="bi bi-plus-lg me-2"></i>
                                                    Tambah
                                                    Pengeluaran
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0 operational-expense-table">
                                                <thead>
                                                    <tr className="bg-light">
                                                        <th
                                                            className="px-3 px-md-4 py-3 text-muted small fw-semibold"
                                                            style={{
                                                                width: "60px",
                                                            }}
                                                        >
                                                            #
                                                        </th>

                                                        <th className="py-3 text-muted small fw-semibold">
                                                            Transaksi
                                                        </th>

                                                        <th className="py-3 text-muted small fw-semibold">
                                                            Periode
                                                        </th>

                                                        <th className="py-3 text-muted small fw-semibold">
                                                            Penerima
                                                        </th>

                                                        <th className="py-3 text-muted small fw-semibold">
                                                            Nominal
                                                        </th>

                                                        <th className="py-3 text-muted small fw-semibold">
                                                            Bukti
                                                        </th>

                                                        <th className="text-end px-3 px-md-4 py-3 text-muted small fw-semibold">
                                                            Aksi
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {filteredExpenses.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => {
                                                            const proofUrl =
                                                                getProofUrl(
                                                                    item
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >
                                                                    <td className="px-3 px-md-4 text-muted">
                                                                        {index +
                                                                            1}
                                                                    </td>

                                                                    <td>
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div
                                                                                className="d-none d-sm-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary flex-shrink-0"
                                                                                style={{
                                                                                    width: "40px",
                                                                                    height: "40px",
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-receipt"></i>
                                                                            </div>

                                                                            <div
                                                                                style={{
                                                                                    minWidth: 0,
                                                                                }}
                                                                            >
                                                                                <div className="fw-semibold text-dark">
                                                                                    {getTitle(
                                                                                        item
                                                                                    )}
                                                                                </div>

                                                                                {item.description && (
                                                                                    <div
                                                                                        className="small text-muted text-truncate"
                                                                                        style={{
                                                                                            maxWidth:
                                                                                                "280px",
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            item.description
                                                                                        }
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <span className="text-nowrap small">
                                                                            {formatPeriod(
                                                                                item.period
                                                                            )}
                                                                        </span>
                                                                    </td>

                                                                    <td>
                                                                        <span className="badge rounded-pill bg-primary-subtle text-primary fw-medium px-3 py-2">
                                                                            <i className="bi bi-people me-1"></i>
                                                                            {getRecipientLabel(
                                                                                item
                                                                            )}
                                                                        </span>
                                                                    </td>

                                                                    <td>
                                                                        <div className="fw-bold text-dark text-nowrap">
                                                                            {formatRupiah(
                                                                                item.amount
                                                                            )}
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        {proofUrl ? (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-light border rounded-3"
                                                                                onClick={() =>
                                                                                    openDetailModal(
                                                                                        item
                                                                                    )
                                                                                }
                                                                            >
                                                                                <i className="bi bi-paperclip me-1"></i>

                                                                                <span className="d-none d-lg-inline">
                                                                                    Lihat
                                                                                </span>
                                                                            </button>
                                                                        ) : (
                                                                            <span className="text-muted small">
                                                                                Tidak
                                                                                ada
                                                                            </span>
                                                                        )}
                                                                    </td>

                                                                    <td className="text-end px-3 px-md-4">
                                                                        <div className="d-inline-flex gap-1">
                                                                            {/* DETAIL */}
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-light border rounded-3"
                                                                                title="Detail"
                                                                                onClick={() =>
                                                                                    openDetailModal(
                                                                                        item
                                                                                    )
                                                                                }
                                                                            >
                                                                                <i className="bi bi-eye"></i>
                                                                            </button>

                                                                            {/* EDIT */}
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-light border rounded-3 text-primary"
                                                                                title="Edit"
                                                                                onClick={() =>
                                                                                    openEditModal(
                                                                                        item
                                                                                    )
                                                                                }
                                                                            >
                                                                                <i className="bi bi-pencil"></i>
                                                                            </button>

                                                                            {/* DELETE */}
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-light border rounded-3 text-danger"
                                                                                title="Hapus"
                                                                                disabled={
                                                                                    deletingId ===
                                                                                    item.id
                                                                                }
                                                                                onClick={() =>
                                                                                    handleDelete(
                                                                                        item
                                                                                    )
                                                                                }
                                                                            >
                                                                                {deletingId ===
                                                                                item.id ? (
                                                                                    <span
                                                                                        className="spinner-border spinner-border-sm"
                                                                                        role="status"
                                                                                    />
                                                                                ) : (
                                                                                    <i className="bi bi-trash"></i>
                                                                                )}
                                                                            </button>
                                                                        </div>
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
                        </div>
                    </main>
                </div>
            </div>

            {/* =============================================================
                FORM MODAL
            ============================================================= */}
            {showFormModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(15, 23, 42, .60)",
                        backdropFilter:
                            "blur(3px)",
                        zIndex: 1055,
                    }}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                        style={{
                            maxWidth: "850px",
                            margin: "1rem auto",
                        }}
                    >
                        <div
                            className="modal-content border-0 rounded-4 shadow-lg"
                            style={{
                                maxHeight: "90vh",
                                overflow: "hidden",
                            }}
                        >
                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="d-flex flex-column"
                                style={{
                                    maxHeight: "90vh",
                                }}
                            >
                                {/* HEADER */}
                                <div className="modal-header border-0 px-4 py-3 flex-shrink-0">
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div
                                                className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "36px",
                                                    height: "36px",
                                                }}
                                            >
                                                <i className="bi bi-wallet2"></i>
                                            </div>

                                            <div>
                                                <h5 className="modal-title fw-bold mb-0">
                                                    {editingId
                                                        ? "Edit Pengeluaran"
                                                        : "Tambah Pengeluaran"}
                                                </h5>

                                                <div className="text-muted small">
                                                    Lengkapi
                                                    informasi
                                                    transaksi
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={
                                            closeFormModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* BODY */}
                                <div
                                    className="modal-body px-4 py-3"
                                    style={{
                                        overflowY:
                                            "auto",
                                        overflowX:
                                            "hidden",
                                    }}
                                >
                                    <div className="row g-3">
                                        {/* LEFT */}
                                        <div className="col-12 col-lg-6">
                                            <div className="border rounded-4 h-100">
                                                <div className="p-3 p-md-4">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-info-circle text-primary"></i>

                                                        <h6 className="fw-bold mb-0">
                                                            Informasi
                                                            Transaksi
                                                        </h6>
                                                    </div>

                                                    {/* NAMA */}
                                                    <div className="mb-3">
                                                        <label className="form-label small fw-semibold mb-1">
                                                            Nama
                                                            Transaksi
                                                            <span className="text-danger ms-1">
                                                                *
                                                            </span>
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="title"
                                                            className="form-control rounded-3"
                                                            placeholder="Contoh: Makan bersama teknisi"
                                                            value={
                                                                form.title
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    {/* TANGGAL + KATEGORI */}
                                                    <div className="row g-3">
                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label small fw-semibold mb-1">
                                                                Tanggal
                                                                Transaksi
                                                                <span className="text-danger ms-1">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <input
                                                                type="date"
                                                                name="expense_date"
                                                                className="form-control rounded-3"
                                                                value={
                                                                    form.expense_date
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            />
                                                        </div>

                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label small fw-semibold mb-1">
                                                                Kategori
                                                                <span className="text-danger ms-1">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <select
                                                                name="category"
                                                                className="form-select rounded-3"
                                                                value={
                                                                    form.category
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            >
                                                                <option value="">
                                                                    Pilih
                                                                    kategori
                                                                </option>

                                                                {EXPENSE_CATEGORIES.map(
                                                                    (
                                                                        cat
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                cat.value
                                                                            }
                                                                            value={
                                                                                cat.value
                                                                            }
                                                                        >
                                                                            {
                                                                                cat.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* PERIODE + NOMINAL */}
                                                    <div className="row g-3 mt-0">
                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label small fw-semibold mb-1">
                                                                Periode
                                                                <span className="text-danger ms-1">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <input
                                                                type="month"
                                                                name="period"
                                                                className="form-control rounded-3"
                                                                value={
                                                                    form.period
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                required
                                                            />
                                                        </div>

                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label small fw-semibold mb-1">
                                                                Nominal
                                                                <span className="text-danger ms-1">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light">
                                                                    Rp
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    name="amount"
                                                                    className="form-control"
                                                                    min="0"
                                                                    step="1"
                                                                    placeholder="500000"
                                                                    value={
                                                                        form.amount
                                                                    }
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* PENERIMA */}
                                                    <div className="mt-3">
                                                        <label className="form-label small fw-semibold mb-1">
                                                            Berlaku
                                                            Untuk
                                                        </label>

                                                        <select
                                                            name="recipient_type"
                                                            className="form-select rounded-3"
                                                            value={
                                                                form.recipient_type
                                                            }
                                                            onChange={
                                                                handleRecipientTypeChange
                                                            }
                                                        >
                                                            <option value="all">
                                                                Semua
                                                                Teknisi
                                                            </option>

                                                            <option value="selected">
                                                                Beberapa
                                                                Teknisi
                                                            </option>
                                                        </select>
                                                    </div>

                                                    {/* DESCRIPTION */}
                                                    <div className="mt-3">
                                                        <label className="form-label small fw-semibold mb-1">
                                                            Keterangan
                                                        </label>

                                                        <textarea
                                                            name="description"
                                                            className="form-control rounded-3"
                                                            rows="3"
                                                            placeholder="Contoh: Makan bersama setelah lembur"
                                                            value={
                                                                form.description
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                        />

                                                        <div className="form-text">
                                                            Tambahkan
                                                            keterangan
                                                            jika
                                                            diperlukan.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT */}
                                        <div className="col-12 col-lg-6">
                                            <div className="border rounded-4 h-100">
                                                <div className="p-3 p-md-4">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-paperclip text-primary"></i>

                                                        <h6 className="fw-bold mb-0">
                                                            Penerima
                                                            & Bukti
                                                        </h6>
                                                    </div>

                                                    {/* TEKNISI TERPILIH */}
                                                    {form.recipient_type ===
                                                        "selected" && (
                                                        <div className="mb-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                                                <label className="form-label small fw-semibold mb-0">
                                                                    Pilih
                                                                    Teknisi
                                                                    <span className="text-danger ms-1">
                                                                        *
                                                                    </span>
                                                                </label>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary rounded-3"
                                                                    onClick={
                                                                        handleSelectAllEmployees
                                                                    }
                                                                    disabled={
                                                                        employees.length ===
                                                                        0
                                                                    }
                                                                >
                                                                    {employees.length >
                                                                        0 &&
                                                                    employees.every(
                                                                        (
                                                                            employee
                                                                        ) =>
                                                                            form.employee_ids.includes(
                                                                                employee.id
                                                                            )
                                                                    )
                                                                        ? "Batalkan Semua"
                                                                        : "Pilih Semua"}
                                                                </button>
                                                            </div>

                                                            <div
                                                                className="border rounded-3 p-2 bg-light"
                                                                style={{
                                                                    maxHeight:
                                                                        "150px",
                                                                    overflowY:
                                                                        "auto",
                                                                }}
                                                            >
                                                                {employees.length ===
                                                                0 ? (
                                                                    <div className="text-center text-muted small py-3">
                                                                        <i className="bi bi-people fs-4 d-block mb-2"></i>
                                                                        Data
                                                                        teknisi
                                                                        tidak
                                                                        ditemukan.
                                                                    </div>
                                                                ) : (
                                                                    employees.map(
                                                                        (
                                                                            employee
                                                                        ) => {
                                                                            const checked =
                                                                                form.employee_ids.includes(
                                                                                    employee.id
                                                                                );

                                                                            return (
                                                                                <label
                                                                                    key={
                                                                                        employee.id
                                                                                    }
                                                                                    htmlFor={`employee-${employee.id}`}
                                                                                    className={`d-flex align-items-center gap-2 p-2 rounded-3 mb-1 ${
                                                                                        checked
                                                                                            ? "bg-primary-subtle"
                                                                                            : ""
                                                                                    }`}
                                                                                    style={{
                                                                                        cursor: "pointer",
                                                                                    }}
                                                                                >
                                                                                    <input
                                                                                        className="form-check-input mt-0"
                                                                                        type="checkbox"
                                                                                        id={`employee-${employee.id}`}
                                                                                        checked={
                                                                                            checked
                                                                                        }
                                                                                        onChange={() =>
                                                                                            handleEmployeeToggle(
                                                                                                employee.id
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <div
                                                                                        style={{
                                                                                            minWidth: 0,
                                                                                        }}
                                                                                    >
                                                                                        <div className="fw-semibold small text-truncate">
                                                                                            {getEmployeeName(
                                                                                                employee
                                                                                            )}
                                                                                        </div>

                                                                                        {employee.employee_code && (
                                                                                            <div className="text-muted small">
                                                                                                {
                                                                                                    employee.employee_code
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </label>
                                                                            );
                                                                        }
                                                                    )
                                                                )}
                                                            </div>

                                                            <div className="small text-muted mt-2">
                                                                {form
                                                                    .employee_ids
                                                                    .length >
                                                                0
                                                                    ? `${form.employee_ids.length} teknisi dipilih`
                                                                    : "Belum ada teknisi dipilih"}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* INFO ALL */}
                                                    {form.recipient_type ===
                                                        "all" && (
                                                        <div className="alert alert-primary border-0 rounded-3 py-2 px-3 mb-3">
                                                            <div className="d-flex gap-2">
                                                                <i className="bi bi-people-fill mt-1"></i>

                                                                <div className="small">
                                                                    Pengeluaran
                                                                    ini
                                                                    berlaku
                                                                    untuk
                                                                    <strong className="ms-1">
                                                                        semua
                                                                        teknisi
                                                                    </strong>
                                                                    .
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BUKTI */}
                                                    <div>
                                                        <label className="form-label small fw-semibold mb-1">
                                                            Bukti
                                                            Transaksi
                                                        </label>

                                                        <div className="border rounded-3 p-3">
                                                            <input
                                                                type="file"
                                                                className="form-control form-control-sm rounded-3"
                                                                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                                                                onChange={
                                                                    handleProofChange
                                                                }
                                                            />

                                                            <div className="form-text">
                                                                JPG,
                                                                JPEG,
                                                                PNG,
                                                                WEBP
                                                                atau
                                                                PDF.
                                                                Maks.
                                                                5 MB.
                                                            </div>

                                                            {form.proof && (
                                                                <div className="mt-2">
                                                                    <div className="d-flex align-items-center gap-2 p-2 bg-success-subtle rounded-3">
                                                                        <i className="bi bi-check-circle-fill text-success"></i>

                                                                        <div
                                                                            className="flex-grow-1"
                                                                            style={{
                                                                                minWidth: 0,
                                                                            }}
                                                                        >
                                                                            <div className="small fw-semibold text-success">
                                                                                Bukti
                                                                                siap
                                                                                diupload
                                                                            </div>

                                                                            <div className="small text-muted text-break">
                                                                                {
                                                                                    form
                                                                                        .proof
                                                                                        .name
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {form.proof.type.startsWith(
                                                                        "image/"
                                                                    ) && (
                                                                        <div className="mt-2 text-center">
                                                                            <img
                                                                                src={URL.createObjectURL(
                                                                                    form.proof
                                                                                )}
                                                                                alt="Preview bukti"
                                                                                className="img-fluid rounded-3 border"
                                                                                style={{
                                                                                    maxHeight:
                                                                                        "120px",
                                                                                    objectFit:
                                                                                        "contain",
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    {form.proof.type ===
                                                                        "application/pdf" && (
                                                                        <div className="mt-2">
                                                                            <div className="alert alert-light border rounded-3 mb-0 py-2">
                                                                                <i className="bi bi-file-earmark-pdf text-danger me-2"></i>

                                                                                <span className="small">
                                                                                    File
                                                                                    PDF
                                                                                    siap
                                                                                    diupload.
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* INFO */}
                                                    <div className="mt-3 p-2 bg-light rounded-3">
                                                        <div className="d-flex gap-2">
                                                            <i className="bi bi-info-circle text-primary mt-1"></i>

                                                            <div className="small text-muted">
                                                                Bukti
                                                                transaksi
                                                                digunakan
                                                                sebagai
                                                                arsip
                                                                dan
                                                                dokumentasi
                                                                pengeluaran.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer border-0 px-4 py-3 flex-shrink-0">
                                    <button
                                        type="button"
                                        className="btn btn-light border rounded-3 px-4"
                                        onClick={
                                            closeFormModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-3 px-4"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                />

                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg me-2"></i>

                                                {editingId
                                                    ? "Simpan Perubahan"
                                                    : "Simpan Pengeluaran"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =============================================================
                DETAIL MODAL
            ============================================================= */}
            {showDetailModal &&
                selectedExpense && (
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{
                            backgroundColor:
                                "rgba(15, 23, 42, .60)",
                            backdropFilter:
                                "blur(3px)",
                            zIndex: 1055,
                        }}
                    >
                        <div
                            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                            style={{
                                maxWidth: "900px",
                                margin: "1rem auto",
                            }}
                        >
                            <div
                                className="modal-content border-0 rounded-4 shadow-lg"
                                style={{
                                    maxHeight: "90vh",
                                    overflow: "hidden",
                                }}
                            >
                                {/* HEADER */}
                                <div className="modal-header border-0 px-4 py-3 flex-shrink-0">
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div
                                                className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "36px",
                                                    height: "36px",
                                                }}
                                            >
                                                <i className="bi bi-receipt"></i>
                                            </div>

                                            <div>
                                                <h5 className="modal-title fw-bold mb-0">
                                                    Detail
                                                    Pengeluaran
                                                </h5>

                                                <div className="text-muted small">
                                                    Informasi
                                                    lengkap
                                                    transaksi
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={
                                            closeDetailModal
                                        }
                                    />
                                </div>

                                {/* BODY */}
                                <div
                                    className="modal-body px-4 py-3"
                                    style={{
                                        overflowY:
                                            "auto",
                                        overflowX:
                                            "hidden",
                                    }}
                                >
                                    <div className="row g-3">
                                        {/* DETAIL */}
                                        <div className="col-12 col-lg-5">
                                            <div className="border rounded-4 h-100">
                                                <div className="p-3 p-md-4">
                                                    <div className="p-3 bg-light rounded-4 mb-3">
                                                        <div className="d-flex align-items-start gap-3">
                                                            <div
                                                                className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white flex-shrink-0"
                                                                style={{
                                                                    width: "44px",
                                                                    height: "44px",
                                                                }}
                                                            >
                                                                <i className="bi bi-receipt"></i>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    minWidth: 0,
                                                                }}
                                                            >
                                                                <div className="small text-muted mb-1">
                                                                    Nama
                                                                    Transaksi
                                                                </div>

                                                                <div className="fw-bold fs-5 text-break">
                                                                    {getTitle(
                                                                        selectedExpense
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row g-3">
                                                        <div className="col-12 col-sm-6">
                                                            <div className="small text-muted mb-1">
                                                                Tanggal
                                                                Transaksi
                                                            </div>

                                                            <div className="fw-semibold">
                                                                {formatDate(
                                                                    selectedExpense.expense_date
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <div className="small text-muted mb-1">
                                                                Periode
                                                            </div>

                                                            <div className="fw-semibold">
                                                                {formatPeriod(
                                                                    selectedExpense.period
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="col-12">
                                                            <div className="small text-muted mb-1">
                                                                Kategori
                                                            </div>

                                                            <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis px-3 py-2">
                                                                <i className="bi bi-tag me-1"></i>

                                                                {getCategoryLabel(
                                                                    selectedExpense
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="col-12">
                                                            <div className="small text-muted mb-1">
                                                                Berlaku
                                                                Untuk
                                                            </div>

                                                            <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                                                                <i className="bi bi-people me-1"></i>

                                                                {getRecipientLabel(
                                                                    selectedExpense
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="col-12">
                                                            <div className="small text-muted mb-1">
                                                                Nominal
                                                            </div>

                                                            <div className="fw-bold text-primary fs-3 text-break">
                                                                {formatRupiah(
                                                                    selectedExpense.amount
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="col-12">
                                                            <div className="small text-muted mb-1">
                                                                Keterangan
                                                            </div>

                                                            <div className="text-dark text-break">
                                                                {selectedExpense.description ||
                                                                    "Tidak ada keterangan."}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BUKTI */}
                                        <div className="col-12 col-lg-7">
                                            <div className="border rounded-4 h-100">
                                                <div className="p-3 p-md-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                                                        <div>
                                                            <h6 className="fw-bold mb-1">
                                                                Bukti
                                                                Transaksi
                                                            </h6>

                                                            <div className="small text-muted">
                                                                Lampiran
                                                                transaksi
                                                            </div>
                                                        </div>

                                                        {getProofUrl(
                                                            selectedExpense
                                                        ) && (
                                                            <a
                                                                href={getProofUrl(
                                                                    selectedExpense
                                                                )}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn btn-sm btn-outline-primary rounded-3"
                                                            >
                                                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                                                Buka
                                                            </a>
                                                        )}
                                                    </div>

                                                    {getProofUrl(
                                                        selectedExpense
                                                    ) ? (
                                                        isImageProof(
                                                            selectedExpense
                                                        ) ? (
                                                            <div
                                                                className="border rounded-4 p-2 bg-light text-center"
                                                                style={{
                                                                    height: "360px",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    overflow:
                                                                        "hidden",
                                                                }}
                                                            >
                                                                <img
                                                                    src={getProofUrl(
                                                                        selectedExpense
                                                                    )}
                                                                    alt="Bukti transaksi"
                                                                    className="img-fluid rounded-3"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "340px",
                                                                        width: "auto",
                                                                        height: "auto",
                                                                        objectFit:
                                                                            "contain",
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : isPdfProof(
                                                              selectedExpense
                                                          ) ? (
                                                            <div
                                                                className="border rounded-4 overflow-hidden bg-light"
                                                                style={{
                                                                    height: "360px",
                                                                }}
                                                            >
                                                                <iframe
                                                                    src={getProofUrl(
                                                                        selectedExpense
                                                                    )}
                                                                    title="Bukti transaksi PDF"
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        border: "0",
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="border rounded-4 p-4 bg-light text-center">
                                                                <i className="bi bi-file-earmark-text fs-1 text-primary d-block mb-3"></i>

                                                                <div className="fw-semibold mb-2">
                                                                    File
                                                                    bukti
                                                                    transaksi
                                                                </div>

                                                                <div className="text-muted small mb-3">
                                                                    Format
                                                                    file
                                                                    tidak
                                                                    dapat
                                                                    dipreview
                                                                    langsung.
                                                                </div>

                                                                <a
                                                                    href={getProofUrl(
                                                                        selectedExpense
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="btn btn-primary rounded-3 px-4"
                                                                >
                                                                    <i className="bi bi-box-arrow-up-right me-2"></i>
                                                                    Buka
                                                                    File
                                                                </a>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="border rounded-4 p-5 bg-light text-center">
                                                            <i className="bi bi-file-earmark-x fs-1 text-muted d-block mb-3"></i>

                                                            <div className="fw-semibold mb-1">
                                                                Tidak
                                                                ada
                                                                bukti
                                                                transaksi
                                                            </div>

                                                            <div className="text-muted small">
                                                                Transaksi
                                                                ini
                                                                tidak
                                                                memiliki
                                                                lampiran
                                                                bukti.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer border-0 px-4 py-3 flex-shrink-0">
                                    <button
                                        type="button"
                                        className="btn btn-light border rounded-3 px-4"
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
        </>
    );
};

export default OperationalExpensePage;