import React, { useState } from 'react';
import { PracticeFollowUp } from '@/types';

interface UpcomingFollowUpCardProps {
  followUp: PracticeFollowUp;
  onComplete: (followUpId: string, notes?: string) => void;
}

const UpcomingFollowUpCard: React.FC<UpcomingFollowUpCardProps> = ({ followUp, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCompleteClick = () => {
    setIsCompleting(true);
  };

  const handleConfirm = () => {
    onComplete(followUp.id, completionNotes.trim() || undefined);
    setIsCompleting(false);
    setCompletionNotes('');
  };

  const handleCancel = () => {
    setIsCompleting(false);
    setCompletionNotes('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3">
        <div className="flex items-start justify-between gap-4">
          {/* Follow-Up Content */}
          <div className="flex-1 min-w-0">
            {/* Notes */}
            <p className="text-foreground text-sm mb-2">{followUp.notes}</p>

            {/* Due Date/Time */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground">
                {formatDate(followUp.dueDate)}
              </span>
              {followUp.dueTime && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{followUp.dueTime}</span>
                </>
              )}
            </div>
          </div>

          {/* Complete Button */}
          {!isCompleting && (
            <div className="flex-shrink-0">
              <button
                onClick={handleCompleteClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Complete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Completion Form */}
      {isCompleting && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Completion notes (optional)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Add any notes about completing this follow-up..."
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
              Confirm Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingFollowUpCard;
