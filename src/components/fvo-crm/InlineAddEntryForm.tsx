import React, { useState } from 'react';
import { PracticeActivity, PracticeFollowUp, IssueType } from '@/types';

const ISSUE_TYPES: readonly IssueType[] = [
  'Practice Paused Patient',
  'Cannot Reach Practice',
  'VOs Promised Not Received',
  'VOs Sent - Unknown Destination',
  'Other'
] as const;

interface InlineAddEntryFormProps {
  practiceId: string;
  onAddActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
  onAddFollowUp: (followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => void;
  initialMode?: 'activity' | 'followUp';
}

const InlineAddEntryForm: React.FC<InlineAddEntryFormProps> = ({
  practiceId,
  onAddActivity,
  onAddFollowUp,
  initialMode = 'activity'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mode, setMode] = useState<'activity' | 'followUp'>(initialMode);
  const [notes, setNotes] = useState('');
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const handleSubmit = () => {
    if (!notes.trim()) return;

    if (mode === 'activity') {
      const isIssue = issueType !== '';
      onAddActivity({
        practiceId,
        date: new Date().toISOString(),
        notes: notes.trim(),
        userId: 'current-user', // TODO: Get from auth context
        isIssue,
        issueType: issueType || undefined,
        issueStatus: isIssue ? 'active' : undefined,
        resolvedAt: undefined,
        resolvedBy: undefined
      });
    } else {
      if (!dueDate) return;
      onAddFollowUp({
        practiceId,
        dueDate,
        dueTime: dueTime || undefined,
        notes: notes.trim(),
        userId: 'current-user' // TODO: Get from auth context
      });
    }

    // Reset form (keep expanded)
    setNotes('');
    setIssueType('');
    setDueDate('');
    setDueTime('');
  };

  const handleCancel = () => {
    setNotes('');
    setIssueType('');
    setDueDate('');
    setDueTime('');
  };

  const handleModeChange = (newMode: 'activity' | 'followUp') => {
    setMode(newMode);
    // Reset fields when switching modes
    setNotes('');
    setIssueType('');
    setDueDate('');
    setDueTime('');
  };

  return (
    <div className="mb-4">
      {/* Collapsed State - Trigger Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Activity or Next Activity
        </button>
      )}

      {/* Expanded State - Form */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          {/* Form Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {mode === 'activity' ? 'Add Activity' : 'Add Next Activity'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4">
            {/* Mode Toggle */}
            <div className="flex gap-1 mb-3 p-1 bg-muted rounded-lg">
              <button
                onClick={() => handleModeChange('activity')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === 'activity'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => handleModeChange('followUp')}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === 'followUp'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Next Activity
              </button>
            </div>

            {/* Activity Form */}
            {mode === 'activity' && (
              <>
                <div className="mb-3">
                  <label htmlFor="activityNotes" className="block text-xs font-medium text-foreground mb-1.5">
                    Notes
                  </label>
                  <textarea
                    id="activityNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="issueType" className="block text-xs font-medium text-foreground mb-1.5">
                    Issue Type (optional)
                  </label>
                  <select
                    id="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType | '')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">None (Regular Activity)</option>
                    {ISSUE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Follow-Up Form */}
            {mode === 'followUp' && (
              <>
                <div className="mb-3">
                  <label htmlFor="dueDate" className="block text-xs font-medium text-foreground mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="dueTime" className="block text-xs font-medium text-foreground mb-1.5">
                    Due Time (optional)
                  </label>
                  <input
                    type="time"
                    id="dueTime"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="followUpNotes" className="block text-xs font-medium text-foreground mb-1.5">
                    Notes
                  </label>
                  <textarea
                    id="followUpNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What needs to be done..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/20">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 border border-border rounded-md text-xs text-foreground hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!notes.trim() || (mode === 'followUp' && !dueDate)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineAddEntryForm;
