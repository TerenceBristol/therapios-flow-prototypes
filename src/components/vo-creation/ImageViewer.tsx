'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ImageViewerProps {
  src: string | null;
  alt?: string;
  onImageChange?: (file: File) => void;
  allowUpload?: boolean;
  className?: string;
}

export function ImageViewer({
  src,
  alt = 'Image',
  onImageChange,
  allowUpload = false,
  className = '',
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan/drag state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  // Handle pan/drag for zoomed images
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 100 || !containerRef.current) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setScrollStart({
      x: containerRef.current.scrollLeft,
      y: containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    containerRef.current.scrollLeft = scrollStart.x - dx;
    containerRef.current.scrollTop = scrollStart.y - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCounterClockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && onImageChange) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageChange(file);
        // Reset zoom/rotation for new image
        setZoom(100);
        setRotation(0);
      }
    }
  }, [onImageChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onImageChange) {
      onImageChange(files[0]);
      // Reset zoom/rotation for new image
      setZoom(100);
      setRotation(0);
    }
  }, [onImageChange]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Empty state - show upload zone
  if (!src && allowUpload) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center
            min-h-[300px] border-2 border-dashed rounded-lg
            cursor-pointer transition-colors
            ${isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Rezept hochladen
          </p>
          <p className="text-xs text-gray-500">
            Klicken oder Datei hierher ziehen
          </p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    );
  }

  // No image and no upload allowed
  if (!src) {
    return (
      <div className={`flex items-center justify-center min-h-[300px] bg-gray-100 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500">Kein Bild vorhanden</p>
      </div>
    );
  }

  // Image viewer with controls
  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input for replacing image */}
      {allowUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Control toolbar */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1">
        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 50}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Verkleinern"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Vergrößern"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Rotation controls */}
        <button
          onClick={handleRotateCounterClockwise}
          className="p-1.5 rounded hover:bg-gray-100"
          title="Gegen Uhrzeigersinn drehen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4V6M3 10l4-4m0 0a8 8 0 1 1-2.3 5.66" />
          </svg>
        </button>
        <button
          onClick={handleRotateClockwise}
          className="p-1.5 rounded hover:bg-gray-100"
          title="Im Uhrzeigersinn drehen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-4V6m4 4l-4-4m0 0a8 8 0 1 0 2.3 5.66" />
          </svg>
        </button>

        {/* Replace image button */}
        {allowUpload && (
          <>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={handleUploadClick}
              className="p-1.5 rounded hover:bg-gray-100"
              title="Bild ersetzen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Image container with overflow handling and pan/drag */}
      <div
        ref={containerRef}
        className={`overflow-auto bg-gray-100 rounded-lg border border-gray-200 ${
          zoom > 100 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        style={{ maxHeight: '500px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="min-h-[300px] flex items-center justify-center p-4">
          <img
            src={src}
            alt={alt}
            className="max-w-full transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export default ImageViewer;
