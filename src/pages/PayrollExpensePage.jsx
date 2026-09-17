
import React, { useEffect, useMemo, useState } from "react";
import {apiFetch} from "../api/apiFetch";

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
  const number = Number(value) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatCompactRupiah = (value) => {
  const number = Number(value) || 0;

  if (number >= 1_000_000_000) {
    return `Rp ${(number / 1_000_000_000)
      .toFixed(1)
      .replace(".", ",")} M`;
  }

  if (number >= 1_000_000) {
    return `Rp ${(number / 1_000_000)
      .toFixed(1)
      .replace(".", ",")} Jt`;
  }

  if (number >= 1_000) {
    return `Rp ${(number / 1_000).toFixed(0)} Rb`;
  }

  return formatRupiah(number);
};

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const PayrollExpensePage = () => {
  const [tahun, setTahun] = useState(getCurrentYear());

  const [data, setData] = useState([]);

  const [summary, setSummary] = useState({
    total_pegawai: 0,
    total_gaji_keseluruhan: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlyDetail, setMonthlyDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Ambil laporan payroll
  |--------------------------------------------------------------------------
  */

  const fetchPayrollExpense = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch.get(
        `/admin/payroll-expenses?tahun=${tahun}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Gagal mengambil laporan pengeluaran gaji."
        );
      }

      setData(response.data.data || []);

      setSummary(
        response.data.summary || {
          total_pegawai: 0,
          total_gaji_keseluruhan: 0,
        }
      );
    } catch (err) {
      console.error(
        "Gagal mengambil pengeluaran payroll:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat mengambil data pengeluaran gaji."
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollExpense();
  }, [tahun]);

  /*
  |--------------------------------------------------------------------------
  | Detail bulan
  |--------------------------------------------------------------------------
  */

  const fetchMonthlyDetail = async (bulan) => {
    try {
      setSelectedMonth(bulan);
      setMonthlyDetail(null);
      setDetailLoading(true);

      const response = await apiFetch.get(
        `/admin/payroll-expenses/${tahun}/${bulan}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Gagal mengambil detail pengeluaran."
        );
      }

      setMonthlyDetail(response.data);
    } catch (err) {
      console.error(
        "Gagal mengambil detail payroll:",
        err
      );

      setMonthlyDetail({
        success: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil detail.",
        data: [],
      });
    } finally {
      setDetailLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Tahun pilihan
  |--------------------------------------------------------------------------
  */

  const yearOptions = useMemo(() => {
    const currentYear = getCurrentYear();

    return Array.from(
      { length: 6 },
      (_, index) => currentYear - index
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Pastikan Januari - Desember selalu tampil
  |--------------------------------------------------------------------------
  */

  const monthlyRows = useMemo(() => {
    return MONTH_NAMES.map((monthName, index) => {
      const bulan = index + 1;

      const existing = data.find(
        (item) => Number(item.bulan) === bulan
      );

      return {
        bulan,
        nama_bulan: monthName,
        jumlah_pegawai: Number(
          existing?.jumlah_pegawai || 0
        ),
        total_gaji: Number(
          existing?.total_gaji || 0
        ),
      };
    });
  }, [data]);

  /*
  |--------------------------------------------------------------------------
  | Nilai grafik
  |--------------------------------------------------------------------------
  */

  const maxSalary = useMemo(() => {
    return Math.max(
      ...monthlyRows.map(
        (item) => item.total_gaji
      ),
      0
    );
  }, [monthlyRows]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="payroll-expense-page">
        <style>{styles}</style>

        <div className="loading-container">
          <div className="loading-spinner" />

          <div>
            <h3>Memuat laporan...</h3>

            <p>
              Sedang mengambil data pengeluaran gaji{" "}
              {tahun}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payroll-expense-page">
      <style>{styles}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <div className="page-title-area">
          <div className="breadcrumb">
            Admin <span>/</span> Payroll
          </div>

          <h1>Pengeluaran Total Gaji</h1>

          <p>
            Rekap pembayaran gaji karyawan berdasarkan
            payroll yang sudah dibayarkan.
          </p>
        </div>

        <div className="year-selector">
          <label htmlFor="tahun">Tahun</label>

          <select
            id="tahun"
            value={tahun}
            onChange={(e) =>
              setTahun(Number(e.target.value))
            }
          >
            {yearOptions.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-alert">
          <div className="error-icon">!</div>

          <div className="error-content">
            <strong>Gagal memuat data</strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={fetchPayrollExpense}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="summary-grid">
        <div className="summary-card total-card">
          <div className="summary-icon">
            Rp
          </div>

          <div className="summary-content">
            <span className="summary-label">
              Total Pengeluaran Gaji
            </span>

            <strong className="summary-value">
              {formatRupiah(
                summary.total_gaji_keseluruhan
              )}
            </strong>

            <span className="summary-description">
              Total payroll yang sudah dibayarkan
              selama {tahun}
            </span>
          </div>
        </div>

        <div className="summary-card employee-card">
          <div className="summary-icon">
            👥
          </div>

          <div className="summary-content">
            <span className="summary-label">
              Jumlah Pegawai
            </span>

            <strong className="summary-value">
              {Number(
                summary.total_pegawai || 0
              ).toLocaleString("id-ID")}
            </strong>

            <span className="summary-description">
              Pegawai yang menerima payroll pada tahun{" "}
              {tahun}
            </span>
          </div>
        </div>

        <div className="summary-card average-card">
          <div className="summary-icon">
            📊
          </div>

          <div className="summary-content">
            <span className="summary-label">
              Rata-rata Pengeluaran / Bulan
            </span>

            <strong className="summary-value">
              {formatRupiah(
                Number(
                  summary.total_gaji_keseluruhan || 0
                ) / 12
              )}
            </strong>

            <span className="summary-description">
              Rata-rata berdasarkan 12 bulan
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          GRAPH
      ===================================================== */}

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>Grafik Pengeluaran Gaji</h2>

            <p>
              Total gaji yang telah dibayarkan setiap
              bulan pada tahun {tahun}.
            </p>
          </div>

          <div className="chart-total">
            <span>Total {tahun}</span>

            <strong>
              {formatCompactRupiah(
                summary.total_gaji_keseluruhan
              )}
            </strong>
          </div>
        </div>

        <div className="chart-wrapper">
          {maxSalary <= 0 ? (
            <div className="empty-chart">
              <div className="empty-chart-icon">
                📊
              </div>

              <strong>
                Belum ada pengeluaran gaji
              </strong>

              <span>
                Belum terdapat payroll berstatus{" "}
                <b>paid</b> pada tahun {tahun}.
              </span>
            </div>
          ) : (
            <div className="bar-chart">
              <div className="chart-y-axis">
                <span>
                  {formatCompactRupiah(maxSalary)}
                </span>

                <span>
                  {formatCompactRupiah(
                    maxSalary * 0.75
                  )}
                </span>

                <span>
                  {formatCompactRupiah(
                    maxSalary * 0.5
                  )}
                </span>

                <span>
                  {formatCompactRupiah(
                    maxSalary * 0.25
                  )}
                </span>

                <span>Rp 0</span>
              </div>

              <div className="chart-area">
                <div className="chart-grid-lines">
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </div>

                <div className="bars">
                  {monthlyRows.map((item) => {
                    const height =
                      item.total_gaji > 0
                        ? Math.max(
                            (item.total_gaji /
                              maxSalary) *
                              100,
                            3
                          )
                        : 0;

                    return (
                      <button
                        type="button"
                        className={`bar-column ${
                          selectedMonth ===
                          item.bulan
                            ? "selected"
                            : ""
                        }`}
                        key={item.bulan}
                        onClick={() =>
                          item.total_gaji > 0 &&
                          fetchMonthlyDetail(
                            item.bulan
                          )
                        }
                        disabled={
                          item.total_gaji <= 0
                        }
                        title={`${item.nama_bulan}: ${formatRupiah(
                          item.total_gaji
                        )}`}
                      >
                        <div className="bar-value">
                          {item.total_gaji > 0
                            ? formatCompactRupiah(
                                item.total_gaji
                              )
                            : ""}
                        </div>

                        <div className="bar-track">
                          <div
                            className="bar"
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>

                        <span className="bar-label">
                          {item.nama_bulan.substring(
                            0,
                            3
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="section-card">
        <div className="section-header table-heading">
          <div>
            <h2>Rekap Pengeluaran Gaji</h2>

            <p>
              Pengeluaran gaji per bulan selama tahun{" "}
              {tahun}.
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Bulan</th>
                <th>Jumlah Pegawai</th>
                <th>Total Gaji</th>
                <th className="action-column">
                  Detail
                </th>
              </tr>
            </thead>

            <tbody>
              {monthlyRows.map((item, index) => (
                <tr
                  key={item.bulan}
                  className={
                    selectedMonth === item.bulan
                      ? "active-row"
                      : ""
                  }
                >
                  <td>
                    <span className="number-badge">
                      {index + 1}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {item.nama_bulan}
                    </strong>

                    {item.total_gaji > 0 && (
                      <span className="paid-badge">
                        Paid
                      </span>
                    )}
                  </td>

                  <td>
                    <span className="employee-count">
                      {item.jumlah_pegawai}
                    </span>{" "}
                    pegawai
                  </td>

                  <td>
                    <strong className="salary-value">
                      {formatRupiah(
                        item.total_gaji
                      )}
                    </strong>
                  </td>

                  <td className="action-column">
                    <button
                      type="button"
                      className="detail-button"
                      disabled={
                        item.total_gaji <= 0
                      }
                      onClick={() =>
                        fetchMonthlyDetail(
                          item.bulan
                        )
                      }
                    >
                      Lihat Detail
                      <span>→</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="2">
                  <strong>
                    TOTAL {tahun}
                  </strong>
                </td>

                <td>
                  <strong>
                    {summary.total_pegawai}
                  </strong>{" "}
                  pegawai
                </td>

                <td>
                  <strong className="grand-total">
                    {formatRupiah(
                      summary.total_gaji_keseluruhan
                    )}
                  </strong>
                </td>

                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedMonth && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setSelectedMonth(null);
              setMonthlyDetail(null);
            }
          }}
        >
          <div className="detail-modal">
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-kicker">
                  DETAIL PENGELUARAN
                </span>

                <h2>
                  {
                    MONTH_NAMES[
                      selectedMonth - 1
                    ]
                  }{" "}
                  {tahun}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setSelectedMonth(null);
                  setMonthlyDetail(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {detailLoading ? (
                <div className="modal-loading">
                  <div className="loading-spinner" />

                  <span>
                    Memuat detail...
                  </span>
                </div>
              ) : monthlyDetail?.success ===
                false ? (
                <div className="modal-error">
                  {monthlyDetail.message}
                </div>
              ) : (
                <>
                  <div className="detail-summary">
                    <div>
                      <span>
                        Jumlah Pegawai
                      </span>

                      <strong>
                        {monthlyDetail?.jumlah_pegawai ||
                          0}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total Gaji
                      </span>

                      <strong>
                        {formatRupiah(
                          monthlyDetail?.total_gaji ||
                            0
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-table-wrapper">
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama Pegawai</th>
                          <th>
                            Take Home Pay
                          </th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(
                          monthlyDetail?.data || []
                        ).map(
                          (payroll, index) => (
                            <tr
                              key={
                                payroll.id
                              }
                            >
                              <td>
                                {index + 1}
                              </td>

                              <td>
                                <div className="employee-name">
                                  <div className="avatar">
                                    {(
                                      payroll
                                        ?.employee
                                        ?.name ||
                                      "?"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <strong>
                                    {payroll
                                      ?.employee
                                      ?.name ||
                                      "Tidak diketahui"}
                                  </strong>
                                </div>
                              </td>

                              <td>
                                <strong>
                                  {formatRupiah(
                                    payroll.take_home_pay
                                  )}
                                </strong>
                              </td>

                              <td>
                                <span className="status-paid">
                                  PAID
                                </span>
                              </td>
                            </tr>
                          )
                        )}

                        {(
                          monthlyDetail?.data ||
                          []
                        ).length === 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              className="empty-detail"
                            >
                              Belum ada payroll
                              dibayarkan pada
                              bulan ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = `
/* =========================================================
   BASE
========================================================= */

.payroll-expense-page {
  min-height: 100vh;
  padding: 28px;
  background: #f6f8fb;
  color: #172033;
  font-family: Inter, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

.payroll-expense-page *,
.payroll-expense-page *::before,
.payroll-expense-page *::after {
  box-sizing: border-box;
}

/* =========================================================
   HEADER
========================================================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-title-area {
  min-width: 0;
}

.breadcrumb {
  color: #8a94a6;
  font-size: 13px;
  margin-bottom: 8px;
}

.breadcrumb span {
  margin: 0 7px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.page-header p {
  margin: 8px 0 0;
  color: #7b8495;
  font-size: 14px;
}

.year-selector {
  width: 150px;
  flex-shrink: 0;
}

.year-selector label {
  display: block;
  font-size: 12px;
  color: #7b8495;
  font-weight: 650;
  margin-bottom: 6px;
}

.year-selector select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #dfe4ec;
  border-radius: 10px;
  background: #fff;
  color: #172033;
  font-size: 14px;
  font-weight: 650;
  outline: none;
  cursor: pointer;
}

.year-selector select:focus {
  border-color: #6c63ff;
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
}

/* =========================================================
   SUMMARY
========================================================= */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}

.summary-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  min-height: 140px;
  background: #fff;
  border: 1px solid #e8ebf0;
  border-radius: 16px;
  box-shadow: 0 5px 18px rgba(31, 41, 55, 0.04);
  overflow: hidden;
}

.summary-card::after {
  content: "";
  position: absolute;
  width: 110px;
  height: 110px;
  right: -45px;
  top: -45px;
  border-radius: 50%;
  background: rgba(108, 99, 255, 0.05);
}

.summary-icon {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #f0efff;
  color: #6158e8;
  font-weight: 800;
  font-size: 16px;
  position: relative;
  z-index: 1;
}

.summary-content {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.summary-label {
  display: block;
  color: #7d8797;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.summary-value {
  display: block;
  font-size: 23px;
  line-height: 1.2;
  color: #172033;
  letter-spacing: -0.3px;
  word-break: break-word;
}

.summary-description {
  display: block;
  margin-top: 7px;
  color: #a0a8b5;
  font-size: 11px;
  line-height: 1.4;
}

/* =========================================================
   SECTION
========================================================= */

.section-card {
  background: #fff;
  border: 1px solid #e8ebf0;
  border-radius: 16px;
  box-shadow: 0 5px 18px rgba(31, 41, 55, 0.04);
  margin-bottom: 20px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 23px 24px 17px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 750;
  color: #172033;
}

.section-header p {
  margin: 5px 0 0;
  color: #8b94a3;
  font-size: 13px;
}

.chart-total {
  text-align: right;
  flex-shrink: 0;
}

.chart-total span {
  display: block;
  font-size: 11px;
  color: #98a1af;
  margin-bottom: 3px;
}

.chart-total strong {
  font-size: 16px;
  color: #6158e8;
}

/* =========================================================
   CHART
========================================================= */

.chart-wrapper {
  padding: 8px 24px 26px;
  width: 100%;
  overflow: hidden;
}

.bar-chart {
  display: flex;
  min-height: 350px;
  padding-top: 12px;
  width: 100%;
}

.chart-y-axis {
  width: 78px;
  flex: 0 0 78px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 10px 30px 0;
  text-align: right;
  color: #9ba3b1;
  font-size: 10px;
}

.chart-area {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 350px;
}

.chart-grid-lines {
  position: absolute;
  inset: 0 0 30px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.chart-grid-lines div {
  width: 100%;
  border-top: 1px dashed #e9edf3;
}

/*
   PENTING:
   Tidak menggunakan minmax(30px, 1fr)
   supaya 12 bulan tidak melebihi lebar layar.
*/

.bars {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.bar-column {
  position: relative;
  height: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
}

.bar-column:disabled {
  cursor: default;
}

.bar-value {
  width: 100%;
  height: 24px;
  color: #667085;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bar-track {
  width: min(42px, 70%);
  height: calc(100% - 54px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.bar {
  width: 100%;
  min-height: 0;
  border-radius: 7px 7px 3px 3px;
  background: linear-gradient(
    180deg,
    #7168f4 0%,
    #5b52df 100%
  );
  box-shadow: 0 7px 15px rgba(97, 88, 232, 0.17);
  transition:
    height 0.35s ease,
    transform 0.2s ease,
    filter 0.2s ease;
}

.bar-column:hover .bar {
  transform: translateY(-3px);
  filter: brightness(1.04);
}

.bar-column.selected .bar {
  background: linear-gradient(
    180deg,
    #4138ca 0%,
    #342da5 100%
  );
}

.bar-label {
  height: 30px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: #737d8e;
  font-size: 11px;
  font-weight: 650;
  overflow: hidden;
}

.empty-chart {
  min-height: 330px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #7e8795;
  text-align: center;
}

.empty-chart-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #f2f3f7;
  margin-bottom: 14px;
  font-size: 27px;
}

.empty-chart strong {
  color: #424b5b;
  font-size: 15px;
}

.empty-chart span {
  margin-top: 5px;
  font-size: 12px;
}

/* =========================================================
   TABLE
========================================================= */

.table-heading {
  padding-bottom: 20px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

thead th {
  padding: 13px 24px;
  background: #fafbfc;
  border-top: 1px solid #edf0f4;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  color: #8a94a3;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

tbody td {
  padding: 15px 24px;
  border-bottom: 1px solid #eef1f5;
  color: #626d7d;
  font-size: 13px;
}

tbody tr {
  transition: background 0.15s ease;
}

tbody tr:hover,
tbody tr.active-row {
  background: #fafaff;
}

tfoot td {
  padding: 17px 24px;
  background: #f8f8ff;
  border-top: 2px solid #e4e3ff;
  color: #30394b;
  font-size: 13px;
}

.number-badge {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f2f3f7;
  color: #687284;
  font-size: 11px;
  font-weight: 700;
}

.paid-badge {
  display: inline-flex;
  margin-left: 8px;
  padding: 3px 7px;
  border-radius: 5px;
  background: #e9f8ef;
  color: #2c9a57;
  font-size: 9px;
  font-weight: 750;
  vertical-align: middle;
}

.employee-count {
  color: #30394b;
  font-weight: 700;
}

.salary-value {
  color: #30394b;
}

.grand-total {
  color: #6158e8;
  font-size: 15px;
}

.action-column {
  text-align: right !important;
}

.detail-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: #f0efff;
  color: #5b52df;
  padding: 8px 11px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.detail-button:hover:not(:disabled) {
  background: #e4e2ff;
}

.detail-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* =========================================================
   ERROR
========================================================= */

.error-alert {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid #ffd6d6;
  border-radius: 12px;
  background: #fff7f7;
}

.error-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffe5e5;
  color: #d83b3b;
  font-weight: 800;
}

.error-content {
  min-width: 0;
}

.error-alert strong {
  color: #a92727;
  font-size: 13px;
}

.error-alert p {
  margin: 2px 0 0;
  color: #a86a6a;
  font-size: 11px;
  word-break: break-word;
}

.error-alert button {
  margin-left: auto;
  border: 0;
  border-radius: 8px;
  background: #d83b3b;
  color: #fff;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

/* =========================================================
   LOADING
========================================================= */

.loading-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #697386;
}

.loading-container h3 {
  margin: 0;
  color: #30394b;
  font-size: 15px;
}

.loading-container p {
  margin: 4px 0 0;
  font-size: 12px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e6e7ef;
  border-top-color: #6158e8;
  border-radius: 50%;
  animation: payrollSpin 0.75s linear infinite;
}

@keyframes payrollSpin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   MODAL
========================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 20px;
  background: rgba(18, 24, 38, 0.48);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.detail-modal {
  width: min(780px, 100%);
  max-width: 780px;
  max-height: 88vh;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 70px rgba(18, 24, 38, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 19px 22px;
  border-bottom: 1px solid #edf0f4;
}

.modal-title {
  min-width: 0;
}

.modal-kicker {
  display: block;
  color: #756ef0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.modal-header h2 {
  margin: 0;
  color: #172033;
  font-size: 20px;
}

.close-button {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border: 0;
  border-radius: 9px;
  background: #f3f4f7;
  color: #6c7482;
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
}

.close-button:hover {
  background: #e9ebf0;
}

/*
   Semua isi modal berada di body.
   Body bisa scroll secara vertikal sehingga
   modal tidak keluar layar.
*/

.modal-body {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* =========================================================
   DETAIL SUMMARY
========================================================= */

.detail-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 17px 22px;
}

.detail-summary > div {
  padding: 14px;
  border: 1px solid #e8ebf0;
  border-radius: 11px;
  background: #fafbfc;
  min-width: 0;
}

.detail-summary span {
  display: block;
  color: #8b94a3;
  font-size: 11px;
  margin-bottom: 4px;
}

.detail-summary strong {
  color: #30394b;
  font-size: 18px;
  word-break: break-word;
}

/* =========================================================
   DETAIL TABLE
========================================================= */

.detail-table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0 22px 22px;
  -webkit-overflow-scrolling: touch;
}

.detail-table {
  width: 100%;
  min-width: 600px;
}

.detail-table thead th,
.detail-table tbody td {
  padding-left: 12px;
  padding-right: 12px;
}

.employee-name {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 180px;
}

.avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eeedff;
  color: #5b52df;
  font-size: 11px;
  font-weight: 800;
}

.employee-name strong {
  white-space: nowrap;
}

.status-paid {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 6px;
  background: #e9f8ef;
  color: #299153;
  font-size: 9px;
  font-weight: 800;
}

.empty-detail {
  text-align: center;
  padding: 35px !important;
  color: #9aa2ae !important;
}

/* =========================================================
   MODAL LOADING / ERROR
========================================================= */

.modal-loading {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #747e8d;
  font-size: 13px;
}

.modal-error {
  margin: 22px;
  padding: 14px;
  border-radius: 9px;
  background: #fff5f5;
  color: #b53838;
  font-size: 13px;
  word-break: break-word;
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .summary-card:last-child {
    grid-column: 1 / -1;
  }

  .bar-track {
    width: min(34px, 70%);
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 760px) {
  .payroll-expense-page {
    padding: 16px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }

  .page-header h1 {
    font-size: 23px;
  }

  .page-header p {
    line-height: 1.5;
  }

  .year-selector {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-card:last-child {
    grid-column: auto;
  }

  .summary-card {
    min-height: 115px;
    padding: 17px;
  }

  .summary-value {
    font-size: 20px;
  }

  .section-card {
    border-radius: 13px;
    margin-bottom: 14px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 17px;
  }

  .section-header h2 {
    font-size: 16px;
  }

  .section-header p {
    line-height: 1.5;
  }

  .chart-total {
    text-align: left;
  }

  .chart-wrapper {
    padding: 4px 10px 18px;
  }

  /*
     Grafik sekarang memakai seluruh lebar layar.
     12 bulan tetap masuk karena grid tidak memakai
     minimum 30px lagi.
  */

  .bar-chart {
    min-height: 290px;
    height: 290px;
  }

  .chart-y-axis {
    width: 52px;
    flex: 0 0 52px;
    padding-right: 7px;
    font-size: 8px;
  }

  .chart-area {
    height: 290px;
  }

  .bars {
    gap: 2px;
  }

  .bar-track {
    width: min(24px, 65%);
  }

  .bar-label {
    font-size: 8px;
    height: 28px;
  }

  .bar-value {
    font-size: 6px;
  }

  .table-heading {
    padding-bottom: 17px;
  }

  .table-container {
    overflow-x: auto;
  }

  thead th,
  tbody td,
  tfoot td {
    padding-left: 15px;
    padding-right: 15px;
  }

  /* =====================================================
     MOBILE MODAL
  ===================================================== */

  .modal-overlay {
    padding: 10px;
    align-items: center;
    justify-content: center;
  }

  .detail-modal {
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    border-radius: 14px;
  }

  .modal-header {
    padding: 15px 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .detail-summary {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 13px 16px;
  }

  .detail-summary > div {
    padding: 12px;
  }

  .detail-summary strong {
    font-size: 16px;
  }

  .detail-table-wrapper {
    padding: 0 16px 16px;
  }

  .detail-table {
    min-width: 570px;
  }

  .modal-error {
    margin: 16px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 430px) {
  .payroll-expense-page {
    padding: 12px;
  }

  .summary-card {
    gap: 11px;
    padding: 15px;
  }

  .summary-icon {
    width: 43px;
    height: 43px;
    flex-basis: 43px;
    font-size: 13px;
  }

  .summary-label {
    font-size: 12px;
  }

  .summary-value {
    font-size: 17px;
  }

  .summary-description {
    font-size: 10px;
  }

  /*
     Grafik 12 bulan dibuat lebih rapat
     supaya Januari sampai Desember terlihat
     sekaligus di layar HP kecil.
  */

  .chart-wrapper {
    padding-left: 5px;
    padding-right: 5px;
  }

  .bar-chart {
    min-height: 270px;
    height: 270px;
  }

  .chart-area {
    height: 270px;
  }

  .chart-y-axis {
    width: 45px;
    flex-basis: 45px;
    font-size: 7px;
    padding-right: 5px;
  }

  .bars {
    gap: 1px;
  }

  .bar-track {
    width: 16px;
  }

  .bar-label {
    font-size: 7px;
  }

  /*
     Nilai nominal di atas batang disembunyikan
     agar 12 bulan tidak bertabrakan.
  */

  .bar-value {
    display: none;
  }

  .bar-track {
    height: calc(100% - 30px);
  }

  /* =====================================================
     MODAL HP KECIL
  ===================================================== */

  .modal-overlay {
    padding: 7px;
  }

  .detail-modal {
    width: 100%;
    max-height: 94vh;
    border-radius: 12px;
  }

  .modal-header {
    padding: 13px 14px;
  }

  .modal-kicker {
    font-size: 8px;
  }

  .modal-header h2 {
    font-size: 17px;
  }

  .close-button {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    font-size: 21px;
  }

  .detail-summary {
    grid-template-columns: 1fr;
    padding: 11px 14px;
  }

  .detail-summary > div {
    padding: 11px;
  }

  .detail-table-wrapper {
    padding: 0 14px 14px;
  }

  .detail-table {
    min-width: 550px;
  }
}

/* =========================================================
   VERY SMALL PHONE
========================================================= */

@media (max-width: 360px) {
  .payroll-expense-page {
    padding: 10px;
  }

  .bar-chart {
    min-height: 250px;
    height: 250px;
  }

  .chart-area {
    height: 250px;
  }

  .chart-y-axis {
    width: 40px;
    flex-basis: 40px;
    font-size: 6px;
  }

  .bar-track {
    width: 13px;
  }

  .bar-label {
    font-size: 6px;
  }
}
`;

export default PayrollExpensePage;

