'use client';

import React, { useState } from 'react';
import { Patient } from './PatientModal';

interface PatientFormProps {
  mode: 'create' | 'edit';
  initialPatient?: Patient;
  onSave: (patient: Omit<Patient, 'id'>) => void;
  onCancel: () => void;
}

export function PatientForm({ mode, initialPatient, onSave, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    pat_anrede: initialPatient?.pat_anrede || '',
    pat_vorname: initialPatient?.pat_vorname || '',
    pat_nachname: initialPatient?.pat_nachname || '',
    pat_geburtsdatum: initialPatient?.pat_geburtsdatum || '',
    pat_strasse: initialPatient?.pat_strasse || '',
    pat_plz: initialPatient?.pat_plz || '',
    pat_ort: initialPatient?.pat_ort || '',
    pat_land: initialPatient?.pat_land || 'Deutschland',
    pat_versichertennummer: initialPatient?.pat_versichertennummer || '',
    pat_kostentraeger: initialPatient?.pat_kostentraeger || '',
    pat_zuzahlung_befreit: initialPatient?.pat_zuzahlung_befreit || 'Nein',
    pat_zuzahlung_befreit_von: initialPatient?.pat_zuzahlung_befreit_von || '',
    pat_zuzahlung_befreit_bis: initialPatient?.pat_zuzahlung_befreit_bis || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pat_vorname.trim()) {
      newErrors.pat_vorname = 'Vorname ist erforderlich';
    }

    if (!formData.pat_nachname.trim()) {
      newErrors.pat_nachname = 'Nachname ist erforderlich';
    }

    if (!formData.pat_geburtsdatum) {
      newErrors.pat_geburtsdatum = 'Geburtsdatum ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      pat_anrede: (formData.pat_anrede || undefined) as 'Herr' | 'Frau' | undefined,
      pat_vorname: formData.pat_vorname.trim(),
      pat_nachname: formData.pat_nachname.trim(),
      pat_geburtsdatum: formData.pat_geburtsdatum,
      pat_strasse: formData.pat_strasse || undefined,
      pat_plz: formData.pat_plz || undefined,
      pat_ort: formData.pat_ort || undefined,
      pat_land: formData.pat_land || undefined,
      pat_versichertennummer: formData.pat_versichertennummer || undefined,
      pat_kostentraeger: formData.pat_kostentraeger || undefined,
      pat_zuzahlung_befreit: formData.pat_zuzahlung_befreit as 'Ja' | 'Nein',
      pat_zuzahlung_befreit_von: formData.pat_zuzahlung_befreit_von || undefined,
      pat_zuzahlung_befreit_bis: formData.pat_zuzahlung_befreit_bis || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Persönliche Daten</h3>

        {/* Anrede */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anrede
          </label>
          <select
            value={formData.pat_anrede}
            onChange={(e) => setFormData({ ...formData, pat_anrede: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Keine Auswahl</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
            <option value="Divers">Divers</option>
          </select>
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pat_vorname}
              onChange={(e) => setFormData({ ...formData, pat_vorname: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pat_vorname ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.pat_vorname && (
              <p className="mt-1 text-sm text-red-600">{errors.pat_vorname}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pat_nachname}
              onChange={(e) => setFormData({ ...formData, pat_nachname: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pat_nachname ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.pat_nachname && (
              <p className="mt-1 text-sm text-red-600">{errors.pat_nachname}</p>
            )}
          </div>
        </div>

        {/* Geburtsdatum */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geburtsdatum <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.pat_geburtsdatum}
            onChange={(e) => setFormData({ ...formData, pat_geburtsdatum: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.pat_geburtsdatum ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.pat_geburtsdatum && (
            <p className="mt-1 text-sm text-red-600">{errors.pat_geburtsdatum}</p>
          )}
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Adresse</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Straße
          </label>
          <input
            type="text"
            value={formData.pat_strasse}
            onChange={(e) => setFormData({ ...formData, pat_strasse: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PLZ
            </label>
            <input
              type="text"
              value={formData.pat_plz}
              onChange={(e) => setFormData({ ...formData, pat_plz: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ort
            </label>
            <input
              type="text"
              value={formData.pat_ort}
              onChange={(e) => setFormData({ ...formData, pat_ort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Land
          </label>
          <input
            type="text"
            value={formData.pat_land}
            onChange={(e) => setFormData({ ...formData, pat_land: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Insurance Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Versicherung</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versichertennummer
            </label>
            <input
              type="text"
              value={formData.pat_versichertennummer}
              onChange={(e) => setFormData({ ...formData, pat_versichertennummer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kostenträger
            </label>
            <input
              type="text"
              value={formData.pat_kostentraeger}
              onChange={(e) => setFormData({ ...formData, pat_kostentraeger: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zuzahlung befreit
          </label>
          <select
            value={formData.pat_zuzahlung_befreit}
            onChange={(e) => setFormData({ ...formData, pat_zuzahlung_befreit: e.target.value as 'Ja' | 'Nein' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Nein">Nein</option>
            <option value="Ja">Ja</option>
          </select>
        </div>

        {formData.pat_zuzahlung_befreit === 'Ja' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Befreit von
              </label>
              <input
                type="date"
                value={formData.pat_zuzahlung_befreit_von}
                onChange={(e) => setFormData({ ...formData, pat_zuzahlung_befreit_von: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Befreit bis
              </label>
              <input
                type="date"
                value={formData.pat_zuzahlung_befreit_bis}
                onChange={(e) => setFormData({ ...formData, pat_zuzahlung_befreit_bis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
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
