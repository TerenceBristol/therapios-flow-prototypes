'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import voUploadDataJson from '@/data/voUploadData.json';
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

export default function AdminVOUploadPage() {
  const [uploads, setUploads] = useState<VOUpload[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<VOUpload | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter uploads based on status filter and sort by upload date (newest first)
  const filteredUploads = useMemo(() => {
    let filtered = uploads;

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter((upload) => upload.status === statusFilter);
    }

    // Filter by search query (VO number or therapist name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (upload) =>
          upload.voNumber?.toLowerCase().includes(query) ||
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
      pending: uploads.filter((u) => u.status === 'Pending Review').length,
      lowQuality: uploads.filter((u) => u.status === 'Low Picture Quality').length,
      missingVO: uploads.filter((u) => u.status === 'Missing VO Number').length,
      uploaded: uploads.filter((u) => u.status === 'Uploaded to TO').length,
      other: uploads.filter((u) => u.status === 'Other').length,
    };
  }, [uploads]);

  const handleViewUpload = (upload: VOUpload) => {
    setSelectedUpload(upload);
    setIsDetailModalOpen(true);
  };

  const handleSaveUpload = (uploadId: string, voNumber: string, status: VOUploadStatus) => {
    setUploads(
      uploads.map((u) =>
        u.id === uploadId ? { ...u, voNumber, status } : u
      )
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
      {/* View Switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Link
              href="/prototypes/vo-upload/therapist"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Therapist View
            </Link>
            <Link
              href="/prototypes/vo-upload/admin"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
            >
              Admin View
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard - Administration</h1>
            <div className="text-sm text-gray-600">
              Hello Admin Admin, I hope you have a wonderful day.
            </div>
          </div>

          {/* Stats Tabs */}
          <div className="flex gap-6 overflow-x-auto pb-2">
            <button className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Follow-up VO Received <span className="font-medium">5968</span>
            </button>
            <button className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Keine Folge-VO <span className="font-medium">166</span>
            </button>
            <button className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Treatment Completed <span className="font-medium">226</span>
            </button>
            <button className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Arztbericht zu versenden <span className="font-medium">98</span>
            </button>
            <button className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Patient Transfers <span className="font-medium">91</span>
            </button>
            <button className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap">
              Prescription Uploads <span className="font-medium">{uploads.length}</span>
            </button>
            <button className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
              All VO <span className="font-medium">12847</span>
            </button>
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
              <option value="Pending Review">Pending Review ({statusCounts.pending})</option>
              <option value="Low Picture Quality">Low Picture Quality ({statusCounts.lowQuality})</option>
              <option value="Missing VO Number">Missing VO Number ({statusCounts.missingVO})</option>
              <option value="Uploaded to TO">Uploaded to TO ({statusCounts.uploaded})</option>
              <option value="Other">Other ({statusCounts.other})</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by VO number or therapist..."
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

