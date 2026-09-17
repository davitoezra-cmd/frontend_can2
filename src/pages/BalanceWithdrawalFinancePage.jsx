

import React, { useState, useEffect } from "react";
import {apiFetch} from "../api/apiFetch";

import SidebarFinance from "../layouts/SidebarFinance";
import NavbarFinance from "../layouts/NavbarFinance";
import { formatRupiah, formatDate } from "../utils/formatters";


const BalanceWithdrawalFinancePage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: "",
    data: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
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

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchWithdrawals = async () => {
  setLoading(true);

  try {
    const res = await apiFetch.get(
      `/finance/balance-withdrawals?_t=${Date.now()}`
    );

    console.log("RESPONSE BALANCE WITHDRAWALS:", res.data);

    if (res.data?.success) {
      setWithdrawals(res.data.data || []);
    } else {
      setWithdrawals([]);
    }

  } catch (err) {
    console.error(
      "Gagal mengambil data penarikan finance:",
      err
    );

    console.error("Response error:", err.response?.data);

    setAlert({
      show: true,
      type: "danger",
      message:
        err.response?.data?.message ||
        "Gagal mengambil data pengajuan penarikan.",
    });

  } finally {
    setLoading(false);
  }
};
  // =========================================================
  // STATISTICS
  // =========================================================

  const pendingCount = withdrawals.filter(
    (w) => w.status === "pending"
  ).length;

  const approvedCount = withdrawals.filter(
    (w) => w.status === "approved"
  ).length;

  const rejectedCount = withdrawals.filter(
    (w) => w.status === "rejected"
  ).length;

  // =========================================================
  // MODAL
  // =========================================================

  const openModal = (type, item) => {
    setModalConfig({
      show: true,
      type,
      data: item,
    });
  };

  const closeModal = () => {
    if (isProcessing) return;

    setModalConfig({
      show: false,
      type: "",
      data: null,
    });
  };

  // =========================================================
  // APPROVE / REJECT
  // =========================================================

  const handleProcessAction = async () => {
  const { type, data } = modalConfig;

  if (!data) return;

  setIsProcessing(true);

  try {
    const url =
      `/finance/balance-withdrawals/` +
      `${data.id}/${type}`;

    const res = await apiFetch.post(url, {});

    console.log(
      "RESPONSE APPROVE/REJECT:",
      res.data
    );

    if (res.data?.success) {
      setAlert({
        show: true,
        type: "success",
        message:
          type === "approve"
            ? "Penarikan berhasil disetujui."
            : "Pengajuan penarikan berhasil ditolak.",
      });

      setModalConfig({
        show: false,
        type: "",
        data: null,
      });

      await fetchWithdrawals();

      setTimeout(() => {
        setAlert({
          show: false,
          type: "",
          message: "",
        });
      }, 4000);
    }

  } catch (err) {
    console.error(
      "Gagal memproses penarikan:",
      err
    );

    console.error(
      "ERROR RESPONSE:",
      err.response?.data
    );

    setAlert({
      show: true,
      type: "danger",
      message:
        err.response?.data?.message ||
        `Gagal ${
          type === "approve"
            ? "menyetujui"
            : "menolak"
        } penarikan.`,
    });

    setModalConfig({
      show: false,
      type: "",
      data: null,
    });

  } finally {
    setIsProcessing(false);
  }

 
};
 useEffect(() => {
    fetchWithdrawals();
}, []);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#f1f5f9",
        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <SidebarFinance
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div
        className="finance-main-content min-vh-100"
        style={{
          minWidth: 0,
          marginLeft: window.innerWidth >= 768 ? "250px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* ===================================================
            NAVBAR
        ==================================================== */}

        <NavbarFinance
          onToggleSidebar={() =>
            setIsSidebarOpen((prev) => !prev)
          }
        />

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="container-fluid p-3 p-md-4">

          {/* HEADER */}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

            <div>
              <h3 className="fw-bold text-dark mb-1">
                Pengajuan Penarikan Saldo
              </h3>

              <p className="text-muted mb-0 small">
                Kelola pengajuan penarikan saldo karyawan.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={fetchWithdrawals}
              disabled={loading}
            >
              <i
                className={`bi ${
                  loading
                    ? "bi-arrow-repeat"
                    : "bi-arrow-clockwise"
                } me-2`}
              ></i>

              {loading ? "Memuat..." : "Refresh"}
            </button>

          </div>

          {/* =================================================
              ALERT
          ================================================== */}

          {alert.show && (
            <div
              className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm`}
              role="alert"
            >
              <i
                className={`bi ${
                  alert.type === "success"
                    ? "bi-check-circle-fill"
                    : "bi-exclamation-triangle-fill"
                } me-2`}
              ></i>

              {alert.message}

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setAlert({
                    show: false,
                    type: "",
                    message: "",
                  })
                }
              ></button>
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="row g-3 mb-4">

            {/* PENDING */}

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <div className="text-muted small fw-semibold">
                        Pengajuan Pending
                      </div>

                      <div className="h3 fw-bold mb-0 text-warning mt-1">
                        {loading ? "..." : pendingCount}
                      </div>
                    </div>

                    <div
                      className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <i className="bi bi-hourglass-split fs-5"></i>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* APPROVED */}

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <div className="text-muted small fw-semibold">
                        Disetujui
                      </div>

                      <div className="h3 fw-bold mb-0 text-success mt-1">
                        {loading ? "..." : approvedCount}
                      </div>
                    </div>

                    <div
                      className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <i className="bi bi-check-circle-fill fs-5"></i>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* REJECTED */}

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger">
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <div className="text-muted small fw-semibold">
                        Ditolak
                      </div>

                      <div className="h3 fw-bold mb-0 text-danger mt-1">
                        {loading ? "..." : rejectedCount}
                      </div>
                    </div>

                    <div
                      className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <i className="bi bi-x-circle-fill fs-5"></i>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================== */}

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-header bg-white py-3 border-0">

              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">

                <div>
                  <h5 className="mb-1 fw-bold">
                    Daftar Pengajuan Penarikan
                  </h5>

                  <small className="text-muted">
                    Daftar seluruh pengajuan saldo karyawan.
                  </small>
                </div>

                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                  {withdrawals.length} Pengajuan
                </span>

              </div>

            </div>

            <div className="card-body p-0">

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>
                      <th className="px-3 py-3">
                        Kode / Karyawan
                      </th>

                      <th>Jumlah</th>

                      <th>Catatan</th>

                      <th>Tanggal</th>

                      <th>Status</th>

                      <th className="text-center">
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
                          >
                            <span className="visually-hidden">
                              Loading...
                            </span>
                          </div>

                          <div className="text-muted small mt-2">
                            Memuat data pengajuan...
                          </div>
                        </td>
                      </tr>

                    ) : withdrawals.length === 0 ? (

                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-5 text-muted"
                        >
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>

                          Belum ada pengajuan penarikan saldo.
                        </td>
                      </tr>

                    ) : (

                      withdrawals.map((item) => {

                        const empCode =
                          item.employee?.code ||
                          item.employee?.employee_code ||
                          `EMP${String(
                            item.employee_id
                          ).padStart(3, "0")}`;

                        const empName =
                          item.employee?.name ||
                          item.employee?.user?.name ||
                          "Karyawan";

                        return (
                          <tr key={item.id}>

                            {/* EMPLOYEE */}

                            <td className="px-3">

                              <div className="d-flex align-items-center gap-2">

                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                  style={{
                                    width: "38px",
                                    height: "38px",
                                  }}
                                >
                                  {empName
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <div className="fw-bold">
                                    {empCode}
                                  </div>

                                  <div className="text-muted small">
                                    {empName}
                                  </div>
                                </div>

                              </div>

                            </td>

                            {/* AMOUNT */}

                            <td className="fw-semibold">
                              {formatRupiah(item.amount)}
                            </td>

                            {/* NOTE */}

                            <td>
                              <span className="text-muted">
                                {item.note ||
                                  item.catatan ||
                                  "-"}
                              </span>
                            </td>

                            {/* DATE */}

                            <td>
                              {formatDate(item.created_at)}
                            </td>

                            {/* STATUS */}

                            <td>

                              <span
                                className={`badge rounded-pill px-3 py-2 ${
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

                            {/* ACTION */}

                            <td className="text-center">

                              {item.status === "pending" ? (

                                <div className="btn-group btn-group-sm">

                                  <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() =>
                                      openModal(
                                        "approve",
                                        item
                                      )
                                    }
                                  >
                                    <i className="bi bi-check-lg me-1"></i>
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() =>
                                      openModal(
                                        "reject",
                                        item
                                      )
                                    }
                                  >
                                    <i className="bi bi-x-lg me-1"></i>
                                    Reject
                                  </button>

                                </div>

                              ) : (

                                <span className="text-muted small">
                                  Selesai
                                </span>

                              )}

                            </td>

                          </tr>
                        );
                      })

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </main>
      </div>

      {/* =====================================================
          CONFIRMATION MODAL
      ====================================================== */}

      {modalConfig.show && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
          }}
          tabIndex="-1"
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 shadow">

              {/* HEADER */}

              <div className="modal-header">

                <h5 className="modal-title fw-bold">

                  {modalConfig.type === "approve"
                    ? "Konfirmasi Penarikan"
                    : "Tolak Pengajuan"}

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={isProcessing}
                ></button>

              </div>

              {/* BODY */}

              <div className="modal-body">

                {modalConfig.type === "approve" ? (

                  <>

                    <p className="mb-3">
                      Apakah Anda yakin ingin
                      menyetujui penarikan saldo
                      berikut?
                    </p>

                    <div className="bg-light rounded-3 p-3">

                      <div className="d-flex justify-content-between mb-2">

                        <span className="text-muted">
                          Karyawan
                        </span>

                        <strong>
                          {modalConfig.data?.employee?.name ||
                            modalConfig.data?.employee?.user?.name ||
                            "Karyawan"}
                        </strong>

                      </div>

                      <div className="d-flex justify-content-between">

                        <span className="text-muted">
                          Jumlah
                        </span>

                        <strong className="text-success">
                          {formatRupiah(
                            modalConfig.data?.amount
                          )}
                        </strong>

                      </div>

                    </div>

                  </>

                ) : (

                  <>

                    <p className="mb-3">
                      Apakah Anda yakin ingin
                      menolak pengajuan penarikan
                      berikut?
                    </p>

                    <div className="bg-light rounded-3 p-3">

                      <div className="d-flex justify-content-between mb-2">

                        <span className="text-muted">
                          Karyawan
                        </span>

                        <strong>
                          {modalConfig.data?.employee?.name ||
                            modalConfig.data?.employee?.user?.name ||
                            "Karyawan"}
                        </strong>

                      </div>

                      <div className="d-flex justify-content-between">

                        <span className="text-muted">
                          Jumlah
                        </span>

                        <strong className="text-danger">
                          {formatRupiah(
                            modalConfig.data?.amount
                          )}
                        </strong>

                      </div>

                    </div>

                  </>

                )}

              </div>

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={isProcessing}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className={`btn ${
                    modalConfig.type === "approve"
                      ? "btn-success"
                      : "btn-danger"
                  }`}
                  onClick={handleProcessAction}
                  disabled={isProcessing}
                >

                  {isProcessing ? (

                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>

                      Memproses...
                    </>

                  ) : modalConfig.type === "approve" ? (

                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Ya, Approve
                    </>

                  ) : (

                    <>
                      <i className="bi bi-x-lg me-1"></i>
                      Ya, Tolak
                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          RESPONSIVE STYLE
      ====================================================== */}

      <style>{`

        @media (max-width: 767.98px) {

          .finance-main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }

          .table {
            min-width: 850px;
          }

        }

        @media (min-width: 768px) {

          .finance-main-content {
            margin-left: 250px !important;
            width: calc(100% - 250px) !important;
          }

        }

      `}</style>

    </div>
  );
};

export default BalanceWithdrawalFinancePage;

