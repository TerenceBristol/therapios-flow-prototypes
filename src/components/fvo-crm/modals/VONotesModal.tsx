'use client';

import React, { useState } from 'react';
import { PracticeVO, VONoteEntry } from '@/types';

interface VONotesModalProps {
  isOpen: boolean;
  vo: PracticeVO;
  onClose: () => void;
  onAddNote: (voId: string, note: string) => void;
  onEditNote: (voId: string, noteIndex: number, newText: string) => void;
  onDeleteNote: (voId: string, noteIndex: number) => void;
}

const VONotesModal: React.FC<VONotesModalProps> = ({
  isOpen,
  vo,
  onClose,
  onAddNote,
  onEditNote,
  onDeleteNote
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  const handleAddNote = () => {
    if (newNoteText.trim().length >= 5) {
      onAddNote(vo.id, newNoteText.trim());
      setNewNoteText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddNote();
    }
  };

  const handleStartEdit = (index: number, text: string) => {
    setEditingIndex(sortedNotes.length - 1 - index); // Convert display index to actual noteHistory index
    setEditText(text);
  };

  const handleSaveEdit = () => {
    if (editText.trim().length >= 5 && editingIndex !== null) {
      onEditNote(vo.id, editingIndex, editText.trim());
      setEditingIndex(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const handleDelete = (index: number) => {
    const actualIndex = sortedNotes.length - 1 - index; // Convert display index to actual noteHistory index
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      onDeleteNote(vo.id, actualIndex);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 1 hour: "5 minutes ago"
    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    }
    // Less than 24 hours: "3 hours ago"
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    // Less than 7 days: "2 days ago"
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    // Otherwise: full date
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get notes in reverse chronological order (newest first)
  const sortedNotes = [...(vo.noteHistory || [])].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Notes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {vo.patientName} • {vo.therapyType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Close"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Add Note Form */}
        <div className="p-6 border-b border-border bg-muted/20">
          <label className="block text-sm font-medium mb-2">
            Add New Note
            <span className="text-muted-foreground ml-2">
              ({newNoteText.length}/500 characters)
            </span>
          </label>
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            maxLength={500}
            placeholder="Enter note (5-500 characters)... Press Cmd/Ctrl+Enter to save"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setNewNoteText('')}
              disabled={!newNoteText}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              onClick={handleAddNote}
              disabled={newNoteText.trim().length < 5}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Note
            </button>
          </div>
        </div>

        {/* Notes History */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No notes yet</p>
              <p className="text-sm mt-1">Add your first note above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedNotes.map((note, index) => {
                const actualIndex = sortedNotes.length - 1 - index;
                const isEditing = editingIndex === actualIndex;

                return (
                  <div
                    key={index}
                    className="bg-muted/30 rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {note.userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {note.userId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(note.timestamp)}
                          </div>
                        </div>
                      </div>
                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(index, note.text)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Edit note"
                            aria-label="Edit note"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete note"
                            aria-label="Delete note"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="ml-10 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                          maxLength={500}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={editText.trim().length < 5}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-foreground whitespace-pre-wrap ml-10">
                        {note.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VONotesModal;
