import React, { useEffect, useState } from 'react';
import {apiFetch} from '../../api/apiFetch';
import LoadingSpinner from '../../components/LoadingSpinner';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';

const LeaveApprovalDetailModal = ({ id, isOpen, onClose, onSuccess }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
      const response = await apiFetch.get(`/admin/leave/${id}`);

      if (response.data.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil detail data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Swal.fire({
      title: 'Konfirmasi Approval',
      text: 'Yakin ingin menyetujui pengajuan ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Approve',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessing(true);

        try {
          const response = await apiFetch.put(
            `/admin/leave/${id}/approve`,
            {
              approval_note: 'Pengajuan disetujui.'
            }
          );

          if (response.data.success) {
            toast.success(
              response.data.message ||
              'Pengajuan berhasil disetujui.'
            );

            onSuccess();
            onClose();
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
            'Gagal memproses approval.'
          );
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleReject = () => {
    Swal.fire({
      title: 'Penolakan Pengajuan',
      input: 'textarea',
      inputLabel: 'Masukkan alasan penolakan',
      inputPlaceholder: 'Tulis alasan penolakan di sini...',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Tolak Pengajuan',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-4'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Alasan penolakan wajib diisi!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessing(true);

        try {
          const response = await apiFetch.put(
            `/admin/leave/${id}/reject`,
            {
              approval_note: result.value
            }
          );

          if (response.data.success) {
            toast.success(
              response.data.message ||
              'Pengajuan berhasil ditolak.'
            );

            onSuccess();
            onClose();
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
            'Gagal memproses penolakan.'
          );
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .leave-detail-overlay {
            position: fixed;
            inset: 0;
            z-index: 1055;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15, 23, 42, 0.45);
          }

          .leave-detail-modal {
            width: 100%;
            max-width: 600px;
            max-height: calc(100vh - 40px);
            background: #ffffff;
            border: 0;
            border-radius: 14px;
            box-shadow:
              0 20px 50px rgba(0, 0, 0, 0.16);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .leave-detail-header {
            padding: 16px 20px;
            border-bottom: 1px solid #edf0f2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .leave-detail-title-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .leave-detail-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
            border-radius: 9px;
            background: #eef2ff;
            color: #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          }

          .leave-detail-title {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #212529;
          }

          .leave-detail-subtitle {
            margin: 2px 0 0;
            font-size: 11px;
            color: #8a9199;
          }

          .leave-detail-close {
            width: 32px;
            height: 32px;
            border: 0;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .leave-detail-close:hover {
            background: #e9ecef;
          }

          .leave-detail-body {
            padding: 18px 20px;
            overflow-y: auto;
          }

          .leave-detail-loading {
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .leave-info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .leave-info-item {
            background: #f8f9fa;
            border: 1px solid #edf0f2;
            border-radius: 9px;
            padding: 11px 13px;
            min-width: 0;
          }

          .leave-info-item.full {
            grid-column: 1 / -1;
          }

          .leave-info-label {
            display: block;
            margin-bottom: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #8a9199;
            text-transform: uppercase;
            letter-spacing: .03em;
          }

          .leave-info-value {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #343a40;
            line-height: 1.5;
            word-break: break-word;
          }

          .leave-status {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 9px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: capitalize;
          }

          .leave-status.pending {
            background: #fff8df;
            color: #997404;
          }

          .leave-status.approved {
            background: #e9f7ef;
            color: #198754;
          }

          .leave-status.rejected {
            background: #fdecec;
            color: #dc3545;
          }

          .leave-status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: currentColor;
          }

          .leave-detail-footer {
            padding: 13px 20px;
            border-top: 1px solid #edf0f2;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 7px;
            background: #ffffff;
          }

          .leave-detail-footer .btn {
            font-size: 12px;
            padding: 7px 13px;
            border-radius: 8px !important;
          }

          .leave-empty {
            text-align: center;
            padding: 35px 20px;
            color: #8a9199;
            font-size: 13px;
          }

          @media (max-width: 576px) {
            .leave-detail-overlay {
              padding: 12px;
            }

            .leave-detail-modal {
              max-height: calc(100vh - 24px);
              border-radius: 12px;
            }

            .leave-detail-header {
              padding: 14px 16px;
            }

            .leave-detail-body {
              padding: 14px 16px;
            }

            .leave-detail-footer {
              padding: 11px 16px;
              flex-wrap: wrap;
            }

            .leave-info-grid {
              grid-template-columns: 1fr;
            }

            .leave-info-item.full {
              grid-column: auto;
            }

            .leave-detail-footer .btn {
              flex: 1;
              justify-content: center;
            }
          }
        `}
      </style>

      <div className="leave-detail-overlay">
        <div className="leave-detail-modal">

          {/* HEADER */}
          <div className="leave-detail-header">
            <div className="leave-detail-title-wrapper">
              <div className="leave-detail-icon">
                <i className="bi bi-calendar-check"></i>
              </div>

              <div>
                <h5 className="leave-detail-title">
                  Detail Pengajuan Cuti
                </h5>

                <p className="leave-detail-subtitle">
                  Informasi pengajuan dan proses approval
                </p>
              </div>
            </div>

            <button
              type="button"
              className="leave-detail-close"
              onClick={onClose}
              disabled={processing}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* BODY */}
          <div className="leave-detail-body">

            {loading ? (
              <div className="leave-detail-loading">
                <LoadingSpinner />
              </div>
            ) : detail ? (
              <div className="leave-info-grid">

                {/* EMPLOYEE */}
                <div className="leave-info-item">
                  <span className="leave-info-label">
                    Nama Employee
                  </span>

                  <span className="leave-info-value">
                    {detail.employee?.name || '-'}
                  </span>
                </div>

                {/* STATUS */}
                <div className="leave-info-item">
                  <span className="leave-info-label">
                    Status
                  </span>

                  <span
                    className={`leave-status ${
                      detail.status === 'approved'
                        ? 'approved'
                        : detail.status === 'rejected'
                        ? 'rejected'
                        : 'pending'
                    }`}
                  >
                    <span className="leave-status-dot"></span>
                    {detail.status || '-'}
                  </span>
                </div>

                {/* TANGGAL CUTI */}
                <div className="leave-info-item">
                  <span className="leave-info-label">
                    Tanggal Cuti
                  </span>

                  <span className="leave-info-value">
                    {detail.start_date || '-'}
                    {' s/d '}
                    {detail.end_date || '-'}
                  </span>
                </div>

                {/* CREATED AT */}
                <div className="leave-info-item">
                  <span className="leave-info-label">
                    Tanggal Pengajuan
                  </span>

                  <span className="leave-info-value">
                    {detail.created_at
                      ? new Date(
                          detail.created_at
                        ).toLocaleString('id-ID')
                      : '-'}
                  </span>
                </div>

                {/* ALASAN */}
                <div className="leave-info-item full">
                  <span className="leave-info-label">
                    Alasan
                  </span>

                  <span className="leave-info-value">
                    {detail.reason ||
                      detail.description ||
                      '-'}
                  </span>
                </div>

                {/* APPROVAL NOTE */}
                <div className="leave-info-item full">
                  <span className="leave-info-label">
                    Approval Note
                  </span>

                  <span className="leave-info-value">
                    {detail.approval_note || '-'}
                  </span>
                </div>

                {/* APPROVED / REJECTED AT */}
                {detail.approved_at && (
                  <div className="leave-info-item full">
                    <span className="leave-info-label">
                      Approved / Rejected At
                    </span>

                    <span className="leave-info-value">
                      {new Date(
                        detail.approved_at
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

              </div>
            ) : (
              <div className="leave-empty">
                <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                Data tidak ditemukan.
              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="leave-detail-footer">

            {detail && detail.status === 'pending' ? (
              <>
                <button
                  className="btn btn-danger d-inline-flex align-items-center gap-2"
                  onClick={handleReject}
                  disabled={processing}
                >
                  <FaTimes />
                  Reject
                </button>

                <button
                  className="btn btn-success d-inline-flex align-items-center gap-2"
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
                  className="btn btn-success"
                  disabled
                >
                  Approve
                </button>

                <button
                  className="btn btn-danger"
                  disabled
                >
                  Reject
                </button>
              </>
            )}

            <button
              className="btn btn-light border"
              onClick={onClose}
              disabled={processing}
            >
              Tutup
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default LeaveApprovalDetailModal;
