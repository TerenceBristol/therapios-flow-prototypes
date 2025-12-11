'use client';

import React from 'react';
import { ImageViewer } from './ImageViewer';

interface ImageSidebarProps {
  imageUrl: string | null;
  onImageUpload?: (file: File) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function ImageSidebar({
  imageUrl,
  onImageUpload,
  onClose,
  isOpen,
}: ImageSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="w-1/2 flex-shrink-0 border-l border-gray-200 bg-gray-50 sticky top-0 h-screen overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Rezept Bild</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Schließen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Image Viewer */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <ImageViewer
            src={imageUrl}
            alt="Rezept"
            onImageChange={onImageUpload}
            allowUpload={true}
          />
        </div>

        {/* Caption */}
        <p className="mt-3 text-xs text-gray-500 text-center">
          {imageUrl
            ? 'Ursprüngliches Rezept-Bild aus dem Upload'
            : 'Noch kein Bild hochgeladen'
          }
        </p>
      </div>
    </div>
  );
}

export default ImageSidebar;
