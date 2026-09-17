import React from 'react';
import { FaEye, FaTrashAlt, FaFolderOpen, FaPlus } from 'react-icons/fa';

const CashAdvanceTable = ({ data, onDetail, onDelete, onOpenModal }) => {
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success px-3 py-2 rounded-pill">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger px-3 py-2 rounded-pill">Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Pending</span>;
    }
  };

  if (data.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-3 py-5 text-center">
        <div className="card-body">
          <FaFolderOpen size={60} className="text-muted mb-3 opacity-50" />
          <h5 className="fw-bold text-secondary">Belum ada pengajuan kasbon.</h5>
          <p className="text-muted small mb-4">Ajukan kasbon pertama Anda untuk memproses dana darurat.</p>
          <button className="btn btn-primary px-4 py-2 rounded-3 shadow-sm" onClick={onOpenModal}>
            <FaPlus className="me-2" /> Ajukan Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 px-3 text-center" style={{ width: '60px' }}>No</th>
              <th className="py-3 px-3">Nominal</th>
              <th className="py-3 px-3">Alasan</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Tanggal Pengajuan</th>
              <th className="py-3 px-3 text-center" style={{ width: '130px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center fw-semibold text-muted">{index + 1}</td>
                <td className="fw-bold text-dark">{formatRupiah(item.amount)}</td>
                <td className="text-secondary text-truncate" style={{ maxWidth: '250px' }}>
                  {item.reason}
                </td>
                <td className="text-center">{getStatusBadge(item.status)}</td>
                <td className="text-muted">{formatDate(item.created_at)}</td>
                <td className="text-center">
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      className="btn btn-outline-info rounded-circle me-1"
                      title="Detail"
                      onClick={() => onDetail(item.id)}
                    >
                      <FaEye />
                    </button>
                    {item.status === 'pending' && (
                      <button
                        className="btn btn-outline-danger rounded-circle"
                        title="Hapus"
                        onClick={() => onDelete(item.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashAdvanceTable;