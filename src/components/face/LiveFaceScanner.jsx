import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Camera-only face scanner.
 *
 * Network protection:
 * - never uses setInterval;
 * - never starts a second request while one is running;
 * - waits `intervalMs` AFTER an attempt finishes before another POST;
 * - when the browser supports the Shape Detection API, the POST is only sent
 *   after exactly one face is detected locally in the live video frame.
 *
 * Browsers without FaceDetector keep a compatibility fallback, but the
 * fallback is still strictly paced by the same cooldown and single-flight
 * guard. FastAPI remains the authoritative face validator.
 */
const LiveFaceScanner = ({
  onScan,
  paused = false,
  intervalMs = 3000,
  presenceCheckMs = 550,
  status = 'Arahkan wajah ke area panduan.',
  statusType = 'idle',
}) => {
  const webcamRef = useRef(null);
  const onScanRef = useRef(onScan);
  const requestBusyRef = useRef(false);
  const faceDetectorRef = useRef(null);
  const mountedRef = useRef(true);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [localDetectorSupported, setLocalDetectorSupported] = useState(null);
  const [facePresence, setFacePresence] = useState('waiting');

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    mountedRef.current = true;

    try {
      if ('FaceDetector' in window) {
        faceDetectorRef.current = new window.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 2,
        });
        setLocalDetectorSupported(true);
      } else {
        setLocalDetectorSupported(false);
      }
    } catch {
      faceDetectorRef.current = null;
      setLocalDetectorSupported(false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!cameraReady || paused || cameraError) return undefined;

    let cancelled = false;
    let timerId = null;

    const schedule = (delay) => {
      if (cancelled || !mountedRef.current) return;
      timerId = window.setTimeout(run, Math.max(150, Number(delay) || 0));
    };

    const detectFaceLocally = async () => {
      const detector = faceDetectorRef.current;
      const video = webcamRef.current?.video;

      if (!video || video.readyState < 2) {
        if (mountedRef.current) setFacePresence('waiting');
        return false;
      }

      // Compatibility fallback for browsers without Shape Detection API.
      // It is still protected by the 3s+ network cooldown and backend lock.
      if (!detector) {
        if (mountedRef.current) setFacePresence('fallback');
        return true;
      }

      try {
        const faces = await detector.detect(video);

        if (!mountedRef.current) return false;

        if (faces.length === 1) {
          setFacePresence('detected');
          return true;
        }

        setFacePresence(faces.length > 1 ? 'multiple' : 'none');
        return false;
      } catch {
        // If native detection becomes unavailable at runtime, degrade safely to
        // the paced server-side validation instead of creating a request loop.
        faceDetectorRef.current = null;
        if (mountedRef.current) {
          setLocalDetectorSupported(false);
          setFacePresence('fallback');
        }
        return true;
      }
    };

    const run = async () => {
      if (cancelled || paused || requestBusyRef.current) {
        schedule(presenceCheckMs);
        return;
      }

      const faceIsPresent = await detectFaceLocally();

      if (cancelled) return;

      if (!faceIsPresent) {
        schedule(presenceCheckMs);
        return;
      }

      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc || typeof onScanRef.current !== 'function') {
        schedule(presenceCheckMs);
        return;
      }

      requestBusyRef.current = true;
      if (mountedRef.current) setFacePresence('verifying');

      let retryAfterMs = intervalMs;

      try {
        const blob = await dataUrlToBlob(imageSrc);
        if (!blob?.size || cancelled) return;

        const result = await onScanRef.current(blob);
        const requestedDelay = Number(result?.retryAfterMs);
        if (Number.isFinite(requestedDelay) && requestedDelay > retryAfterMs) {
          retryAfterMs = requestedDelay;
        }
      } catch (error) {
        // LoginPage owns user-facing API error messages. Keep this component
        // silent and only ensure the next network request is delayed.
        console.debug('Live face verification attempt failed:', error);
      } finally {
        requestBusyRef.current = false;
        if (!cancelled && mountedRef.current) {
          setFacePresence('waiting');
          // Important: cooldown starts AFTER the request has completed.
          schedule(retryAfterMs);
        }
      }
    };

    // Give autofocus/exposure a moment to settle before the first detection.
    schedule(1000);

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [cameraError, cameraReady, intervalMs, paused, presenceCheckMs]);

  const presenceText = (() => {
    if (!cameraReady) return 'Menunggu kamera...';
    if (facePresence === 'detected') return 'Wajah terdeteksi';
    if (facePresence === 'multiple') return 'Pastikan hanya satu wajah di kamera';
    if (facePresence === 'none') return 'Belum ada wajah di area kamera';
    if (facePresence === 'verifying') return 'Memverifikasi wajah...';
    if (facePresence === 'fallback') return 'Deteksi lokal tidak tersedia · verifikasi aman berkala';
    return localDetectorSupported === true ? 'Mencari wajah...' : 'Menyiapkan deteksi wajah...';
  })();

  return (
    <div className="live-face-scanner w-100">
      <div className="live-face-scanner__frame position-relative overflow-hidden bg-dark">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          screenshotFormat="image/jpeg"
          screenshotQuality={0.86}
          forceScreenshotSourceSize={false}
          videoConstraints={{
            facingMode: 'user',
            width: { ideal: 960 },
            height: { ideal: 720 },
          }}
          onUserMedia={() => {
            setCameraReady(true);
            setCameraError('');
          }}
          onUserMediaError={() => {
            setCameraReady(false);
            setCameraError('Kamera tidak dapat diakses. Izinkan akses kamera pada browser.');
          }}
          className="live-face-scanner__video"
        />

        <div className="live-face-scanner__shade" aria-hidden="true" />
        <div
          className="live-face-scanner__guide position-absolute top-50 start-50 translate-middle"
          aria-hidden="true"
        >
          <span className="live-face-scanner__corner live-face-scanner__corner--tl" />
          <span className="live-face-scanner__corner live-face-scanner__corner--tr" />
          <span className="live-face-scanner__corner live-face-scanner__corner--bl" />
          <span className="live-face-scanner__corner live-face-scanner__corner--br" />
          {cameraReady && !paused && facePresence !== 'none' && facePresence !== 'multiple' && (
            <span className="live-face-scanner__scan-line" />
          )}
        </div>

        {!cameraReady && !cameraError && (
          <div className="live-face-scanner__center-message position-absolute top-50 start-50 translate-middle text-center text-white">
            <span className="spinner-border spinner-border-sm mb-2" role="status" />
            <div>Menyiapkan kamera...</div>
          </div>
        )}

        {cameraReady && !cameraError && (
          <div className="live-face-scanner__presence position-absolute top-0 start-50 translate-middle-x mt-3">
            <span className={`badge rounded-pill ${facePresence === 'detected' || facePresence === 'verifying' ? 'bg-success' : 'bg-dark bg-opacity-75'}`}>
              <i className={`bi ${facePresence === 'detected' ? 'bi-person-check-fill' : facePresence === 'multiple' ? 'bi-people-fill' : 'bi-person-bounding-box'} me-1`} />
              {presenceText}
            </span>
          </div>
        )}

        <div className="live-face-scanner__instruction position-absolute start-0 end-0 bottom-0 text-center text-white">
          Posisikan satu wajah di tengah dan lihat ke kamera
        </div>
      </div>

      {cameraError ? (
        <div className="alert alert-warning py-2 px-3 small mt-3 mb-0 rounded-3">
          <i className="bi bi-camera-video-off me-2" />
          {cameraError}
        </div>
      ) : (
        <div className={`live-face-scanner__status live-face-scanner__status--${statusType} mt-3`}>
          <span className="live-face-scanner__status-icon" aria-hidden="true">
            {statusType === 'checking' ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : statusType === 'success' ? (
              <i className="bi bi-check-circle-fill" />
            ) : statusType === 'error' ? (
              <i className="bi bi-exclamation-circle-fill" />
            ) : (
              <i className="bi bi-person-bounding-box" />
            )}
          </span>
          <span>{cameraReady ? status : 'Menunggu izin kamera...'}</span>
        </div>
      )}
    </div>
  );
};

export default LiveFaceScanner;
