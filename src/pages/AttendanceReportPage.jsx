import React, { useState, useEffect, useMemo } from 'react';
import {apiFetch} from '../api/apiFetch';
import AttendanceReportFilter from '../components/supervisor/AttendanceReportFilter';
import AttendanceReportStats from '../components/supervisor/AttendanceReportStats';
import AttendanceReportTable from '../components/supervisor/AttendanceReportTable';

const AttendanceReportPage = () => {
  const [rawReportData, setRawReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    date: '',
    employee_id: '',
  });

 const fetchAttendanceReport = async () => {
  setLoading(true);

  console.log("Filter:", filter);

  try {
    const response = await apiFetch.get('/supervisor/attendance-report', {
      params: {
        date: filter.date || undefined,
        employee_id: filter.employee_id || undefined,
      },
    });

    console.log("Response:", response.data);
    setRawReportData(response.data.data || []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  fetchAttendanceReport();
}, [filter]);

  // Ekstrak daftar unik employee dari raw data
  const employees = useMemo(() => {
    const map = new Map();
    rawReportData.forEach((item) => {
      if (item.employee && item.employee.id) {
        if (!map.has(item.employee.id)) {
          map.set(item.employee.id, item.employee);
        }
      }
    });
    return Array.from(map.values());
  }, [rawReportData]);

 
  // Kalkulasi statistik dari data terfilter
  const statsData = useMemo(() => {
    const stats = {
      hadir: 0,
      terlambat: 0,
      izin: 0,
      absen: 0,
    };

   rawReportData.forEach((item) => {
      const status = item.status ? item.status.toLowerCase() : '';
      if (status === 'hadir') {
        stats.hadir += 1;
      } else if (status === 'terlambat') {
        stats.terlambat += 1;
      } else if (status === 'izin' || status === 'sakit') {
        stats.izin += 1;
      } else if (status === 'absen' || status === 'tidak hadir') {
        stats.absen += 1;
      }
    });

    return stats;
 }, [rawReportData]);

  const handleResetFilter = () => {
    setFilter({
      date: '',
      employee_id: '',
    });
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold m-0">Rekap Kehadiran</h4>
          <p className="text-muted small m-0">
            Laporan dan riwayat presensi tim karyawan
          </p>
        </div>
      </div>

      <AttendanceReportStats stats={statsData} />

      <AttendanceReportFilter
        filter={filter}
        setFilter={setFilter}
        employees={employees}
        onReset={handleResetFilter}
      />

      {loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small m-0">
              Memuat data rekap kehadiran...
            </p>
          </div>
        </div>
      ) : (
       <AttendanceReportTable data={rawReportData} />
      )}
    </div>
  );
};

export default AttendanceReportPage;