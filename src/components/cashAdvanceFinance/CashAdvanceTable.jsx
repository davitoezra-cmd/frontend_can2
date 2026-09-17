import React from 'react';

const CashAdvanceTable = ({ data, onDetail, onPay, payLoadingId }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
      {/* 1. Tambahkan wrapper table-responsive */}
      <div className="table-responsive">
        {/* 2. Tambahkan class text-nowrap pada tabel agar isi teks tidak terpotong ke bawah */}
        <table className="table table-hover align-middle mb-0 text-nowrap">
          <thead className="table-light">
            <tr>
              <th className="fw-semibold">Karyawan</th>
              <th className="fw-semibold">Jumlah</th>
              <th className="fw-semibold">Alasan</th>
              <th className="fw-semibold">Status Approved</th>
              <th className="fw-semibold">Status Bayar</th>
              <th className="text-center fw-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  Data kasbon tidak ditemukan.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold">{item.employee?.name || '-'}</td>
                  <td className="fw-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.amount || 0)}
                  </td>
                  <td>{item.reason || '-'}</td>
                  <td>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                      {item.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.is_paid ? (
                      <span className="badge bg-success text-white px-2 py-1">PAID</span>
                    ) : (
                      <span className="badge bg-warning text-dark px-2 py-1">UNPAID</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button 
                      className="btn btn-sm btn-outline-info me-2"
                      onClick={() => onDetail(item)}
                    >
                      Detail
                    </button>
                    {!item.is_paid && (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => onPay(item.id)}
                        disabled={payLoadingId === item.id}
                      >
                        {payLoadingId === item.id ? 'Memproses...' : 'Cairkan'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashAdvanceTable;