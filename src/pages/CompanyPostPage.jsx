import React, { useCallback, useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";
import { apiFetch } from "../api/apiFetch";

import {
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  Send,
  FileText,
  Megaphone,
  Newspaper,
  Info,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  X,
} from "lucide-react";

// =========================================================
// TYPE OPTIONS
// =========================================================

const TYPE_OPTIONS = [
  {
    value: "announcement",
    label: "Pengumuman",
    icon: Megaphone,
  },
  {
    value: "update",
    label: "Update",
    icon: Newspaper,
  },
  {
    value: "article",
    label: "Artikel",
    icon: FileText,
  },
  {
    value: "hr_info",
    label: "Informasi HR",
    icon: Info,
  },
];

// =========================================================
// EMPTY FORM
// =========================================================

const EMPTY_FORM = {
  title: "",
  type: "announcement",
  content: "",
  image: null,
  status: "draft",
  published_at: "",
};

// =========================================================
// HELPERS
// =========================================================

const getTypeLabel = (type) => {
  const item = TYPE_OPTIONS.find((item) => item.value === type);

  return item?.label || type || "-";
};

const getTypeIcon = (type) => {
  const item = TYPE_OPTIONS.find((item) => item.value === type);

  return item?.icon || FileText;
};

// =========================================================
// IMAGE URL
// =========================================================

const getImageUrl = (image) => {
  if (!image) return null;

  const imageString = String(image).trim();

  if (!imageString) return null;

  // Kalau backend sudah mengirim URL lengkap
  if (imageString.startsWith("http://") || imageString.startsWith("https://")) {
    return imageString;
  }

  // Bersihkan slash di awal
  const imagePath = imageString.replace(/^\/+/, "");

  // LOCAL
  if (!import.meta.env.PROD) {
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  }

  // PRODUCTION
  return `https://yukabsen.com/storage/${imagePath}`;
};

// =========================================================
// FORMAT DATE
// Backend = UTC
// Tampilan = WIB
// =========================================================

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =========================================================
// UTC → WIB
// Untuk mengisi datetime-local saat EDIT
// =========================================================

const utcToJakartaInput = (utcDate) => {
  if (!utcDate) return "";

  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
};

// =========================================================
// WIB → UTC
// Untuk dikirim ke Laravel
// =========================================================

const jakartaInputToUTC = (localDateTime) => {
  if (!localDateTime) return null;

  const [datePart, timePart] = localDateTime.split("T");

  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split("-").map(Number);

  const [hour, minute] = timePart.split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  // WIB = UTC + 7
  // Jadi WIB 19:36 = UTC 12:36
  const utcMillis = Date.UTC(year, month - 1, day, hour - 7, minute, 0);

  const utcDate = new Date(utcMillis);

  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  return utcDate.toISOString();
};

// =========================================================
// COMPONENT
// =========================================================

const CompanyPostPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [editingPost, setEditingPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const [imagePreview, setImagePreview] = useState(null);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const query = params.toString();

      const response = await apiFetch.get(
        `/admin/company-posts${query ? `?${query}` : ""}`,
      );

      setPosts(response?.data?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data informasi:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text:
          error?.message || "Terjadi kesalahan saat mengambil data informasi.",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return posts;
    }

    return posts.filter((post) => {
      return (
        post.title?.toLowerCase().includes(keyword) ||
        post.content?.toLowerCase().includes(keyword) ||
        getTypeLabel(post.type)?.toLowerCase().includes(keyword)
      );
    });
  }, [posts, search]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalPosts = posts.length;

  const publishedCount = posts.filter(
    (post) => post.status === "published",
  ).length;

  const draftCount = posts.filter((post) => post.status === "draft").length;

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "File Tidak Valid",
        text: "Silakan pilih file gambar.",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Terlalu Besar",
        text: "Ukuran gambar maksimal 2 MB.",
      });

      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreateModal = () => {
    setEditingPost(null);

    setForm({
      ...EMPTY_FORM,
    });

    setImagePreview(null);
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (post) => {
    setEditingPost(post);

    setForm({
      title: post.title || "",
      type: post.type || "announcement",
      content: post.content || "",
      image: null,
      status: post.status || "draft",

      // Database/API = UTC
      // Input datetime-local = WIB
      published_at: post.published_at
        ? utcToJakartaInput(post.published_at)
        : "",
    });

    setImagePreview(getImageUrl(post.image));

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPost(null);

    setForm({
      ...EMPTY_FORM,
    });

    setImagePreview(null);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Judul Belum Diisi",
        text: "Silakan masukkan judul informasi.",
      });

      return;
    }

    if (!form.content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Konten Belum Diisi",
        text: "Silakan masukkan isi informasi.",
      });

      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());

      formData.append("type", form.type);

      formData.append("content", form.content);

      formData.append("status", form.status);

      // =====================================================
      // WIB → UTC
      // =====================================================

      if (form.published_at) {
        const utcPublishedAt = jakartaInputToUTC(form.published_at);

        if (utcPublishedAt) {
          formData.append("published_at", utcPublishedAt);
        }
      }

      // =====================================================
      // IMAGE
      // =====================================================

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      let response;

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingPost) {
        response = await apiFetch.post(
          `/admin/company-posts/${editingPost.id}`,
          formData,
        );
      }

      // =====================================================
      // CREATE
      // =====================================================
      else {
        response = await apiFetch.post("/admin/company-posts", formData);
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: response?.data?.message || "Informasi berhasil disimpan.",
        timer: 1600,
        showConfirmButton: false,
      });

      closeModal();

      await loadPosts();
    } catch (error) {
      console.error("Gagal menyimpan informasi:", error);

      let message =
        error?.message || "Terjadi kesalahan saat menyimpan informasi.";

      if (error?.data?.errors) {
        const validationErrors = Object.values(error.data.errors)
          .flat()
          .join("\n");

        if (validationErrors) {
          message = validationErrors;
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
  // DELETE
  // =========================================================

  const handleDelete = async (post) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus Informasi?",
      html: `
        Informasi
        <strong>"${post.title}"</strong>
        akan dihapus secara permanen.
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await apiFetch.delete(`/admin/company-posts/${post.id}`);

      await Swal.fire({
        icon: "success",
        title: "Berhasil Dihapus",
        timer: 1300,
        showConfirmButton: false,
      });

      await loadPosts();
    } catch (error) {
      console.error("Gagal menghapus informasi:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: error?.message || "Informasi gagal dihapus.",
      });
    }
  };

  // =========================================================
  // PUBLISH
  // =========================================================

  const handlePublish = async (post) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Publikasikan Informasi?",
      text: `"${post.title}" akan dapat dilihat oleh employee.`,
      showCancelButton: true,
      confirmButtonText: "Publikasikan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#198754",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await apiFetch.patch(
        `/admin/company-posts/${post.id}/publish`,
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil Dipublikasikan",
        text: response?.data?.message || "Informasi berhasil dipublikasikan.",
        timer: 1400,
        showConfirmButton: false,
      });

      await loadPosts();
    } catch (error) {
      console.error("Gagal publish:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal Publish",
        text: error?.message || "Informasi gagal dipublikasikan.",
      });
    }
  };

  // =========================================================
  // UNPUBLISH
  // =========================================================

  const handleUnpublish = async (post) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Kembalikan ke Draft?",
      text: `"${post.title}" tidak akan terlihat oleh employee.`,
      showCancelButton: true,
      confirmButtonText: "Ya, Jadikan Draft",
      cancelButtonText: "Batal",
      confirmButtonColor: "#f0ad4e",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await apiFetch.patch(
        `/admin/company-posts/${post.id}/unpublish`,
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: response?.data?.message || "Informasi dikembalikan ke draft.",
        timer: 1400,
        showConfirmButton: false,
      });

      await loadPosts();
    } catch (error) {
      console.error("Gagal unpublish:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error?.message || "Informasi gagal dikembalikan ke draft.",
      });
    }
  };

  // =========================================================
  // PREVIEW
  // =========================================================

  const openPreview = (post) => {
    setPreviewPost(post);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewPost(null);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main className="container-fluid px-3 px-md-4 py-4">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary text-white flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                }}
              >
                <FileText size={21} />
              </span>

              <div>
                <h3 className="fw-bold mb-0">Informasi & Pengumuman</h3>

                <small className="text-secondary">
                  Kelola artikel, pengumuman, update, dan informasi HR.
                </small>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Tambah Informasi
          </button>
        </div>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-secondary small mb-1">
                      Total Informasi
                    </div>

                    <div className="fs-3 fw-bold">{totalPosts}</div>
                  </div>

                  <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-3">
                    <FileText size={23} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-secondary small mb-1">
                      Dipublikasikan
                    </div>

                    <div className="fs-3 fw-bold text-success">
                      {publishedCount}
                    </div>
                  </div>

                  <div className="rounded-3 bg-success bg-opacity-10 text-success p-3">
                    <CheckCircle2 size={23} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-secondary small mb-1">Draft</div>

                    <div className="fs-3 fw-bold text-warning">
                      {draftCount}
                    </div>
                  </div>

                  <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-3">
                    <Clock3 size={23} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            FILTER
        =================================================== */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-12 col-lg-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={18} />
                  </span>

                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Cari judul atau isi informasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-6 col-lg-2">
                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Semua Tipe</option>

                  {TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6 col-lg-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>

                  <option value="published">Published</option>

                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="col-12 col-lg-2">
                <button
                  type="button"
                  className="btn btn-light border w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={loadPosts}
                  disabled={loading}
                >
                  <RefreshCw size={17} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 p-4">
            <h5 className="fw-bold mb-1">Daftar Informasi</h5>

            <small className="text-secondary">
              {filteredPosts.length} informasi ditemukan
            </small>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />

                <div className="text-secondary mt-3">Memuat data...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-5 px-3">
                <div className="rounded-circle bg-light d-inline-flex p-4 mb-3">
                  <FileText size={32} className="text-secondary" />
                </div>

                <h5 className="fw-bold">Belum Ada Informasi</h5>

                <p className="text-secondary mb-3">
                  Belum ada artikel atau pengumuman yang sesuai dengan filter.
                </p>

                <button
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center gap-1"
                  onClick={openCreateModal}
                >
                  <Plus size={17} />
                  Tambah Informasi
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    DESKTOP
                ================================================= */}

                <div className="table-responsive d-none d-md-block">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Informasi</th>

                        <th className="py-3">Tipe</th>

                        <th className="py-3">Status</th>

                        <th className="py-3">Dibuat</th>

                        <th className="text-end px-4 py-3">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPosts.map((post) => {
                        const TypeIcon = getTypeIcon(post.type);

                        return (
                          <tr key={post.id}>
                            <td className="px-4">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: 64,
                                    height: 52,
                                  }}
                                >
                                  {post.image ? (
                                    <img
                                      src={getImageUrl(post.image)}
                                      alt={post.title}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon
                                      size={20}
                                      className="text-secondary"
                                    />
                                  )}
                                </div>

                                <div
                                  style={{
                                    minWidth: 0,
                                  }}
                                >
                                  <h6
                                    className="fw-bold mb-1 text-truncate"
                                    style={{
                                      maxWidth: 360,
                                    }}
                                  >
                                    {post.title}
                                  </h6>

                                  <small
                                    className="text-secondary d-block text-truncate"
                                    style={{
                                      maxWidth: 360,
                                    }}
                                  >
                                    {post.content}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-2 py-2 fw-normal">
                                <TypeIcon size={14} />

                                {getTypeLabel(post.type)}
                              </span>
                            </td>

                            <td>
                              {post.status === "published" ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-2">
                                  Published
                                </span>
                              ) : (
                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-2">
                                  Draft
                                </span>
                              )}
                            </td>

                            <td>
                              <small className="text-secondary">
                                {formatDate(
                                  post.created_at || post.published_at,
                                )}
                              </small>
                            </td>

                            <td className="text-end px-4">
                              <div className="d-flex align-items-center justify-content-end gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border"
                                  title="Preview"
                                  onClick={() => openPreview(post)}
                                >
                                  <Eye size={16} />
                                </button>

                                {post.status === "draft" ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border text-success"
                                    title="Publikasikan"
                                    onClick={() => handlePublish(post)}
                                  >
                                    <Send size={16} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border text-warning"
                                    title="Unpublish"
                                    onClick={() => handleUnpublish(post)}
                                  >
                                    <Clock3 size={16} />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border text-primary"
                                  title="Edit"
                                  onClick={() => openEditModal(post)}
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border text-danger"
                                  title="Hapus"
                                  onClick={() => handleDelete(post)}
                                >
                                  <Trash2 size={16} />
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
                    MOBILE
                ================================================= */}

                <div className="d-md-none p-3">
                  <div className="d-flex flex-column gap-3">
                    {filteredPosts.map((post) => {
                      const TypeIcon = getTypeIcon(post.type);

                      return (
                        <div key={post.id} className="border rounded-3 p-3">
                          <div className="d-flex gap-3">
                            <div
                              className="rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: 64,
                                height: 64,
                              }}
                            >
                              {post.image ? (
                                <img
                                  src={getImageUrl(post.image)}
                                  alt={post.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <ImageIcon
                                  size={22}
                                  className="text-secondary"
                                />
                              )}
                            </div>

                            <div
                              className="flex-grow-1"
                              style={{
                                minWidth: 0,
                              }}
                            >
                              <h6 className="fw-bold mb-1 text-truncate">
                                {post.title}
                              </h6>

                              <div className="d-flex flex-wrap gap-1 mb-2">
                                <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 fw-normal">
                                  <TypeIcon size={13} />

                                  {getTypeLabel(post.type)}
                                </span>

                                {post.status === "published" ? (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                    Published
                                  </span>
                                ) : (
                                  <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                                    Draft
                                  </span>
                                )}
                              </div>

                              <small className="text-secondary">
                                {formatDate(
                                  post.created_at || post.published_at,
                                )}
                              </small>
                            </div>
                          </div>

                          <p
                            className="text-secondary small mt-3 mb-3"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post.content}
                          </p>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-light border flex-grow-1"
                              onClick={() => openPreview(post)}
                            >
                              <Eye size={15} className="me-1" />
                              Preview
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-light border text-primary"
                              onClick={() => openEditModal(post)}
                            >
                              <Edit3 size={15} />
                            </button>

                            {post.status === "draft" ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-light border text-success"
                                onClick={() => handlePublish(post)}
                              >
                                <Send size={15} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-light border text-warning"
                                onClick={() => handleUnpublish(post)}
                              >
                                <Clock3 size={15} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-light border text-danger"
                              onClick={() => handleDelete(post)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1055,
          }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            style={{
              width: "calc(100% - 24px)",
              maxWidth: "900px",
              margin: "15px auto",
            }}
          >
            <div
              className="modal-content border-0 shadow"
              style={{
                maxHeight: "calc(100vh - 30px)",
                height: "auto",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              {/* HEADER */}

              <div
                className="modal-header flex-shrink-0"
                style={{
                  padding: "18px 20px",
                }}
              >
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editingPost ? "Edit Informasi" : "Tambah Informasi Baru"}
                  </h5>

                  <small className="text-secondary">
                    Isi informasi yang akan ditampilkan kepada employee.
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={saving}
                />
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column"
                style={{
                  minHeight: 0,
                  flex: 1,
                }}
              >
                {/* BODY */}

                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "20px",
                    minHeight: 0,
                  }}
                >
                  {/* TITLE */}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Judul *</label>

                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      placeholder="Contoh: Pengumuman Libur Nasional"
                      value={form.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* TYPE + STATUS */}

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Tipe *</label>

                      <select
                        className="form-select"
                        name="type"
                        value={form.type}
                        onChange={handleInputChange}
                      >
                        {TYPE_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Status *</label>

                      <select
                        className="form-select"
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                      >
                        <option value="draft">Draft</option>

                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  {/* PUBLISH DATE */}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Jadwal Publikasi
                    </label>

                    <input
                      type="datetime-local"
                      className="form-control"
                      name="published_at"
                      value={form.published_at}
                      onChange={handleInputChange}
                    />

                    <div className="form-text">
                      Waktu menggunakan WIB (Asia/Jakarta). Jika dikosongkan dan
                      status Published, waktu publikasi akan menggunakan waktu
                      otomatis dari server.
                    </div>
                  </div>

                  {/* IMAGE */}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Gambar Header
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />

                    <div className="form-text">
                      Format JPG, PNG, atau WEBP. Maksimal 2 MB.
                    </div>

                    {imagePreview && (
                      <div className="mt-3">
                        <div className="position-relative d-inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="rounded-3 border"
                            style={{
                              width: "100%",
                              maxWidth: 360,
                              maxHeight: 180,
                              objectFit: "cover",
                            }}
                          />

                          <button
                            type="button"
                            className="btn btn-dark btn-sm position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 30,
                              height: 30,
                              padding: 0,
                            }}
                            onClick={() => {
                              setImagePreview(
                                editingPost
                                  ? getImageUrl(editingPost.image)
                                  : null,
                              );

                              setForm((prev) => ({
                                ...prev,
                                image: null,
                              }));
                            }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Konten *</label>

                    <textarea
                      className="form-control"
                      name="content"
                      rows="8"
                      placeholder="Tuliskan isi artikel atau pengumuman di sini..."
                      value={form.content}
                      onChange={handleInputChange}
                      required
                      style={{
                        resize: "vertical",
                        minHeight: "180px",
                      }}
                    />

                    <div className="form-text">
                      Tulis isi lengkap informasi, pengumuman, atau artikel.
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div
                  className="modal-footer flex-shrink-0 bg-white"
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #dee2e6",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving && (
                      <span className="spinner-border spinner-border-sm" />
                    )}

                    {editingPost ? "Simpan Perubahan" : "Simpan Informasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {showPreview && previewPost && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            style={{
              width: "calc(100% - 24px)",
              maxWidth: "900px",
              margin: "15px auto",
            }}
          >
            <div
              className="modal-content border-0 shadow"
              style={{
                maxHeight: "calc(100vh - 30px)",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              {/* HEADER */}

              <div className="modal-header flex-shrink-0">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-primary">
                    {getTypeLabel(previewPost.type)}
                  </span>

                  {previewPost.status === "published" ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                      Published
                    </span>
                  ) : (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                      Draft
                    </span>
                  )}

                  <small className="text-secondary">
                    {formatDate(
                      previewPost.published_at || previewPost.created_at,
                    )}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closePreview}
                />
              </div>

              {/* BODY */}

              <div
                className="modal-body"
                style={{
                  overflowY: "auto",
                  padding: "20px",
                }}
              >
                <h4 className="fw-bold mb-3">{previewPost.title}</h4>

                {previewPost.image && (
                  <img
                    src={getImageUrl(previewPost.image)}
                    alt={previewPost.title}
                    className="img-fluid rounded-3 mb-4 w-100"
                    style={{
                      maxHeight: 380,
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}

                <div
                  className="text-dark"
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.8,
                  }}
                >
                  {previewPost.content}
                </div>
              </div>

              {/* FOOTER */}

              <div className="modal-footer flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePreview}
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

export default CompanyPostPage;
