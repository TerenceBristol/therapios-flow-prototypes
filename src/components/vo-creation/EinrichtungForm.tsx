'use client';

import React, { useState } from 'react';

export interface Einrichtung {
  id: string;
  name: string;
  status: 'Aktiv' | 'Inaktiv';
}

interface EinrichtungFormData {
  name: string;
  status: 'Aktiv' | 'Inaktiv';
}

interface EinrichtungFormProps {
  mode: 'create' | 'edit';
  initialData?: Einrichtung;
  onSave: (data: EinrichtungFormData) => void;
  onCancel: () => void;
}

export function EinrichtungForm({ mode, initialData, onSave, onCancel }: EinrichtungFormProps) {
  const [formData, setFormData] = useState<EinrichtungFormData>({
    name: initialData?.name || '',
    status: initialData?.status || 'Aktiv',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name der Einrichtung ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: formData.name.trim(),
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Einrichtungs ID (read-only in edit mode) */}
      {mode === 'edit' && initialData?.id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Einrichtungs ID
          </label>
          <input
            type="text"
            value={initialData.id}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      )}

      {/* Name der Einrichtung */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name der Einrichtung <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="z.B. Haus am ZernseeSenioren"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktiv' | 'Inaktiv' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Aktiv">Aktiv</option>
          <option value="Inaktiv">Inaktiv</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Speichern
        </button>
      </div>
    </form>
  );
}

export default EinrichtungForm;
