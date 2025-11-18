import React, { useState, useEffect } from 'react';
import { generateTimeOptions } from '@/utils/timeUtils';

interface AddFollowUpModalProps {
  isOpen: boolean;
  practiceId: string;
  onClose: () => void;
  onSave: (followUp: {
    practiceId: string;
    dueDate: string;
    dueTime?: string;
    notes: string;
  }) => void;
}

const AddFollowUpModal: React.FC<AddFollowUpModalProps> = ({
  isOpen,
  practiceId,
  onClose,
  onSave
}) => {
  const [datePreset, setDatePreset] = useState<'custom' | 'tomorrow' | 'in3days' | 'nextweek'>('tomorrow');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeOptions = generateTimeOptions();

  // Calculate date based on preset
  const getDateFromPreset = (preset: typeof datePreset): string => {
    const date = new Date();
    switch (preset) {
      case 'tomorrow':
        date.setDate(date.getDate() + 1);
        break;
      case 'in3days':
        date.setDate(date.getDate() + 3);
        break;
      case 'nextweek':
        date.setDate(date.getDate() + 7);
        break;
      case 'custom':
        // Keep current dueDate
        return dueDate;
    }
    return date.toISOString().split('T')[0];
  };

  // Set default date and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDatePreset('tomorrow');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setDueTime('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  // Update date when preset changes
  useEffect(() => {
    if (datePreset !== 'custom') {
      setDueDate(getDateFromPreset(datePreset));
    }
  }, [datePreset]);

  const handleDatePresetChange = (preset: typeof datePreset) => {
    setDatePreset(preset);
  };

  const handleDateChange = (newDate: string) => {
    setDueDate(newDate);
    setDatePreset('custom');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date must be today or in the future';
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

    onSave({
      practiceId,
      dueDate,
      dueTime: dueTime || undefined,
      notes: notes.trim()
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
            <h2 className="text-xl font-bold text-foreground">➕ Add Follow-Up</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* When Section */}
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                ⏰ When is this due?
              </label>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleDatePresetChange('tomorrow')}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    datePreset === 'tomorrow'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePresetChange('in3days')}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    datePreset === 'in3days'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  In 3 days
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePresetChange('nextweek')}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    datePreset === 'nextweek'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  Next week
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePresetChange('custom')}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    datePreset === 'custom'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.dueDate ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Time (Optional)
                  </label>
                  <select
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes * ({notes.length}/500)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the follow-up task..."
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                  errors.notes ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.notes && (
                <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
              )}
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
                Save Follow-Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFollowUpModal;
