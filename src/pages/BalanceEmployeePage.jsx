import React, { useState, useEffect } from "react";
import {apiFetch} from "../api/apiFetch";
import { formatRupiah, formatDate } from "../utils/formatters";

import SidebarEmployee from "../components/SidebarEmployee";
import NavbarEmployee from "../layouts/NavbarEmployee";


const BalanceEmployeePage = () => {
  // =========================
  // STATE DATA
  // =========================
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // STATE SIDEBAR
  // =========================
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // =========================
  // STATE MODAL
  // =========================
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState("");

  // =========================
  // RESPONSIVE SIDEBAR
  // =========================
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

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    setLoading(true);

    try {
      const [resBalance, resTransactions, resWithdrawals] = await Promise.all([
        apiFetch.get("/employee/balance"),
        apiFetch.get("/employee/balance/transactions"),
        apiFetch.get("/employee/balance-withdrawals"),
      ]);

      if (resBalance.data?.success) {
        setBalance(parseFloat(resBalance.data.data?.balance || 0));
      }

      if (resTransactions.data?.success) {
        setTransactions(resTransactions.data.data || []);
      }

      if (resWithdrawals.data?.success) {
        setWithdrawals(resWithdrawals.data.data || []);
      }
    } catch (err) {
      console.error("🔥 ERROR BALANCE:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // STATISTIK
  // =========================
  const totalIncome = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // =========================
  // SUBMIT WITHDRAWAL
  // =========================
  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();

    setModalError("");

    const amountNum = parseFloat(withdrawAmount);

    if (!withdrawAmount || isNaN(amountNum)) {
      setModalError("Jumlah penarikan wajib diisi.");
      return;
    }

    if (amountNum <= 0) {
      setModalError("Jumlah penarikan harus lebih besar dari 0.");
      return;
    }

    if (amountNum > balance) {
      setModalError("Jumlah penarikan tidak boleh melebihi saldo tersedia.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const res = await apiFetch.post(
        "/employee/balance-withdrawals",
        {
          amount: amountNum,
          note: withdrawNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.success) {
        setShowModal(false);
        setWithdrawAmount("");
        setWithdrawNote("");

        setSuccessAlert("Pengajuan penarikan saldo berhasil dikirim!");

        fetchData();

        setTimeout(() => {
          setSuccessAlert("");
        }, 4000);
      }
    } catch (err) {
      setModalError(
        err.response?.data?.message || "Gagal mengajukan penarikan saldo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // OPEN MODAL
  // =========================
  const openWithdrawModal = () => {
    setModalError("");
    setWithdrawAmount("");
    setWithdrawNote("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeWithdrawModal = () => {
    if (isSubmitting) return;

    setShowModal(false);
    setModalError("");
    setWithdrawAmount("");
    setWithdrawNote("");
  };

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundColor: "#f1f5f9",
        overflowX: "hidden",
      }}
    >
      {/* ==================================================
                STYLE LAYOUT
            ================================================== */}
      <style>{`
                .sidebar-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(3px);
                    z-index: 1040;
                    opacity: 0;
                    visibility: hidden;
                    transition:
                        opacity 0.3s ease,
                        visibility 0.3s ease;
                }

                .sidebar-backdrop.show {
                    opacity: 1;
                    visibility: visible;
                }

                .sidebar-container {
                    width: 260px;
                    height: 100vh !important;
                    max-height: 100vh !important;

                    position: fixed !important;
                    top: 0 !important;
                    bottom: 0 !important;
                    left: 0 !important;

                    z-index: 1050;

                    background-color: #0f172a;

                    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);

                    transition:
                        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

                    will-change: transform;

                    overflow-y: auto;
                }

                .main-content-wrapper {
                    min-height: 100vh;
                    min-width: 0;

                    transition:
                        margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @media (max-width: 991.98px) {
                    .sidebar-container.closed {
                        transform: translateX(-100%);
                    }

                    .sidebar-container.open {
                        transform: translateX(0);
                    }

                    .main-content-wrapper {
                        margin-left: 0 !important;
                    }
                }

                @media (min-width: 992px) {
                    .sidebar-container {
                        transform: translateX(0) !important;
                    }

                    .main-content-wrapper {
                        margin-left: 260px !important;
                    }
                }

                .balance-page-content {
                    width: 100%;
                    max-width: 1600px;
                }

                /* ==================================================
                   WITHDRAW MODAL
                ================================================== */

                .withdraw-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 1090;
                    background: rgba(15, 23, 42, 0.55);
                    backdrop-filter: blur(3px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }

                .withdraw-modal-dialog {
                    width: 100%;
                    max-width: 480px;
                    margin: auto;
                }

                .withdraw-modal-content {
                    background: #ffffff;
                    border: none;
                    border-radius: 18px;
                    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
                    overflow: hidden;
                    animation: withdrawModalShow 0.2s ease-out;
                }

                @keyframes withdrawModalShow {
                    from {
                        opacity: 0;
                        transform: translateY(10px) scale(0.98);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .withdraw-modal-header {
                    padding: 18px 22px 14px;
                    border-bottom: 1px solid #eef2f7;
                }

                .withdraw-modal-body {
                    padding: 18px 22px;
                }

                .withdraw-modal-footer {
                    padding: 14px 22px 18px;
                    border-top: 1px solid #eef2f7;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }

                .withdraw-balance-box {
                    background: linear-gradient(
                        135deg,
                        #eff6ff 0%,
                        #f8fafc 100%
                    );
                    border: 1px solid #dbeafe;
                    border-radius: 12px;
                    padding: 13px 15px;
                    margin-bottom: 16px;
                }

                .withdraw-balance-label {
                    font-size: 12px;
                    color: #64748b;
                    margin-bottom: 3px;
                }

                .withdraw-balance-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #2563eb;
                }

                .withdraw-form-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 7px;
                }

                .withdraw-form-control {
                    border: 1px solid #dbe2ea;
                    border-radius: 10px;
                    min-height: 44px;
                    box-shadow: none !important;
                }

                .withdraw-form-control:focus {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.08) !important;
                }

                .withdraw-modal-textarea {
                    min-height: 82px;
                    resize: vertical;
                }

                .withdraw-error {
                    border: none;
                    border-radius: 10px;
                    background: #fef2f2;
                    color: #b91c1c;
                    font-size: 13px;
                    padding: 10px 12px;
                    margin-bottom: 14px;
                }

                .withdraw-submit-btn {
                    min-width: 145px;
                    border-radius: 10px;
                    font-weight: 600;
                }

                .withdraw-cancel-btn {
                    border-radius: 10px;
                    font-weight: 500;
                    min-width: 85px;
                }

                @media (max-width: 575.98px) {
                    .withdraw-modal-backdrop {
                        padding: 12px;
                    }

                    .withdraw-modal-dialog {
                        max-width: 100%;
                    }

                    .withdraw-modal-header {
                        padding: 16px 18px 12px;
                    }

                    .withdraw-modal-body {
                        padding: 16px 18px;
                    }

                    .withdraw-modal-footer {
                        padding: 12px 18px 16px;
                    }

                    .withdraw-modal-content {
                        border-radius: 15px;
                    }
                }
            `}</style>

      {/* ==================================================
                BACKDROP MOBILE
            ================================================== */}
      <div
        className={`sidebar-backdrop d-lg-none ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ==================================================
                SIDEBAR
            ================================================== */}
      <aside
        className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
      >
        <button
          type="button"
          className="btn btn-sm text-white rounded-circle position-absolute top-0 end-0 m-3 d-flex d-lg-none align-items-center justify-content-center"
          style={{
            width: "32px",
            height: "32px",
            zIndex: 1060,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            border: "none",
          }}
          onClick={() => setIsSidebarOpen(false)}
        >
          <i className="bi bi-x-lg fs-6"></i>
        </button>

        <SidebarEmployee
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showBackdrop={false}
          showMobileClose={false}
        />
      </aside>

      {/* ==================================================
                MAIN CONTENT
            ================================================== */}
      <div className="main-content-wrapper d-flex flex-column">
        <NavbarEmployee
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="p-3 p-md-4">
          <div className="balance-page-content mx-auto">
            {/* TITLE */}
            <h3 className="fw-bold mb-4">Informasi Saldo & Penarikan</h3>

            {/* SUCCESS ALERT */}
            {successAlert && (
              <div
                className="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                {successAlert}

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessAlert("")}
                ></button>
              </div>
            )}

            {/* ==================================================
                            STATISTIC CARDS
                        ================================================== */}
            <div className="row g-3 mb-4">
              {/* SALDO */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
                  <div className="card-body">
                    <div className="text-muted small fw-semibold">
                      Saldo Saya
                    </div>

                    <div className="h4 fw-bold mb-0 text-primary mt-1">
                      {loading ? "..." : formatRupiah(balance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* UANG MASUK */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
                  <div className="card-body">
                    <div className="text-muted small fw-semibold">
                      Total Uang Masuk
                    </div>

                    <div className="h4 fw-bold mb-0 text-success mt-1">
                      {loading ? "..." : formatRupiah(totalIncome)}
                    </div>
                  </div>
                </div>
              </div>

              {/* UANG KELUAR */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger">
                  <div className="card-body">
                    <div className="text-muted small fw-semibold">
                      Total Uang Keluar
                    </div>

                    <div className="h4 fw-bold mb-0 text-danger mt-1">
                      {loading ? "..." : formatRupiah(totalExpense)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                            SALDO AKTIF
                        ================================================== */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4 text-center text-md-start d-md-flex align-items-center justify-content-between">
                <div className="mb-3 mb-md-0">
                  <span className="text-muted d-block mb-1">
                    Total Saldo Aktif
                  </span>

                  <h1 className="fw-bold text-dark mb-0">
                    {formatRupiah(balance)}
                  </h1>
                </div>

                <button
                  className="btn btn-primary btn-lg px-4 rounded-3"
                  onClick={openWithdrawModal}
                >
                  <i className="bi bi-wallet2 me-2"></i>
                  Tarik Saldo
                </button>
              </div>
            </div>

            {/* ==================================================
                            RIWAYAT TRANSAKSI
                        ================================================== */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">Riwayat Transaksi Saldo</h5>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 w-100">
                    <thead className="table-light">
                      <tr>
                        <th>Tanggal</th>
                        <th>Jenis</th>
                        <th>Keterangan</th>
                        <th className="text-end">Jumlah</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            Memuat data...
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-4 text-muted"
                          >
                            Belum ada riwayat transaksi.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((item) => (
                          <tr key={item.id}>
                            <td>{formatDate(item.created_at)}</td>

                            <td>
                              <span
                                className={`badge ${
                                  item.type === "credit"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {item.type ? item.type.toUpperCase() : "-"}
                              </span>
                            </td>

                            <td>{item.description || "-"}</td>

                            <td className="text-end fw-semibold">
                              {item.type === "credit" ? "+ " : "- "}

                              {formatRupiah(item.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ==================================================
                            RIWAYAT PENARIKAN
                        ================================================== */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">Riwayat Penarikan Saldo</h5>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 w-100">
                    <thead className="table-light">
                      <tr>
                        <th>Tanggal</th>
                        <th>Jumlah</th>
                        <th>Catatan</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            Memuat data...
                          </td>
                        </tr>
                      ) : withdrawals.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-4 text-muted"
                          >
                            Belum ada pengajuan penarikan.
                          </td>
                        </tr>
                      ) : (
                        withdrawals.map((item) => (
                          <tr key={item.id}>
                            <td>{formatDate(item.created_at)}</td>

                            <td className="fw-semibold">
                              {formatRupiah(item.amount)}
                            </td>

                            <td>{item.note || item.catatan || "-"}</td>

                            <td>
                              <span
                                className={`badge ${
                                  item.status === "approved"
                                    ? "bg-success"
                                    : item.status === "rejected"
                                      ? "bg-danger"
                                      : "bg-warning text-dark"
                                }`}
                              >
                                {item.status
                                  ? item.status.toUpperCase()
                                  : "PENDING"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ==========================================================
                MODAL TARIK SALDO
            ========================================================== */}
      {showModal && (
        <div
          className="withdraw-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeWithdrawModal();
            }
          }}
        >
          <div className="withdraw-modal-dialog">
            <div className="withdraw-modal-content">
              {/* HEADER */}
              <div className="withdraw-modal-header d-flex align-items-start justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                      style={{
                        width: "36px",
                        height: "36px",
                      }}
                    >
                      <i className="bi bi-wallet2"></i>
                    </div>

                    <h5 className="fw-bold mb-0">Tarik Saldo</h5>
                  </div>

                  <small className="text-muted">
                    Ajukan penarikan saldo Anda
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close mt-1"
                  onClick={closeWithdrawModal}
                  disabled={isSubmitting}
                  aria-label="Tutup"
                ></button>
              </div>

              {/* BODY */}
              <form onSubmit={handleSubmitWithdrawal}>
                <div className="withdraw-modal-body">
                  {/* SALDO TERSEDIA */}
                  <div className="withdraw-balance-box">
                    <div className="withdraw-balance-label">Saldo tersedia</div>

                    <div className="withdraw-balance-value">
                      {formatRupiah(balance)}
                    </div>
                  </div>

                  {/* ERROR */}
                  {modalError && (
                    <div className="withdraw-error">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {modalError}
                    </div>
                  )}

                  {/* NOMINAL */}
                  <div className="mb-3">
                    <label className="withdraw-form-label">
                      Jumlah Penarikan
                    </label>

                    <div className="input-group">
                      <span
                        className="input-group-text bg-light"
                        style={{
                          borderRadius: "10px 0 0 10px",
                          borderColor: "#dbe2ea",
                        }}
                      >
                        Rp
                      </span>

                      <input
                        type="number"
                        min="1"
                        className="form-control withdraw-form-control"
                        style={{
                          borderRadius: "0 10px 10px 0",
                        }}
                        placeholder="Masukkan nominal"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div className="form-text mt-1">
                      Maksimal penarikan sebesar saldo tersedia.
                    </div>
                  </div>

                  {/* CATATAN */}
                  <div>
                    <label className="withdraw-form-label">
                      Catatan / Rekening Tujuan
                    </label>

                    <textarea
                      className="form-control withdraw-form-control withdraw-modal-textarea"
                      rows="3"
                      placeholder="Contoh: Transfer ke BCA 123456789 a.n John Doe"
                      value={withdrawNote}
                      onChange={(e) => setWithdrawNote(e.target.value)}
                      disabled={isSubmitting}
                    />

                    <div className="form-text mt-1">
                      Masukkan informasi rekening atau tujuan penarikan.
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="withdraw-modal-footer">
                  <button
                    type="button"
                    className="btn btn-light withdraw-cancel-btn"
                    onClick={closeWithdrawModal}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary withdraw-submit-btn d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>

                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send"></i>
                        <span>Kirim Pengajuan</span>
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

export default BalanceEmployeePage;
