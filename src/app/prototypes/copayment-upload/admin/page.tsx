'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import copaymentUploadDataJson from '@/data/copaymentUploadData.json';
import CopaymentUploadTable from '@/components/copayment-upload/CopaymentUploadTable';
import CopaymentUploadDetailModal, { CopaymentUploadStatus, Note } from '@/components/copayment-upload/CopaymentUploadDetailModal';

const STORAGE_KEY = 'copayment-upload-wireframe-data';

interface CopaymentUpload {
  id: string;
  uploadId: string;
  uploadedBy: string;
  uploadedById: string;
  uploadDate: string;
  fileName: string;
  imageUrl: string;
  status: CopaymentUploadStatus;
  notes: Note[];
}

export default function AdminCopaymentUploadPage() {
  const [uploads, setUploads] = useState<CopaymentUpload[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<CopaymentUpload | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize from sessionStorage or mock data
  useEffect(() => {
    const storedData = sessionStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Migrate old data: ensure all uploads have notes array
        const migrated = parsed.map((upload: any) => ({
          ...upload,
          notes: upload.notes ?? []
        }));
        setUploads(migrated);
      } catch (error) {
        console.error('Failed to parse sessionStorage data:', error);
        setUploads(copaymentUploadDataJson as CopaymentUpload[]);
      }
    } else {
      setUploads(copaymentUploadDataJson as CopaymentUpload[]);
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

    // Filter by search query (Copayment Batch ID or therapist name)
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
      confirmed: uploads.filter((u) => u.status === 'Bestätigt').length,
    };
  }, [uploads]);

  const handleViewUpload = (upload: CopaymentUpload) => {
    setSelectedUpload(upload);
    setIsDetailModalOpen(true);
  };

  const handleSaveUpload = (uploadId: string, status: CopaymentUploadStatus) => {
    setUploads(
      uploads.map((u) => {
        if (u.id === uploadId) {
          return { ...u, status };
        }
        return u;
      })
    );
  };

  const handleReplaceImage = (uploadId: string, file: File) => {
    setUploads(
      uploads.map((u) =>
        u.id === uploadId
          ? {
              ...u,
              fileName: file.name,
              imageUrl: '/sample-vo-slip.jpg', // In production, this would be the uploaded image URL
            }
          : u
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-6">
              <Link
                href="/prototypes/copayment-upload/admin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-3 -mb-[1px]"
                >
                  Upload Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50">
                        Copayment
                      </div>
                      <div className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                        Prescription
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/prototypes/copayment-upload/therapist"
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
            <h1 className="text-2xl font-bold text-gray-900">Copayment Uploads - Administration</h1>
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
              <option value="in Prüfung">in Prüfung ({statusCounts.pending})</option>
              <option value="Nicht lesbar">Nicht lesbar ({statusCounts.lowQuality})</option>
              <option value="Bestätigt">Bestätigt ({statusCounts.confirmed})</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Copayment Batch ID or therapist..."
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
        <CopaymentUploadTable uploads={filteredUploads} onViewUpload={handleViewUpload} />
      </div>

      {/* Detail Modal */}
      <CopaymentUploadDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        upload={selectedUpload}
        isAdmin={true}
        currentUser={{ name: 'Admin Admin', role: 'Admin' }}
        onSave={handleSaveUpload}
        onReplaceImage={handleReplaceImage}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
