'use client';

import React, { useState } from 'react';
import { PracticeWithComputed, PracticeActivity } from '@/types';

interface QuickActivityModalProps {
  isOpen: boolean;
  practice: PracticeWithComputed | null;
  onClose: () => void;
  onSave: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
}

const QuickActivityModal: React.FC<QuickActivityModalProps> = ({
  isOpen,
  practice,
  onClose,
  onSave
}) => {
  const [notes, setNotes] = useState('');
  const [includeFollowUp, setIncludeFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');

  if (!isOpen || !practice) return null;

  const handleSave = () => {
    const activity: Omit<PracticeActivity, 'id' | 'createdAt'> = {
      practiceId: practice.id,
      date: new Date().toISOString(),
      notes: notes.trim(),
      userId: 'current-user', // TODO: Get from auth context
      isIssue: false
    };

    onSave(activity);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setNotes('');
    setIncludeFollowUp(false);
    setFollowUpDate('');
    setFollowUpTime('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">Quick Activity Log</h2>
            <p className="text-sm text-muted-foreground truncate">{practice.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Practice Quick Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-sm text-foreground">{practice.address}</span>
            </div>
            {practice.contacts && practice.contacts.length > 0 ? (
              <div className="space-y-1">
                {practice.contacts.slice(0, 2).map(contact => (
                  <div key={contact.id} className="flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {contact.phone}
                    </a>
                    {contact.name && (
                      <span className="text-xs text-muted-foreground">({contact.name})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : practice.phone ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <a href={`tel:${practice.phone}`} className="text-sm text-primary hover:underline">
                  {practice.phone}
                </a>
              </div>
            ) : null}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="quick-notes" className="block text-sm font-medium mb-2">
              Activity Notes
            </label>
            <textarea
              id="quick-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md resize-none bg-background"
              rows={6}
              placeholder="Enter activity notes (e.g., called practice, sent email, left voicemail...)..."
              autoFocus
            />
          </div>

          {/* Follow-up Section */}
          <div className="border-t border-border pt-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={includeFollowUp}
                onChange={(e) => setIncludeFollowUp(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Schedule Follow-up</span>
            </label>

            {includeFollowUp && (
              <div className="space-y-3 pl-6">
                <div>
                  <label htmlFor="follow-up-date" className="block text-xs text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="follow-up-date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="follow-up-time" className="block text-xs text-muted-foreground mb-1">
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    id="follow-up-time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!notes.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Save Activity
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickActivityModal;
