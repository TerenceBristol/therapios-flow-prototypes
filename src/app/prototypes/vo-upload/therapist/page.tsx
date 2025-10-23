'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import voUploadDataJson from '@/data/voUploadData.json';
import UploadPrescriptionModal from '@/components/vo-upload/UploadPrescriptionModal';
import VOUploadTable from '@/components/vo-upload/VOUploadTable';
import VOUploadDetailModal, { VOUploadStatus, Note } from '@/components/vo-upload/VOUploadDetailModal';

const STORAGE_KEY = 'vo-upload-wireframe-data';

interface VOUpload {
  id: string;
  voNumber?: string;
  uploadedBy: string;
  uploadedById: string;
  uploadDate: string;
  fileName: string;
  imageUrl: string;
  status: VOUploadStatus;
  notes: Note[];
}

export default function TherapistVOUploadPage() {
  // Current logged-in therapist
  const currentTherapist = 'S. Zeibig';
  const currentTherapistId = 'therapist-001';

  const [uploads, setUploads] = useState<VOUpload[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<VOUpload | null>(null);
  const [activeTab, setActiveTab] = useState<'open' | 'uploads'>('uploads');

  // Initialize from localStorage or mock data
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setUploads(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse localStorage data:', error);
        setUploads(voUploadDataJson as VOUpload[]);
      }
    } else {
      setUploads(voUploadDataJson as VOUpload[]);
    }
  }, []);

  // Sync to localStorage whenever uploads change
  useEffect(() => {
    if (uploads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
    }
  }, [uploads]);

  // Filter uploads for current therapist and sort by upload date (newest first)
  const therapistUploads = uploads
    .filter((upload) => upload.uploadedById === currentTherapistId)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const handleUpload = (voNumber: string, file: File) => {
    const newUpload: VOUpload = {
      id: `upload-${Date.now()}`,
      voNumber: voNumber || undefined,
      uploadedBy: currentTherapist,
      uploadedById: currentTherapistId,
      uploadDate: new Date().toISOString(),
      fileName: file.name,
      imageUrl: '/sample-vo-slip.jpg',
      status: 'Pending Review',
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
      {/* View Switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Link
              href="/prototypes/vo-upload/therapist"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
            >
              Therapist View
            </Link>
            <Link
              href="/prototypes/vo-upload/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Admin View
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
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
                onClick={() => setIsUploadModalOpen(true)}
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

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('open')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'open'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Open Prescriptions (21)
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'uploads'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Uploads ({therapistUploads.length})
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Shared Prescriptions (5)
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Closed Prescriptions (169)
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'open' && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Open Prescriptions View</h3>
            <p className="mt-2 text-sm text-gray-500">
              This tab shows your open prescriptions (static for wireframe purposes).
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Switch to the &quot;My Uploads&quot; tab to see the VO Upload functionality.
            </p>
          </div>
        )}

        {activeTab === 'uploads' && (
          <VOUploadTable uploads={therapistUploads} onViewUpload={handleViewUpload} />
        )}
      </div>

      {/* Modals */}
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

