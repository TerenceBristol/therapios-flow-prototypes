import React, { useState } from 'react';
import { PracticeActivity } from '@/types';

interface ResolveIssueModalProps {
  isOpen: boolean;
  issue: PracticeActivity | null;
  onClose: () => void;
  onResolve: (activityId: string, resolvedBy: string) => void;
}

const ResolveIssueModal: React.FC<ResolveIssueModalProps> = ({ isOpen, issue, onClose, onResolve }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!isOpen || !issue) return null;

  const handleResolve = () => {
    onResolve(issue.id, 'current-user'); // TODO: Get from auth context
    setResolutionNotes('');
    onClose();
  };

  const handleCancel = () => {
    setResolutionNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Resolve Issue</h2>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Issue Details */}
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-medium text-orange-900 mb-1">Issue:</p>
            <p className="text-foreground">{issue.notes}</p>
          </div>

          {/* Resolution Notes (Optional) */}
          <div className="mb-4">
            <label htmlFor="resolutionNotes" className="block text-sm font-medium text-foreground mb-2">
              Resolution Notes (Optional)
            </label>
            <textarea
              id="resolutionNotes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add any notes about how this issue was resolved..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-900">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>
              This issue will be marked as resolved and moved to the activity history.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Resolve Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolveIssueModal;
