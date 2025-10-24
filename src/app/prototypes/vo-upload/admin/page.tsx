'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import voUploadDataJson from '@/data/voUploadData.json';
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

export default function AdminVOUploadPage() {
  const [uploads, setUploads] = useState<VOUpload[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<VOUpload | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter uploads based on status filter and sort by upload date (newest first)
  const filteredUploads = useMemo(() => {
    let filtered = uploads;

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter((upload) => upload.status === statusFilter);
    }

    // Filter by search query (Upload ID or therapist name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (upload) =>
          upload.uploadId.toLowerCase().includes(query) ||
          upload.uploadedBy.toLowerCase().includes(query)
      );
    }

    // Sort by upload date (newest first)
    return filtered.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [uploads, statusFilter, searchQuery]);

  // Count uploads by status
  const statusCounts = useMemo(() => {
    return {
      all: uploads.length,
      pending: uploads.filter((u) => u.status === 'Hochgeladen – in Prüfung').length,
      lowQuality: uploads.filter((u) => u.status === 'Nicht lesbar').length,
      missingVO: uploads.filter((u) => u.status === 'Fehlende Upload-ID').length,
      uploaded: uploads.filter((u) => u.status === 'Angelegt').length,
      other: uploads.filter((u) => u.status === 'Sonstiges').length,
    };
  }, [uploads]);

  const handleViewUpload = (upload: VOUpload) => {
    setSelectedUpload(upload);
    setIsDetailModalOpen(true);
  };

  const handleSaveUpload = (uploadId: string, voNumber: string, status: VOUploadStatus) => {
    setUploads(
      uploads.map((u) => {
        if (u.id === uploadId) {
          // Auto-set/clear toDate based on status
          let toDate = u.toDate;

          // If status changed to "Angelegt", set toDate to current timestamp
          if (status === 'Angelegt' && u.status !== 'Angelegt') {
            toDate = new Date().toISOString();
          }
          // If status changed away from "Angelegt", clear toDate
          else if (status !== 'Angelegt' && u.status === 'Angelegt') {
            toDate = undefined;
          }

          return { ...u, voNumber, status, toDate };
        }
        return u;
      })
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-6">
              <Link
                href="/prototypes/vo-upload/admin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/prototypes/vo-upload/admin"
                className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-3 -mb-[1px]"
              >
                Prescription Upload
              </Link>
            </div>
            <Link
              href="/prototypes/vo-upload/therapist"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Switch to Therapist View
            </Link>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Prescription Uploads - Administration</h1>
            <div className="text-sm text-gray-600">
              Hello Admin Admin, I hope you have a wonderful day.
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[200px]"
            >
              <option value="All">All ({statusCounts.all})</option>
              <option value="Hochgeladen – in Prüfung">Hochgeladen – in Prüfung ({statusCounts.pending})</option>
              <option value="Nicht lesbar">Nicht lesbar ({statusCounts.lowQuality})</option>
              <option value="Fehlende Upload-ID">Fehlende Upload-ID ({statusCounts.missingVO})</option>
              <option value="Angelegt">Angelegt ({statusCounts.uploaded})</option>
              <option value="Sonstiges">Sonstiges ({statusCounts.other})</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Upload ID or therapist..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <VOUploadTable uploads={filteredUploads} onViewUpload={handleViewUpload} />
      </div>

      {/* Detail Modal */}
      <VOUploadDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        upload={selectedUpload}
        isAdmin={true}
        currentUser={{ name: 'Admin Admin', role: 'Admin' }}
        onSave={handleSaveUpload}
        onAddNote={handleAddNote}
        onReplaceImage={handleReplaceImage}
      />
    </div>
  );
}

