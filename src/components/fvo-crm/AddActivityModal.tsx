import React, { useState, useEffect } from 'react';
import { PracticeActivityType } from '@/types';

interface AddActivityModalProps {
  isOpen: boolean;
  practiceId: string;
  onClose: () => void;
  onSave: (activity: {
    practiceId: string;
    type: PracticeActivityType;
    date: string;
    notes: string;
    nextFollowUpDate?: string;
  }) => void;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  practiceId,
  onClose,
  onSave
}) => {
  const [type, setType] = useState<PracticeActivityType>('Call');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default date to today
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      // Reset form
      setType('Call');
      setNotes('');
      setNextFollowUpDate('');
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

    if (nextFollowUpDate) {
      const followUpDate = new Date(nextFollowUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (followUpDate < today) {
        newErrors.nextFollowUpDate = 'Follow-up date must be today or in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      practiceId,
      type,
      date: new Date(date).toISOString(),
      notes: notes.trim(),
      nextFollowUpDate: nextFollowUpDate || undefined
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
            <h2 className="text-xl font-bold text-foreground">Add Activity</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Activity Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PracticeActivityType)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Fax">Fax</option>
                <option value="Note">Note</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.date ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Notes * ({notes.length}/500)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What happened during this interaction?"
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

            {/* Next Follow-up Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Next Follow-up Date (Optional)
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                placeholder="When should we follow up?"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.nextFollowUpDate ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.nextFollowUpDate && (
                <p className="text-sm text-red-500 mt-1">{errors.nextFollowUpDate}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
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
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;
