"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2, Zap } from "lucide-react";

interface CameraQRScannerProps {
  onScan: (decodedText: string) => void;
  isProcessing?: boolean;
}

export function CameraQRScanner({ onScan, isProcessing = false }: CameraQRScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentScan, setRecentScan] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser or device.");
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      setHasPermission(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera access was denied. Please allow camera permissions in browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No video camera detected on this device.");
      } else {
        setErrorMessage(err.message || "Unable to initialize camera video stream.");
      }
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Frame processing loop for QR decoding
  useEffect(() => {
    let active = true;

    const scanFrame = async () => {
      if (!active || !isCameraActive || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Try Native BarcodeDetector first (fastest, hardware accelerated)
          let detectedValue: string | null = null;
          if (typeof window !== "undefined" && "BarcodeDetector" in window) {
            try {
              const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
              const barcodes = await detector.detect(canvas);
              if (barcodes && barcodes.length > 0) {
                detectedValue = barcodes[0].rawValue;
              }
            } catch {
              // Fallback to jsQR below
            }
          }

          // Fallback to jsQR library
          if (!detectedValue) {
            try {
              const jsQRModule = await import("jsqr");
              const jsQR = jsQRModule.default || jsQRModule;
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
              });
              if (code && code.data) {
                detectedValue = code.data;
              }
            } catch {
              // jsQR not yet ready
            }
          }

          // Handle detected QR with cooldown throttle (3 seconds)
          if (detectedValue) {
            const now = Date.now();
            if (now - lastScanTimestampRef.current > 3000) {
              lastScanTimestampRef.current = now;
              setRecentScan(detectedValue);
              onScan(detectedValue);

              // Clear highlight after 2.5s
              setTimeout(() => {
                if (active) setRecentScan(null);
              }, 2500);
            }
          }
        }
      }

      if (active && isCameraActive) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    };

    if (isCameraActive) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isCameraActive, onScan]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full flex flex-col gap-3">
      {/* Viewfinder Window */}
      <div className="relative w-full h-72 sm:h-80 bg-[#060a12] rounded-2xl border-2 border-emerald-500/30 flex flex-col items-center justify-center overflow-hidden shadow-inner">
        {/* Hidden Canvas used for frame decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {isCameraActive ? (
          <>
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Scanning Laser Guide */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse-slow pointer-events-none" />

            {/* Corner Reticles */}
            <div
              className={`absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 transition-colors pointer-events-none ${
                recentScan ? "border-emerald-400 scale-110 shadow-[0_0_10px_#10b981]" : "border-emerald-500/70"
              }`}
            />
            <div
              className={`absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 transition-colors pointer-events-none ${
                recentScan ? "border-emerald-400 scale-110 shadow-[0_0_10px_#10b981]" : "border-emerald-500/70"
              }`}
            />
            <div
              className={`absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 transition-colors pointer-events-none ${
                recentScan ? "border-emerald-400 scale-110 shadow-[0_0_10px_#10b981]" : "border-emerald-500/70"
              }`}
            />
            <div
              className={`absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 transition-colors pointer-events-none ${
                recentScan ? "border-emerald-400 scale-110 shadow-[0_0_10px_#10b981]" : "border-emerald-500/70"
              }`}
            />

            {/* Center Crosshair Target */}
            <div className="w-48 h-48 rounded-xl border border-dashed border-emerald-500/40 pointer-events-none flex items-center justify-center">
              {recentScan ? (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/90 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>QR Captured!</span>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400/80 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  Align QR Within Frame
                </span>
              )}
            </div>

            {/* Live Indicator Pill */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE CAM ACTIVE</span>
            </div>
          </>
        ) : (
          /* Camera Idle / Placeholder State */
          <div className="flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-white">Camera Scanner Standby</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Activate your device webcam or back camera to enable continuous optical scanning of resident QR passes.
            </p>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-xs max-w-sm text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Controls Bar */}
      <div className="flex items-center justify-between gap-3">
        {isCameraActive ? (
          <>
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextMode = facingMode === "environment" ? "user" : "environment";
                setFacingMode(nextMode);
                stopCamera();
                setTimeout(() => startCamera(), 100);
              }}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
              title="Flip Camera (Front/Back)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip ({facingMode === "environment" ? "Back" : "Front"})</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Start Optical Camera Scanner</span>
          </button>
        )}
      </div>
    </div>
  );
}
