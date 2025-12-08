'use client';

import React, { useState } from 'react';

interface Praxis {
  id: string;
  name: string;
  strasse?: string;
  plz?: string;
  ort?: string;
}

interface DoctorData {
  arzt_vorname: string;
  arzt_nachname: string;
  arzt_arztnummer?: string;
  praxis_id?: string;
}

interface DoctorFormProps {
  mode: 'create' | 'edit';
  initialDoctor?: DoctorData & { id: string };
  praxen: Praxis[];
  onSave: (doctor: DoctorData) => void;
  onCancel: () => void;
}

export function DoctorForm({ mode, initialDoctor, praxen, onSave, onCancel }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    arzt_vorname: initialDoctor?.arzt_vorname || '',
    arzt_nachname: initialDoctor?.arzt_nachname || '',
    arzt_arztnummer: initialDoctor?.arzt_arztnummer || '',
    praxis_id: initialDoctor?.praxis_id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.arzt_vorname.trim()) {
      newErrors.arzt_vorname = 'Vorname ist erforderlich';
    }

    if (!formData.arzt_nachname.trim()) {
      newErrors.arzt_nachname = 'Nachname ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      arzt_vorname: formData.arzt_vorname.trim(),
      arzt_nachname: formData.arzt_nachname.trim(),
      arzt_arztnummer: formData.arzt_arztnummer.trim() || `${Date.now()}`,
      praxis_id: formData.praxis_id || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vorname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.arzt_vorname}
            onChange={(e) => setFormData({ ...formData, arzt_vorname: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.arzt_vorname ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.arzt_vorname && (
            <p className="mt-1 text-sm text-red-600">{errors.arzt_vorname}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nachname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.arzt_nachname}
            onChange={(e) => setFormData({ ...formData, arzt_nachname: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.arzt_nachname ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.arzt_nachname && (
            <p className="mt-1 text-sm text-red-600">{errors.arzt_nachname}</p>
          )}
        </div>
      </div>

      {/* Praxis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Praxis
        </label>
        <select
          value={formData.praxis_id}
          onChange={(e) => setFormData({ ...formData, praxis_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Keine Praxis auswählen</option>
          {praxen.map((praxis) => (
            <option key={praxis.id} value={praxis.id}>
              {praxis.name}
            </option>
          ))}
        </select>
      </div>

      {/* Arztnummer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Arztnummer <span className="text-gray-400">(wird automatisch generiert)</span>
        </label>
        <input
          type="text"
          value={formData.arzt_arztnummer}
          onChange={(e) => setFormData({ ...formData, arzt_arztnummer: e.target.value })}
          placeholder="Automatisch generiert wenn leer"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
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
          {mode === 'create' ? 'Erstellen' : 'Aktualisieren'}
        </button>
      </div>
    </form>
  );
}
