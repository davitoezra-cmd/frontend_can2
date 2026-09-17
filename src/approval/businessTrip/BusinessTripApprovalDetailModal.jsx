import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {apiFetch} from '../../api/apiFetch';
import LoadingSpinner from '../../components/LoadingSpinner';

const BusinessTripApprovalDetailModal = ({ show, onClose, item, onSuccess }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalNote, setApprovalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const response = await apiFetch.get(`/admin/business-trip/${item.id}`);
      setDetailData(response.data?.data || response.data);
    } catch (err) {
      setDetailData(item); // Fallback ke item row
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && item) {
      setDetailData(null); // Reset data lama sebelum fetch baru
      fetchDetail();
      setApprovalNote('');
    }
  }, [show, item]);

  if (!show) return null;

  const data = detailData || item;

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Persetujuan',
      text: 'Apakah Anda yakin ingin menyetujui pengajuan dinas luar ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        const response = await apiFetch.put(`/admin/business-trip/${data.id}/approve`, {
          approval_note: approvalNote || 'Disetujui'
        });
        toast.success(response.data?.message || 'Pengajuan dinas luar berhasil disetujui.');
        onSuccess();
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menyetujui pengajuan.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReject = async () => {
    if (!approvalNote.trim()) {
      toast.warning('Catatan penolakan (Approval Note) wajib diisi.');
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Penolakan',
      text: 'Apakah Anda yakin ingin menolak pengajuan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        const response = await apiFetch.put(`/admin/business-trip/${data.id}/reject`, {
          approval_note: approvalNote
        });
        toast.success(response.data?.message || 'Pengajuan dinas luar berhasil ditolak.');
        onSuccess();
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menolak pengajuan.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      {/* Tambahkan modal-dialog-scrollable agar scroll terjadi di dalam modal */}
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content border-0 shadow-lg">

          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold">Detail Pengajuan Business Trip</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>

          {/* Body dengan penanganan batasan tinggi */}
          <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="py-5 text-center">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Status Pending Alert */}
                {data.status === 'pending' && (
                  <div className="alert alert-warning border-0 rounded-3 mb-4">
                    <strong>Informasi:</strong> Pengajuan ini menunggu persetujuan Anda.
                  </div>
                )}

                {/* Status Completed Alert */}
                {data.status === 'completed' && (
                  <div className="alert alert-success border-0 rounded-3 mb-4">
                    <strong>Selesai:</strong> Business Trip telah selesai dilaksanakan.
                  </div>
                )}

                {/* Info Utama Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <small className="text-muted d-block">Nama Employee</small>
                    <span className="fw-semibold fs-6 text-dark">{data.employee?.name || data.employee_name || '-'}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Status Pengajuan</small>
                    <span className="fw-bold text-uppercase">{data.status}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Tanggal Dinas</small>
                    <span className="fw-semibold text-dark">{data.start_date} s/d {data.end_date}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Tujuan</small>
                    <span className="fw-semibold text-dark">{data.destination || '-'}</span>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Keperluan</small>
                    <p className="mb-0 text-dark">{data.purpose || '-'}</p>
                  </div>

                  {data.approved_at && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">Approved At</small>
                      <span>{data.approved_at}</span>
                    </div>
                  )}

                  {data.status !== 'pending' && (
                    <div className="col-12">
                      <small className="text-muted d-block">Catatan Persetujuan (Approval Note)</small>
                      <p className="mb-0 text-dark fw-semibold">{data.approval_note || '-'}</p>
                    </div>
                  )}
                </div>

                {/* Textarea Note untuk Pending */}
                {data.status === 'pending' && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Approval Note</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Masukkan catatan persetujuan atau alasan penolakan..."
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                      disabled={submitting}
                    ></textarea>
                  </div>
                )}

                {/* Section Bukti Absensi Dinas Luar (Approved / Completed) */}
                {(data.status === 'approved' || data.status === 'completed') && (
                  <>
                    <hr className="my-4" />
                    <h6 className="fw-bold text-primary mb-3">ABSENSI DINAS LUAR</h6>

                    {!data.check_in && !data.check_out && (
                      <div className="alert alert-light border text-muted mb-0">
                        Employee belum melakukan Check In.
                      </div>
                    )}

                    {data.check_in && !data.check_out && data.status !== 'completed' && (
                      <div className="alert alert-info border-0 mb-3">
                        Employee sedang menjalankan dinas luar.
                      </div>
                    )}

                    <div className="row g-3">
                      {/* Check In Info */}
                      {data.check_in && (
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border h-100">
                            <h6 className="fw-bold text-success mb-2">CHECK IN</h6>
                            <p className="mb-1 small"><strong>Jam:</strong> {data.check_in.time || data.check_in_time || '-'}</p>
                            <p className="mb-1 small"><strong>Latitude:</strong> {data.check_in.latitude || '-'}</p>
                            <p className="mb-2 small"><strong>Longitude:</strong> {data.check_in.longitude || '-'}</p>
                            {data.check_in.photo && (
                              <a href={data.check_in.photo} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={data.check_in.photo}
                                  alt="Foto Check In"
                                  className="img-fluid rounded border"
                                  style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }}
                                />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Check Out Info */}
                      {data.check_out && (
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border h-100">
                            <h6 className="fw-bold text-primary mb-2">CHECK OUT</h6>
                            <p className="mb-1 small"><strong>Jam:</strong> {data.check_out.time || data.check_out_time || '-'}</p>
                            <p className="mb-1 small"><strong>Latitude:</strong> {data.check_out.latitude || '-'}</p>
                            <p className="mb-2 small"><strong>Longitude:</strong> {data.check_out.longitude || '-'}</p>
                            {data.check_out.photo && (
                              <a href={data.check_out.photo} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={data.check_out.photo}
                                  alt="Foto Check Out"
                                  className="img-fluid rounded border"
                                  style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }}
                                />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top pt-3">
            {data?.status === 'pending' ? (
              <div className="d-flex gap-2 w-100 justify-content-end">
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleReject}
                  disabled={submitting || loading}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn btn-success px-4"
                  onClick={handleApprove}
                  disabled={submitting || loading}
                >
                  Approve
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={onClose}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTripApprovalDetailModal;
