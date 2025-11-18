import React, { useState } from 'react';
import { PracticeActivity } from '@/types';

interface ActiveIssueCardProps {
  activity: PracticeActivity;
  onResolve: (activityId: string, notes?: string) => void;
}

const ActiveIssueCard: React.FC<ActiveIssueCardProps> = ({ activity, onResolve }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleResolveClick = () => {
    setIsResolving(true);
  };

  const handleConfirm = () => {
    onResolve(activity.id, resolutionNotes.trim() || undefined);
    setIsResolving(false);
    setResolutionNotes('');
  };

  const handleCancel = () => {
    setIsResolving(false);
    setResolutionNotes('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-2">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          {/* Issue Content */}
          <div className="flex-1 min-w-0">
            {/* Issue Notes */}
            <p className="text-foreground text-sm mb-1.5">{activity.notes}</p>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(activity.date)}</span>
              <span>•</span>
              <span>{formatTime(activity.date)}</span>
            </div>
          </div>

          {/* Resolve Button */}
          {!isResolving && (
            <div className="flex-shrink-0">
              <button
                onClick={handleResolveClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Resolve
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Resolution Form */}
      {isResolving && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Resolution notes (optional)
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add any notes about resolving this issue..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Confirm Resolution
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveIssueCard;
