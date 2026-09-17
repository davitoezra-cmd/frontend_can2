import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import LogoutButton from "../components/LogoutButton";
import apiFetch from "../api/apiFetch";

const NavbarEmployee = ({
  user,
  onToggleSidebar,
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] =
    useState(false);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  // =====================================================
  // AMBIL JUMLAH NOTIFIKASI BELUM DIBACA
  // =====================================================
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch.get(
        "/employee/notifications/unread-count"
      );

      if (res.data?.success) {
        setUnreadCount(
          res.data?.data?.count || 0
        );
      }
    } catch (error) {
      console.error(
        "Gagal mengambil jumlah notifikasi:",
        error
      );
    }
  }, []);

  // =====================================================
  // AMBIL SEMUA NOTIFIKASI
  // =====================================================
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);

      const res = await apiFetch.get(
        "/employee/notifications"
      );

      if (res.data?.success) {
        setNotifications(
          res.data?.data || []
        );
      }
    } catch (error) {
      console.error(
        "Gagal mengambil notifikasi:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // =====================================================
  // LOAD JUMLAH NOTIFIKASI
  // =====================================================
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  // =====================================================
  // BUKA / TUTUP NOTIFIKASI
  // =====================================================
  const handleNotificationClick = async () => {
    const newState = !notificationOpen;

    setNotificationOpen(newState);

    if (newState) {
      await fetchNotifications();
    }
  };

  // =====================================================
  // TANDAI SATU NOTIFIKASI SUDAH DIBACA
  // =====================================================
  const handleMarkAsRead = async (
    notification
  ) => {
    try {
      if (!notification.read_at) {
        await apiFetch.post(
          `/employee/notifications/${notification.id}/read`
        );

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read_at:
                    new Date().toISOString(),
                }
              : item
          )
        );

        setUnreadCount((prev) =>
          Math.max(0, prev - 1)
        );
      }

      // Untuk sementara
      // Nanti bisa diarahkan ke halaman detail informasi
      if (notification.data?.post_id) {
        console.log(
          "Company Post ID:",
          notification.data.post_id
        );
      }
    } catch (error) {
      console.error(
        "Gagal menandai notifikasi:",
        error
      );
    }
  };

  // =====================================================
  // TANDAI SEMUA SUDAH DIBACA
  // =====================================================
  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch.post(
        "/employee/notifications/read-all"
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read_at:
            new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Gagal menandai semua notifikasi:",
        error
      );
    }
  };

  // =====================================================
  // TUTUP DROPDOWN KETIKA KLIK DI LUAR
  // =====================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // FORMAT WAKTU NOTIFIKASI
  // =====================================================
  const formatNotificationDate = (date) => {
    if (!date) return "";

    const notificationDate =
      new Date(date);

    const now = new Date();

    const diff = Math.floor(
      (now - notificationDate) / 1000
    );

    if (diff < 60) {
      return "Baru saja";
    }

    if (diff < 3600) {
      return `${Math.floor(
        diff / 60
      )} menit lalu`;
    }

    if (diff < 86400) {
      return `${Math.floor(
        diff / 3600
      )} jam lalu`;
    }

    if (diff < 604800) {
      return `${Math.floor(
        diff / 86400
      )} hari lalu`;
    }

    return notificationDate.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <header
      className="bg-white border-bottom px-3 px-md-4 py-2 py-md-3 shadow-sm"
      style={{
        borderColor: "#e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 1020,
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-2 gap-md-3">

        {/* =====================================================
            LEFT
        ===================================================== */}
        <div
          className="d-flex align-items-center gap-2 flex-grow-1"
          style={{
            maxWidth: "450px",
            minWidth: 0,
          }}
        >

          {/* MOBILE SIDEBAR */}
          <button
            type="button"
            className="btn btn-light border rounded-3 d-lg-none flex-shrink-0"
            onClick={onToggleSidebar}
            aria-label="Buka menu"
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* SEARCH DESKTOP / TABLET */}
          <div className="input-group d-none d-sm-flex">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>

            <input
              type="text"
              className="form-control border-start-0 bg-light shadow-none"
              placeholder="Cari..."
            />
          </div>
        </div>

        {/* =====================================================
            RIGHT
        ===================================================== */}
        <div
          className="d-flex align-items-center gap-2 gap-md-3 flex-shrink-0"
        >

          {/* =====================================================
              NOTIFICATION
          ===================================================== */}
          <div
            className="position-relative"
            ref={notificationRef}
          >
            <button
              type="button"
              className="btn btn-light rounded-circle position-relative d-inline-flex align-items-center justify-content-center"
              aria-label="Notifikasi"
              onClick={
                handleNotificationClick
              }
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
              }}
            >
              <i
                className={`bi ${
                  unreadCount > 0
                    ? "bi-bell-fill"
                    : "bi-bell"
                }`}
                style={{
                  fontSize: 18,
                }}
              ></i>

              {/* BADGE JUMLAH */}
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{
                    minWidth: 18,
                    height: 18,
                    fontSize: 10,
                    padding: "2px 5px",
                  }}
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* =====================================================
                DROPDOWN NOTIFICATION
            ===================================================== */}
            {notificationOpen && (
              <div
                className="position-absolute bg-white border rounded-3 shadow-lg"
                style={{
                  width:
                    "min(360px, calc(100vw - 24px))",

                  /*
                   * DESKTOP:
                   * tetap berada di bawah tombol bell
                   */
                  right: 0,

                  top: "calc(100% + 10px)",

                  zIndex: 2000,
                  overflow: "hidden",
                }}
              >

                {/* =================================================
                    HEADER
                ================================================= */}
                <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom gap-2">

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div className="fw-semibold">
                      Notifikasi
                    </div>

                    {unreadCount > 0 && (
                      <small className="text-muted">
                        {unreadCount} belum dibaca
                      </small>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none p-0 flex-shrink-0"
                      onClick={
                        handleMarkAllAsRead
                      }
                    >
                      Tandai semua
                    </button>
                  )}
                </div>

                {/* =================================================
                    BODY
                ================================================= */}
                <div
                  style={{
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >

                  {/* LOADING */}
                  {loadingNotifications ? (
                    <div className="text-center py-4">

                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      ></div>

                      <div className="small text-muted mt-2">
                        Memuat notifikasi...
                      </div>

                    </div>
                  ) : notifications.length ===
                    0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */
                    <div className="text-center py-5 px-3">

                      <i
                        className="bi bi-bell-slash text-muted"
                        style={{
                          fontSize: 30,
                        }}
                      ></i>

                      <div className="small text-muted mt-2">
                        Belum ada notifikasi
                      </div>

                    </div>

                  ) : (

                    /* =================================================
                       LIST
                    ================================================= */
                    notifications.map(
                      (notification) => {

                        const data =
                          notification.data ||
                          {};

                        const isUnread =
                          !notification.read_at;

                        return (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            className="w-100 border-0 text-start px-3 py-3"
                            onClick={() =>
                              handleMarkAsRead(
                                notification
                              )
                            }
                            style={{
                              backgroundColor:
                                isUnread
                                  ? "#f8fafc"
                                  : "#fff",

                              borderBottom:
                                "1px solid #f1f5f9",

                              cursor: "pointer",
                            }}
                          >

                            <div className="d-flex gap-3">

                              {/* ICON */}
                              <div
                                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: 38,
                                  height: 38,
                                }}
                              >
                                <i className="bi bi-megaphone"></i>
                              </div>

                              {/* CONTENT */}
                              <div
                                className="flex-grow-1"
                                style={{
                                  minWidth: 0,
                                }}
                              >

                                <div
                                  className={
                                    isUnread
                                      ? "fw-semibold text-dark"
                                      : "fw-normal text-dark"
                                  }
                                  style={{
                                    wordBreak:
                                      "break-word",
                                  }}
                                >
                                  {data.title ||
                                    "Informasi baru"}
                                </div>

                                <div
                                  className="small text-muted mt-1"
                                  style={{
                                    wordBreak:
                                      "break-word",
                                  }}
                                >
                                  {data.message ||
                                    "Ada informasi baru dari perusahaan."}
                                </div>

                                <div className="small text-secondary mt-1">
                                  {formatNotificationDate(
                                    notification.created_at
                                  )}
                                </div>

                              </div>

                              {/* UNREAD DOT */}
                              {isUnread && (
                                <span
                                  className="rounded-circle bg-primary flex-shrink-0 mt-2"
                                  style={{
                                    width: 8,
                                    height: 8,
                                  }}
                                />
                              )}

                            </div>

                          </button>
                        );
                      }
                    )
                  )}

                </div>

              </div>
            )}
          </div>

          {/* =====================================================
              USER
          ===================================================== */}
          <div className="d-flex align-items-center gap-2">

            {/* NAMA */}
            <div
              className="text-end d-none d-md-block"
            >
              <div
                className="fw-semibold text-truncate"
                style={{
                  maxWidth: 160,
                }}
              >
                {user?.name || "Employee"}
              </div>

              <small className="text-muted">
                Employee
              </small>
            </div>

            {/* AVATAR */}
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{
                width: 40,
                height: 40,
              }}
              aria-label="Profil employee"
            >
              <i className="bi bi-person-fill"></i>
            </div>

          </div>

          {/* =====================================================
              LOGOUT
          ===================================================== */}
          <LogoutButton
            compact
            className="navbar-logout-btn"
          />

        </div>

      </div>

      {/* =========================================================
          MOBILE NOTIFICATION POSITION
          ========================================================= */}
      <style>
        {`
          @media (max-width: 575.98px) {
            .navbar-notification-mobile {
              right: auto !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
            }
          }
        `}
      </style>

    </header>
  );
};

export default NavbarEmployee;