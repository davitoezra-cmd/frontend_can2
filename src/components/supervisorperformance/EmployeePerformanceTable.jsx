import React from 'react';

const EmployeePerformanceTable = ({ performances, loading, onDetail, onEdit, onDelete }) => {
  const getBadgeClass = (grade) => {
    switch (grade) {
      case 'A': return 'bg-success';
      case 'B': return 'bg-info text-dark';
      case 'C': return 'bg-warning text-dark';
      case 'D': return 'bg-secondary';
      case 'E': return 'bg-danger';
      default: return 'bg-dark';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
      <div className="card-body p-0">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small fw-medium">Memuat data penilaian...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom text-uppercase text-secondary fs-7 fw-bold">
                <tr>
                  <th className="py-3 px-3 text-center" style={{ width: '50px' }}>No</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3">Supervisor</th>
                  <th className="py-3 px-3">Tanggal Penilaian</th>
                  <th className="py-3 px-3 text-center" style={{ width: '130px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {performances.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  performances.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center fw-medium text-muted">{index + 1}</td>
                      <td className="fw-semibold text-dark">
                        {item.employee?.name || item.employee?.nama || '-'}
                      </td>
                      <td>
                        <span className="d-inline-block text-truncate" style={{ maxWidth: '200px' }} title={item.employee_target?.title || item.employee_target?.target_name}>
                          {item.employee_target?.title || item.employee_target?.target_name || '-'}
                        </span>
                      </td>
                      <td className="text-center fw-bold text-dark">{item.score}</td>
                      <td className="text-center">
                        <span className={`badge ${getBadgeClass(item.grade)} px-2 py-1 rounded-2`}>
                          {item.grade}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {item.supervisor?.name || item.supervisor?.nama || '-'}
                      </td>
                      <td className="text-muted small">{formatDate(item.created_at)}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => onDetail(item.id)}
                            title="Detail"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => onEdit(item)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => onDelete(item)}
                            title="Hapus"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePerformanceTable;