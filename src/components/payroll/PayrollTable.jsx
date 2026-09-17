import React from 'react';
import { BiInfoCircle, BiCheck, BiTrash } from 'react-icons/bi';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const PayrollTable = ({
  data,
  onDetail,
  onMarkPaid,
  onDelete,
}) => {
  return (
    <div className="table-responsive">

      <table className="table table-hover align-middle mb-0 text-nowrap">

        <thead className="table-light">

          <tr>

            <th>
              Employee
            </th>

            <th>
              Bulan/Tahun
            </th>

            <th className="text-end">
              Gaji Dasar
            </th>

            <th className="text-end">
              Bonus
            </th>

            <th className="text-end">
              Potongan
            </th>

            <th className="text-end">
              Kasbon
            </th>

            <th className="text-end">
              Take Home Pay
            </th>

            <th className="text-center">
              Status
            </th>

            <th className="text-center">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {data.map((item) => (

            <tr key={item.id}>

              <td className="fw-semibold">
                {item.employee?.name ||
                  `Employee #${item.employee_id}`}
              </td>

              <td>
                {item.bulan}/{item.tahun}
              </td>

              <td className="text-end">
                {formatRupiah(
                  item.total_gaji_dasar
                )}
              </td>

              <td className="text-end text-success">
                +
                {formatRupiah(
                  item.bonus_datang_awal
                )}
              </td>

              <td className="text-end text-danger">
                -
                {formatRupiah(
                  item.total_potongan
                )}
              </td>

              <td className="text-end text-danger">
                -
                {formatRupiah(
                  item.total_kasbon
                )}
              </td>

              <td className="text-end fw-bold text-primary">
                {formatRupiah(
                  item.take_home_pay
                )}
              </td>

              <td className="text-center">

                <span
                  className={`badge rounded-pill px-3 py-2 ${
                    item.status === 'paid'
                      ? 'bg-success'
                      : 'bg-primary'
                  }`}
                >
                  {item.status}
                </span>

              </td>

              <td>

                <div className="d-flex justify-content-center gap-1">

                  <button
                    className="btn btn-sm btn-outline-info rounded-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                    }}
                    onClick={() =>
                      onDetail(item)
                    }
                    title="Detail"
                  >
                    <BiInfoCircle size={16} />
                  </button>

                  {item.status !== 'paid' && (

                    <button
                      className="btn btn-sm btn-outline-success rounded-2 d-flex align-items-center justify-content-center"
                      style={{
                        width: '32px',
                        height: '32px',
                      }}
                      onClick={() =>
                        onMarkPaid(item)
                      }
                      title="Mark Paid"
                    >
                      <BiCheck size={18} />
                    </button>

                  )}

                  <button
                    className="btn btn-sm btn-outline-danger rounded-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                    }}
                    onClick={() =>
                      onDelete(item.id)
                    }
                    title="Delete"
                  >
                    <BiTrash size={16} />
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

export default PayrollTable;