import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";
import Swal from "sweetalert2";

const AttendanceLocationPage = () => {
    // =========================================================
    // STATE
    // =========================================================

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const [form, setForm] = useState({
        name: "",
        latitude: "",
        longitude: "",
        radius_meter: 100,
        is_active: true,
    });

    // =========================================================
    // FETCH DATA
    // =========================================================

    const fetchLocations = async () => {
        try {
            setLoading(true);

            const res = await apiFetch.get(
                "/admin/attendance-locations"
            );

            setLocations(res.data?.data || []);
        } catch (error) {
            console.error("FETCH ATTENDANCE LOCATIONS ERROR:", error);

            Swal.fire({
                icon: "error",
                title: "Gagal Memuat Data",
                text:
                    error?.data?.message ||
                    error?.message ||
                    "Data lokasi absensi tidak dapat dimuat.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    // =========================================================
    // FORM
    // =========================================================

    const resetForm = () => {
        setForm({
            name: "",
            latitude: "",
            longitude: "",
            radius_meter: 100,
            is_active: true,
        });

        setEditingLocation(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (location) => {
        setEditingLocation(location);

        setForm({
            name: location.name || "",
            latitude: location.latitude ?? "",
            longitude: location.longitude ?? "",
            radius_meter: location.radius_meter ?? 100,
            is_active: Boolean(location.is_active),
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================================================
    // AMBIL LOKASI GPS
    // =========================================================

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire({
                icon: "error",
                title: "GPS Tidak Didukung",
                text: "Browser ini tidak mendukung pengambilan lokasi GPS.",
            });

            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setForm((prev) => ({
                    ...prev,
                    latitude: latitude.toFixed(7),
                    longitude: longitude.toFixed(7),
                }));

                setGettingLocation(false);

                Swal.fire({
                    icon: "success",
                    title: "Lokasi Berhasil Diambil",
                    text: `Latitude: ${latitude.toFixed(
                        7
                    )}, Longitude: ${longitude.toFixed(7)}`,
                    timer: 2200,
                    showConfirmButton: false,
                });
            },
            (error) => {
                console.error("GPS ERROR:", error);

                setGettingLocation(false);

                let message =
                    "Lokasi GPS tidak dapat diambil.";

                if (error.code === 1) {
                    message =
                        "Izin lokasi ditolak. Silakan izinkan akses lokasi di browser.";
                } else if (error.code === 2) {
                    message =
                        "Lokasi GPS tidak tersedia.";
                } else if (error.code === 3) {
                    message =
                        "Pengambilan lokasi GPS terlalu lama.";
                }

                Swal.fire({
                    icon: "error",
                    title: "Gagal Mengambil Lokasi",
                    text: message,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    // =========================================================
    // VALIDASI
    // =========================================================

    const validateForm = () => {
        if (!form.name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Nama Lokasi Belum Diisi",
                text: "Silakan masukkan nama lokasi absensi.",
            });

            return false;
        }

        if (
            form.latitude === "" ||
            form.longitude === ""
        ) {
            Swal.fire({
                icon: "warning",
                title: "Koordinat Belum Diisi",
                text: "Latitude dan longitude wajib diisi.",
            });

            return false;
        }

        const latitude = Number(form.latitude);
        const longitude = Number(form.longitude);
        const radius = Number(form.radius_meter);

        if (
            Number.isNaN(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            Swal.fire({
                icon: "warning",
                title: "Latitude Tidak Valid",
                text: "Latitude harus berada antara -90 sampai 90.",
            });

            return false;
        }

        if (
            Number.isNaN(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            Swal.fire({
                icon: "warning",
                title: "Longitude Tidak Valid",
                text: "Longitude harus berada antara -180 sampai 180.",
            });

            return false;
        }

        if (
            Number.isNaN(radius) ||
            radius < 1 ||
            radius > 10000
        ) {
            Swal.fire({
                icon: "warning",
                title: "Radius Tidak Valid",
                text: "Radius harus antara 1 sampai 10.000 meter.",
            });

            return false;
        }

        return true;
    };

    // =========================================================
    // SAVE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);

        const payload = {
            name: form.name.trim(),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            radius_meter: Number(form.radius_meter),
            is_active: Boolean(form.is_active),
        };

        try {
            let res;

            if (editingLocation) {
                res = await apiFetch.put(
                    `/admin/attendance-locations/${editingLocation.id}`,
                    payload
                );
            } else {
                res = await apiFetch.post(
                    "/admin/attendance-locations",
                    payload
                );
            }

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text:
                    res.data?.message ||
                    "Lokasi absensi berhasil disimpan.",
                timer: 1800,
                showConfirmButton: false,
            });

            setShowModal(false);
            resetForm();

            await fetchLocations();
        } catch (error) {
            console.error("SAVE ATTENDANCE LOCATION ERROR:", error);

            let message =
                error?.data?.message ||
                error?.message ||
                "Lokasi absensi gagal disimpan.";

            if (error?.data?.errors) {
                const errors = error.data.errors;

                const firstError = Object.values(errors)
                    .flat()
                    .find(Boolean);

                if (firstError) {
                    message = firstError;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Gagal Menyimpan",
                text: message,
            });
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // TOGGLE STATUS
    // =========================================================

    const handleToggleStatus = async (location) => {
        const newStatus = !location.is_active;

        const result = await Swal.fire({
            icon: newStatus ? "question" : "warning",
            title: newStatus
                ? "Aktifkan Lokasi?"
                : "Nonaktifkan Lokasi?",
            text: newStatus
                ? `${location.name} akan menjadi lokasi aktif untuk absensi.`
                : `${location.name} tidak dapat digunakan untuk absensi.`,
            showCancelButton: true,
            confirmButtonText: newStatus
                ? "Ya, Aktifkan"
                : "Ya, Nonaktifkan",
            cancelButtonText: "Batal",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const res = await apiFetch.patch(
                `/admin/attendance-locations/${location.id}/toggle-status`
            );

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text:
                    res.data?.message ||
                    "Status lokasi berhasil diubah.",
                timer: 1600,
                showConfirmButton: false,
            });

            await fetchLocations();
        } catch (error) {
            console.error(
                "TOGGLE ATTENDANCE LOCATION ERROR:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text:
                    error?.data?.message ||
                    error?.message ||
                    "Status lokasi gagal diubah.",
            });
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (location) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Hapus Lokasi?",
            html: `
                Lokasi <strong>${escapeHtml(
                    location.name
                )}</strong> akan dihapus.
                <br><br>
                Tindakan ini tidak dapat dibatalkan.
            `,
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc3545",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const res = await apiFetch.delete(
                `/admin/attendance-locations/${location.id}`
            );

            Swal.fire({
                icon: "success",
                title: "Berhasil Dihapus",
                text:
                    res.data?.message ||
                    "Lokasi absensi berhasil dihapus.",
                timer: 1600,
                showConfirmButton: false,
            });

            await fetchLocations();
        } catch (error) {
            console.error(
                "DELETE ATTENDANCE LOCATION ERROR:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Gagal Menghapus",
                text:
                    error?.data?.message ||
                    error?.message ||
                    "Lokasi absensi gagal dihapus.",
            });
        }
    };

    // =========================================================
    // HELPERS
    // =========================================================

    const formatRadius = (meter) => {
        const value = Number(meter) || 0;

        if (value >= 1000) {
            return `${(value / 1000)
                .toFixed(value % 1000 === 0 ? 0 : 1)} km`;
        }

        return `${value} meter`;
    };

    const formatCoordinate = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        return Number(value).toFixed(7);
    };

    const escapeHtml = (value) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            className="container-fluid py-4"
            style={{
                background: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* =================================================
                HEADER
            ================================================== */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <div
                            className="d-flex align-items-center justify-content-center rounded-3"
                            style={{
                                width: 46,
                                height: 46,
                                background:
                                    "rgba(0, 229, 255, 0.12)",
                                color: "#00a9bd",
                            }}
                        >
                            <i className="bi bi-geo-alt-fill fs-4"></i>
                        </div>

                        <div>
                            <h3
                                className="fw-bold mb-0"
                                style={{ color: "#111827" }}
                            >
                                Lokasi Absensi
                            </h3>

                            <small className="text-muted">
                                Atur titik lokasi dan batas radius
                                GPS untuk presensi karyawan.
                            </small>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-center gap-2 px-4 py-2"
                    onClick={openCreateModal}
                    style={{
                        background: "#080f1f",
                        color: "#fff",
                        borderRadius: 10,
                        minHeight: 44,
                    }}
                >
                    <i className="bi bi-plus-lg"></i>
                    Tambah Lokasi
                </button>
            </div>

            {/* =================================================
                INFO CARD
            ================================================== */}

            <div
                className="card border-0 shadow-sm mb-4"
                style={{
                    borderRadius: 16,
                    overflow: "hidden",
                }}
            >
                <div className="card-body p-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-auto">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle"
                                style={{
                                    width: 48,
                                    height: 48,
                                    background:
                                        "rgba(13, 110, 253, 0.10)",
                                    color: "#0d6efd",
                                }}
                            >
                                <i className="bi bi-info-circle-fill fs-5"></i>
                            </div>
                        </div>

                        <div className="col">
                            <h6 className="fw-bold mb-1">
                                Cara kerja radius GPS
                            </h6>

                            <p className="text-muted mb-0 small">
                                Karyawan hanya dapat melakukan
                                absensi jika posisi GPS mereka
                                berada di dalam radius lokasi
                                absensi yang aktif.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================== */}

            {loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-5 text-center">
                        <div
                            className="spinner-border"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <div className="text-muted mt-3">
                            Memuat lokasi absensi...
                        </div>
                    </div>
                </div>
            ) : locations.length === 0 ? (
                <div
                    className="card border-0 shadow-sm"
                    style={{ borderRadius: 16 }}
                >
                    <div className="card-body text-center py-5 px-4">
                        <div
                            className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                            style={{
                                width: 72,
                                height: 72,
                                background:
                                    "rgba(108, 117, 125, 0.10)",
                                color: "#6c757d",
                            }}
                        >
                            <i className="bi bi-geo-alt fs-2"></i>
                        </div>

                        <h5 className="fw-bold">
                            Belum Ada Lokasi Absensi
                        </h5>

                        <p className="text-muted mb-4">
                            Tambahkan lokasi kantor terlebih
                            dahulu agar sistem dapat menggunakan
                            pembatasan radius GPS.
                        </p>

                        <button
                            type="button"
                            className="btn btn-dark px-4"
                            onClick={openCreateModal}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Tambah Lokasi
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {locations.map((location) => (
                        <div
                            className="col-12 col-md-6 col-xl-4"
                            key={location.id}
                        >
                            <div
                                className="card border-0 shadow-sm h-100"
                                style={{
                                    borderRadius: 16,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: 6,
                                        background:
                                            location.is_active
                                                ? "#198754"
                                                : "#adb5bd",
                                    }}
                                ></div>

                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                                style={{
                                                    width: 46,
                                                    height: 46,
                                                    background:
                                                        location.is_active
                                                            ? "rgba(25, 135, 84, 0.10)"
                                                            : "rgba(108, 117, 125, 0.10)",
                                                    color:
                                                        location.is_active
                                                            ? "#198754"
                                                            : "#6c757d",
                                                }}
                                            >
                                                <i className="bi bi-building fs-5"></i>
                                            </div>

                                            <div>
                                                <h5 className="fw-bold mb-1">
                                                    {location.name}
                                                </h5>

                                                <span
                                                    className={`badge rounded-pill ${
                                                        location.is_active
                                                            ? "text-bg-success"
                                                            : "text-bg-secondary"
                                                    }`}
                                                >
                                                    {location.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="rounded-3 p-3 mb-3"
                                        style={{
                                            background:
                                                "rgba(0, 229, 255, 0.07)",
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <small className="text-muted d-block">
                                                    Radius Absensi
                                                </small>

                                                <div
                                                    className="fw-bold fs-4"
                                                    style={{
                                                        color: "#087f8c",
                                                    }}
                                                >
                                                    {formatRadius(
                                                        location.radius_meter
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    background:
                                                        "#fff",
                                                    color: "#00a9bd",
                                                }}
                                            >
                                                <i className="bi bi-broadcast-pin fs-5"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="small text-muted mb-1">
                                            Koordinat Lokasi
                                        </div>

                                        <div className="small fw-semibold">
                                            <i className="bi bi-geo-alt me-2 text-danger"></i>
                                            {formatCoordinate(
                                                location.latitude
                                            )}
                                        </div>

                                        <div className="small fw-semibold mt-1">
                                            <i className="bi bi-geo-alt me-2 text-danger"></i>
                                            {formatCoordinate(
                                                location.longitude
                                            )}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            className="btn btn-light border flex-fill"
                                            onClick={() =>
                                                openEditModal(
                                                    location
                                                )
                                            }
                                        >
                                            <i className="bi bi-pencil me-1"></i>
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className={`btn ${
                                                location.is_active
                                                    ? "btn-outline-secondary"
                                                    : "btn-outline-success"
                                            }`}
                                            onClick={() =>
                                                handleToggleStatus(
                                                    location
                                                )
                                            }
                                            title={
                                                location.is_active
                                                    ? "Nonaktifkan"
                                                    : "Aktifkan"
                                            }
                                        >
                                            <i
                                                className={`bi ${
                                                    location.is_active
                                                        ? "bi-toggle-on"
                                                        : "bi-toggle-off"
                                                }`}
                                            ></i>
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                                handleDelete(
                                                    location
                                                )
                                            }
                                            title="Hapus"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* =================================================
                MODAL
            ================================================== */}

            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{
                        background:
                            "rgba(0, 0, 0, 0.55)",
                    }}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        role="document"
                        style={{
                            maxWidth: 680,
                        }}
                    >
                        <div
                            className="modal-content border-0 shadow-lg"
                            style={{
                                borderRadius: 16,
                                overflow: "hidden",
                            }}
                        >
                            {/* MODAL HEADER */}

                            <div
                                className="modal-header border-0 px-4 py-3"
                                style={{
                                    paddingBottom: 10,
                                }}
                            >
                                <div>
                                    <h5 className="modal-title fw-bold mb-1">
                                        {editingLocation
                                            ? "Edit Lokasi Absensi"
                                            : "Tambah Lokasi Absensi"}
                                    </h5>

                                    <small className="text-muted">
                                        Tentukan titik kantor dan
                                        batas radius GPS.
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                    disabled={saving}
                                ></button>
                            </div>

                            {/* MODAL BODY */}

                            <form onSubmit={handleSubmit}>
                                <div
                                    className="modal-body px-4 py-2"
                                    style={{
                                        maxHeight: "70vh",
                                        overflowY: "auto",
                                    }}
                                >
                                    <div className="row g-3">
                                        {/* NAME */}

                                        <div className="col-12">
                                            <label className="form-label fw-semibold mb-1">
                                                Nama Lokasi
                                            </label>

                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="bi bi-building"></i>
                                                </span>

                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control border-start-0"
                                                    placeholder="Contoh: Kantor Utama"
                                                    value={
                                                        form.name
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* COORDINATE */}

                                        <div className="col-12">
                                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                                                <label className="form-label fw-semibold mb-0">
                                                    Titik Lokasi
                                                </label>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={
                                                        getCurrentLocation
                                                    }
                                                    disabled={
                                                        gettingLocation ||
                                                        saving
                                                    }
                                                >
                                                    {gettingLocation ? (
                                                        <>
                                                            <span
                                                                className="spinner-border spinner-border-sm me-2"
                                                                role="status"
                                                            ></span>
                                                            Mengambil
                                                            GPS...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-crosshair me-2"></i>
                                                            Ambil Lokasi
                                                            Saya
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="row g-2">
                                                <div className="col-12 col-md-6">
                                                    <label className="form-label small text-muted mb-1">
                                                        Latitude
                                                    </label>

                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="latitude"
                                                        className="form-control"
                                                        placeholder="-7.1234567"
                                                        value={
                                                            form.latitude
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <label className="form-label small text-muted mb-1">
                                                        Longitude
                                                    </label>

                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="longitude"
                                                        className="form-control"
                                                        placeholder="111.1234567"
                                                        value={
                                                            form.longitude
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* RADIUS */}

                                        <div className="col-12 col-md-7">
                                            <label className="form-label fw-semibold mb-1">
                                                Radius Absensi
                                            </label>

                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10000"
                                                    name="radius_meter"
                                                    className="form-control"
                                                    value={
                                                        form.radius_meter
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />

                                                <span className="input-group-text">
                                                    meter
                                                </span>
                                            </div>

                                            <small
                                                className="text-muted d-block mt-1"
                                                style={{
                                                    fontSize: 11,
                                                }}
                                            >
                                                Karyawan harus berada
                                                maksimal sesuai radius
                                                dari titik kantor.
                                            </small>
                                        </div>

                                        {/* STATUS */}

                                        <div className="col-12 col-md-5">
                                            <label className="form-label fw-semibold mb-1">
                                                Status
                                            </label>

                                            <div
                                                className="form-check form-switch border rounded-3 px-3 py-2 d-flex align-items-center"
                                                style={{
                                                    minHeight: 38,
                                                }}
                                            >
                                                <input
                                                    className="form-check-input ms-0 me-3"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="attendanceLocationActive"
                                                    name="is_active"
                                                    checked={
                                                        form.is_active
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />

                                                <label
                                                    className="form-check-label fw-semibold small"
                                                    htmlFor="attendanceLocationActive"
                                                >
                                                    Lokasi Aktif
                                                </label>
                                            </div>
                                        </div>

                                        {/* PREVIEW */}

                                        <div className="col-12">
                                            <div
                                                className="rounded-3 p-3 border"
                                                style={{
                                                    background:
                                                        "#f8fafc",
                                                }}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                                        style={{
                                                            width: 38,
                                                            height: 38,
                                                            background:
                                                                "rgba(13, 110, 253, 0.10)",
                                                            color: "#0d6efd",
                                                        }}
                                                    >
                                                        <i className="bi bi-shield-check"></i>
                                                    </div>

                                                    <div>
                                                        <div className="fw-semibold small">
                                                            Pengaturan
                                                            saat ini
                                                        </div>

                                                        <div
                                                            className="small text-muted"
                                                            style={{
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            {form.name ||
                                                                "Nama lokasi belum diisi"}{" "}
                                                            • Radius{" "}
                                                            <strong>
                                                                {formatRadius(
                                                                    form.radius_meter
                                                                )}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MODAL FOOTER */}

                                <div
                                    className="modal-footer border-0 px-4 py-2"
                                    style={{
                                        background: "#fff",
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-light border px-4"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn px-4"
                                        disabled={saving}
                                        style={{
                                            background:
                                                "#080f1f",
                                            color: "#fff",
                                        }}
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
                                                <i className="bi bi-check-lg me-2"></i>
                                                {editingLocation
                                                    ? "Simpan Perubahan"
                                                    : "Simpan Lokasi"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                MODAL BACKDROP
            ================================================== */}

            {showModal && (
                <div
                    className="modal-backdrop fade show"
                    onClick={closeModal}
                ></div>
            )}
        </div>
    );
};

export default AttendanceLocationPage;