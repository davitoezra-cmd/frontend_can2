import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {apiFetch} from "../api/apiFetch";

import NavbarEmployee from "../layouts/NavbarEmployee";
import SidebarEmployee from "../components/SidebarEmployee";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatRupiah = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const formatPeriod = (period) => {
  if (!period) return "-";

  const [year, month] = period.split("-");

  if (!year || !month) return period;

  return `${MONTH_NAMES[Number(month) - 1] || month} ${year}`;
};

const getCategoryLabel = (category) => {
  if (!category) return "-";

  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getCategoryIcon = (category) => {
  const value = String(category || "").toLowerCase();

  if (
    value.includes("makan") ||
    value.includes("food") ||
    value.includes("meal")
  ) {
    return "🍱";
  }

  if (
    value.includes("transport") ||
    value.includes("bensin") ||
    value.includes("bbm")
  ) {
    return "🚗";
  }

  if (value.includes("operasional") || value.includes("office")) {
    return "🏢";
  }

  if (value.includes("lembur") || value.includes("overtime")) {
    return "⏰";
  }

  if (value.includes("alat") || value.includes("equipment")) {
    return "🛠️";
  }

  return "💰";
};

const PortalOperationalExpensePage = () => {
  const [expenses, setExpenses] = useState([]);

  const [summary, setSummary] = useState({
    count: 0,
    total_amount: 0,
    total_amount_formatted: "Rp 0",
    by_category: [],
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  const [selectedExpense, setSelectedExpense] = useState(null);

  const [search, setSearch] = useState("");

  /**
   * ============================================================
   * FETCH EXPENSES
   * ============================================================
   */
  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await apiFetch.get(
        "/employee/operational-expenses",
        {
          params: {
            period: selectedPeriod,
          },
        },
      );

      if (response.data?.success) {
        setExpenses(response.data.data || []);
      } else {
        setExpenses([]);

        toast.error(
          response.data?.message ||
            "Gagal mengambil pengeluaran operasional.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil pengeluaran operasional:", error);

      setExpenses([]);

      toast.error(
        error.response?.data?.message ||
          "Gagal mengambil pengeluaran operasional.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================
   * FETCH SUMMARY
   * ============================================================
   */
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);

      const response = await apiFetch.get(
        "/employee/operational-expenses/summary",
        {
          params: {
            period: selectedPeriod,
          },
        },
      );

      if (response.data?.success) {
        setSummary({
          count: response.data.count || 0,
          total_amount: response.data.total_amount || 0,
          total_amount_formatted:
            response.data.total_amount_formatted ||
            formatRupiah(response.data.total_amount),
          by_category: response.data.by_category || [],
        });
      }
    } catch (error) {
      console.error("Gagal mengambil summary pengeluaran:", error);

      setSummary({
        count: 0,
        total_amount: 0,
        total_amount_formatted: "Rp 0",
        by_category: [],
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  /**
   * ============================================================
   * INITIAL / PERIOD CHANGE
   * ============================================================
   */
  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [selectedPeriod]);

  /**
   * ============================================================
   * FILTER SEARCH
   * ============================================================
   */
  const filteredExpenses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return expenses;
    }

    return expenses.filter((expense) => {
      const category = String(expense.category || "").toLowerCase();

      const description = String(
        expense.description || "",
      ).toLowerCase();

      return (
        category.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [expenses, search]);

  /**
   * ============================================================
   * REFRESH
   * ============================================================
   */
  const handleRefresh = async () => {
    await Promise.all([fetchExpenses(), fetchSummary()]);

    toast.success("Data berhasil diperbarui.");
  };

  /**
   * ============================================================
   * DETAIL
   * ============================================================
   */
  const handleShowDetail = async (expense) => {
    try {
      const response = await apiFetch.get(
        `/employee/operational-expenses/${expense.id}`,
      );

      if (response.data?.success) {
        setSelectedExpense(response.data.data);
      } else {
        setSelectedExpense(expense);
      }
    } catch (error) {
      console.error("Gagal mengambil detail pengeluaran:", error);

      setSelectedExpense(expense);
    }
  };

  /**
   * ============================================================
   * CLOSE DETAIL
   * ============================================================
   */
  const handleCloseDetail = () => {
    setSelectedExpense(null);
  };

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <>
      <style>
        {`
          /* =====================================================
             PAGE LAYOUT
          ====================================================== */

          .portal-operational-layout {
            min-height: 100vh;
            width: 100%;
            background: #f8fafc;
          }

          /*
           * SidebarEmployee tidak diubah.
           * Karena sidebar menggunakan position fixed,
           * area konten diberi margin kiri.
           */
          .portal-operational-main {
            min-width: 0;
            min-height: 100vh;
            margin-left: 250px;
            width: calc(100% - 250px);
            position: relative;
          }

          /*
           * Mencegah isi halaman melebar keluar viewport.
           */
          .portal-operational-main main {
            min-width: 0;
            width: 100%;
          }

          /*
           * Responsive tablet/mobile.
           */
          @media (max-width: 991.98px) {
            .portal-operational-main {
              margin-left: 0;
              width: 100%;
            }
          }


          /* =====================================================
             DETAIL MODAL
          ====================================================== */

          .portal-expense-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: flex;
            align-items: center;
            justify-content: center;

            background-color: rgba(15, 23, 42, 0.55);

            padding: 24px;

            overflow-y: auto;
          }

          .portal-expense-modal-dialog {
            position: relative;

            width: 100%;
            max-width: 700px;

            margin: auto;

            display: flex;
            align-items: center;
            justify-content: center;
          }

          .portal-expense-modal-content {
            width: 100%;

            max-height: calc(100vh - 48px);

            background: #fff;

            border-radius: 18px;

            overflow: hidden;

            display: flex;
            flex-direction: column;

            box-shadow:
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }

          /*
           * Hanya BODY yang melakukan scroll.
           * Header dan footer tetap terlihat.
           */
          .portal-expense-modal-body {
            overflow-y: auto;
            overflow-x: hidden;

            flex: 1 1 auto;

            min-height: 0;
          }

          .portal-expense-modal-header {
            flex: 0 0 auto;
          }

          .portal-expense-modal-footer {
            flex: 0 0 auto;
          }


          /* =====================================================
             MODAL CONTENT
          ====================================================== */

          .portal-expense-detail-icon {
            width: 68px;
            height: 68px;

            background: #eef2ff;

            border-radius: 50%;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            font-size: 29px;
          }

          .portal-expense-detail-box {
            background: #f8fafc;

            border-radius: 12px;

            padding: 16px;

            height: 100%;
          }

          .portal-expense-proof-box {
            background: #eff6ff;

            border-radius: 12px;

            padding: 16px;
          }


          /* =====================================================
             MOBILE
          ====================================================== */

          @media (max-width: 575.98px) {
            .portal-expense-modal-overlay {
              padding: 12px;
              align-items: center;
            }

            .portal-expense-modal-dialog {
              max-width: 100%;
            }

            .portal-expense-modal-content {
              max-height: calc(100vh - 24px);

              border-radius: 16px;
            }

            .portal-expense-modal-body {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }

            .portal-expense-modal-header {
              padding: 16px !important;
            }

            .portal-expense-modal-footer {
              padding-left: 16px !important;
              padding-right: 16px !important;
              padding-bottom: 16px !important;
            }

            .portal-expense-detail-icon {
              width: 60px;
              height: 60px;
              font-size: 26px;
            }
          }
        `}
      </style>

      <div className="portal-operational-layout d-flex">
        {/* =====================================================
            SIDEBAR
        ====================================================== */}
        <SidebarEmployee />

        {/* =====================================================
            MAIN
        ====================================================== */}
        <div className="portal-operational-main flex-grow-1 d-flex flex-column">
          <NavbarEmployee />

          <main className="flex-grow-1 p-3 p-md-4">
            <div className="container-fluid">

              {/* =================================================
                  HEADER
              ================================================== */}
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 44,
                        height: 44,
                        background:
                          "linear-gradient(135deg, #2563eb, #4f46e5)",
                        color: "#fff",
                        fontSize: 21,
                      }}
                    >
                      💳
                    </span>

                    <div>
                      <h3 className="fw-bold mb-0">
                        Pengeluaran Operasional
                      </h3>

                      <small className="text-muted">
                        Informasi pengeluaran yang berlaku untuk Anda
                      </small>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-light border shadow-sm"
                    onClick={handleRefresh}
                    disabled={loading || summaryLoading}
                  >
                    <span
                      className={
                        loading
                          ? "spinner-border spinner-border-sm me-2"
                          : "me-2"
                      }
                    >
                      {!loading && "↻"}
                    </span>

                    Refresh
                  </button>

                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0">
                      📅
                    </span>

                    <input
                      type="month"
                      className="form-control border-start-0"
                      value={selectedPeriod}
                      onChange={(e) =>
                        setSelectedPeriod(e.target.value)
                      }
                      style={{
                        minWidth: 160,
                      }}
                    />
                  </div>
                </div>
              </div>


              {/* =================================================
                  SUMMARY CARDS
              ================================================== */}
              <div className="row g-3 mb-4">

                {/* TOTAL */}
                <div className="col-12 col-md-6 col-xl-4">
                  <div
                    className="card border-0 shadow-sm h-100 overflow-hidden"
                    style={{
                      borderRadius: 18,
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted small mb-2">
                            Total Pengeluaran
                          </div>

                          {summaryLoading ? (
                            <div
                              className="placeholder-glow"
                              style={{
                                width: 190,
                              }}
                            >
                              <span className="placeholder col-12 rounded"></span>
                            </div>
                          ) : (
                            <h4 className="fw-bold mb-1">
                              {formatRupiah(
                                summary.total_amount,
                              )}
                            </h4>
                          )}

                          <small className="text-muted">
                            {formatPeriod(selectedPeriod)}
                          </small>
                        </div>

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 48,
                            height: 48,
                            background: "#eef2ff",
                            fontSize: 22,
                          }}
                        >
                          💰
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* TRANSACTION */}
                <div className="col-12 col-md-6 col-xl-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      borderRadius: 18,
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted small mb-2">
                            Jumlah Transaksi
                          </div>

                          {summaryLoading ? (
                            <div
                              className="placeholder-glow"
                              style={{
                                width: 100,
                              }}
                            >
                              <span className="placeholder col-12 rounded"></span>
                            </div>
                          ) : (
                            <h4 className="fw-bold mb-1">
                              {summary.count}
                            </h4>
                          )}

                          <small className="text-muted">
                            Transaksi operasional
                          </small>
                        </div>

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 48,
                            height: 48,
                            background: "#ecfdf5",
                            fontSize: 22,
                          }}
                        >
                          🧾
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* STATUS */}
                <div className="col-12 col-xl-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      borderRadius: 18,
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted small mb-2">
                            Status Informasi
                          </div>

                          <h4 className="fw-bold mb-1">
                            Aktif
                          </h4>

                          <small className="text-muted">
                            Pengeluaran yang berlaku untuk Portal
                          </small>
                        </div>

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 48,
                            height: 48,
                            background: "#fff7ed",
                            fontSize: 22,
                          }}
                        >
                          📢
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* =================================================
                  SEARCH + INFO
              ================================================== */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                  <div className="row g-3 align-items-center">

                    <div className="col-12 col-lg-7">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          🔎
                        </span>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Cari kategori atau keterangan..."
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                        />

                        {search && (
                          <button
                            type="button"
                            className="btn btn-light border"
                            onClick={() => setSearch("")}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-lg-5">
                      <div className="text-muted small text-lg-end">
                        Menampilkan{" "}
                        <strong>
                          {filteredExpenses.length}
                        </strong>{" "}
                        dari{" "}
                        <strong>
                          {expenses.length}
                        </strong>{" "}
                        transaksi
                      </div>
                    </div>

                  </div>
                </div>
              </div>


              {/* =================================================
                  EXPENSE LIST
              ================================================== */}
              <div
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: 18,
                }}
              >
                <div className="card-header bg-white border-0 p-4">
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        Riwayat Pengeluaran
                      </h5>

                      <small className="text-muted">
                        {formatPeriod(selectedPeriod)}
                      </small>
                    </div>

                    <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                      {filteredExpenses.length} transaksi
                    </span>
                  </div>
                </div>

                <div className="card-body p-0">
                  {loading ? (
                    <div className="p-4">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="border-bottom py-3"
                        >
                          <div className="placeholder-glow">
                            <span className="placeholder col-8 rounded mb-2"></span>
                            <br />
                            <span className="placeholder col-5 rounded"></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-5 px-4">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{
                          width: 72,
                          height: 72,
                          background: "#f1f5f9",
                          fontSize: 30,
                        }}
                      >
                        🧾
                      </div>

                      <h5 className="fw-bold">
                        Belum ada pengeluaran
                      </h5>

                      <p className="text-muted mb-0">
                        Tidak ada pengeluaran operasional yang
                        berlaku untuk Anda pada periode{" "}
                        {formatPeriod(selectedPeriod)}.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="px-3 px-md-4 py-3 border-bottom"
                        >
                          <div className="row align-items-center g-3">

                            {/* ICON */}
                            <div className="col-auto">
                              <div
                                className="rounded-3 d-flex align-items-center justify-content-center"
                                style={{
                                  width: 52,
                                  height: 52,
                                  background: "#f8fafc",
                                  fontSize: 23,
                                }}
                              >
                                {getCategoryIcon(
                                  expense.category,
                                )}
                              </div>
                            </div>


                            {/* INFO */}
                            <div className="col">
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <h6 className="fw-bold mb-0">
                                  {getCategoryLabel(
                                    expense.category,
                                  )}
                                </h6>

                                <span
                                  className={`badge rounded-pill ${
                                    expense.recipient_type ===
                                    "all"
                                      ? "text-bg-primary"
                                      : "text-bg-warning"
                                  }`}
                                >
                                  {expense.recipient_type ===
                                  "all"
                                    ? "Semua Teknisi"
                                    : "Teknisi Terpilih"}
                                </span>
                              </div>

                              <div className="text-muted small mb-1">
                                {expense.description ||
                                  "Tidak ada keterangan."}
                              </div>

                              <div className="d-flex flex-wrap gap-3 text-muted small">
                                <span>
                                  📅{" "}
                                  {expense.expense_date_formatted ||
                                    formatDate(
                                      expense.expense_date,
                                    )}
                                </span>

                                <span>
                                  📆{" "}
                                  {expense.period_formatted ||
                                    formatPeriod(
                                      expense.period,
                                    )}
                                </span>
                              </div>
                            </div>


                            {/* AMOUNT */}
                            <div className="col-12 col-md-auto text-md-end">
                              <div className="fw-bold text-primary fs-6">
                                {expense.amount_formatted ||
                                  formatRupiah(
                                    expense.amount,
                                  )}
                              </div>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={() =>
                                  handleShowDetail(expense)
                                }
                              >
                                Lihat Detail
                              </button>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              {/* =================================================
                  CATEGORY SUMMARY
              ================================================== */}
              {summary.by_category?.length > 0 && (
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-body p-4">

                    <div className="mb-3">
                      <h5 className="fw-bold mb-1">
                        Pengeluaran Berdasarkan Kategori
                      </h5>

                      <small className="text-muted">
                        Ringkasan periode{" "}
                        {formatPeriod(selectedPeriod)}
                      </small>
                    </div>

                    <div className="row g-3">
                      {summary.by_category.map((item) => (
                        <div
                          key={item.category}
                          className="col-12 col-md-6 col-xl-4"
                        >
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center justify-content-between gap-3">

                              <div className="d-flex align-items-center gap-2">
                                <span
                                  style={{
                                    fontSize: 20,
                                  }}
                                >
                                  {getCategoryIcon(
                                    item.category,
                                  )}
                                </span>

                                <span className="fw-semibold">
                                  {getCategoryLabel(
                                    item.category,
                                  )}
                                </span>
                              </div>

                              <strong>
                                {formatRupiah(item.total)}
                              </strong>

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>


      {/* =========================================================
          DETAIL MODAL
      ========================================================== */}
      {selectedExpense && (
        <div
          className="portal-expense-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="expense-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          <div className="portal-expense-modal-dialog">
            <div className="portal-expense-modal-content">

              {/* =================================================
                  MODAL HEADER
              ================================================== */}
              <div className="modal-header portal-expense-modal-header border-0 p-4 pb-3">

                <div>
                  <h5
                    id="expense-detail-title"
                    className="modal-title fw-bold mb-1"
                  >
                    Detail Pengeluaran
                  </h5>

                  <small className="text-muted">
                    Informasi transaksi operasional
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Tutup"
                  onClick={handleCloseDetail}
                ></button>

              </div>


              {/* =================================================
                  MODAL BODY
              ================================================== */}
              <div className="modal-body portal-expense-modal-body px-4 pb-4">

                {/* =================================================
                    ICON + AMOUNT
                ================================================== */}
                <div className="text-center mb-4">

                  <div className="portal-expense-detail-icon mb-3">
                    {getCategoryIcon(
                      selectedExpense.category,
                    )}
                  </div>

                  <h4 className="fw-bold mb-1">
                    {getCategoryLabel(
                      selectedExpense.category,
                    )}
                  </h4>

                  <div className="text-primary fw-bold fs-4">
                    {selectedExpense.amount_formatted ||
                      formatRupiah(
                        selectedExpense.amount,
                      )}
                  </div>

                </div>


                {/* =================================================
                    DETAIL DATA
                ================================================== */}
                <div className="row g-3">

                  {/* TANGGAL */}
                  <div className="col-12 col-md-6">
                    <div className="portal-expense-detail-box">
                      <small className="text-muted d-block mb-1">
                        Tanggal Transaksi
                      </small>

                      <strong>
                        {selectedExpense.expense_date_formatted ||
                          formatDate(
                            selectedExpense.expense_date,
                          )}
                      </strong>
                    </div>
                  </div>


                  {/* PERIODE */}
                  <div className="col-12 col-md-6">
                    <div className="portal-expense-detail-box">
                      <small className="text-muted d-block mb-1">
                        Periode
                      </small>

                      <strong>
                        {selectedExpense.period_formatted ||
                          formatPeriod(
                            selectedExpense.period,
                          )}
                      </strong>
                    </div>
                  </div>


                  {/* BERLAKU UNTUK */}
                  <div className="col-12">
                    <div className="portal-expense-detail-box">
                      <small className="text-muted d-block mb-1">
                        Berlaku Untuk
                      </small>

                      <strong>
                        {selectedExpense.recipient_label ||
                          (selectedExpense.recipient_type ===
                          "all"
                            ? "Semua Teknisi"
                            : "Teknisi Terpilih")}
                      </strong>
                    </div>
                  </div>


                  {/* KETERANGAN */}
                  <div className="col-12">
                    <div className="portal-expense-detail-box">
                      <small className="text-muted d-block mb-1">
                        Keterangan
                      </small>

                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {selectedExpense.description ||
                          "Tidak ada keterangan."}
                      </div>
                    </div>
                  </div>


                  {/* =================================================
                      BUKTI TRANSAKSI
                  ================================================== */}
                  {selectedExpense.proof_url && (
                    <div className="col-12">
                      <div className="portal-expense-proof-box">

                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">

                          <div>
                            <small className="text-muted d-block mb-1">
                              Bukti Transaksi
                            </small>

                            <strong>
                              Bukti tersedia
                            </strong>
                          </div>

                          <a
                            href={
                              selectedExpense.proof_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            📎 Lihat Bukti
                          </a>

                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>


              {/* =================================================
                  MODAL FOOTER
              ================================================== */}
              <div className="modal-footer portal-expense-modal-footer border-0 px-4 pt-3 pb-4">

                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={handleCloseDetail}
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

export default PortalOperationalExpensePage;