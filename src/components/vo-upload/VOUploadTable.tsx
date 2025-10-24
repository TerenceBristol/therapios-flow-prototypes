'use client';

import React from 'react';
import { VOUploadStatus, Note } from './VOUploadDetailModal';

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

interface VOUploadTableProps {
  uploads: VOUpload[];
  onViewUpload: (upload: VOUpload) => void;
}

export default function VOUploadTable({ uploads, onViewUpload }: VOUploadTableProps) {
  const getStatusBadgeColor = (status: VOUploadStatus) => {
    switch (status) {
      case 'Hochgeladen – in Prüfung':
        return 'bg-amber-300 text-amber-900';
      case 'Nicht lesbar':
        return 'bg-orange-400 text-orange-900';
      case 'Fehlende Upload-ID':
        return 'bg-red-400 text-red-900';
      case 'Angelegt':
        return 'bg-green-400 text-green-900';
      case 'Sonstiges':
        return 'bg-gray-400 text-gray-900';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (uploads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No uploads yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading a prescription.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Upload ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Nr</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Uploaded By</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Upload Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">TO Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Image</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {uploads.map((upload) => (
              <tr key={upload.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                  {upload.uploadId}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {upload.voNumber || (
                    <span className="text-gray-400 italic text-xs">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900">{upload.uploadedBy}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {formatDate(upload.uploadDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeColor(
                      upload.status
                    )}`}
                  >
                    {upload.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {upload.toDate ? formatDate(upload.toDate) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {upload.notes.length > 0 ? (
                    <span
                      className="text-sm"
                      title={
                        upload.notes.length > 0
                          ? `Latest: ${upload.notes[upload.notes.length - 1].text}`
                          : ''
                      }
                    >
                      {upload.notes.length} note{upload.notes.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewUpload(upload)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Info */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{uploads.length}</span> upload{uploads.length !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-500">
          1-{uploads.length} of {uploads.length}
        </div>
      </div>
    </div>
  );
}

