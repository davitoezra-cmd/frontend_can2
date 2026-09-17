import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";

import NavbarEmployee from "../layouts/NavbarEmployee";
import SidebarEmployee from "../components/SidebarEmployee";

import { apiFetch } from "../api/apiFetch";

import {
  Search,
  RefreshCw,
  Eye,
  FileText,
  Megaphone,
  Newspaper,
  Info,
  CalendarDays,
  X,
  ChevronRight,
  Image as ImageIcon,
  Menu,
} from "lucide-react";

// ============================================================
// TYPE OPTIONS
// ============================================================

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

// ============================================================
// TYPE DATA
// ============================================================

const getTypeData = (type) => {
  return (
    TYPE_OPTIONS.find((item) => item.value === type) || {
      value: type,
      label: type || "Informasi",
      icon: FileText,
    }
  );
};

// ============================================================
// FORMAT DATE
// Laravel menyimpan created_at dalam UTC.
// Browser akan otomatis mengubahnya ke timezone lokal laptop.
// Contoh:
// DB      : 2026-09-05 03:00:00 UTC
// WIB     : 05 September 2026 10:00
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ============================================================
// FORMAT DATE TIME
// ============================================================

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================
// IMAGE URL
// ============================================================

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  const imageString = String(image).trim();

  if (!imageString) {
    return null;
  }

  // Jika backend sudah mengirim URL lengkap
  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  // Bersihkan slash di awal
  const cleanImage = imageString.replace(/^\/+/, "");

  // LOCAL
  if (!import.meta.env.PROD) {
    return `http://127.0.0.1:8000/storage/${cleanImage}`;
  }

  // PRODUCTION
  return `https://yukabsen.com/storage/${cleanImage}`;
};

// ============================================================
// GET EXCERPT
// ============================================================

const getExcerpt = (content, maxLength = 160) => {
  if (!content) {
    return "";
  }

  const text = String(content)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength).trim()}...`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const EmployeecompanyPostPage = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Sidebar mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const query = params.toString();

      const endpoint = `employee/company-posts${
        query ? `?${query}` : ""
      }`;

      console.log("====================================");
      console.log("EMPLOYEE COMPANY POSTS REQUEST");
      console.log("ENDPOINT:", endpoint);
      console.log("====================================");

      const response = await apiFetch.get(endpoint);

      console.log(
        "EMPLOYEE COMPANY POSTS RESPONSE:",
        response
      );

      // ======================================================
      // NORMALISASI RESPONSE
      // ======================================================

      let postData = [];

      if (Array.isArray(response)) {
        postData = response;
      } else if (Array.isArray(response?.data)) {
        postData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        postData = response.data.data;
      } else if (Array.isArray(response?.data?.posts)) {
        postData = response.data.posts;
      } else if (Array.isArray(response?.posts)) {
        postData = response.posts;
      }

      console.log(
        "EMPLOYEE COMPANY POSTS DATA:",
        postData
      );

      console.log(
        "JUMLAH POSTS:",
        postData.length
      );

      setPosts(postData);
    } catch (error) {
      console.error(
        "GAGAL MENGAMBIL DATA COMPANY POSTS:",
        error
      );

      console.error(
        "ERROR RESPONSE:",
        error?.response
      );

      console.error(
        "ERROR DATA:",
        error?.response?.data
      );

      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Informasi",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan saat mengambil informasi.",
      });

      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ==========================================================
  // FILTER SEARCH
  // ==========================================================

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return posts;
    }

    return posts.filter((post) => {
      const typeData = getTypeData(post?.type);

      return (
        String(post?.title || "")
          .toLowerCase()
          .includes(keyword) ||
        String(post?.content || "")
          .toLowerCase()
          .includes(keyword) ||
        String(typeData?.label || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [posts, search]);

  // ==========================================================
  // OPEN DETAIL
  // ==========================================================

  const openDetail = (post) => {
    setSelectedPost(post);
    setShowDetail(true);

    document.body.style.overflow = "hidden";
  };

  // ==========================================================
  // CLOSE DETAIL
  // ==========================================================

  const closeDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedPost(null);

    document.body.style.overflow = "";
  }, []);

  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showDetail) {
        closeDetail();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [showDetail, closeDetail]);

  // ==========================================================
  // CLOSE MOBILE SIDEBAR WHEN RESIZE
  // ==========================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991.98) {
        setIsSidebarOpen(false);
      }
    };

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

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="employee-company-post-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <SidebarEmployee
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="employee-company-post-main">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <NavbarEmployee />

        {/* ===================================================
            MOBILE SIDEBAR BUTTON
        =================================================== */}

        <button
          type="button"
          className="btn btn-primary mobile-sidebar-button shadow"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="employee-company-post-content">

          <div className="employee-company-post-container">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header mb-4 mb-md-5">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex align-items-center justify-content-center rounded-4 bg-primary text-white shadow-sm"
                  style={{
                    width: 54,
                    height: 54,
                    minWidth: 54,
                  }}
                >
                  <FileText size={26} />
                </div>

                <div>
                  <h2
                    className="fw-bold mb-1"
                    style={{
                      color: "#1e293b",
                    }}
                  >
                    Informasi & Pengumuman
                  </h2>

                  <p className="text-secondary mb-0">
                    Temukan informasi terbaru dari
                    perusahaan dan HR.
                  </p>
                </div>

              </div>

            </div>

            {/* =================================================
                SEARCH & FILTER
            ================================================= */}

            <div className="card border-0 shadow-sm rounded-4 mb-4">

              <div className="card-body p-3 p-md-4">

                <div className="row g-3">

                  {/* SEARCH */}

                  <div className="col-12 col-lg-8">

                    <div className="input-group">

                      <span className="input-group-text bg-white border-end-0">
                        <Search
                          size={18}
                          className="text-secondary"
                        />
                      </span>

                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Cari informasi, pengumuman, atau artikel..."
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                      />

                    </div>

                  </div>

                  {/* TYPE FILTER */}

                  <div className="col-12 col-sm-8 col-lg-3">

                    <select
                      className="form-select"
                      value={typeFilter}
                      onChange={(e) =>
                        setTypeFilter(e.target.value)
                      }
                    >

                      <option value="all">
                        Semua Informasi
                      </option>

                      {TYPE_OPTIONS.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* REFRESH */}

                  <div className="col-12 col-sm-4 col-lg-1">

                    <button
                      type="button"
                      className="btn btn-light border w-100 refresh-button d-flex align-items-center justify-content-center"
                      onClick={loadPosts}
                      disabled={loading}
                      title="Refresh"
                    >

                      <RefreshCw
                        size={18}
                        className={
                          loading
                            ? "spin-animation"
                            : ""
                        }
                      />

                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                RESULT INFO
            ================================================= */}

            {!loading && (
              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>

                  <span
                    className="fw-semibold"
                    style={{
                      color: "#1e293b",
                    }}
                  >
                    Informasi Terbaru
                  </span>

                  <span className="text-secondary ms-2">
                    {filteredPosts.length} informasi
                  </span>

                </div>

              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div className="row g-4">

                {[1, 2, 3].map((item) => (

                  <div
                    className="col-12 col-md-6 col-xl-4"
                    key={item}
                  >

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">

                      <div
                        className="placeholder-glow"
                        style={{
                          height: 220,
                          background: "#e9ecef",
                        }}
                      />

                      <div className="card-body p-4">

                        <span className="placeholder col-4 mb-3" />
                        <br />

                        <span className="placeholder col-9 mb-2" />
                        <br />

                        <span className="placeholder col-12 mb-2" />
                        <br />

                        <span className="placeholder col-8" />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            ) : filteredPosts.length === 0 ? (

              /* =================================================
                 EMPTY
              ================================================= */

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body text-center py-5 px-3">

                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3"
                    style={{
                      width: 84,
                      height: 84,
                    }}
                  >

                    <FileText
                      size={36}
                      className="text-secondary"
                    />

                  </div>

                  <h5 className="fw-bold">
                    Tidak Ada Informasi
                  </h5>

                  <p className="text-secondary mb-0">
                    Belum ada informasi yang sesuai
                    dengan pencarian atau filter.
                  </p>

                </div>

              </div>

            ) : (

              /* =================================================
                 POSTS
              ================================================= */

              <div className="row g-4">

                {filteredPosts.map((post) => {

                  const typeData = getTypeData(
                    post?.type
                  );

                  const TypeIcon = typeData.icon;

                  const imageUrl = getImageUrl(
                    post?.image
                  );

                  return (

                    <div
                      className="col-12 col-md-6 col-xl-4"
                      key={post?.id}
                    >

                      <article className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 post-card">

                        {/* IMAGE */}

                        <div
                          className="position-relative bg-light"
                          style={{
                            height: 220,
                          }}
                        >

                          {imageUrl ? (

                            <img
                              src={imageUrl}
                              alt={
                                post?.title ||
                                "Informasi"
                              }
                              className="w-100 h-100"
                              style={{
                                objectFit: "cover",
                              }}
                              onError={(e) => {

                                e.currentTarget.style.display =
                                  "none";

                                const parent =
                                  e.currentTarget
                                    .parentElement;

                                if (parent) {
                                  parent.classList.add(
                                    "image-error"
                                  );
                                }

                              }}
                            />

                          ) : (

                            <div className="w-100 h-100 d-flex align-items-center justify-content-center">

                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm"
                                style={{
                                  width: 72,
                                  height: 72,
                                }}
                              >

                                <ImageIcon
                                  size={31}
                                  className="text-secondary"
                                />

                              </div>

                            </div>

                          )}

                          {/* TYPE BADGE */}

                          <div className="position-absolute top-0 start-0 m-3">

                            <span className="badge bg-white text-dark shadow-sm px-3 py-2 d-inline-flex align-items-center gap-2">

                              <TypeIcon size={14} />

                              {typeData.label}

                            </span>

                          </div>

                        </div>

                        {/* CARD CONTENT */}

                        <div className="card-body p-4 d-flex flex-column">

                          {/* DATE */}

                          <div className="d-flex align-items-center gap-2 text-secondary small mb-2">

                            <CalendarDays size={14} />

                            <span>
                              {formatDate(
                                post?.created_at
                              )}
                            </span>

                          </div>

                          {/* TITLE */}

                          <h5
                            className="fw-bold mb-2"
                            style={{
                              lineHeight: 1.4,
                              color: "#1e293b",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient:
                                "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post?.title ||
                              "Tanpa Judul"}
                          </h5>

                          {/* EXCERPT */}

                          <p
                            className="text-secondary mb-4"
                            style={{
                              lineHeight: 1.65,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient:
                                "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {getExcerpt(
                              post?.content,
                              160
                            )}
                          </p>

                          {/* BUTTON */}

                          <div className="mt-auto">

                            <button
                              type="button"
                              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                              onClick={() =>
                                openDetail(post)
                              }
                            >

                              <Eye size={17} />

                              Baca Selengkapnya

                              <ChevronRight
                                size={17}
                              />

                            </button>

                          </div>

                        </div>

                      </article>

                    </div>

                  );
                })}

              </div>

            )}

          </div>

        </main>

      </div>

      {/* =======================================================
          DETAIL MODAL
      ======================================================= */}

      {showDetail && selectedPost && (

        <div
          className="employee-post-overlay"
          onMouseDown={(e) => {

            if (e.target === e.currentTarget) {
              closeDetail();
            }

          }}
        >

          <div className="employee-post-modal">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="employee-post-modal-header">

              <div className="d-flex align-items-center gap-2">

                <span className="badge bg-primary px-3 py-2">

                  {
                    getTypeData(
                      selectedPost?.type
                    ).label
                  }

                </span>

              </div>

              <button
                type="button"
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                }}
                onClick={closeDetail}
                aria-label="Tutup"
              >

                <X size={19} />

              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="employee-post-modal-body">

              {/* IMAGE */}

              {selectedPost?.image &&
                getImageUrl(
                  selectedPost.image
                ) && (

                  <img
                    src={getImageUrl(
                      selectedPost.image
                    )}
                    alt={
                      selectedPost?.title ||
                      "Informasi"
                    }
                    className="employee-post-detail-image"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                )}

              <div className="p-4 p-md-5">

                {/* DATE */}

                <div className="d-flex align-items-center gap-2 text-secondary small mb-3">

                  <CalendarDays size={16} />

                  <span>

                    Dipublikasikan{" "}

                    {formatDateTime(
                      selectedPost?.created_at
                    )}

                  </span>

                </div>

                {/* TITLE */}

                <h2
                  className="fw-bold mb-4"
                  style={{
                    lineHeight: 1.3,
                    color: "#1e293b",
                  }}
                >

                  {selectedPost?.title ||
                    "Tanpa Judul"}

                </h2>

                {/* CONTENT */}

                <div
                  className="text-dark"
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.8,
                    fontSize: "1rem",
                    wordBreak: "break-word",
                  }}
                >

                  {selectedPost?.content || "-"}

                </div>

              </div>

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="employee-post-modal-footer">

              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={closeDetail}
              >
                Tutup
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =======================================================
          PAGE STYLE
      ======================================================= */}

      <style>{`
        /* =====================================================
           PAGE
        ===================================================== */

        .employee-company-post-page {
          --employee-sidebar-width: 260px;

          min-height: 100vh;

          background: linear-gradient(
            180deg,
            #f8fafc 0%,
            #f1f5f9 100%
          );
        }

        /* =====================================================
           MAIN AREA
        ===================================================== */

        .employee-company-post-main {
          min-height: 100vh;
          min-width: 0;

          margin-left: var(--employee-sidebar-width);

          width: calc(
            100% - var(--employee-sidebar-width)
          );
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .employee-company-post-content {
          width: 100%;
          min-width: 0;
        }

        .employee-company-post-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 40px 32px 60px;
        }

        /* =====================================================
           CARD
        ===================================================== */

        .post-card {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .post-card:hover {
          transform: translateY(-4px);

          box-shadow:
            0 0.75rem 2rem
            rgba(15, 23, 42, 0.10) !important;
        }

        /* =====================================================
           IMAGE ERROR
        ===================================================== */

        .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-error::after {
          content: "Tidak ada gambar";

          color: #6c757d;

          font-size: 14px;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .employee-company-post-page .form-control,
        .employee-company-post-page .form-select {
          min-height: 44px;
        }

        .employee-company-post-page
          .form-control:focus,
        .employee-company-post-page
          .form-select:focus {
          border-color: #86b7fe;

          box-shadow:
            0 0 0 0.2rem
            rgba(13, 110, 253, 0.10);
        }

        .refresh-button {
          min-height: 44px;
        }

        /* =====================================================
           REFRESH ANIMATION
        ===================================================== */

        .spin-animation {
          animation:
            employeePostSpin
            0.8s
            linear
            infinite;
        }

        @keyframes employeePostSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           MOBILE SIDEBAR BUTTON
        ===================================================== */

        .mobile-sidebar-button {
          display: none;

          position: fixed;

          left: 14px;
          bottom: 18px;

          z-index: 1500;

          width: 46px;
          height: 46px;

          border-radius: 50%;

          align-items: center;
          justify-content: center;
        }

        /* =====================================================
           MODAL OVERLAY
        ===================================================== */

        .employee-post-overlay {
          position: fixed;

          inset: 0;

          z-index: 2000;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 16px;

          background:
            rgba(15, 23, 42, 0.68);
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .employee-post-modal {
          width: 100%;
          max-width: 900px;

          max-height: 92vh;

          background: #ffffff;

          border-radius: 18px;

          overflow: hidden;

          box-shadow:
            0 1.5rem 4rem
            rgba(0, 0, 0, 0.25);

          display: flex;

          flex-direction: column;
        }

        /* =====================================================
           MODAL HEADER
        ===================================================== */

        .employee-post-modal-header {
          min-height: 68px;

          padding: 14px 20px;

          border-bottom:
            1px solid #e5e7eb;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 12px;

          flex-shrink: 0;
        }

        /* =====================================================
           MODAL BODY
        ===================================================== */

        .employee-post-modal-body {
          overflow-y: auto;

          min-height: 0;

          flex: 1;
        }

        /* =====================================================
           DETAIL IMAGE
        ===================================================== */

        .employee-post-detail-image {
          width: 100%;

          max-height: 400px;

          object-fit: cover;

          display: block;
        }

        /* =====================================================
           MODAL FOOTER
        ===================================================== */

        .employee-post-modal-footer {
          min-height: 68px;

          padding: 14px 20px;

          border-top:
            1px solid #e5e7eb;

          display: flex;

          justify-content: flex-end;

          align-items: center;

          flex-shrink: 0;

          background: #ffffff;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 991.98px) {

          .employee-company-post-main {
            margin-left: 0;

            width: 100%;
          }

          .employee-company-post-container {
            padding:
              30px
              24px
              50px;
          }

          .mobile-sidebar-button {
            display: flex;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 576px) {

          .employee-company-post-container {
            padding:
              24px
              14px
              40px;
          }

          .page-header h2 {
            font-size: 1.5rem;
          }

          .page-header p {
            font-size: 0.9rem;
          }

          .page-header > div {
            align-items: flex-start !important;
          }

          .employee-post-overlay {
            padding: 8px;
          }

          .employee-post-modal {
            max-height: 96vh;

            border-radius: 14px;
          }

          .employee-post-modal-header {
            min-height: 60px;

            padding: 10px 14px;
          }

          .employee-post-modal-footer {
            min-height: 60px;

            padding: 10px 14px;
          }

          .employee-post-detail-image {
            max-height: 250px;
          }

          .employee-post-modal-body .p-4 {
            padding: 1rem !important;
          }

          .mobile-sidebar-button {
            left: 12px;

            bottom: 14px;

            width: 44px;
            height: 44px;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .employee-company-post-container {
            padding:
              20px
              10px
              35px;
          }

          .employee-post-modal-header {
            padding: 9px 12px;
          }

          .employee-post-modal-footer {
            padding: 9px 12px;
          }

          .employee-post-modal-body .p-4 {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeecompanyPostPage;