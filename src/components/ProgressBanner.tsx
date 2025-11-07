"use client";

import { useEffect, useRef, useState } from "react";

import { config } from "../config/app";

interface ProgressBannerProps {
  src: string;
  alt: string;
  progress: number; // 0-100
  className?: string;
  showProgressLine?: boolean;
  animationDuration?: number; // in seconds
  animationDelay?: number; // in seconds
}

export default function ProgressBanner({
  src,
  alt,
  progress,
  className = "",
  showProgressLine = true,
  animationDuration = config.animations.duration,
  animationDelay = config.animations.delay,
}: ProgressBannerProps) {
  const pixelatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const clearCanvasRef = useRef<HTMLCanvasElement>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const pixelatedCanvas = pixelatedCanvasRef.current;
    const clearCanvas = clearCanvasRef.current;
    if (!pixelatedCanvas || !clearCanvas) return;

    const pixCtx = pixelatedCanvas.getContext('2d');
    const clearCtx = clearCanvas.getContext('2d');
    if (!pixCtx || !clearCtx) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      const rect = pixelatedCanvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Set canvas dimensions
      pixelatedCanvas.width = width;
      pixelatedCanvas.height = height;
      clearCanvas.width = width;
      clearCanvas.height = height;

      // Calculate object-cover dimensions
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = drawHeight * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      // Draw clear version
      clearCtx.imageSmoothingEnabled = true;
      clearCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Draw pixelated version
      pixCtx.imageSmoothingEnabled = false;

      const pixelFactor = 0.05;
      const smallWidth = drawWidth * pixelFactor;
      const smallHeight = drawHeight * pixelFactor;

      // Draw minimized
      pixCtx.drawImage(img, 0, 0, smallWidth, smallHeight);

      // Scale back up for pixelated effect
      pixCtx.drawImage(pixelatedCanvas, 0, 0, smallWidth, smallHeight, offsetX, offsetY, drawWidth, drawHeight);
    };
  }, [src]);

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, animationDelay * 1000);

    return () => clearTimeout(timer);
  }, [progress, animationDelay]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pixelated version with blur (full image) */}
      <canvas
        ref={pixelatedCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'blur(2px)' }}
      />

      {/* Clear version (clipped to progress %) */}
      <div
        className="absolute inset-0 ease-out"
        style={{
          clipPath: `inset(0 ${100 - animatedProgress}% 0 0)`,
          transition: `clip-path ${animationDuration}s ease-out`
        }}
      >
        <canvas
          ref={clearCanvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Progress line indicator */}
      {showProgressLine && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)] ease-out z-10"
          style={{
            left: `${animatedProgress}%`,
            transition: `left ${animationDuration}s ease-out`
          }}
        />
      )}
    </div>
  );
}
