import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import Swal from "sweetalert2";

import {
    Search,
    RefreshCw,
    Plus,
    FileText,
    File,
    FileSpreadsheet,
    FileImage,
    Download,
    Eye,
    Edit3,
    Trash2,
    X,
    Upload,
} from "lucide-react";

import { apiFetch } from "../api/apiFetch";

const DocumentPage = () => {
    // =====================================================
    // STATE
    // =====================================================

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);

    const [form, setForm] = useState({
        name: "",
        category: "",
        description: "",
        file: null,
    });

    const [saving, setSaving] = useState(false);

    // =====================================================
    // BASE URL
    // =====================================================

    const API_BASE_URL = (
        import.meta.env.VITE_API_BASE_URL ||
        (import.meta.env.PROD
            ? "https://yukabsen.com/api"
            : "/api")
    ).replace(/\/+$/, "");

    // =====================================================
    // STORAGE ORIGIN
    // =====================================================

    /**
     * Menentukan origin tempat file storage berada.
     *
     * LOCAL:
     *   API_BASE_URL = /api
     *   hasil = http://localhost:5173
     *
     * PRODUCTION:
     *   API_BASE_URL = https://yukabsen.com/api
     *   hasil = https://yukabsen.com
     */
    const getStorageOrigin = useCallback(() => {
        try {
            const apiUrl = new URL(
                API_BASE_URL,
                window.location.origin
            );

            return apiUrl.origin;
        } catch (error) {
            console.error(
                "Gagal menentukan storage origin:",
                error
            );

            return window.location.origin;
        }
    }, [API_BASE_URL]);

    // =====================================================
    // STORAGE URL
    // =====================================================

    const getStorageUrl = useCallback(
        (filePath) => {
            if (!filePath) {
                return null;
            }

            const value = String(filePath).trim();

            if (!value) {
                return null;
            }

            // Jika backend sudah memberikan URL lengkap
            if (
                value.startsWith("http://") ||
                value.startsWith("https://")
            ) {
                return value;
            }

            const storageOrigin = getStorageOrigin();

            // Bersihkan slash di depan
            let cleanPath = value.replace(/^\/+/, "");

            /**
             * Kemungkinan data dari backend:
             *
             * documents/file.pdf
             * storage/documents/file.pdf
             * /storage/documents/file.pdf
             */

            if (cleanPath.startsWith("storage/")) {
                return `${storageOrigin}/${cleanPath}`;
            }

            return `${storageOrigin}/storage/${cleanPath}`;
        },
        [getStorageOrigin]
    );

    // =====================================================
    // API URL
    // =====================================================

    const documentApiUrl = useCallback(
        (path = "") => {
            return `${API_BASE_URL}/admin/documents${path}`;
        },
        [API_BASE_URL]
    );

    // =====================================================
    // FETCH DOCUMENTS
    // =====================================================

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append(
                    "search",
                    search.trim()
                );
            }

            if (category) {
                params.append(
                    "category",
                    category
                );
            }

            const query = params.toString();

            const response = await apiFetch.get(
                `admin/documents${
                    query ? `?${query}` : ""
                }`
            );

            setDocuments(
                response?.data?.data || []
            );
        } catch (error) {
            console.error(
                "Fetch documents error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text:
                    error?.response?.data?.message ||
                    error?.data?.message ||
                    error?.message ||
                    "Gagal mengambil data dokumen.",
            });
        } finally {
            setLoading(false);
        }
    }, [search, category]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // =====================================================
    // CATEGORY LIST
    // =====================================================

    const categories = useMemo(() => {
        return [
            ...new Set(
                documents
                    .map(
                        (document) =>
                            document.category
                    )
                    .filter(Boolean)
            ),
        ];
    }, [documents]);

    // =====================================================
    // FORM
    // =====================================================

    const resetForm = () => {
        setForm({
            name: "",
            category: "",
            description: "",
            file: null,
        });

        setEditingDocument(null);
    };

    const openUploadModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (document) => {
        setEditingDocument(document);

        setForm({
            name: document.name || "",
            category: document.category || "",
            description:
                document.description || "",
            file: null,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file =
            e.target.files?.[0] || null;

        setForm((prev) => ({
            ...prev,
            file,
        }));
    };

    // =====================================================
    // SUBMIT UPLOAD / EDIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Nama dokumen wajib diisi",
            });

            return;
        }

        if (!editingDocument && !form.file) {
            Swal.fire({
                icon: "warning",
                title: "File wajib dipilih",
            });

            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append(
                "name",
                form.name.trim()
            );

            formData.append(
                "category",
                form.category
            );

            formData.append(
                "description",
                form.description
            );

            if (form.file) {
                formData.append(
                    "file",
                    form.file
                );
            }

            let response;

            if (editingDocument) {
                response = await apiFetch.post(
                    `/admin/documents/${editingDocument.id}`,
                    formData
                );
            } else {
                response = await apiFetch.post(
                    "/admin/documents",
                    formData
                );
            }

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text:
                    response?.data?.message ||
                    response?.message ||
                    (editingDocument
                        ? "Dokumen berhasil diperbarui."
                        : "Dokumen berhasil diupload."),
                timer: 1800,
                showConfirmButton: false,
            });

            setShowModal(false);
            resetForm();

            await fetchDocuments();
        } catch (error) {
            console.error(
                "Save document error:",
                error
            );

            let message =
                "Gagal menyimpan dokumen.";

            if (
                error?.response?.data?.message
            ) {
                message =
                    error.response.data.message;
            } else if (error?.data?.message) {
                message =
                    error.data.message;
            } else if (error?.message) {
                message = error.message;
            }

            // Validation Laravel
            if (
                error?.response?.data?.errors
            ) {
                const errors =
                    error.response.data.errors;

                const firstError =
                    Object.values(errors)
                        .flat()
                        .find(Boolean);

                if (firstError) {
                    message = firstError;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: message,
            });
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // VIEW / PREVIEW DOCUMENT
    // =====================================================

    const handleView = (document) => {
        const filePath =
            document?.file_path;

        if (!filePath) {
            Swal.fire({
                icon: "error",
                title: "Preview Gagal",
                text:
                    "Path file dokumen tidak tersedia.",
            });

            return;
        }

        const url =
            getStorageUrl(filePath);

        if (!url) {
            Swal.fire({
                icon: "error",
                title: "Preview Gagal",
                text:
                    "URL file dokumen tidak tersedia.",
            });

            return;
        }

        console.log(
            "PREVIEW DOCUMENT:",
            {
                filePath,
                url,
                environment: import.meta.env.PROD
                    ? "production"
                    : "local",
            }
        );

        const fileName = String(
            document?.file_name ||
                filePath
        ).toLowerCase();

        const extension =
            fileName
                .split(".")
                .pop()
                ?.toLowerCase() || "";

        // =================================================
        // PDF
        // =================================================

        if (extension === "pdf") {
            const previewWindow =
                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            if (!previewWindow) {
                Swal.fire({
                    icon: "warning",
                    title: "Popup Browser Diblokir",
                    text:
                        "Browser memblokir tab preview. Izinkan popup untuk situs ini lalu coba lagi.",
                });
            }

            return;
        }

        // =================================================
        // GAMBAR
        // =================================================

        const imageExtensions = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
        ];

        if (
            imageExtensions.includes(
                extension
            )
        ) {
            const previewWindow =
                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            if (!previewWindow) {
                Swal.fire({
                    icon: "warning",
                    title: "Popup Browser Diblokir",
                    text:
                        "Browser memblokir tab preview. Izinkan popup untuk situs ini lalu coba lagi.",
                });
            }

            return;
        }

        // =================================================
        // MICROSOFT OFFICE
        // =================================================

        const officeExtensions = [
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
        ];

        if (
            officeExtensions.includes(
                extension
            )
        ) {
            /**
             * Microsoft Viewer hanya bisa mengakses
             * URL yang bisa diakses publik dari internet.
             *
             * Karena itu:
             *
             * LOCAL:
             * Microsoft Viewer tidak cocok untuk
             * localhost.
             *
             * PRODUCTION:
             * Bisa digunakan karena URL yukabsen.com
             * dapat diakses internet.
             */

            if (!import.meta.env.PROD) {
                Swal.fire({
                    icon: "info",
                    title: "Preview Office di Local",
                    text:
                        "File Word, Excel, atau PowerPoint di local tidak dapat dipreview melalui Microsoft Viewer. Silakan gunakan Download.",
                    confirmButtonText:
                        "Mengerti",
                });

                return;
            }

            const officeViewer =
                `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                    url
                )}`;

            const previewWindow =
                window.open(
                    officeViewer,
                    "_blank",
                    "noopener,noreferrer"
                );

            if (!previewWindow) {
                Swal.fire({
                    icon: "warning",
                    title: "Popup Browser Diblokir",
                    text:
                        "Browser memblokir tab preview. Izinkan popup untuk situs ini lalu coba lagi.",
                });
            }

            return;
        }

        // =================================================
        // FORMAT LAIN
        // =================================================

        Swal.fire({
            icon: "info",
            title: "Preview Tidak Tersedia",
            text:
                "Format file ini belum mendukung preview. Silakan gunakan tombol Download.",
            confirmButtonText: "Mengerti",
        });
    };

    // =====================================================
    // DOWNLOAD DOCUMENT
    // =====================================================

    const handleDownload = (document) => {
        const url =
            getStorageUrl(
                document?.file_path
            );

        if (!url) {
            Swal.fire({
                icon: "error",
                title: "Download Gagal",
                text:
                    "Path file dokumen tidak tersedia.",
            });

            return;
        }

        try {
            const link =
                window.document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                document?.file_name ||
                document?.name ||
                "dokumen";

            link.target = "_blank";
            link.rel =
                "noopener noreferrer";

            window.document.body.appendChild(
                link
            );

            link.click();

            link.remove();
        } catch (error) {
            console.error(
                "DOWNLOAD ERROR:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Download Gagal",
                text:
                    error?.message ||
                    "Dokumen tidak dapat didownload.",
            });
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (document) => {
        const result =
            await Swal.fire({
                icon: "warning",
                title: "Hapus dokumen?",
                text: `Dokumen "${document.name}" akan dihapus.`,
                showCancelButton: true,
                confirmButtonText:
                    "Ya, hapus",
                cancelButtonText: "Batal",
                confirmButtonColor:
                    "#dc2626",
            });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await apiFetch.delete(
                `admin/documents/${document.id}`
            );

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text:
                    "Dokumen berhasil dihapus.",
                timer: 1500,
                showConfirmButton: false,
            });

            await fetchDocuments();
        } catch (error) {
            console.error(
                "Delete document error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text:
                    error?.response?.data
                        ?.message ||
                    error?.data?.message ||
                    error?.message ||
                    "Dokumen gagal dihapus.",
            });
        }
    };

    // =====================================================
    // HELPERS
    // =====================================================

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "-";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };

    const getFileIcon = (mimeType) => {
        if (!mimeType) {
            return <File size={22} />;
        }

        if (mimeType.includes("pdf")) {
            return <FileText size={22} />;
        }

        if (
            mimeType.includes(
                "spreadsheet"
            ) ||
            mimeType.includes("excel") ||
            mimeType.includes("sheet")
        ) {
            return (
                <FileSpreadsheet
                    size={22}
                />
            );
        }

        if (
            mimeType.startsWith(
                "image/"
            )
        ) {
            return (
                <FileImage size={22} />
            );
        }

        return <File size={22} />;
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="container-fluid py-4">
            {/* HEADER */}

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">
                        Penyimpanan Dokumen
                    </h3>

                    <p className="text-muted mb-0">
                        Kelola dan simpan dokumen HR Payroll.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={
                        openUploadModal
                    }
                >
                    <Plus size={18} />
                    Upload Dokumen
                </button>
            </div>

            {/* FILTER */}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-7">
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <Search
                                        size={18}
                                    />
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Cari nama dokumen..."
                                    value={
                                        search
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={
                                    category
                                }
                                onChange={(
                                    e
                                ) =>
                                    setCategory(
                                        e
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="">
                                    Semua Kategori
                                </option>

                                {categories.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={
                                    fetchDocuments
                                }
                                disabled={
                                    loading
                                }
                            >
                                <RefreshCw
                                    size={
                                        17
                                    }
                                    className={
                                        loading
                                            ? "spin"
                                            : ""
                                    }
                                />

                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE */}

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4">
                                        Dokumen
                                    </th>

                                    <th>
                                        Kategori
                                    </th>

                                    <th>
                                        Ukuran
                                    </th>

                                    <th>
                                        Diupload Oleh
                                    </th>

                                    <th>
                                        Tanggal
                                    </th>

                                    <th className="text-end px-4">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            />

                                            <div className="text-muted mt-2">
                                                Memuat dokumen...
                                            </div>
                                        </td>
                                    </tr>
                                ) : documents.length ===
                                  0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >
                                            <FileText
                                                size={
                                                    42
                                                }
                                                className="text-muted mb-2"
                                            />

                                            <div className="fw-semibold">
                                                Belum ada dokumen
                                            </div>

                                            <div className="text-muted small">
                                                Upload dokumen pertama untuk memulai penyimpanan.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map(
                                        (
                                            document
                                        ) => (
                                            <tr
                                                key={
                                                    document.id
                                                }
                                            >
                                                <td className="px-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded bg-light"
                                                            style={{
                                                                width: 42,
                                                                height: 42,
                                                                minWidth: 42,
                                                            }}
                                                        >
                                                            {getFileIcon(
                                                                document.mime_type
                                                            )}
                                                        </div>

                                                        <div
                                                            style={{
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <div className="fw-semibold text-truncate">
                                                                {
                                                                    document.name
                                                                }
                                                            </div>

                                                            <div
                                                                className="text-muted small text-truncate"
                                                                style={{
                                                                    maxWidth: 300,
                                                                }}
                                                                title={
                                                                    document.file_name
                                                                }
                                                            >
                                                                {
                                                                    document.file_name
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    {document.category ? (
                                                        <span className="badge bg-primary-subtle text-primary">
                                                            {
                                                                document.category
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">
                                                            -
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {formatFileSize(
                                                        document.file_size
                                                    )}
                                                </td>

                                                <td>
                                                    {document
                                                        .uploader
                                                        ?.name ||
                                                        document
                                                            .uploader
                                                            ?.username ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {document.created_at
                                                        ? new Date(
                                                              document.created_at
                                                          ).toLocaleDateString(
                                                              "id-ID",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric",
                                                              }
                                                          )
                                                        : "-"}
                                                </td>

                                                <td className="text-end px-4">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-info"
                                                            title="Preview"
                                                            onClick={() =>
                                                                handleView(
                                                                    document
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Download"
                                                            onClick={() =>
                                                                handleDownload(
                                                                    document
                                                                )
                                                            }
                                                        >
                                                            <Download
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-warning"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    document
                                                                )
                                                            }
                                                        >
                                                            <Edit3
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Hapus"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    document
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL UPLOAD / EDIT */}

            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                        overflowY: "auto",
                    }}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        style={{
                            maxWidth: "440px",
                            width: "calc(100% - 24px)",
                            margin: "1.5rem auto",
                        }}
                    >
                        <div
                            className="modal-content border-0 shadow"
                            style={{
                                maxHeight:
                                    "calc(100vh - 48px)",
                                overflow:
                                    "hidden",
                                borderRadius:
                                    "10px",
                            }}
                        >
                            <div
                                className="modal-header"
                                style={{
                                    padding:
                                        "14px 18px",
                                }}
                            >
                                <h5 className="modal-title fw-bold mb-0">
                                    {editingDocument
                                        ? "Edit Dokumen"
                                        : "Upload Dokumen"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                />
                            </div>

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    minHeight: 0,
                                }}
                            >
                                <div
                                    className="modal-body"
                                    style={{
                                        padding:
                                            "16px 18px",
                                        overflowY:
                                            "auto",
                                    }}
                                >
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold mb-1">
                                            Nama Dokumen
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Contoh: Kontrak Kerja Budi"
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

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold mb-1">
                                            Kategori
                                        </label>

                                        <select
                                            name="category"
                                            className="form-select"
                                            value={
                                                form.category
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <option value="">
                                                Pilih kategori
                                            </option>

                                            <option value="HR">
                                                HR
                                            </option>

                                            <option value="Payroll">
                                                Payroll
                                            </option>

                                            <option value="Karyawan">
                                                Karyawan
                                            </option>

                                            <option value="Perusahaan">
                                                Perusahaan
                                            </option>

                                            <option value="Administrasi">
                                                Administrasi
                                            </option>

                                            <option value="Lainnya">
                                                Lainnya
                                            </option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold mb-1">
                                            File
                                        </label>

                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={
                                                handleFileChange
                                            }
                                            disabled={
                                                saving
                                            }
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                        />

                                        {editingDocument && (
                                            <div className="form-text">
                                                Kosongkan jika tidak ingin mengganti file.
                                            </div>
                                        )}

                                        {form.file && (
                                            <div className="small text-muted mt-2 text-truncate">
                                                File
                                                dipilih:{" "}
                                                <strong>
                                                    {
                                                        form
                                                            .file
                                                            .name
                                                    }
                                                </strong>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label fw-semibold mb-1">
                                            Deskripsi
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            placeholder="Keterangan dokumen..."
                                            value={
                                                form.description
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

                                <div
                                    className="modal-footer"
                                    style={{
                                        padding:
                                            "12px 18px",
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <X
                                            size={
                                                17
                                            }
                                            className="me-1"
                                        />

                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
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
                                                <Upload
                                                    size={
                                                        17
                                                    }
                                                    className="me-1"
                                                />

                                                {editingDocument
                                                    ? "Simpan Perubahan"
                                                    : "Upload"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentPage;

