'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import voUploadDataJson from '@/data/voUploadData.json';
import UploadPrescriptionModal from '@/components/vo-upload/UploadPrescriptionModal';
import UploadIDConfirmationModal from '@/components/vo-upload/UploadIDConfirmationModal';
import VOUploadTable from '@/components/vo-upload/VOUploadTable';
import VOUploadDetailModal, { VOUploadStatus, Note } from '@/components/vo-upload/VOUploadDetailModal';

const STORAGE_KEY = 'vo-upload-wireframe-data';

interface VOUpload {
  id: string;
  uploadId: string;
  voNumber?: string;
  uploadedBy: string;
  uploadedById: string;
  uploadDate: string;
  fileName: string;
  imageUrl: string;
  status: VOUploadStatus;
  toDate?: string;
  notes: Note[];
}

export default function TherapistVOUploadPage() {
  // Current logged-in therapist
  const currentTherapist = 'S. Zeibig';
  const currentTherapistId = 'therapist-001';
  const employeeNumber = '03';

  const [uploads, setUploads] = useState<VOUpload[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<VOUpload | null>(null);
  const [generatedUploadId, setGeneratedUploadId] = useState<string>('');

  // Initialize from sessionStorage or mock data
  useEffect(() => {
    const storedData = sessionStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setUploads(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse sessionStorage data:', error);
        setUploads(voUploadDataJson as VOUpload[]);
      }
    } else {
      setUploads(voUploadDataJson as VOUpload[]);
    }
  }, []);

  // Sync to sessionStorage whenever uploads change
  useEffect(() => {
    if (uploads.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
    }
  }, [uploads]);

  // Filter uploads for current therapist and sort by upload date (newest first)
  const therapistUploads = uploads
    .filter((upload) => upload.uploadedById === currentTherapistId)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  // Generate next Upload ID for current therapist
  const generateUploadId = () => {
    // Find all existing uploads for this therapist
    const therapistUploads = uploads.filter((u) => u.uploadedById === currentTherapistId);

    // Extract sequential numbers from their Upload IDs
    const existingNumbers = therapistUploads
      .map((u) => {
        const parts = u.uploadId.split('-');
        return parseInt(parts[1], 10);
      })
      .filter((n) => !isNaN(n));

    // Find the max and add 1
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;

    return `${employeeNumber}-${nextNumber}`;
  };

  const handleInitiateUpload = () => {
    const uploadId = generateUploadId();
    setGeneratedUploadId(uploadId);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmationContinue = () => {
    setIsConfirmationModalOpen(false);
    setIsUploadModalOpen(true);
  };

  const handleUpload = (file: File) => {
    const newUpload: VOUpload = {
      id: `upload-${Date.now()}`,
      uploadId: generatedUploadId,
      voNumber: undefined,
      uploadedBy: currentTherapist,
      uploadedById: currentTherapistId,
      uploadDate: new Date().toISOString(),
      fileName: file.name,
      imageUrl: '/sample-vo-slip.jpg',
      status: 'in Prüfung',
      notes: [],
    };

    setUploads([newUpload, ...uploads]);

    // Show success message (you could add a toast notification here)
    console.log('Upload successful:', newUpload);
  };

  const handleAddNote = (uploadId: string, note: Note) => {
    setUploads(
      uploads.map((u) =>
        u.id === uploadId ? { ...u, notes: [...u.notes, note] } : u
      )
    );
  };

  const handleReplaceImage = (uploadId: string, file: File, note: Note) => {
    setUploads(
      uploads.map((u) =>
        u.id === uploadId
          ? {
              ...u,
              fileName: file.name,
              imageUrl: '/sample-vo-slip.jpg', // In production, this would be the uploaded image URL
              notes: [...u.notes, note],
            }
          : u
      )
    );
  };

  const handleViewUpload = (upload: VOUpload) => {
    setSelectedUpload(upload);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-6">
              <Link
                href="/prototypes/vo-upload/therapist"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                T Board
              </Link>
              <Link
                href="/prototypes/vo-upload/therapist"
                className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-3 -mb-[1px]"
              >
                Prescription Upload
              </Link>
            </div>
            <Link
              href="/prototypes/vo-upload/admin"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Switch to Admin View
            </Link>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Therapist Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{currentTherapist}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {/* Refresh - static for wireframe */}}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                title="Refresh to see new VOs"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              
              <button
                onClick={handleInitiateUpload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Prescription
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <VOUploadTable uploads={therapistUploads} onViewUpload={handleViewUpload} />
      </div>

      {/* Modals */}
      <UploadIDConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onContinue={handleConfirmationContinue}
        uploadId={generatedUploadId}
      />
      <UploadPrescriptionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <VOUploadDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        upload={selectedUpload}
        isAdmin={false}
        currentUser={{ name: currentTherapist, role: 'Therapist' }}
        onSave={(uploadId, voNumber, status) => {
          // Therapists can't actually save (only admins)
          // This won't be called since Save button is hidden for therapists
          setUploads(
            uploads.map((u) =>
              u.id === uploadId ? { ...u, voNumber, status } : u
            )
          );
        }}
        onAddNote={handleAddNote}
        onReplaceImage={handleReplaceImage}
      />
    </div>
  );
}

