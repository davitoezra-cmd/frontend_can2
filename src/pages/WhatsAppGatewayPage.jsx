import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";
import Swal from "sweetalert2";

const API_URL = "/admin/whatsapp-gateway";

const EMPTY_FORM = {
    name: "WhatsApp Gateway",
    provider: "custom",
    url: "",
    api_id: "",
    api_key: "",
    is_active: true,
};

const WhatsAppGatewayPage = () => {
    const [gateway, setGateway] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testSending, setTestSending] = useState(false);

    const [showApiKey, setShowApiKey] = useState(false);

    const [error, setError] = useState("");

    // =========================================================
    // FETCH DATA
    // =========================================================

    const fetchGateway = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFetch.get(API_URL);

            const data = response?.data?.data ?? null;

            setGateway(data);

            if (data) {
                setForm({
                    name: data.name || "WhatsApp Gateway",
                    provider: data.provider || "custom",
                    url: data.url || "",
                    api_id: data.api_id || "",
                    api_key: "",
                    is_active: Boolean(data.is_active),
                });
            } else {
                setForm(EMPTY_FORM);
            }
        } catch (err) {
            console.error(
                "FETCH WHATSAPP GATEWAY ERROR:",
                err
            );

            const message =
                err?.data?.message ||
                err?.message ||
                "Gagal mengambil pengaturan WhatsApp Gateway.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGateway();
    }, [fetchGateway]);

    // =========================================================
    // FORM
    // =========================================================

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =========================================================
    // SAVE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.provider) {
            Swal.fire({
                icon: "warning",
                title: "Provider belum dipilih",
                text: "Pilih provider WhatsApp Gateway.",
            });

            return;
        }

        if (!form.url.trim()) {
            Swal.fire({
                icon: "warning",
                title: "URL belum diisi",
                text: "Masukkan URL WhatsApp Gateway.",
            });

            return;
        }

        if (!form.api_id.trim()) {
            Swal.fire({
                icon: "warning",
                title: "API ID belum diisi",
                text: "Masukkan API ID dari provider WhatsApp Gateway.",
            });

            return;
        }

        // API Key wajib hanya ketika membuat gateway baru.
        if (!gateway && !form.api_key.trim()) {
            Swal.fire({
                icon: "warning",
                title: "API Key belum diisi",
                text: "Masukkan API Key dari provider WhatsApp Gateway.",
            });

            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name,
                provider: form.provider,
                url: form.url,
                api_id: form.api_id,
                is_active: form.is_active,
            };

            // Saat membuat gateway baru, API Key wajib dikirim.
            // Saat edit, hanya dikirim jika user memasukkan API Key baru.
            if (form.api_key.trim()) {
                payload.api_key = form.api_key;
            }

            let response;

            if (gateway?.id) {
                response = await apiFetch.put(
                    `${API_URL}/${gateway.id}`,
                    payload
                );
            } else {
                response = await apiFetch.post(
                    API_URL,
                    payload
                );
            }

            const savedData =
                response?.data?.data;

            if (savedData) {
                setGateway(savedData);

                setForm((prev) => ({
                    ...prev,
                    name:
                        savedData.name ||
                        prev.name,

                    provider:
                        savedData.provider ||
                        prev.provider,

                    url:
                        savedData.url ||
                        prev.url,

                    api_id:
                        savedData.api_id ||
                        prev.api_id,

                    api_key: "",

                    is_active:
                        Boolean(
                            savedData.is_active
                        ),
                }));
            }

            await Swal.fire({
                icon: "success",
                title: "Berhasil",
                text:
                    response?.data?.message ||
                    "Pengaturan WhatsApp Gateway berhasil disimpan.",
                timer: 1800,
                showConfirmButton: false,
            });

            await fetchGateway();
        } catch (err) {
            console.error(
                "SAVE WHATSAPP GATEWAY ERROR:",
                err
            );

            const message =
                err?.data?.message ||
                err?.message ||
                "Gagal menyimpan pengaturan WhatsApp Gateway.";

            let detail = "";

            if (err?.data?.errors) {
                const errors = err.data.errors;

                detail = Object.values(errors)
                    .flat()
                    .join("\n");
            }

            Swal.fire({
                icon: "error",
                title: "Gagal menyimpan",
                text: detail || message,
            });
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // TEST CONNECTION
    // =========================================================

    const handleTestConnection = async () => {
        if (!gateway?.id) {
            Swal.fire({
                icon: "warning",
                title: "Gateway belum tersedia",
                text: "Simpan konfigurasi gateway terlebih dahulu.",
            });

            return;
        }

        const result = await Swal.fire({
            icon: "question",
            title: "Test Connection?",
            text: "Sistem akan mencoba menghubungi WhatsApp Gateway yang dipilih.",
            showCancelButton: true,
            confirmButtonText: "Ya, Test",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) {
            return;
        }

        setTesting(true);

        try {
            const response = await apiFetch.post(
                `${API_URL}/${gateway.id}/test`
            );

            const data = response?.data;

            if (data?.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Koneksi Berhasil",
                    text:
                        data?.message ||
                        data?.response ||
                        "WhatsApp Gateway berhasil terhubung.",
                });
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Koneksi Gagal",
                    text:
                        data?.message ||
                        data?.response ||
                        "WhatsApp Gateway tidak dapat dihubungi.",
                });
            }
        } catch (err) {
            console.error(
                "TEST WHATSAPP GATEWAY ERROR:",
                err
            );

            Swal.fire({
                icon: "error",
                title: "Test Connection Gagal",
                text:
                    err?.data?.message ||
                    err?.data?.response ||
                    err?.message ||
                    "Gagal melakukan test connection.",
            });
        } finally {
            setTesting(false);
        }
    };

    // =========================================================
    // TEST SEND
    // =========================================================

    const handleTestSend = async () => {
        if (!gateway?.id) {
            Swal.fire({
                icon: "warning",
                title: "Gateway belum tersedia",
                text: "Simpan konfigurasi gateway terlebih dahulu.",
            });

            return;
        }

        const result = await Swal.fire({
            title: "Test Send WhatsApp",
            text: "Masukkan nomor WhatsApp tujuan untuk menerima pesan percobaan.",
            input: "text",
            inputLabel: "Nomor WhatsApp",
            inputPlaceholder: "Contoh: 081234567890",
            showCancelButton: true,
            confirmButtonText: "Kirim Test",
            cancelButtonText: "Batal",
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return "Nomor WhatsApp wajib diisi.";
                }

                return undefined;
            },
        });

        if (!result.isConfirmed) {
            return;
        }

        const phone = result.value?.trim();

        if (!phone) {
            return;
        }

        setTestSending(true);

        try {
            const response = await apiFetch.post(
                `${API_URL}/${gateway.id}/test-send`,
                {
                    phone,
                     message: "Tes WhatsApp Gateway YukAbsen berhasil. Pesan ini adalah pesan uji coba.",
                }
            );

            const data = response?.data;

            if (data?.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Pesan Berhasil Dikirim",
                    text:
                        data?.message ||
                        data?.response ||
                        "Pesan test berhasil dikirim melalui WhatsApp Gateway.",
                });
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Pesan Gagal Dikirim",
                    text:
                        data?.message ||
                        data?.response ||
                        "Pesan test tidak berhasil dikirim.",
                });
            }
        } catch (err) {
            console.error(
                "TEST SEND WHATSAPP GATEWAY ERROR:",
                err
            );

            Swal.fire({
                icon: "error",
                title: "Test Send Gagal",
                text:
                    err?.data?.message ||
                    err?.data?.response ||
                    err?.message ||
                    "Gagal mengirim pesan test WhatsApp.",
            });
        } finally {
            setTestSending(false);
        }
    };

    // =========================================================
    // TOGGLE STATUS
    // =========================================================

    const handleToggleStatus = async () => {
        if (!gateway?.id) return;

        const newStatus = !gateway.is_active;

        const result = await Swal.fire({
            icon: "question",
            title: newStatus
                ? "Aktifkan Gateway?"
                : "Nonaktifkan Gateway?",
            text: newStatus
                ? "Gateway ini akan digunakan untuk pengiriman WhatsApp."
                : "Pengiriman WhatsApp melalui gateway ini akan dinonaktifkan.",
            showCancelButton: true,
            confirmButtonText: newStatus
                ? "Ya, Aktifkan"
                : "Ya, Nonaktifkan",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await apiFetch.patch(
                `${API_URL}/${gateway.id}/toggle-status`
            );

            await fetchGateway();

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: newStatus
                    ? "WhatsApp Gateway berhasil diaktifkan."
                    : "WhatsApp Gateway berhasil dinonaktifkan.",
                timer: 1600,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error(
                "TOGGLE WHATSAPP GATEWAY ERROR:",
                err
            );

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text:
                    err?.data?.message ||
                    err?.message ||
                    "Gagal mengubah status WhatsApp Gateway.",
            });
        }
    };

    // =========================================================
    // RESET
    // =========================================================

    const handleReset = () => {
        if (gateway) {
            setForm({
                name:
                    gateway.name ||
                    "WhatsApp Gateway",

                provider:
                    gateway.provider ||
                    "custom",

                url:
                    gateway.url ||
                    "",

                api_id:
                    gateway.api_id ||
                    "",

                api_key: "",

                is_active:
                    Boolean(
                        gateway.is_active
                    ),
            });
        } else {
            setForm(EMPTY_FORM);
        }

        setShowApiKey(false);
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="container-fluid py-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-5 text-center">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <div className="text-muted">
                            Memuat pengaturan WhatsApp Gateway...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="container-fluid py-3 py-md-4">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">

                        <div
                            className="d-flex align-items-center justify-content-center rounded-3"
                            style={{
                                width: 42,
                                height: 42,
                                background: "#e8f7f0",
                                color: "#198754",
                            }}
                        >
                            <i className="bi bi-whatsapp fs-4"></i>
                        </div>

                        <h4 className="fw-bold mb-0">
                            WhatsApp Gateway
                        </h4>

                    </div>

                    <p className="text-muted mb-0">
                        Atur koneksi WhatsApp yang digunakan aplikasi
                        untuk mengirim notifikasi.
                    </p>
                </div>

                {gateway && (
                    <div>
                        <span
                            className={`badge rounded-pill px-3 py-2 ${
                                gateway.is_active
                                    ? "text-bg-success"
                                    : "text-bg-secondary"
                            }`}
                        >
                            <i
                                className={`bi ${
                                    gateway.is_active
                                        ? "bi-check-circle"
                                        : "bi-pause-circle"
                                } me-1`}
                            ></i>

                            {gateway.is_active
                                ? "Gateway Aktif"
                                : "Gateway Nonaktif"}
                        </span>
                    </div>
                )}

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div
                    className="alert alert-danger d-flex align-items-start gap-2"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle-fill mt-1"></i>

                    <div>
                        <div className="fw-semibold">
                            Tidak dapat memuat pengaturan
                        </div>

                        <div>{error}</div>
                    </div>
                </div>
            )}

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="row g-4">

                {/* =================================================
                    FORM
                ================================================= */}

                <div className="col-12 col-xl-8">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-header bg-white border-0 pt-4 px-4">

                            <h5 className="fw-bold mb-1">
                                Pengaturan Gateway
                            </h5>

                            <p className="text-muted small mb-0">
                                Masukkan informasi dari provider
                                WhatsApp Gateway yang digunakan.
                            </p>

                        </div>

                        <div className="card-body px-4 pb-4">

                            <form onSubmit={handleSubmit}>

                                {/* NAME */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Nama Gateway
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Contoh: WhatsApp Gateway"
                                        maxLength={255}
                                    />

                                    <div className="form-text">
                                        Nama ini hanya digunakan sebagai
                                        identitas pengaturan.
                                    </div>

                                </div>

                                {/* PROVIDER */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Provider WhatsApp
                                    </label>

                                    <select
                                        name="provider"
                                        className="form-select"
                                        value={form.provider}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="custom">
                                            Custom
                                        </option>

                                        <option value="waha">
                                            WAHA
                                        </option>

                                        <option value="fonnte">
                                            Fonnte
                                        </option>

                                        <option value="wablas">
                                            Wablas
                                        </option>
                                    </select>

                                    <div className="form-text">
                                        Pilih provider WhatsApp yang digunakan
                                        oleh sistem.
                                    </div>

                                </div>

                                {/* URL */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Gateway URL
                                    </label>

                                    <input
                                        type="url"
                                        name="url"
                                        className="form-control"
                                        value={form.url}
                                        onChange={handleChange}
                                        placeholder="https://gateway.example.com/send"
                                        required
                                    />

                                    <div className="form-text">
                                        Masukkan URL API pengiriman dari
                                        provider WhatsApp Gateway.
                                    </div>

                                </div>

                                {/* API ID */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        API ID
                                    </label>

                                    <input
                                        type="text"
                                        name="api_id"
                                        className="form-control"
                                        value={form.api_id}
                                        onChange={handleChange}
                                        placeholder="Masukkan API ID"
                                        required
                                    />

                                </div>

                                {/* API KEY */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        API Key
                                    </label>

                                    <div className="input-group">

                                        <input
                                            type={
                                                showApiKey
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="api_key"
                                            className="form-control"
                                            value={form.api_key}
                                            onChange={handleChange}
                                            placeholder={
                                                gateway
                                                    ? "Kosongkan jika tidak ingin mengganti API Key"
                                                    : "Masukkan API Key"
                                            }
                                            required={!gateway}
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                setShowApiKey(
                                                    (prev) => !prev
                                                )
                                            }
                                            title={
                                                showApiKey
                                                    ? "Sembunyikan API Key"
                                                    : "Tampilkan API Key"
                                            }
                                        >
                                            <i
                                                className={`bi ${
                                                    showApiKey
                                                        ? "bi-eye-slash"
                                                        : "bi-eye"
                                                }`}
                                            ></i>
                                        </button>

                                    </div>

                                    <div className="form-text">
                                        API Key disimpan di database dan
                                        tidak ditampilkan kembali secara
                                        penuh.
                                    </div>

                                </div>

                                {/* STATUS */}

                                <div className="border rounded-3 p-3 mb-4">

                                    <div className="form-check form-switch">

                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="gatewayActive"
                                            name="is_active"
                                            checked={form.is_active}
                                            onChange={handleChange}
                                        />

                                        <label
                                            className="form-check-label fw-semibold"
                                            htmlFor="gatewayActive"
                                        >
                                            Aktifkan Gateway
                                        </label>

                                    </div>

                                    <div className="small text-muted mt-1">
                                        Jika aktif, gateway ini akan
                                        digunakan oleh sistem untuk
                                        mengirim WhatsApp.
                                    </div>

                                </div>

                                {/* BUTTON */}

                                <div className="d-flex flex-column flex-sm-row gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={
                                            saving ||
                                            testing ||
                                            testSending
                                        }
                                    >
                                        {saving ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-save me-2"></i>

                                                {gateway
                                                    ? "Simpan Perubahan"
                                                    : "Simpan Gateway"}
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-light border px-4"
                                        onClick={handleReset}
                                        disabled={
                                            saving ||
                                            testing ||
                                            testSending
                                        }
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                                        Reset
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>

                {/* =================================================
                    STATUS / INFO
                ================================================= */}

                <div className="col-12 col-xl-4">

                    {/* SECURITY CARD */}

                    <div className="card border-0 shadow-sm mb-4">

                        <div className="card-body p-4">

                            <div className="d-flex align-items-center gap-3 mb-3">

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        background: "#eef4ff",
                                        color: "#0d6efd",
                                    }}
                                >
                                    <i className="bi bi-shield-check fs-4"></i>
                                </div>

                                <div>

                                    <h6 className="fw-bold mb-1">
                                        Keamanan
                                    </h6>

                                    <div className="small text-muted">
                                        Informasi gateway
                                    </div>

                                </div>

                            </div>

                            <div className="small text-muted">
                                API Key tidak ditampilkan secara penuh
                                setelah tersimpan. Saat mengedit,
                                kosongkan API Key jika ingin tetap
                                menggunakan key yang lama.
                            </div>

                        </div>
                    </div>

                    {/* STATUS CARD */}

                    <div className="card border-0 shadow-sm">

                        <div className="card-body p-4">

                            <h6 className="fw-bold mb-3">
                                Status Koneksi
                            </h6>

                            {!gateway ? (

                                <div className="text-center py-3">

                                    <div
                                        className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 58,
                                            height: 58,
                                            background: "#f8f9fa",
                                        }}
                                    >
                                        <i className="bi bi-link-45deg fs-3 text-muted"></i>
                                    </div>

                                    <div className="fw-semibold">
                                        Belum dikonfigurasi
                                    </div>

                                    <div className="small text-muted mt-1">
                                        Isi form di sebelah kiri untuk
                                        menghubungkan WhatsApp Gateway.
                                    </div>

                                </div>

                            ) : (

                                <>

                                    {/* STATUS */}

                                    <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">

                                        <span className="text-muted">
                                            Status
                                        </span>

                                        <span
                                            className={`badge rounded-pill ${
                                                gateway.is_active
                                                    ? "text-bg-success"
                                                    : "text-bg-secondary"
                                            }`}
                                        >
                                            {gateway.is_active
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </span>

                                    </div>

                                    {/* PROVIDER */}

                                    <div className="mb-3">

                                        <div className="small text-muted mb-1">
                                            Provider
                                        </div>

                                        <div className="fw-semibold text-break">
                                            {gateway.provider
                                                ? gateway.provider.toUpperCase()
                                                : "CUSTOM"}
                                        </div>

                                    </div>

                                    {/* NAME */}

                                    <div className="mb-3">

                                        <div className="small text-muted mb-1">
                                            Nama
                                        </div>

                                        <div className="fw-semibold text-break">
                                            {gateway.name}
                                        </div>

                                    </div>

                                    {/* API ID */}

                                    <div className="mb-3">

                                        <div className="small text-muted mb-1">
                                            API ID
                                        </div>

                                        <div className="fw-semibold text-break">
                                            {gateway.api_id}
                                        </div>

                                    </div>

                                    {/* URL */}

                                    <div className="mb-4">

                                        <div className="small text-muted mb-1">
                                            Gateway URL
                                        </div>

                                        <div className="small text-break">
                                            {gateway.url}
                                        </div>

                                    </div>

                                    {/* TEST BUTTONS */}

                                    <div className="d-grid gap-2 mb-3">

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={
                                                handleTestConnection
                                            }
                                            disabled={
                                                testing ||
                                                testSending ||
                                                saving
                                            }
                                        >
                                            {testing ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>

                                                    Menguji Koneksi...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-plug me-2"></i>

                                                    Test Connection
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-success"
                                            onClick={
                                                handleTestSend
                                            }
                                            disabled={
                                                testing ||
                                                testSending ||
                                                saving
                                            }
                                        >
                                            {testSending ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>

                                                    Mengirim Test...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send me-2"></i>

                                                    Test Send
                                                </>
                                            )}
                                        </button>

                                    </div>

                                    {/* TOGGLE */}

                                    <button
                                        type="button"
                                        className={`btn w-100 ${
                                            gateway.is_active
                                                ? "btn-outline-danger"
                                                : "btn-outline-success"
                                        }`}
                                        onClick={
                                            handleToggleStatus
                                        }
                                        disabled={
                                            saving ||
                                            testing ||
                                            testSending
                                        }
                                    >
                                        <i
                                            className={`bi ${
                                                gateway.is_active
                                                    ? "bi-pause-circle"
                                                    : "bi-play-circle"
                                            } me-2`}
                                        ></i>

                                        {gateway.is_active
                                            ? "Nonaktifkan Gateway"
                                            : "Aktifkan Gateway"}
                                    </button>

                                </>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* =================================================
                FOOTER INFO
            ================================================= */}

            <div className="mt-4">

                <div className="alert alert-light border mb-0">

                    <div className="d-flex gap-2">

                        <i className="bi bi-info-circle text-primary mt-1"></i>

                        <div className="small">

                            <strong>Catatan:</strong>{" "}

                            Pengaturan ini nantinya akan digunakan oleh
                            sistem saat mengirim reminder WhatsApp,
                            termasuk reminder meeting kepada peserta
                            rapat.

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default WhatsAppGatewayPage;