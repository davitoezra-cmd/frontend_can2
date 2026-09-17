import React from 'react';
import { FaEye } from 'react-icons/fa';

const MealAllowanceApprovalTable = ({ data, onDetail }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success-subtle text-success border border-success-subtle';

      case 'rejected':
        return 'bg-danger-subtle text-danger border border-danger-subtle';

      default:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';

      case 'rejected':
        return 'Rejected';

      default:
        return 'Pending';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';

    try {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatRupiah = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ''
    ) {
      return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">

          {/* =================================================
              HEADER
          ================================================= */}

          <thead className="table-light">
            <tr>
              <th className="py-3 px-4">
                No
              </th>

              <th className="py-3 px-4">
                Nama Employee
              </th>

              <th className="py-3 px-4">
                Tanggal Uang Makan
              </th>

              <th className="py-3 px-4">
                Nominal
              </th>

              <th className="py-3 px-4">
                Status
              </th>

              <th className="py-3 px-4">
                Tanggal Pengajuan
              </th>

              <th className="py-3 px-4 text-center">
                Action
              </th>
            </tr>
          </thead>

          {/* =================================================
              BODY
          ================================================= */}

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-muted"
                >
                  Tidak ada data pengajuan uang makan.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index}>

                  {/* ==========================================
                      NO
                  ========================================== */}

                  <td className="px-4 fw-medium">
                    {index + 1}
                  </td>

                  {/* ==========================================
                      NAMA EMPLOYEE
                  ========================================== */}

                  <td className="px-4 fw-semibold text-dark">
                    {item.employee?.name || '-'}
                  </td>

                  {/* ==========================================
                      TANGGAL UANG MAKAN
                  ========================================== */}

                  <td className="px-4">
                    {formatDate(item.meal_date)}
                  </td>

                  {/* ==========================================
                      NOMINAL
                  ========================================== */}

                  <td className="px-4 fw-semibold">
                    {formatRupiah(item.amount)}
                  </td>

                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <td className="px-4">
                    <span
                      className={`badge rounded-pill px-3 py-2 ${getBadgeClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>

                  {/* ==========================================
                      TANGGAL PENGAJUAN
                  ========================================== */}

                  <td className="px-4">
                    {formatDate(item.created_at)}
                  </td>

                  {/* ==========================================
                      ACTION
                  ========================================== */}

                  <td className="px-4 text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-3 d-inline-flex align-items-center gap-1"
                      onClick={() => onDetail(item.id)}
                    >
                      <FaEye />
                      Detail
                    </button>
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

export default MealAllowanceApprovalTable;