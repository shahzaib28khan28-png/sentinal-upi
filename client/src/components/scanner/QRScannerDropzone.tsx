import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Upload, Camera, QrCode, X, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface QRScannerDropzoneProps {
  onScanComplete: (qrData: string) => void;
  isLoading?: boolean;
}

export const QRScannerDropzone: React.FC<QRScannerDropzoneProps> = ({
  onScanComplete,
  isLoading
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera' | 'paste'>('upload');
  const [manualText, setManualText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [decodedSuccess, setDecodedSuccess] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle File Upload & jsQR Image Decode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setDecodedSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMessage('Could not initialize canvas context.');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          setDecodedSuccess(code.data);
          onScanComplete(code.data);
        } else {
          setErrorMessage('No valid QR code could be found in the uploaded image. Please ensure the QR is clear and well-lit.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Start Camera Scanning
  const startCamera = async () => {
    setErrorMessage(null);
    setDecodedSuccess(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Camera access is not supported on this browser or connection is not secure (requires HTTPS or localhost).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickCamera);
      }
    } catch (err: any) {
      console.warn('Camera access denied:', err);
      setErrorMessage('Camera permission was denied or camera is unavailable. You can upload an image or paste the UPI code directly.');
    }
  };

  const tickCamera = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            stopCamera();
            setDecodedSuccess(code.data);
            onScanComplete(code.data);
            return;
          }
        }
      }
    }
    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(tickCamera);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) {
      setErrorMessage('Please paste or type a UPI QR code string or payment link.');
      return;
    }
    setErrorMessage(null);
    setDecodedSuccess(manualText.trim());
    onScanComplete(manualText.trim());
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('upload');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'upload'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('camera');
            startCamera();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'camera'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Scan Camera</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('paste');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'paste'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Paste UPI URI</span>
        </button>
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success decode pill */}
      {decodedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-mono break-all">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span className="truncate">Decoded: {decodedSuccess}</span>
        </div>
      )}

      {/* Mode 1: Upload */}
      {activeMode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-strong)] hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Click to upload or drag and drop QR code image
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Supports PNG, JPG, JPEG, WEBP screenshots from WhatsApp, GPay, PhonePe, or Paytm
          </p>
        </div>
      )}

      {/* Mode 2: Camera */}
      {activeMode === 'camera' && (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-black aspect-video max-w-md mx-auto flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder crosshairs overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-blue-400 rounded-2xl relative animate-pulse">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
            </div>
          </div>

          <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] backdrop-blur-sm">
            Align QR code inside the frame
          </div>
        </div>
      )}

      {/* Mode 3: Manual Paste */}
      {activeMode === 'paste' && (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Paste UPI URI or Raw QR Content:
            </label>
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g. upi://pay?pa=refund-officer@okhdfcbank&pn=Amazon%20Refund&am=4999&tn=ClaimRefund"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            Decode & Analyze QR String
          </button>
        </form>
      )}
    </div>
  );
};
