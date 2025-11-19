import React, { useState } from 'react';
import { PracticeActivity, PracticeFollowUp } from '@/types';

interface AddEntryModalProps {
  isOpen: boolean;
  practiceId: string;
  onClose: () => void;
  onAddActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
  onAddFollowUp: (followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => void;
  initialMode?: 'activity' | 'followUp';
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  practiceId,
  onClose,
  onAddActivity,
  onAddFollowUp,
  initialMode = 'activity'
}) => {
  const [mode, setMode] = useState<'activity' | 'followUp'>(initialMode);
  const [notes, setNotes] = useState('');
  const [isIssue, setIsIssue] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!notes.trim()) return;

    if (mode === 'activity') {
      onAddActivity({
        practiceId,
        date: new Date().toISOString(),
        notes: notes.trim(),
        userId: 'current-user', // TODO: Get from auth context
        isIssue,
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

    // Reset form
    setNotes('');
    setIsIssue(false);
    setDueDate('');
    setDueTime('');
    onClose();
  };

  const handleCancel = () => {
    setNotes('');
    setIsIssue(false);
    setDueDate('');
    setDueTime('');
    onClose();
  };

  const handleModeChange = (newMode: 'activity' | 'followUp') => {
    setMode(newMode);
    // Reset fields when switching modes
    setNotes('');
    setIsIssue(false);
    setDueDate('');
    setDueTime('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === 'activity' ? 'Add Activity' : 'Add Next Activity'}
          </h2>
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
          {/* Mode Toggle */}
          <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg">
            <button
              onClick={() => handleModeChange('activity')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'activity'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => handleModeChange('followUp')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
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
              <div className="mb-4">
                <label htmlFor="activityNotes" className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  id="activityNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what happened..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={6}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="markAsIssue"
                  checked={isIssue}
                  onChange={(e) => setIsIssue(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="markAsIssue" className="ml-2 text-sm text-foreground cursor-pointer">
                  Mark as issue
                </label>
              </div>
            </>
          )}

          {/* Follow-Up Form */}
          {mode === 'followUp' && (
            <>
              <div className="mb-4">
                <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="dueTime" className="block text-sm font-medium text-foreground mb-2">
                  Due Time (optional)
                </label>
                <input
                  type="time"
                  id="dueTime"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="followUpNotes" className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  id="followUpNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What needs to be done..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>
            </>
          )}
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
            onClick={handleSubmit}
            disabled={!notes.trim() || (mode === 'followUp' && !dueDate)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
