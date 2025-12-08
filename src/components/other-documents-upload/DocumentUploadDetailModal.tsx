'use client';

import React, { useState, useEffect } from 'react';

export type DocumentUploadStatus = 'in Prüfung' | 'Nicht lesbar' | 'Bestätigt';
export type DocumentType = 'Zuzahlungsbefreiung' | 'Patienteninformationsbogen' | 'Honorarvereinbarung' | 'Andere';

export interface Note {
  id: string;
  author: string;
  role: 'Admin' | 'Therapist';
  timestamp: string;
  text: string;
}

interface DocumentUpload {
  id: string;
  uploadId: string;
  documentType: DocumentType;
  uploadedBy: string;
  uploadedById: string;
  uploadDate: string;
  fileName: string;
  imageUrl: string;
  status: DocumentUploadStatus;
  notes: Note[];
}

interface DocumentUploadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: DocumentUpload | null;
  isAdmin: boolean;
  currentUser: { name: string; role: 'Admin' | 'Therapist' };
  onSave: (uploadId: string, status: DocumentUploadStatus) => void;
  onAddNote: (uploadId: string, note: Note) => void;
  onReplaceImage: (uploadId: string, file: File) => void;
}

// Format date in German 12-hour format
const formatGermanDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year}, ${hours}:${minutes} ${ampm}`;
};

export default function DocumentUploadDetailModal({
  isOpen,
  onClose,
  upload,
  isAdmin,
  currentUser,
  onSave,
  onAddNote,
  onReplaceImage,
}: DocumentUploadDetailModalProps) {
  const [status, setStatus] = useState<DocumentUploadStatus>('in Prüfung');
  const [newNoteText, setNewNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [showReplaceUI, setShowReplaceUI] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (upload) {
      setStatus(upload.status);
      setLocalNotes(upload.notes ?? []);
    }
  }, [upload]);

  if (!isOpen || !upload) return null;

  const handleSave = () => {
    onSave(upload.id, status);
    onClose();
  };

  const handleClose = () => {
    // Reset to original values
    if (upload) {
      setStatus(upload.status);
      setNewNoteText('');
      setShowReplaceUI(false);
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
    return formatGermanDateTime(timestamp);
  };

  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && upload) {
      // Persist to parent component
      onReplaceImage(upload.id, file);

      // Reset replace UI state
      setShowReplaceUI(false);

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
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
              Document Image
            </label>

            {!showReplaceUI ? (
              <>
                <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{ minHeight: '400px' }}>
                  <img
                    src={upload.imageUrl}
                    alt="Document"
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
                {!isAdmin && (
                  <button
                    onClick={() => setShowReplaceUI(true)}
                    className="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Replace Image
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Camera Mockup */}
                <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
                  {/* Camera viewfinder overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-b border-white/20"></div>
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-b border-white/20"></div>
                      <div className="border-r border-white/20"></div>
                      <div className="border-r border-white/20"></div>
                      <div></div>
                    </div>

                    {/* Camera icon */}
                    <div className="relative z-10 text-center">
                      <svg
                        className="mx-auto h-24 w-24 text-white/80"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="mt-3 text-sm text-white/90 font-medium">Camera View</p>
                    </div>
                  </div>

                  {/* Corner brackets for focus */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReplaceUI(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload File
                  </button>
                </div>
              </div>
            )}

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
              <label className="block text-sm font-medium text-gray-700">Dokument-ID:</label>
              <p className="mt-1 text-base font-mono font-semibold text-blue-600">{upload.uploadId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dokumenttyp:</label>
              <p className="mt-1 text-sm text-gray-900">{upload.documentType}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hochgeladen von:</label>
              <p className="mt-1 text-sm text-gray-900">{upload.uploadedBy}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Datum:</label>
              <p className="mt-1 text-sm text-gray-900">{formatGermanDateTime(upload.uploadDate)}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dateiname:</label>
              <p className="mt-1 text-sm text-gray-900 truncate" title={upload.fileName}>
                {upload.fileName}
              </p>
            </div>
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

        {/* Admin Status Section */}
        {isAdmin && (
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="space-y-4">
              {/* Status Dropdown */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentUploadStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="in Prüfung">in Prüfung</option>
                  <option value="Nicht lesbar">Nicht lesbar</option>
                  <option value="Bestätigt">Bestätigt</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {isAdmin && (
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
