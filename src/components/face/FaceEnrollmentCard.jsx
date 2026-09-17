import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {apiFetch} from '../../api/apiFetch';
import FaceCapture from './FaceCapture';

const FACE_ENDPOINTS = {
  user: { base: '/admin/face', label: 'Administrator' },
  employee: { base: '/employee/face', label: 'Employee' },
  supervisor: { base: '/supervisor/face', label: 'Supervisor' },
  finance: { base: '/finance/face', label: 'Finance' },
};

const FaceEnrollmentCard = ({ guard: guardProp }) => {
  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const guard = guardProp || sessionUser?.guard || 'employee';
  const faceConfig = FACE_ENDPOINTS[guard] || FACE_ENDPOINTS.employee;
  const { base, label } = faceConfig;

  const [status, setStatus] = useState({ enrolled: false, setup_required: false });
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await apiFetch.get(`${base}/status`);
      setStatus(response.data?.data || { enrolled: false, setup_required: false });
    } catch (error) {
      console.error('Gagal mengambil status Face Recognition:', error);
      setStatus({ enrolled: false, setup_required: false });
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    setLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  const requireImage = () => {
    if (faceImage?.file) return true;

    Swal.fire({
      icon: 'warning',
      title: 'Foto belum tersedia',
      text: 'Ambil foto wajah dari kamera terlebih dahulu.',
      customClass: { popup: 'rounded-4' },
    });
    return false;
  };

  const enroll = async () => {
    if (!requireImage()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', faceImage.file);

      const response = await apiFetch.post(`${base}/enroll`, formData);
      setFaceImage(null);
      await fetchStatus();
      await Swal.fire({
        icon: 'success',
        title: 'Wajah Terdaftar',
        text: response.data?.message || `Face Login ${label} berhasil diaktifkan.`,
        customClass: { popup: 'rounded-4' },
      });
    } catch (error) {
      console.error('Face enrollment gagal:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Pendaftaran Wajah Gagal',
        text: error.response?.data?.message || 'Wajah belum dapat didaftarkan. Silakan coba kembali.',
        customClass: { popup: 'rounded-4' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async () => {
    if (!requireImage()) return;

    setVerifying(true);
    try {
      const formData = new FormData();
      formData.append('image', faceImage.file);

      const response = await apiFetch.post(`${base}/verify`, formData);
      const verified = Boolean(response.data?.verified);
      const similarity = response.data?.similarity;

      await Swal.fire({
        icon: verified ? 'success' : 'error',
        title: verified ? 'Wajah Cocok' : 'Wajah Tidak Cocok',
        text:
          typeof similarity === 'number'
            ? `Similarity: ${similarity.toFixed(4)}`
            : verified
              ? 'Verifikasi wajah berhasil.'
              : 'Verifikasi wajah gagal.',
        customClass: { popup: 'rounded-4' },
      });

      if (verified) await fetchStatus();
    } catch (error) {
      console.error('Face verification gagal:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Verifikasi Gagal',
        text: error.response?.data?.message || 'Wajah belum dapat diverifikasi.',
        customClass: { popup: 'rounded-4' },
      });
    } finally {
      setVerifying(false);
    }
  };

  const remove = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Face Login?',
      text: 'Face Login hanya dilepas dari akun ini. Role lain yang terhubung ke identitas wajah yang sama tetap aktif.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      customClass: { popup: 'rounded-4' },
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch.delete(base);
      setFaceImage(null);
      await fetchStatus();
    } catch (error) {
      console.error('Gagal menghapus Face Login:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error.response?.data?.message || 'Face Login belum dapat dihapus.',
        customClass: { popup: 'rounded-4' },
      });
    }
  };

  return (
    <div className="card border-0 p-3 p-md-4 p-xl-5 mb-4 bg-white face-enrollment-card">
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="face-enrollment-card__icon rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
            <i className="bi bi-person-bounding-box fs-5" />
          </div>
          <div>
            <h5 className="fw-bold mb-1 text-dark">Face Recognition Login</h5>
            <small className="text-secondary">
              Daftarkan wajah untuk menghubungkan akun {label} ke identitas biometrik Anda.
            </small>
          </div>
        </div>

        {loading ? (
          <span className="badge rounded-pill text-bg-light align-self-start px-3 py-2">Memeriksa status...</span>
        ) : (
          <span
            className={`badge rounded-pill align-self-start px-3 py-2 d-inline-flex align-items-center gap-2 ${
              status.enrolled ? 'face-enrollment-card__badge--active' : 'face-enrollment-card__badge--inactive'
            }`}
          >
            <span className="rounded-circle face-enrollment-card__badge-dot" />
            {status.enrolled ? 'Wajah Terdaftar' : 'Belum Terdaftar'}
          </span>
        )}
      </div>

      {status.setup_required && (
        <div className="alert alert-warning rounded-4 small" role="alert">
          <i className="bi bi-database-exclamation me-2" />
          Tabel Face Identity belum tersedia. Jalankan migration Laravel terlebih dahulu.
        </div>
      )}

      <div className="row g-3 g-xl-4 align-items-stretch">
        <div className="col-12 col-lg-7">
          <FaceCapture value={faceImage} onChange={setFaceImage} disabled={submitting || verifying} />
        </div>

        <div className="col-12 col-lg-5">
          <div className="h-100 p-3 p-md-4 rounded-4 d-flex flex-column face-enrollment-card__settings">
            <h6 className="fw-bold mb-3 text-dark">
              <i className="bi bi-shield-check text-primary me-2" />
              Pengaturan Wajah
            </h6>

            <div className="d-flex flex-column gap-3 small text-secondary mb-4">
              <div className="d-flex gap-2">
                <i className="bi bi-check-circle-fill text-success mt-1" />
                <span>Pastikan hanya satu wajah terlihat, tanpa masker, dan pencahayaan cukup.</span>
              </div>
              <div className="d-flex gap-2">
                <i className="bi bi-check-circle-fill text-success mt-1" />
                <span>Embedding wajah disimpan terenkripsi sebagai satu Face Identity per orang.</span>
              </div>
              <div className="d-flex gap-2">
                <i className="bi bi-check-circle-fill text-success mt-1" />
                <span>Jika wajah yang sama sudah terdaftar pada role lain, akun ini otomatis dihubungkan ke Face Identity yang sama.</span>
              </div>
            </div>

            {status.enrolled && (
              <div className="rounded-3 p-3 mb-4 bg-white border">
                <small className="text-muted d-block mb-1">MODEL</small>
                <span className="fw-semibold text-dark">{status.model_name || '-'}</span>
                {Number(status.linked_account_count) > 1 && (
                  <small className="text-primary d-block mt-2">
                    <i className="bi bi-link-45deg me-1" />
                    Terhubung ke {status.linked_account_count} akun/role
                  </small>
                )}
                {status.enrolled_at && (
                  <small className="text-muted d-block mt-2">
                    Terdaftar: {new Date(status.enrolled_at).toLocaleString('id-ID')}
                  </small>
                )}
              </div>
            )}

            <div className="mt-auto d-grid gap-2">
              <button
                type="button"
                className="btn btn-custom-primary"
                onClick={enroll}
                disabled={!faceImage?.file || submitting || verifying || status.setup_required}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-person-plus-fill me-2" />
                )}
                {status.enrolled ? 'Perbarui Wajah' : 'Daftarkan Wajah'}
              </button>

              {status.enrolled && (
                <button
                  type="button"
                  className="btn btn-custom-outline"
                  onClick={verify}
                  disabled={!faceImage?.file || submitting || verifying}
                >
                  {verifying ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : (
                    <i className="bi bi-patch-check me-2" />
                  )}
                  Tes Verifikasi Wajah
                </button>
              )}

              {status.enrolled && (
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-3"
                  onClick={remove}
                  disabled={submitting || verifying}
                >
                  <i className="bi bi-trash3 me-2" />
                  Hapus Face Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceEnrollmentCard;
