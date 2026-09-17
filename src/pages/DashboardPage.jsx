import React, { useEffect, useMemo, useState } from "react";
import {apiFetch} from "../api/apiFetch";
import LoadingSpinner from "../components/LoadingSpinner";

const DashboardPage = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
  });

  const [attendances, setAttendances] = useState([]);
  const [attendanceChartData, setAttendanceChartData] = useState([]);

  const [attendanceStatistics, setAttendanceStatistics] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    absen: 0,
  });

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // NAMA BULAN
  // =====================================================

  const monthNames = [
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

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        /*
        |--------------------------------------------------------------------------
        | Dashboard utama
        |--------------------------------------------------------------------------
        |
        | Tidak lagi menggunakan:
        | /admin/attendance
        |
        | karena endpoint tersebut tidak tersedia dan menyebabkan 404.
        |
        */

        const [resAdmin, resStats] = await Promise.all([
          apiFetch.get("/admin/dashboard"),
          apiFetch.get("/admin/attendance-qr/statistics"),
        ]);

        // =================================================
        // RESPONSE DASHBOARD
        // =================================================

        const dashboardData = resAdmin.data;

        setAdminData(dashboardData);

        // =================================================
        // ATTENDANCE STATISTICS
        // =================================================

        if (dashboardData?.attendance_statistics) {
          setAttendanceStatistics({
            year:
              dashboardData.attendance_statistics.year ??
              new Date().getFullYear(),

            month:
              dashboardData.attendance_statistics.month ??
              new Date().getMonth() + 1,

            total:
              dashboardData.attendance_statistics.total ?? 0,

            hadir:
              dashboardData.attendance_statistics.hadir ?? 0,

            terlambat:
              dashboardData.attendance_statistics.terlambat ?? 0,

            izin:
              dashboardData.attendance_statistics.izin ?? 0,

            absen:
              dashboardData.attendance_statistics.absen ?? 0,
          });
        }

        // =================================================
        // ATTENDANCE CHART
        // =================================================

        if (Array.isArray(dashboardData?.attendance_chart)) {
          setAttendanceChartData(
            dashboardData.attendance_chart
          );
        } else {
          setAttendanceChartData([]);
        }

        // =================================================
        // RAW ATTENDANCE
        // =================================================

        if (Array.isArray(dashboardData?.attendances)) {
          setAttendances(dashboardData.attendances);
        } else {
          setAttendances([]);
        }

        // =================================================
        // QR STATISTICS
        // =================================================

        const qrStats = resStats.data?.data;

        if (qrStats) {
          setStats({
            total: qrStats.total ?? 0,
            active: qrStats.active ?? 0,
            inactive: qrStats.inactive ?? 0,
            expired: qrStats.expired ?? 0,
          });
        }
      } catch (err) {
        console.error(
          "Gagal mengambil data dashboard:",
          err
        );

        setAttendances([]);
        setAttendanceChartData([]);

        setAttendanceStatistics({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          total: 0,
          hadir: 0,
          terlambat: 0,
          izin: 0,
          absen: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =====================================================
  // GRAFIK ABSENSI HARIAN
  // =====================================================

  const attendanceChart = useMemo(() => {
    /*
    |--------------------------------------------------------------------------
    | Prioritas menggunakan data dari backend.
    |--------------------------------------------------------------------------
    */

    if (
      Array.isArray(attendanceChartData) &&
      attendanceChartData.length > 0
    ) {
      return attendanceChartData.map((item) => ({
        day: Number(item.day),
        date: item.date,

        hadir: Number(item.hadir ?? 0),

        terlambat: Number(
          item.terlambat ?? 0
        ),

        izin: Number(
          item.izin ?? 0
        ),

        absen: Number(
          item.absen ?? 0
        ),

        total: Number(
          item.total ??
            Number(item.hadir ?? 0) +
              Number(item.terlambat ?? 0)
        ),
      }));
    }

    /*
    |--------------------------------------------------------------------------
    | Fallback jika backend belum mengirim attendance_chart.
    |--------------------------------------------------------------------------
    */

    const year = attendanceStatistics.year;
    const month = attendanceStatistics.month;

    const daysInMonth = new Date(
      year,
      month,
      0
    ).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, index) => {
        const day = index + 1;

        let hadir = 0;
        let terlambat = 0;
        let izin = 0;
        let absen = 0;

        attendances.forEach((attendance) => {
          if (!attendance.attendance_date) {
            return;
          }

          const dateString = String(
            attendance.attendance_date
          ).substring(0, 10);

          const [
            attendanceYear,
            attendanceMonth,
            attendanceDay,
          ] = dateString
            .split("-")
            .map(Number);

          if (
            attendanceYear !== year ||
            attendanceMonth !== month ||
            attendanceDay !== day
          ) {
            return;
          }

          if (attendance.status === "hadir") {
            hadir++;
          }

          if (
            attendance.status ===
            "terlambat"
          ) {
            terlambat++;
          }

          if (attendance.status === "izin") {
            izin++;
          }

          if (attendance.status === "absen") {
            absen++;
          }
        });

        return {
          day,
          hadir,
          terlambat,
          izin,
          absen,
          total: hadir + terlambat,
        };
      }
    );
  }, [
    attendanceChartData,
    attendances,
    attendanceStatistics,
  ]);

  // =====================================================
  // TOTAL STATISTIK ABSENSI
  // =====================================================

  const attendanceSummary = useMemo(() => {
    /*
    |--------------------------------------------------------------------------
    | Ambil langsung dari backend jika tersedia
    |--------------------------------------------------------------------------
    */

    if (attendanceStatistics) {
      return {
        hadir: Number(
          attendanceStatistics.hadir ?? 0
        ),

        terlambat: Number(
          attendanceStatistics.terlambat ?? 0
        ),

        total: Number(
          attendanceStatistics.total ?? 0
        ),
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Fallback dari grafik
    |--------------------------------------------------------------------------
    */

    return attendanceChart.reduce(
      (result, item) => {
        result.hadir += item.hadir;
        result.terlambat += item.terlambat;
        result.total += item.total;

        return result;
      },
      {
        hadir: 0,
        terlambat: 0,
        total: 0,
      }
    );
  }, [
    attendanceChart,
    attendanceStatistics,
  ]);

  // =====================================================
  // NILAI MAKSIMAL GRAFIK
  // =====================================================

  const maxAttendance = useMemo(() => {
    const max = Math.max(
      ...attendanceChart.map(
        (item) => item.total
      ),
      1
    );

    return max;
  }, [attendanceChart]);

  // =====================================================
  // FORMAT BULAN
  // =====================================================

  const currentMonthName =
    monthNames[
      Number(attendanceStatistics.month) - 1
    ] ?? "Bulan";

  const currentYear =
    attendanceStatistics.year ??
    new Date().getFullYear();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <LoadingSpinner />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4">
        <h4 className="fw-bold mb-1">
          Dashboard Admin
        </h4>

        <p className="text-muted small mb-0">
          Ringkasan statistik sistem absensi dan QR Code
        </p>
      </div>

      {/* =================================================
          QR CODE STATISTICS
      ================================================= */}

      <div className="row g-3 mb-4">

        {/* TOTAL QR */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                <i className="bi bi-qr-code fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  Total QR Code
                </small>

                <h4 className="fw-bold mb-0">
                  {stats.total}
                </h4>
              </div>

            </div>
          </div>
        </div>

        {/* QR AKTIF */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                <i className="bi bi-check-circle fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  QR Aktif
                </small>

                <h4 className="fw-bold mb-0">
                  {stats.active}
                </h4>
              </div>

            </div>
          </div>
        </div>

        {/* QR NONAKTIF */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-secondary bg-opacity-10 text-secondary rounded-3">
                <i className="bi bi-dash-circle fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  QR Nonaktif
                </small>

                <h4 className="fw-bold mb-0">
                  {stats.inactive}
                </h4>
              </div>

            </div>
          </div>
        </div>

        {/* QR EXPIRED */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3">
                <i className="bi bi-exclamation-triangle fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  QR Expired
                </small>

                <h4 className="fw-bold mb-0">
                  {stats.expired}
                </h4>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =================================================
          ABSENSI SUMMARY
      ================================================= */}

      <div className="row g-3 mb-4">

        {/* TOTAL ABSENSI */}
        <div className="col-12 col-md-4">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                <i className="bi bi-people fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  Total Absensi
                </small>

                <h4 className="fw-bold mb-0">
                  {attendanceSummary.total}
                </h4>

                <small className="text-muted">
                  {currentMonthName} {currentYear}
                </small>
              </div>

            </div>
          </div>
        </div>

        {/* HADIR */}
        <div className="col-12 col-md-4">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                <i className="bi bi-person-check fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  Hadir
                </small>

                <h4 className="fw-bold mb-0 text-success">
                  {attendanceSummary.hadir}
                </h4>

                <small className="text-muted">
                  {currentMonthName} {currentYear}
                </small>
              </div>

            </div>
          </div>
        </div>

        {/* TERLAMBAT */}
        <div className="col-12 col-md-4">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
                <i className="bi bi-clock-history fs-3"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  Terlambat
                </small>

                <h4 className="fw-bold mb-0 text-warning">
                  {attendanceSummary.terlambat}
                </h4>

                <small className="text-muted">
                  {currentMonthName} {currentYear}
                </small>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =================================================
          GRAFIK ABSENSI HARIAN
      ================================================= */}

      <div className="card card-custom p-4">

        {/* HEADER GRAFIK */}

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

          <div>
            <h6 className="fw-bold mb-1">
              Grafik Aktivitas Absensi Harian
            </h6>

            <small className="text-muted">
              Jumlah karyawan hadir dan terlambat setiap tanggal
            </small>
          </div>

          <div className="d-flex gap-3">

            {/* LEGEND HADIR */}

            <div className="d-flex align-items-center gap-2">
              <span
                className="bg-success rounded"
                style={{
                  width: "10px",
                  height: "10px",
                }}
              ></span>

              <small className="text-muted">
                Hadir
              </small>
            </div>

            {/* LEGEND TERLAMBAT */}

            <div className="d-flex align-items-center gap-2">
              <span
                className="bg-warning rounded"
                style={{
                  width: "10px",
                  height: "10px",
                }}
              ></span>

              <small className="text-muted">
                Terlambat
              </small>
            </div>

          </div>

        </div>

        {/* =================================================
            GRAPH
        ================================================= */}

        <div
          className="d-flex align-items-end gap-2 overflow-auto"
          style={{
            height: "280px",
            paddingBottom: "5px",
            width: "100%",
          }}
        >

          {attendanceChart.map((item) => {

            const totalHeight =
              item.total > 0
                ? Math.max(
                    (item.total / maxAttendance) * 190,
                    8
                  )
                : 3;

            const hadirHeight =
              item.total > 0
                ? (item.hadir / item.total) *
                  totalHeight
                : 0;

            const terlambatHeight =
              item.total > 0
                ? (item.terlambat / item.total) *
                  totalHeight
                : 0;

            return (
              <div
                key={item.day}
                className="d-flex flex-column align-items-center flex-shrink-0"
                style={{
                  minWidth: "35px",
                  height: "250px",
                }}
              >

                {/* TOTAL */}

                <div
                  className="small fw-bold text-muted mb-1"
                  style={{
                    height: "20px",
                  }}
                >
                  {item.total}
                </div>

                {/* BATANG */}

                <div
                  className="d-flex align-items-end justify-content-center"
                  style={{
                    height: "195px",
                    width: "100%",
                  }}
                >

                  <div
                    className="rounded-top overflow-hidden d-flex flex-column-reverse"
                    style={{
                      width: "20px",
                      height: `${totalHeight}px`,
                      minHeight:
                        item.total > 0
                          ? "6px"
                          : "3px",

                      transition:
                        "height 0.3s ease",
                    }}
                  >

                    {/* HADIR */}

                    <div
                      className="bg-success"
                      style={{
                        height: `${hadirHeight}px`,
                        minHeight:
                          item.hadir > 0
                            ? "3px"
                            : "0px",
                      }}
                    ></div>

                    {/* TERLAMBAT */}

                    <div
                      className="bg-warning"
                      style={{
                        height: `${terlambatHeight}px`,
                        minHeight:
                          item.terlambat > 0
                            ? "3px"
                            : "0px",
                      }}
                    ></div>

                  </div>

                </div>

                {/* TANGGAL */}

                <div
                  className="text-muted small mt-2"
                  style={{
                    height: "20px",
                  }}
                >
                  {item.day}
                </div>

              </div>
            );
          })}

        </div>

        {/* =================================================
            INFO GRAFIK
        ================================================= */}

        <div className="border-top mt-3 pt-3">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

            <small className="text-muted">
              Menampilkan data tanggal 1–
              {attendanceChart.length}{" "}
              {currentMonthName} {currentYear}
            </small>

            <small className="text-muted">
              Total:{" "}
              <strong>
                {attendanceSummary.total}
              </strong>{" "}
              absensi
            </small>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;