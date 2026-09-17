import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import {apiFetch} from '../api/apiFetch'; // Sesuaikan path jika berbeda

const CheckInModal = ({ show, onClose, item, onSuccess }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);

      // Ambil GPS Location saat ini
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            toast.error(
              'Gagal mengambil lokasi GPS. Pastikan izin lokasi diaktifkan.'
            );
            console.error(error);
          }
        );
      } else {
        toast.error('Browser tidak mendukung Geolocation.');
      }
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setImgSrc(null);
    setCoords({ latitude: null, longitude: null });
  };

  // Helper konversi DataURL (base64) ke File/Blob
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    if (!imgSrc || !coords.latitude || !coords.longitude) {
      toast.error(
        'Foto dan lokasi GPS wajib ada untuk melakukan Check In!'
      );
      return;
    }

    setLoading(true);

    try {
      const photoFile = dataURLtoFile(
        imgSrc,
        `checkin-${item.id}.jpg`
      );

      const formData = new FormData();

      formData.append('photo', photoFile);
      formData.append('latitude', coords.latitude);
      formData.append('longitude', coords.longitude);

      await apiFetch.post(
        `/employee/business-trip/${item.id}/check-in`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success('Berhasil melakukan Check In Dinas!');

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Gagal melakukan Check In.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        /* =====================================================
           CHECK IN MODAL
        ===================================================== */

        .checkin-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.55);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 16px;

          z-index: 2000;

          overflow-y: auto;
        }

        .checkin-modal {
          width: 100%;
          max-width: 560px;

          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);

          background: #ffffff;

          border-radius: 18px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.22);

          display: flex;
          flex-direction: column;

          overflow: hidden;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .checkin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 17px 20px;

          border-bottom: 1px solid #e5e7eb;

          flex-shrink: 0;
        }

        .checkin-title {
          margin: 0;

          font-size: 17px;
          font-weight: 700;

          color: #111827;
        }

        .checkin-subtitle {
          margin: 3px 0 0;

          font-size: 12px;

          color: #6b7280;
        }

        .checkin-close {
          width: 34px;
          height: 34px;

          border: none;
          border-radius: 9px;

          background: #f3f4f6;

          color: #6b7280;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .checkin-close:hover {
          background: #e5e7eb;
          color: #111827;
        }

        /* =====================================================
           BODY
        ===================================================== */

        .checkin-body {
          padding: 18px 20px;

          overflow-y: auto;

          min-height: 0;

          flex: 1;
        }

        /* =====================================================
           CAMERA
        ===================================================== */

        .checkin-camera-wrapper {
          width: 100%;

          background: #000000;

          border-radius: 14px;

          overflow: hidden;

          position: relative;

          margin-bottom: 14px;

          display: flex;
          justify-content: center;
          align-items: center;

          aspect-ratio: 4 / 3;

          max-height: 330px;
        }

        .checkin-camera-wrapper video {
          width: 100% !important;
          height: 100% !important;

          object-fit: cover;
        }

        .checkin-preview {
          width: 100%;

          max-height: 330px;

          aspect-ratio: 4 / 3;

          object-fit: cover;

          border-radius: 14px;

          border: 1px solid #e5e7eb;

          display: block;

          margin-bottom: 14px;
        }

        /* =====================================================
           PHOTO BUTTON
        ===================================================== */

        .checkin-photo-actions {
          display: flex;

          justify-content: center;

          gap: 8px;

          margin-bottom: 14px;
        }

        .checkin-photo-btn {
          min-height: 38px;

          padding: 8px 20px;

          border: none;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          cursor: pointer;
        }

        .checkin-photo-btn.primary {
          background: #4f46e5;
          color: #ffffff;
        }

        .checkin-photo-btn.secondary {
          background: #ffffff;

          color: #4b5563;

          border: 1px solid #d1d5db;
        }

        /* =====================================================
           GPS
        ===================================================== */

        .checkin-gps {
          padding: 12px 14px;

          background: #f8fafc;

          border: 1px solid #e5e7eb;

          border-radius: 11px;

          font-size: 12px;

          color: #4b5563;
        }

        .checkin-gps-title {
          display: flex;
          align-items: center;

          gap: 7px;

          margin-bottom: 7px;

          font-size: 12px;

          font-weight: 700;

          color: #374151;
        }

        .checkin-gps-row {
          display: flex;

          justify-content: space-between;

          gap: 12px;

          padding: 3px 0;
        }

        .checkin-gps-label {
          color: #6b7280;
        }

        .checkin-gps-value {
          color: #111827;

          font-weight: 500;

          text-align: right;

          word-break: break-all;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .checkin-footer {
          display: flex;

          justify-content: flex-end;

          gap: 8px;

          padding: 13px 20px;

          border-top: 1px solid #e5e7eb;

          background: #ffffff;

          flex-shrink: 0;
        }

        .checkin-footer-btn {
          min-height: 38px;

          padding: 8px 18px;

          border-radius: 9px;

          font-size: 13px;

          font-weight: 600;

          border: none;

          cursor: pointer;
        }

        .checkin-footer-btn.cancel {
          background: #f3f4f6;

          color: #374151;
        }

        .checkin-footer-btn.submit {
          background: #16a34a;

          color: #ffffff;
        }

        .checkin-footer-btn:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 575.98px) {

          .checkin-overlay {
            padding: 10px;
          }

          .checkin-modal {
            max-width: 100%;

            max-height: calc(100vh - 20px);
            max-height: calc(100dvh - 20px);

            border-radius: 15px;
          }

          .checkin-header {
            padding: 14px 16px;
          }

          .checkin-title {
            font-size: 15px;
          }

          .checkin-body {
            padding: 14px 16px;
          }

          .checkin-camera-wrapper,
          .checkin-preview {
            aspect-ratio: 4 / 3;

            max-height: 260px;

            border-radius: 12px;
          }

          .checkin-gps-row {
            display: block;
          }

          .checkin-gps-value {
            text-align: left;

            margin-top: 2px;
          }

          .checkin-footer {
            padding: 11px 16px;
          }

          .checkin-footer-btn {
            flex: 1;
          }
        }
      `}</style>

      <div
        className="checkin-overlay"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !loading) {
            onClose();
          }
        }}
      >
        <div className="checkin-modal">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="checkin-header">
            <div>
              <h5 className="checkin-title">
                Business Trip Check In
              </h5>

              <p className="checkin-subtitle">
                Ambil foto dan lokasi untuk melakukan check in
              </p>
            </div>

            <button
              type="button"
              className="checkin-close"
              onClick={onClose}
              disabled={loading}
              title="Tutup"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* =================================================
              BODY
          ================================================= */}

          <div className="checkin-body">

            {/* CAMERA / PREVIEW */}

            {!imgSrc ? (
              <div className="checkin-camera-wrapper">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{
                    facingMode: 'user',
                  }}
                />
              </div>
            ) : (
              <img
                src={imgSrc}
                alt="Preview"
                className="checkin-preview"
              />
            )}

            {/* PHOTO ACTION */}

            <div className="checkin-photo-actions">

              {!imgSrc ? (
                <button
                  type="button"
                  className="checkin-photo-btn primary"
                  onClick={capturePhoto}
                  disabled={loading}
                >
                  <i className="bi bi-camera me-2"></i>
                  Ambil Foto
                </button>
              ) : (
                <button
                  type="button"
                  className="checkin-photo-btn secondary"
                  onClick={handleRetake}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Foto Ulang
                </button>
              )}

            </div>

            {/* GPS */}

            <div className="checkin-gps">

              <div className="checkin-gps-title">
                <i className="bi bi-geo-alt-fill text-danger"></i>
                Koordinat Lokasi GPS
              </div>

              <div className="checkin-gps-row">
                <span className="checkin-gps-label">
                  Latitude
                </span>

                <span className="checkin-gps-value">
                  {coords.latitude !== null
                    ? coords.latitude
                    : 'Menunggu foto...'}
                </span>
              </div>

              <div className="checkin-gps-row">
                <span className="checkin-gps-label">
                  Longitude
                </span>

                <span className="checkin-gps-value">
                  {coords.longitude !== null
                    ? coords.longitude
                    : 'Menunggu foto...'}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="checkin-footer">

            <button
              type="button"
              className="checkin-footer-btn cancel"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="button"
              className="checkin-footer-btn submit"
              onClick={handleSubmit}
              disabled={
                loading ||
                !imgSrc ||
                !coords.latitude
              }
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Mengirim...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Kirim Check In
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default CheckInModal;