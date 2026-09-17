import React from 'react';

const PayrollSettingTable = ({ data, onDetail, onEdit, onDelete }) => {
  const formatRupiah = (val) => {
    const numberValue = Number(val) || 0;

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0 text-nowrap">
        <thead className="table-light">
          <tr>
            <th>Employee</th>
            <th className="text-end">Gaji Harian</th>
            <th className="text-end">Tarif Lembur</th>
            <th className="text-end">Potongan Telat</th>
            <th className="text-center">Tgl Gajian</th>
            <th className="text-center">Status</th>
            <th className="text-end">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="fw-bold text-dark">
                  {item.employee?.name ||
                    `Employee #${item.employee_id}`}
                </div>

                <small className="text-muted">
                  {item.employee?.email || '-'}
                </small>
              </td>

              <td className="fw-semibold text-primary text-end">
                {formatRupiah(item.gaji_harian)}
              </td>

              <td className="text-end">
                {formatRupiah(item.tarif_lembur)}
              </td>

              <td className="text-end">
                {formatRupiah(item.potongan_terlambat)}
              </td>

              <td className="text-center">
                <span className="badge bg-light text-dark border">
                  Tgl {item.tanggal_gajian || '-'}
                </span>
              </td>

              <td className="text-center">
                <span
                  className={`badge ${
                    item.aktif
                      ? 'bg-success-subtle text-success'
                      : 'bg-danger-subtle text-danger'
                  } border px-2 py-1 rounded-pill`}
                >
                  {item.aktif ? '● Aktif' : '● Non-Aktif'}
                </span>
              </td>

              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <button
                    onClick={() => onDetail(item)}
                    className="btn btn-light text-info border-secondary-subtle"
                    title="Detail"
                  >
                    <i className="bi bi-eye" />
                  </button>

                  <button
                    onClick={() => onEdit(item)}
                    className="btn btn-light text-warning border-secondary-subtle"
                    title="Edit"
                  >
                    <i className="bi bi-pencil-square" />
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="btn btn-light text-danger border-secondary-subtle"
                    title="Hapus"
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollSettingTable;