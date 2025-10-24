import React, { useState } from 'react';
import { Activity, ActivityType } from '@/types';

interface ActivityEditModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onConvertToTreatment: (activity: Activity) => void;
}

export default function ActivityEditModal({
  activity,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onConvertToTreatment,
}: ActivityEditModalProps) {
  const [editedActivity, setEditedActivity] = useState<Activity | null>(activity);

  React.useEffect(() => {
    setEditedActivity(activity);
  }, [activity]);

  if (!isOpen || !editedActivity) return null;

  const handleSave = () => {
    if (editedActivity) {
      // Validate Treatment (No VO) type has required fields
      if (editedActivity.type === 'Treatment (No VO)') {
        if (!editedActivity.uploadId || !editedActivity.uploadId.trim()) {
          alert('Upload ID is required for Treatment (No VO)');
          return;
        }
      }
      onSave(editedActivity);
    }
  };

  const handleDelete = () => {
    if (editedActivity) {
      onDelete(editedActivity.id);
    }
  };

  const handleConvert = () => {
    if (editedActivity) {
      onConvertToTreatment(editedActivity);
    }
  };

  const formatDateForInput = (isoDate: string) => {
    // Convert YYYY-MM-DD to DD.MM.YYYY for display
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Activity</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Date Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum der Behandlung: {formatDateForInput(editedActivity.date)}
            </label>
            <input
              type="date"
              value={editedActivity.date}
              onChange={(e) => setEditedActivity({ ...editedActivity, date: e.target.value })}
              className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500 italic">
              Lange drücken und die Karte ziehen, um die Reihenfolge zu ändern
            </p>
          </div>

          {/* Activity Type Dropdown */}
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {editedActivity.type}
                  </div>
                  <div className="text-xs text-gray-600">
                    Position #{editedActivity.position} | Duration: {editedActivity.duration || 0} min
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Collapse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Aktivitätstyp
              </label>
              <select
                value={editedActivity.type}
                onChange={(e) => setEditedActivity({ ...editedActivity, type: e.target.value as ActivityType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pause">Pause</option>
                <option value="Doku">Doku</option>
                <option value="Other">Other</option>
                <option value="Treatment (No VO)">Treatment (No VO)</option>
              </select>
            </div>

            {editedActivity.type === 'Treatment (No VO)' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Upload ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedActivity.uploadId || ''}
                    onChange={(e) => setEditedActivity({ ...editedActivity, uploadId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Upload ID (e.g., 03-1)"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editedActivity.notes || ''}
                    onChange={(e) => setEditedActivity({ ...editedActivity, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter treatment notes (optional)"
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Dauer (Minuten)
              </label>
              <input
                type="number"
                value={editedActivity.duration || 0}
                onChange={(e) => setEditedActivity({ ...editedActivity, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="text-xs text-gray-600">
              Position: {editedActivity.position}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {editedActivity.type === 'Treatment (No VO)' && (
              <button
                onClick={handleConvert}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Convert to Treatment
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-950 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

