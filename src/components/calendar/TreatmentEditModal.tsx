import React, { useState } from 'react';
import { CalendarTreatment, BehandlungsArt } from '@/types';

interface TreatmentEditModalProps {
  treatment: Partial<CalendarTreatment> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatment: CalendarTreatment) => void;
  onDelete?: (treatmentId: string) => void;
  isNewFromActivity?: boolean;
}

export default function TreatmentEditModal({
  treatment,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNewFromActivity = false,
}: TreatmentEditModalProps) {
  const [editedTreatment, setEditedTreatment] = useState<Partial<CalendarTreatment>>({
    duration: 0,
    notes: '',
    behandlungsart: 'Durchgeführt',
    patientRejected: false,
    ...treatment,
  });

  React.useEffect(() => {
    setEditedTreatment({
      duration: 0,
      notes: '',
      behandlungsart: 'Durchgeführt',
      patientRejected: false,
      ...treatment,
    });
  }, [treatment]);

  if (!isOpen || !editedTreatment) return null;

  const handleSave = () => {
    // Validate required fields
    if (
      !editedTreatment.id ||
      !editedTreatment.patientName ||
      !editedTreatment.voNumber ||
      !editedTreatment.voId ||
      !editedTreatment.date ||
      !editedTreatment.therapist ||
      !editedTreatment.behStatus ||
      editedTreatment.position === undefined
    ) {
      alert('Missing required fields');
      return;
    }

    onSave(editedTreatment as CalendarTreatment);
  };

  const handleDelete = () => {
    if (editedTreatment.id && onDelete) {
      onDelete(editedTreatment.id);
    }
  };

  const formatDateForInput = (isoDate: string) => {
    // Convert YYYY-MM-DD to DD.MM.YYYY for display
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isNewFromActivity ? 'Create Treatment' : 'Edit Treatment'}
          </h2>
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
              Datum der Behandlung: {editedTreatment.date ? formatDateForInput(editedTreatment.date) : ''}
            </label>
            <input
              type="date"
              value={editedTreatment.date || ''}
              onChange={(e) => setEditedTreatment({ ...editedTreatment, date: e.target.value })}
              className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500 italic">
              Lange drücken und die Karte ziehen, um die Reihenfolge zu ändern
            </p>
          </div>

          {/* Treatment Info Card */}
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {editedTreatment.patientName || 'No patient selected'}
                  </div>
                  <div className="text-xs text-gray-600">
                    Position #{editedTreatment.position} | Akt. VO {editedTreatment.voNumber} | Beh. Status {editedTreatment.behStatus}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isNewFromActivity && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Collapse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notes
              </label>
              <textarea
                value={editedTreatment.notes || ''}
                onChange={(e) => setEditedTreatment({ ...editedTreatment, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter treatment notes..."
              />
            </div>

            {/* Behandlungsart */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Behandlungsart
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="behandlungsart"
                    value="Durchgeführt"
                    checked={editedTreatment.behandlungsart === 'Durchgeführt'}
                    onChange={(e) => setEditedTreatment({ ...editedTreatment, behandlungsart: e.target.value as BehandlungsArt })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Durchgeführt</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="behandlungsart"
                    value="Geplant"
                    checked={editedTreatment.behandlungsart === 'Geplant'}
                    onChange={(e) => setEditedTreatment({ ...editedTreatment, behandlungsart: e.target.value as BehandlungsArt })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Geplant</span>
                </label>
              </div>
            </div>

            {/* Patient Rejected Checkbox */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedTreatment.patientRejected || false}
                  onChange={(e) => setEditedTreatment({ ...editedTreatment, patientRejected: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Patient hat die Behandlung verweigert</span>
              </label>
            </div>

            <div className="mt-4 text-xs text-gray-600">
              Position: {editedTreatment.position}
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
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              editedTreatment.patientName
                ? 'bg-blue-900 hover:bg-blue-950'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!editedTreatment.patientName}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

