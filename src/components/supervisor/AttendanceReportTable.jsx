import React from 'react';

const AttendanceReportTable = ({ data }) => {
  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'hadir') {
      return <span className="badge bg-success">Hadir</span>;
    }
    if (s === 'terlambat') {
      return <span className="badge bg-warning text-dark">Terlambat</span>;
    }
   
    return <span className="badge bg-secondary">{status || '-'}</span>;
  };
const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3 border-0">
        <h6 className="m-0 fw-bold">Kehadiran Hari Ini</h6>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-3">No</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Jam Masuk</th>
              <th>Jam Keluar</th>
              <th>Metode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <tr key={row.id || index}>
                  <td className="px-3">{index + 1}</td>
                  <td className="fw-semibold">
                    {row.employee ? row.employee.name : '-'}
                  </td>
                  <td>{formatDate(row.attendance_date)}</td>
                  <td>{row.check_in || '-'}</td>
                  <td>{row.check_out || '-'}</td>
                  <td className="text-capitalize">{row.metode || '-'}</td>
                  <td>{getStatusBadge(row.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  Belum ada data kehadiran hari ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReportTable;