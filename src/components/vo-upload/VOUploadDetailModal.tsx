'use client';

import React, { useState, useEffect } from 'react';

export type VOUploadStatus = 'Pending Review' | 'Low Picture Quality' | 'Missing VO Number' | 'Uploaded to TO' | 'Other';

export interface Note {
  id: string;
  author: string;
  role: 'Admin' | 'Therapist';
  timestamp: string;
  text: string;
}

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

interface VOUploadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: VOUpload | null;
  isAdmin: boolean;
  currentUser: { name: string; role: 'Admin' | 'Therapist' };
  onSave: (uploadId: string, voNumber: string, status: VOUploadStatus) => void;
  onAddNote: (uploadId: string, note: Note) => void;
  onReplaceImage: (uploadId: string, file: File, note: Note) => void;
}

export default function VOUploadDetailModal({
  isOpen,
  onClose,
  upload,
  isAdmin,
  currentUser,
  onSave,
  onAddNote,
  onReplaceImage,
}: VOUploadDetailModalProps) {
  const [voNumber, setVoNumber] = useState('');
  const [status, setStatus] = useState<VOUploadStatus>('Pending Review');
  const [newNoteText, setNewNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (upload) {
      setVoNumber(upload.voNumber || '');
      setStatus(upload.status);
      setLocalNotes(upload.notes);
    }
  }, [upload]);

  if (!isOpen || !upload) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleSave = () => {
    onSave(upload.id, voNumber, status);
    onClose();
  };

  const handleClose = () => {
    // Reset to original values
    if (upload) {
      setVoNumber(upload.voNumber || '');
      setStatus(upload.status);
      setNewNoteText('');
    }
    onClose();
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      timestamp: new Date().toISOString(),
      text: newNoteText.trim(),
    };

    // Update local state immediately for instant UI feedback
    setLocalNotes([...localNotes, newNote]);

    // Persist to parent component
    onAddNote(upload.id, newNote);

    setNewNoteText('');
  };

  const formatNoteTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && upload) {
      // Create system note
      const now = new Date();
      const systemNote: Note = {
        id: `note-${Date.now()}`,
        author: currentUser.name,
        role: currentUser.role,
        timestamp: now.toISOString(),
        text: `Image replaced by ${currentUser.name} on ${formatNoteTimestamp(now.toISOString())}`,
      };

      // Update local state immediately for instant UI feedback
      setLocalNotes([...localNotes, systemNote]);

      // Persist to parent component
      onReplaceImage(upload.id, file, systemNote);

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Prescription Image Details</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Image Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription Image
            </label>
            <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{ minHeight: '400px' }}>
              <img
                src={upload.imageUrl}
                alt="Prescription"
                className="w-full h-full object-contain"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Replace Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleReplaceImage}
              className="hidden"
            />
          </div>

          {/* Upload Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Uploaded By:</label>
              <p className="mt-1 text-sm text-gray-900">{upload.uploadedBy}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Date:</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(upload.uploadDate)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">File Name:</label>
              <p className="mt-1 text-sm text-gray-900 truncate" title={upload.fileName}>
                {upload.fileName}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="voNumberInput" className="block text-sm font-medium text-gray-700">
                VO Number:
              </label>
              <input
                type="text"
                id="voNumberInput"
                value={voNumber}
                onChange={(e) => setVoNumber(e.target.value)}
                placeholder="Enter VO number (e.g., 2155-10)"
                disabled={!isAdmin}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isAdmin ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                {isAdmin
                  ? 'If therapist did not provide VO number, you can add it here'
                  : 'Only admins can edit VO number'}
              </p>
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VOUploadStatus)}
              disabled={!isAdmin}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isAdmin ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white'
              }`}
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Low Picture Quality">Low Picture Quality</option>
              <option value="Missing VO Number">Missing VO Number</option>
              <option value="Uploaded to TO">Uploaded to TO</option>
              <option value="Other">Other</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {isAdmin
                ? 'Select the appropriate status for this prescription upload'
                : 'Only admins can change status'}
            </p>
          </div>

          {/* Notes History */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Notes
            </label>
            <div className="border border-gray-200 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
              {localNotes.length === 0 ? (
                <div className="p-8 text-center">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No notes yet</p>
                  <p className="text-xs text-gray-500">Start the conversation by adding a note below</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {localNotes
                    .slice()
                    .reverse()
                    .map((note) => (
                      <div
                        key={note.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900">
                              {note.author}
                            </span>
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                                note.role === 'Admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {note.role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatNoteTimestamp(note.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{note.text}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Note */}
          <div>
            <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 mb-2">
              Add Note
            </label>
            <div className="space-y-2">
              <textarea
                id="newNote"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                placeholder="Type your note here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  newNoteText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Add Note
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Notes are saved immediately and visible to both therapists and admins
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          {isAdmin && (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

