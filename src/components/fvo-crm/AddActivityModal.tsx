import React, { useState, useEffect } from 'react';
import { PracticeActivity } from '@/types';
import { generateTimeOptions } from '@/utils/timeUtils';

interface AddActivityModalProps {
  isOpen: boolean;
  practiceId: string;
  onClose: () => void;
  onSave: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  practiceId,
  onClose,
  onSave
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeOptions = generateTimeOptions();

  // Set default date and time
  useEffect(() => {
    if (isOpen) {
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

      // Reset form
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    if (!notes.trim()) {
      newErrors.notes = 'Notes are required';
    } else if (notes.trim().length < 5) {
      newErrors.notes = 'Notes must be at least 5 characters';
    } else if (notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

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

    onSave({
      practiceId,
      date: activityDate.toISOString(),
      notes: notes.trim(),
      userId: 'current-user', // TODO: Get from auth context
      isIssue: false
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">📝 Log Activity</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* What Happened Section */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                When did this happen?
              </label>

              {/* Inline Date/Time */}
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.date ? 'border-red-500' : 'border-border'
                  }`}
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
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what happened during this interaction..."
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.notes ? 'border-red-500' : 'border-border'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.notes ? (
                  <p className="text-xs text-red-500">{errors.notes}</p>
                ) : (
                  <span className="text-xs text-muted-foreground">{notes.length}/500 characters</span>
                )}
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
                Save Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;
