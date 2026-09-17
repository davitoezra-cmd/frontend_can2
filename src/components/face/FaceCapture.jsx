import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const dataUrlToFile = async (dataUrl, filename = 'face-capture.jpg') => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
};

const FaceCapture = ({
  value,
  onChange,
  disabled = false,
  compact = false,
  allowUpload = true,
}) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    return () => {
      if (value?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(value.preview);
      }
    };
  }, [value?.preview]);

  const capture = useCallback(async () => {
    if (!webcamRef.current || disabled || !cameraReady) return;

    setCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setCameraError('Kamera belum siap. Coba beberapa detik lagi.');
        return;
      }

      const file = await dataUrlToFile(imageSrc);
      onChange({ preview: imageSrc, file });
      setCameraError('');
    } finally {
      setCapturing(false);
    }
  }, [cameraReady, disabled, onChange]);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('File yang dipilih harus berupa gambar.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setCameraError('Ukuran gambar maksimal 5 MB.');
      return;
    }

    const preview = URL.createObjectURL(file);
    onChange({ preview, file });
    setCameraError('');
  };

  const reset = () => {
    if (value?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(value.preview);
    }
    onChange(null);
    setCameraError('');
  };

  return (
    <div className={`face-capture ${compact ? 'face-capture--compact' : ''}`}>
      <div className="face-capture__frame position-relative overflow-hidden bg-dark d-flex align-items-center justify-content-center">
        {value?.preview ? (
          <img
            src={value.preview}
            alt="Pratinjau wajah"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              videoConstraints={{
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }}
              onUserMedia={() => {
                setCameraReady(true);
                setCameraError('');
              }}
              onUserMediaError={() => {
                setCameraReady(false);
                setCameraError(
                  allowUpload
                    ? 'Kamera tidak dapat diakses. Izinkan akses kamera atau unggah foto.'
                    : 'Kamera tidak dapat diakses. Izinkan akses kamera pada browser untuk login wajah.',
                );
              }}
              className="face-capture__video w-100 h-100"
            />

            <div className="face-capture__guide position-absolute top-50 start-50 translate-middle" />

            {!cameraReady && !cameraError && (
              <div className="face-capture__loading position-absolute top-50 start-50 translate-middle text-white text-center">
                <span className="spinner-border spinner-border-sm mb-2" role="status" />
                <div>Menyiapkan kamera...</div>
              </div>
            )}

            <div className="face-capture__hint position-absolute bottom-0 start-0 end-0 text-center text-white px-3 py-2">
              Posisikan satu wajah di tengah, lihat ke kamera, dan pastikan cahaya cukup.
            </div>
          </>
        )}
      </div>

      {cameraError && (
        <div className="alert alert-warning py-2 px-3 small mt-3 mb-0 rounded-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {cameraError}
        </div>
      )}

      {allowUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="d-none"
          onChange={handleUpload}
          disabled={disabled}
        />
      )}

      <div className={`face-capture__actions mt-3 ${allowUpload ? 'd-grid d-sm-flex gap-2' : 'd-grid'}`}>
        {value?.preview ? (
          <button
            type="button"
            className="btn btn-custom-secondary flex-fill"
            onClick={reset}
            disabled={disabled}
          >
            <i className="bi bi-arrow-counterclockwise me-2" />
            Foto Ulang
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-custom-primary flex-fill"
            onClick={capture}
            disabled={disabled || capturing || !cameraReady}
          >
            {capturing ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <i className="bi bi-camera-fill me-2" />
            )}
            {cameraReady ? 'Ambil Foto Wajah' : 'Menunggu Kamera'}
          </button>
        )}

        {allowUpload && (
          <button
            type="button"
            className="btn btn-custom-outline flex-fill"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <i className="bi bi-image me-2" />
            Pilih Foto
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
