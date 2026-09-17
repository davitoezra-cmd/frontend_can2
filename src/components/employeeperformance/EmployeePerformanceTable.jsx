import React from 'react';

const EmployeePerformanceTable = ({ performances, onDetailClick }) => {
  // Helper Nilai -> Status Badge & Style
  const getBadgeProps = (score) => {
    const val = Number(score);
    if (val >= 90) {
      return { text: 'Excellent', className: 'bg-success text-white' };
    } else if (val >= 80) {
      return { text: 'Good', className: 'bg-primary text-white' };
    } else if (val >= 70) {
      return { text: 'Average', className: 'bg-warning text-dark' };
    } else {
      return { text: 'Need Improvement', className: 'bg-danger text-white' };
    }
  };

  const getScoreBadgeClass = (score) => {
    const val = Number(score);
    if (val >= 90) return 'text-success bg-success-subtle border-success';
    if (val >= 80) return 'text-primary bg-primary-subtle border-primary';
    if (val >= 70) return 'text-warning-emphasis bg-warning-subtle border-warning';
    return 'text-danger bg-danger-subtle border-danger';
  };

  if (!performances || performances.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-3 p-5 text-center my-4">
        <div className="mb-3 text-secondary">
          <i className="bi bi-clipboard-x display-1"></i>
        </div>
        <h5 className="fw-bold text-dark">Belum Ada Penilaian</h5>
        <p className="text-muted mb-0">Supervisor belum memberikan hasil penilaian untuk target kerja Anda.</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="table-responsive">
        {/*
          - minWidth: '750px' mencegah kolom terhimpit/penyok di HP
          - align-middle & text-nowrap membuat isi sel tetap rapi & sejajar
        */}
        <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '750px' }}>
          <thead className="table-light">
            <tr>
              <th className="py-3 px-4" style={{ width: '50px' }}>No</th>
              <th className="py-3 px-3" style={{ minWidth: '200px' }}>Judul Target</th>
              <th className="py-3 px-3">Kategori</th>
              <th className="py-3 px-3 text-center">Nilai</th>
              <th className="py-3 px-3 text-center">Grade</th>
              <th className="py-3 px-3" style={{ minWidth: '160px' }}>Supervisor</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center" style={{ width: '100px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {performances.map((item, index) => {
              const statusBadge = getBadgeProps(item.score);
              return (
                <tr key={item.id || index}>
                  <td className="py-3 px-4 fw-medium text-muted">{index + 1}</td>
                  <td className="py-3 px-3">
                    <span className="fw-semibold text-dark d-block">
                      {item.employee_target?.title || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge bg-light text-secondary border px-2 py-1">
                      {item.employee_target?.category || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`badge border px-3 py-2 fw-bold fs-6 ${getScoreBadgeClass(item.score)}`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="fw-bold fs-6 text-dark">{item.grade}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-circle text-secondary"></i>
                      <span>{item.supervisor?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`badge rounded-pill px-3 py-2 ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-2 d-inline-flex align-items-center gap-1"
                      onClick={() => onDetailClick(item)}
                      title="Lihat Detail"
                    >
                      <i className="bi bi-eye"></i>
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeePerformanceTable;