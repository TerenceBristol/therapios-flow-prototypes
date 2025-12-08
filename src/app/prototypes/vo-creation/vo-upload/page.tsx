'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

export default function VOUploadPage() {
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
      pending: uploads.filter((u) => u.status === 'in Prüfung').length,
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground mb-1">Hello Admin Admin, I hope you have a wonderful day.</p>
          <h1 className="text-2xl font-bold text-foreground">Prescription Uploads - Administration</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
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
            <option value="in Prüfung">in Prüfung ({statusCounts.pending})</option>
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
      <div className="bg-background border border-border rounded-lg overflow-hidden">
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
