import React, { useState, useMemo } from 'react';
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
}

const InlineAddEntryForm: React.FC<InlineAddEntryFormProps> = ({
  practiceId,
  onAddActivity,
  onAddFollowUp
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [notes, setNotes] = useState('');
  const [issueType, setIssueType] = useState<IssueType | ''>('');

  // Date for the activity (time only for scheduled activities)
  const [activityDate, setActivityDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Time is optional and only for scheduled activities
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activityTime, setActivityTime] = useState('');

  // Follow-up scheduling (only for completed activities)
  const [followUpInterval, setFollowUpInterval] = useState<'1' | '3' | '5' | 'custom' | ''>('');
  const [customFollowUpDate, setCustomFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [showFollowUpTimePicker, setShowFollowUpTimePicker] = useState(false);
  const [followUpTime, setFollowUpTime] = useState('');

  // Determine if the selected date is in the future (scheduled activity)
  const isScheduledActivity = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(activityDate);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  }, [activityDate]);

  // Calculate follow-up date based on interval
  const getFollowUpDate = (): string => {
    if (followUpInterval === 'custom') {
      return customFollowUpDate;
    }
    if (!followUpInterval) return '';

    const baseDate = new Date(activityDate);
    const daysToAdd = parseInt(followUpInterval);
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    return baseDate.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmit = () => {
    if (!notes.trim()) return;

    if (isScheduledActivity) {
      // Create a scheduled follow-up (next activity)
      onAddFollowUp({
        practiceId,
        dueDate: activityDate,
        dueTime: activityTime || undefined,
        notes: notes.trim(),
        userId: 'current-user'
      });
    } else {
      // Create a completed activity with current timestamp
      const isIssue = issueType !== '';
      onAddActivity({
        practiceId,
        date: new Date().toISOString(), // Auto-set to now for completed activities
        notes: notes.trim(),
        userId: 'current-user',
        isIssue,
        issueType: issueType || undefined,
        issueStatus: isIssue ? 'active' : undefined,
        resolvedAt: undefined,
        resolvedBy: undefined
      });

      // If follow-up is scheduled, also create it
      const followUpDate = getFollowUpDate();
      if (followUpDate && followUpNote.trim()) {
        onAddFollowUp({
          practiceId,
          dueDate: followUpDate,
          dueTime: followUpTime || undefined,
          notes: followUpNote.trim(),
          userId: 'current-user'
        });
      }
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setNotes('');
    setIssueType('');
    setFollowUpInterval('');
    setCustomFollowUpDate('');
    setFollowUpNote('');
    setShowTimePicker(false);
    setActivityTime('');
    setShowFollowUpTimePicker(false);
    setFollowUpTime('');
    // Reset date to today
    const now = new Date();
    setActivityDate(now.toISOString().split('T')[0]);
  };

  const handleCancel = () => {
    resetForm();
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!notes.trim()) return false;
    // If follow-up interval is set, note is required
    if (followUpInterval && followUpInterval !== 'custom' && !followUpNote.trim()) return false;
    if (followUpInterval === 'custom' && (!customFollowUpDate || !followUpNote.trim())) return false;
    return true;
  }, [notes, followUpInterval, followUpNote, customFollowUpDate]);

  // Check if follow-up card is active
  const isFollowUpActive = followUpInterval !== '';

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
          Add Activity
        </button>
      )}

      {/* Expanded State - Unified Form */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          {/* Form Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Add Activity
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
            {/* Row 1: Date/Time + Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="px-3 py-1.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {isScheduledActivity && (
                  <>
                    {showTimePicker ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={activityTime}
                          onChange={(e) => setActivityTime(e.target.value)}
                          className="px-3 py-1.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowTimePicker(false);
                            setActivityTime('');
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title="Remove time"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowTimePicker(true)}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        + Add time
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Status Badge */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                isScheduledActivity
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {isScheduledActivity ? (
                  <span>📅 Scheduling for {formatDateForDisplay(activityDate)}</span>
                ) : (
                  <span>✅ Logging activity</span>
                )}
              </div>
            </div>

            {/* Row 2: Notes */}
            <div className="mb-4">
              <label htmlFor="activityNotes" className="block text-xs font-medium text-foreground mb-1.5">
                Notes
              </label>
              <textarea
                id="activityNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter activity details..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
              />
            </div>

            {/* Row 3: Two Side-by-Side Cards (only for completed activities) */}
            {!isScheduledActivity && (
              <div className="grid grid-cols-2 gap-3">
                {/* Left Card - Mark as Issue */}
                <div className={`p-3 rounded-lg border transition-colors ${
                  issueType ? 'border-amber-300 bg-amber-50' : 'border-border bg-muted/20'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">⚠️</span>
                    <span className="text-xs font-semibold text-foreground">Mark as Issue</span>
                  </div>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType | '')}
                    className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select type...</option>
                    {ISSUE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right Card - Schedule Follow-up */}
                <div className={`p-3 rounded-lg border transition-colors ${
                  isFollowUpActive ? 'border-blue-300 bg-blue-50' : 'border-border bg-muted/20'
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">📅</span>
                    <span className="text-xs font-semibold text-foreground">Schedule Next Activity</span>
                  </div>

                  {/* Quick Interval Buttons */}
                  <div className="flex gap-1.5 mb-2">
                    {(['1', '3', '5'] as const).map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFollowUpInterval(followUpInterval === days ? '' : days)}
                        className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                          followUpInterval === days
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        +{days}d
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFollowUpInterval(followUpInterval === 'custom' ? '' : 'custom')}
                      className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                        followUpInterval === 'custom'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      📅
                    </button>
                  </div>

                  {/* Custom Date Picker */}
                  {followUpInterval === 'custom' && (
                    <div className="mb-2">
                      <input
                        type="date"
                        value={customFollowUpDate}
                        onChange={(e) => setCustomFollowUpDate(e.target.value)}
                        min={activityDate}
                        className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}

                  {/* Follow-up Note (shown when interval is selected) */}
                  {isFollowUpActive && (
                    <input
                      type="text"
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      placeholder="What needs to be done..."
                      className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}

                  {/* Follow-up Preview with optional time */}
                  {isFollowUpActive && getFollowUpDate() && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-blue-600">
                        → {formatDateForDisplay(getFollowUpDate())}
                        {followUpTime && ` at ${followUpTime}`}
                      </span>
                      {showFollowUpTimePicker ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={followUpTime}
                            onChange={(e) => setFollowUpTime(e.target.value)}
                            className="px-2 py-0.5 border border-border rounded bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowFollowUpTimePicker(false);
                              setFollowUpTime('');
                            }}
                            className="p-0.5 text-muted-foreground hover:text-foreground"
                            title="Remove time"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowFollowUpTimePicker(true)}
                          className="text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          + time
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
              disabled={!isFormValid}
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
