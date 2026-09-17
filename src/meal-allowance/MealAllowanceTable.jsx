import React from 'react';
import {
  FaEye,
  FaTrash,
} from 'react-icons/fa';

const MealAllowanceTable = ({
  data,
  onDetail,
  onDelete,
}) => {

  // =========================================================
  // STATUS BADGE
  // =========================================================

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


  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';

      case 'rejected':
        return 'Ditolak';

      case 'pending':
        return 'Menunggu';

      default:
        return status || '-';
    }
  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return '-';

    try {
      return new Date(date).toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      );
    } catch {
      return '-';
    }
  };


  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

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


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

      <div className="table-responsive">

        <table className="table table-hover align-middle mb-0">

          <thead className="table-light">

            <tr>

              <th className="py-3 px-4">
                No
              </th>

              <th className="py-3 px-4">
                Tanggal Uang Makan
              </th>

              <th className="py-3 px-4">
                Nominal
              </th>

              <th className="py-3 px-4">
                Alasan
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


          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-5 text-muted"
                >
                  Tidak ada data pengajuan uang makan.
                </td>

              </tr>

            ) : (

              data.map((item, index) => (

                <tr
                  key={item.id || index}
                >

                  {/* NO */}

                  <td className="px-4 fw-medium">
                    {index + 1}
                  </td>


                  {/* TANGGAL UANG MAKAN */}

                  <td className="px-4">

                    {formatDate(
                      item.meal_date
                    )}

                  </td>


                  {/* NOMINAL */}

                  <td className="px-4 fw-semibold">

                    {formatRupiah(
                      item.amount
                    )}

                  </td>


                  {/* ALASAN */}

                  <td
                    className="px-4"
                    style={{
                      maxWidth: '280px',
                    }}
                  >

                    <div
                      className="text-truncate"
                      title={item.reason || '-'}
                    >
                      {item.reason || '-'}
                    </div>

                  </td>


                  {/* STATUS */}

                  <td className="px-4">

                    <span
                      className={`
                        badge
                        rounded-pill
                        px-3
                        py-2
                        ${getBadgeClass(item.status)}
                      `}
                    >
                      {getStatusLabel(
                        item.status
                      )}
                    </span>

                  </td>


                  {/* TANGGAL PENGAJUAN */}

                  <td className="px-4">

                    {formatDate(
                      item.created_at
                    )}

                  </td>


                  {/* ACTION */}

                  <td className="px-4 text-center">

                    <div
                      className="
                        d-flex
                        align-items-center
                        justify-content-center
                        gap-2
                      "
                    >

                      {/* DETAIL */}

                      <button
                        type="button"
                        className="
                          btn
                          btn-sm
                          btn-outline-primary
                          rounded-3
                          d-inline-flex
                          align-items-center
                          gap-1
                        "
                        onClick={() =>
                          onDetail(item.id)
                        }
                        title="Lihat detail"
                      >
                        <FaEye />

                        <span className="d-none d-md-inline">
                          Detail
                        </span>
                      </button>


                      {/* DELETE */}

                      {item.status === 'pending' && (

                        <button
                          type="button"
                          className="
                            btn
                            btn-sm
                            btn-outline-danger
                            rounded-3
                            d-inline-flex
                            align-items-center
                            gap-1
                          "
                          onClick={() =>
                            onDelete(item.id)
                          }
                          title="Hapus pengajuan"
                        >
                          <FaTrash />

                          <span className="d-none d-md-inline">
                            Hapus
                          </span>
                        </button>

                      )}

                    </div>

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

export default MealAllowanceTable;