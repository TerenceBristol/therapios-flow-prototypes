import React, { useState, useEffect } from 'react';
import { PracticeFollowUp, PracticeActivity } from '@/types';
import { generateTimeOptions } from '@/utils/timeUtils';

interface CompleteFollowUpModalProps {
  isOpen: boolean;
  followUp: PracticeFollowUp | null;
  onClose: () => void;
  onComplete: (followUpId: string, activityData: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
}

const CompleteFollowUpModal: React.FC<CompleteFollowUpModalProps> = ({
  isOpen,
  followUp,
  onClose,
  onComplete
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const timeOptions = generateTimeOptions();

  // Initialize form when follow-up changes
  useEffect(() => {
    if (followUp) {
      // Set default values
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);

      // Set current time rounded to nearest 15 minutes
      const minutes = now.getMinutes();
      const roundedMinutes = Math.round(minutes / 15) * 15;
      now.setMinutes(roundedMinutes, 0, 0);
      const hours = now.getHours();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = roundedMinutes.toString().padStart(2, '0');
      setTime(`${displayHours}:${displayMinutes} ${period}`);

      // Pre-fill with follow-up notes
      setNotes(followUp.notes);
    }
  }, [followUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp) return;

    // Combine date and time
    const activityDate = new Date(date);
    if (time) {
      const [timeStr, period] = time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      activityDate.setHours(hour24, minutes, 0, 0);
    }

    onComplete(
      followUp.id,
      {
        practiceId: followUp.practiceId,
        date: activityDate.toISOString(),
        notes: notes.trim(),
        userId: 'current-user', // TODO: Get from auth context
        isIssue: false
      }
    );

    onClose();
  };

  if (!isOpen || !followUp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">✅ Complete Follow-Up</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Resolution Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              When was this completed?
            </h3>

            {/* Inline Date/Time */}
            <div className="flex items-center gap-2 text-sm flex-wrap mb-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <span className="text-muted-foreground">at</span>

              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {timeOptions.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Describe what happened..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notes.length}/500 characters
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Complete & Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteFollowUpModal;
