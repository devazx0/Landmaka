'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ImageCapturePickerProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  required?: boolean;
}

export default function ImageCapturePicker({
  value,
  onChange,
  label = 'Photo Evidence / Entrance Photo',
  required = false,
}: ImageCapturePickerProps) {
  const [activeMode, setActiveMode] = useState<'picker' | 'camera'>('picker');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream when component unmounts or modal closes
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Handle local file picking (or mobile native camera)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        stopCameraStream();
        setActiveMode('picker');
      }
    };
    reader.readAsDataURL(file);
  };

  // Launch live device camera stream (webcam / desktop / phone browser)
  const startLiveCamera = async () => {
    setCameraError(null);
    setActiveMode('camera');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback directly to native camera input on unsupported browsers
      nativeCameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Could not access live camera. You can still pick a photo or take one using the native device camera button.'
      );
      // Trigger native device camera input
      nativeCameraInputRef.current?.click();
    }
  };

  // Capture frame from live video feed
  const capturePhotoFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onChange(dataUrl);
      stopCameraStream();
      setActiveMode('picker');
    }
  };

  const handleClear = () => {
    onChange('');
    stopCameraStream();
  };

  return (
    <div className="space-y-2 font-body-sm">
      <div className="flex items-center justify-between">
        <label className="font-label-caps text-[11px] font-semibold text-on-surface">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-mono-sm text-error hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            <span>Remove photo</span>
          </button>
        )}
      </div>

      {/* Hidden file inputs: one for generic file pick, one with capture="environment" for native phone camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* When live camera is active */}
      {isCameraActive && (
        <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 text-white space-y-3 animate-in fade-in">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-error/80 text-white font-mono-sm text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>LIVE CAM</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={stopCameraStream}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel Camera
            </button>
            <button
              type="button"
              onClick={capturePhotoFrame}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Snap Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* When not capturing live video */}
      {!isCameraActive && (
        <div>
          {value ? (
            /* Image Preview */
            <div className="relative rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-low group">
              <img
                src={value}
                alt="Selected entrance or POD proof"
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold shadow hover:bg-white flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  <span>Change File</span>
                </button>
                <button
                  type="button"
                  onClick={startLiveCamera}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow hover:bg-primary-container flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Retake with Camera</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-xs text-[10px] font-mono-sm font-semibold text-tertiary border border-outline-variant/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                <span>Photo Attached</span>
              </div>
            </div>
          ) : (
            /* Clean Minimalist Pick/Capture Dropzone */
            <div className="p-4 rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container-low/40 transition-colors text-center space-y-2.5">
              <div className="w-10 h-10 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-on-surface">
                  Take photo or select from device
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  High-resolution entrance, yellow gate, or package drop-off evidence
                </p>
              </div>

              {cameraError && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-body-sm">
                  {cameraError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface text-xs font-medium shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">upload_file</span>
                  <span>Pick from Device</span>
                </button>

                <button
                  type="button"
                  onClick={startLiveCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Use Device Camera</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
