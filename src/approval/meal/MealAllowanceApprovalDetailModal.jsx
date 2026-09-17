import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiFetch';
import LoadingSpinner from '../../components/LoadingSpinner';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';

const MealAllowanceApprovalDetailModal = ({
  id,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // =========================================================
  // FETCH DETAIL
  // =========================================================

  useEffect(() => {
    if (isOpen && id) {
      fetchDetail();
    } else {
      setDetail(null);
    }
  }, [isOpen, id]);

  const fetchDetail = async () => {
    setLoading(true);

    try {
      const response = await apiFetch.get(
        `/admin/meal-allowance/${id}`
      );

      if (response.data?.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error(
        'Gagal mengambil detail pengajuan uang makan:',
        error
      );

      toast.error(
        'Gagal mengambil detail data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatDate = (date) => {
    if (!date) return '-';

    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date));
    } catch {
      return '-';
    }
  };

  // =========================================================
  // FORMAT TANGGAL + JAM
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) return '-';

    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(date));
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
  // APPROVE
  // =========================================================

  const handleApprove = () => {
    Swal.fire({
      title: 'Konfirmasi Approval',
      input: 'textarea',
      inputLabel: 'Catatan Approval',
      inputPlaceholder:
        'Tulis catatan approval untuk employee...',
      inputValue: 'Pengajuan uang makan disetujui.',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Approve',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4',
      },
      inputAttributes: {
        'aria-label': 'Catatan Approval',
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setProcessing(true);

      try {
        const response = await apiFetch.post(
          `/admin/meal-allowance/${id}/approve`,
          {
            approval_note:
              result.value ||
              'Pengajuan uang makan disetujui.',
          }
        );

        if (response.data?.success) {
          toast.success(
            response.data.message ||
              'Pengajuan uang makan berhasil disetujui.'
          );

          onSuccess?.();
          onClose?.();
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            'Gagal memproses approval.'
        );
      } finally {
        setProcessing(false);
      }
    });
  };

  // =========================================================
  // REJECT
  // =========================================================

  const handleReject = () => {
    Swal.fire({
      title: 'Penolakan Pengajuan Uang Makan',
      input: 'textarea',
      inputLabel: 'Masukkan alasan penolakan',
      inputPlaceholder:
        'Tulis alasan penolakan di sini...',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Tolak Pengajuan',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4',
      },
      inputAttributes: {
        'aria-label': 'Alasan Penolakan',
      },
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan penolakan wajib diisi!';
        }

        return null;
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setProcessing(true);

      try {
        const response = await apiFetch.post(
          `/admin/meal-allowance/${id}/reject`,
          {
            approval_note: result.value.trim(),
          }
        );

        if (response.data?.success) {
          toast.success(
            response.data.message ||
              'Pengajuan uang makan berhasil ditolak.'
          );

          onSuccess?.();
          onClose?.();
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            'Gagal memproses penolakan.'
        );
      } finally {
        setProcessing(false);
      }
    });
  };

  // =========================================================
  // MODAL TIDAK DIBUKA
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 1040,
        }}
      />

      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{
          zIndex: 1050,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            maxWidth: '560px',
            width: 'calc(100% - 30px)',
          }}
        >
          <div
            className="modal-content border-0 shadow rounded-4 overflow-hidden"
            style={{
              maxHeight: '90vh',
            }}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="modal-header px-4 py-3 border-bottom">
              <div>
                <h5 className="modal-title fw-bold mb-1">
                  Detail Pengajuan Uang Makan
                </h5>

                <small className="text-muted">
                  Informasi pengajuan uang makan employee
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={processing}
              />
            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div
              className="modal-body px-4 py-3"
              style={{
                overflowY: 'auto',
              }}
            >
              {loading ? (
                <div className="py-4 text-center">
                  <LoadingSpinner />
                </div>
              ) : detail ? (
                <div className="row g-3">

                  {/* ==========================================
                      NAMA EMPLOYEE
                  ========================================== */}

                  <div className="col-12">
                    <div className="detail-item">
                      <label className="detail-label">
                        Nama Employee
                      </label>

                      <div className="detail-value">
                        {detail.employee?.name || '-'}
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <div className="col-6">
                    <div className="detail-item">
                      <label className="detail-label">
                        Status
                      </label>

                      <div>
                        <span
                          className={`badge rounded-pill ${
                            detail.status === 'approved'
                              ? 'bg-success'
                              : detail.status === 'rejected'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {detail.status === 'approved'
                            ? 'Disetujui'
                            : detail.status === 'rejected'
                            ? 'Ditolak'
                            : 'Menunggu'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      TANGGAL UANG MAKAN
                  ========================================== */}

                  <div className="col-6">
                    <div className="detail-item">
                      <label className="detail-label">
                        Tanggal Uang Makan
                      </label>

                      <div className="detail-value">
                        {formatDate(detail.meal_date)}
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      NOMINAL
                  ========================================== */}

                  <div className="col-12">
                    <div className="detail-item">
                      <label className="detail-label">
                        Nominal Uang Makan
                      </label>

                      <div
                        className="detail-value"
                        style={{
                          fontSize: '18px',
                          color: '#059669',
                        }}
                      >
                        {formatRupiah(detail.amount)}
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      TANGGAL PENGAJUAN
                  ========================================== */}

                  <div className="col-12">
                    <div className="detail-item">
                      <label className="detail-label">
                        Tanggal Pengajuan
                      </label>

                      <div className="detail-value">
                        {formatDateTime(detail.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      ALASAN
                  ========================================== */}

                  <div className="col-12">
                    <div className="detail-item">
                      <label className="detail-label">
                        Alasan Pengajuan
                      </label>

                      <div
                        className="detail-value"
                        style={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                        }}
                      >
                        {detail.reason || '-'}
                      </div>
                    </div>
                  </div>

                  {/* ==========================================
                      WAKTU DIPROSES
                  ========================================== */}

                  {detail.approved_at && (
                    <div className="col-12">
                      <div className="detail-item">
                        <label className="detail-label">
                          Waktu Diproses
                        </label>

                        <div className="detail-value">
                          {formatDateTime(
                            detail.approved_at
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  Data tidak ditemukan.
                </div>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="modal-footer px-4 py-3 border-top">

              {detail &&
              detail.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    className="btn btn-danger rounded-3 d-inline-flex align-items-center gap-2"
                    onClick={handleReject}
                    disabled={processing}
                  >
                    <FaTimes />
                    Reject
                  </button>

                  <button
                    type="button"
                    className="btn btn-success rounded-3 d-inline-flex align-items-center gap-2"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    <FaCheck />
                    Approve
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-success rounded-3"
                    disabled
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger rounded-3"
                    disabled
                  >
                    Reject
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn btn-light border rounded-3"
                onClick={onClose}
                disabled={processing}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          STYLE
      ===================================================== */}

      <style>
        {`
          .detail-item {
            padding: 12px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #f8fafc;
          }

          .detail-label {
            display: block;
            margin-bottom: 5px;
            color: #6b7280;
            font-size: 12px;
            font-weight: 500;
          }

          .detail-value {
            color: #111827;
            font-size: 14px;
            font-weight: 600;
          }

          @media (max-width: 576px) {
            .modal-dialog {
              width: calc(100% - 20px) !important;
              margin: 10px auto;
            }

            .modal-content {
              border-radius: 14px !important;
            }

            .modal-header,
            .modal-body,
            .modal-footer {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }

            .modal-footer {
              flex-wrap: wrap;
            }

            .modal-footer button {
              flex: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default MealAllowanceApprovalDetailModal;