import React from "react";

const PayrollSettingDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);

  const payrollItems = [
    {
      label: "Gaji Harian",
      value: formatRupiah(item.gaji_harian),
      icon: "bi-cash-stack",
    },
    {
      label: "Bonus Datang Awal",
      value: formatRupiah(item.bonus_datang_awal),
      icon: "bi-sunrise",
    },
    {
      label: "Bonus Kedisiplinan",
      value: formatRupiah(item.bonus_kedisiplinan),
      icon: "bi-award",
    },
    {
      label: "Tarif Lembur / Jam",
      value: formatRupiah(item.tarif_lembur),
      icon: "bi-clock-history",
    },
    {
      label: "Uang Makan",
      value: formatRupiah(item.uang_makan),
      icon: "bi-cup-hot",
    },
    {
      label: "Potongan Terlambat",
      value: formatRupiah(item.potongan_terlambat),
      icon: "bi-clock",
    },
    {
      label: "Potongan Izin",
      value: formatRupiah(item.potongan_izin),
      icon: "bi-calendar-minus",
    },
    {
      label: "Potongan Cuti",
      value: formatRupiah(item.potongan_cuti),
      icon: "bi-calendar-x",
    },
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="payroll-detail-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="payroll-detail-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="payroll-detail-header">
          <div>
            <h4>Detail Payroll</h4>
            <p>Informasi pengaturan payroll karyawan</p>
          </div>

          <button
            type="button"
            className="payroll-detail-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* EMPLOYEE */}
        <div className="payroll-detail-employee">
          <div className="payroll-detail-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div className="payroll-detail-employee-info">
            <h5>
              {item.employee?.name ||
                `Employee #${item.employee_id}`}
            </h5>

            <span>
              {item.employee?.email || "-"}
            </span>
          </div>

          <span
            className={
              item.aktif
                ? "payroll-detail-status active"
                : "payroll-detail-status inactive"
            }
          >
            <span className="payroll-detail-status-dot"></span>

            {item.aktif ? "Aktif" : "Non-Aktif"}
          </span>
        </div>

        {/* INFO */}
        <div className="payroll-detail-info">
          <i className="bi bi-info-circle"></i>

          <div>
            <strong>Catatan payroll</strong>

            <p>
              Jam masuk, jam pulang, dan toleransi keterlambatan
              mengikuti <b>Work Shift</b> pada tanggal attendance.
            </p>
          </div>
        </div>

        {/* PAYROLL */}
        <div className="payroll-detail-section">
          <div className="payroll-detail-section-title">
            <span>Pengaturan Nominal</span>
          </div>

          <div className="payroll-detail-grid">
            {payrollItems.map((itemData) => (
              <div
                className="payroll-detail-item"
                key={itemData.label}
              >
                <div className="payroll-detail-item-icon">
                  <i
                    className={`bi ${itemData.icon}`}
                  ></i>
                </div>

                <div className="payroll-detail-item-content">
                  <span>{itemData.label}</span>

                  <strong>
                    {itemData.value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OTHER SETTINGS */}
        <div className="payroll-detail-section payroll-detail-other">
          <div className="payroll-detail-section-title">
            <span>Pengaturan Lainnya</span>
          </div>

          {/* JATAH HARI LIBUR DIHAPUS */}

          <div className="payroll-detail-other-item">
            <span>Jatah Cuti</span>

            <strong>
              {item.jatah_cuti || 0} hari
            </strong>
          </div>

          <div className="payroll-detail-other-item">
            <span>Tanggal Gajian</span>

            <strong>
              Tanggal {item.tanggal_gajian || "-"}
            </strong>
          </div>
        </div>

        {/* FOOTER */}
        <div className="payroll-detail-footer">
          <button
            type="button"
            className="payroll-detail-button"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .payroll-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1060;
          padding: 16px;
        }

        .payroll-detail-modal {
          background: #ffffff;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border: 1px solid #f1f5f9;
        }

        .payroll-detail-header {
          padding: 24px 28px 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: #ffffff;
        }

        .payroll-detail-header h4 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .payroll-detail-header p {
          margin: 4px 0 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .payroll-detail-close {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .payroll-detail-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .payroll-detail-employee {
          margin: 0 28px;
          padding: 16px 0;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px dashed #e2e8f0;
        }

        .payroll-detail-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .payroll-detail-employee-info {
          flex: 1;
        }

        .payroll-detail-employee-info h5 {
          margin: 0;
          font-size: 0.975rem;
          font-weight: 600;
          color: #0f172a;
        }

        .payroll-detail-employee-info span {
          font-size: 0.825rem;
          color: #64748b;
        }

        .payroll-detail-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .payroll-detail-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .payroll-detail-status.active {
          background-color: #dcfce7;
          color: #15803d;
        }

        .payroll-detail-status.active
        .payroll-detail-status-dot {
          background-color: #22c55e;
        }

        .payroll-detail-status.inactive {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .payroll-detail-status.inactive
        .payroll-detail-status-dot {
          background-color: #ef4444;
        }

        .payroll-detail-info {
          margin: 16px 28px 0;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .payroll-detail-info i {
          color: #0284c7;
          font-size: 1.1rem;
          margin-top: 2px;
        }

        .payroll-detail-info strong {
          display: block;
          font-size: 0.825rem;
          color: #0369a1;
          margin-bottom: 2px;
        }

        .payroll-detail-info p {
          margin: 0;
          font-size: 0.775rem;
          color: #0c4a6e;
          line-height: 1.4;
        }

        .payroll-detail-section {
          padding: 18px 28px 0;
        }

        .payroll-detail-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 10px;
        }

        .payroll-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .payroll-detail-item {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .payroll-detail-item-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .payroll-detail-item-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .payroll-detail-item-content span {
          font-size: 0.725rem;
          color: #64748b;
        }

        .payroll-detail-item-content strong {
          font-size: 0.85rem;
          color: #0f172a;
          font-weight: 600;
          white-space: nowrap;
        }

        .payroll-detail-other-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          margin-bottom: 8px;
          font-size: 0.825rem;
        }

        .payroll-detail-other-item span {
          color: #64748b;
        }

        .payroll-detail-other-item strong {
          color: #0f172a;
          font-weight: 600;
        }

        .payroll-detail-footer {
          padding: 20px 28px 24px;
          background: #ffffff;
          display: flex;
          justify-content: flex-end;
        }

        .payroll-detail-button {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
        }

        .payroll-detail-button:hover {
          background: #1e293b;
        }

        @media (max-width: 576px) {
          .payroll-detail-grid {
            grid-template-columns: 1fr;
          }

          .payroll-detail-employee {
            margin: 0 20px;
          }

          .payroll-detail-info {
            margin-left: 20px;
            margin-right: 20px;
          }

          .payroll-detail-section {
            padding-left: 20px;
            padding-right: 20px;
          }

          .payroll-detail-header {
            padding-left: 20px;
            padding-right: 20px;
          }

          .payroll-detail-footer {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollSettingDetailModal;
