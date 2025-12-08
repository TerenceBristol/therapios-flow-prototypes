'use client';

import React, { useState } from 'react';

export interface User {
  id: string;
  mitarbeiter_nr: string;
  vorname: string;
  nachname: string;
  email: string;
  handy_nummer: string | null;
  status: 'Aktiv' | 'Inaktiv';
  rolle: 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_THERAPIST' | 'ROLE_USER';
  allow_fvo_ordering: boolean;
}

interface TeamFormProps {
  mode: 'create' | 'edit';
  initialUser?: User;
  existingMitarbeiterNrs: string[];
  onSave: (user: Omit<User, 'id'>) => void;
  onCancel: () => void;
}

export function TeamForm({ mode, initialUser, existingMitarbeiterNrs, onSave, onCancel }: TeamFormProps) {
  const [formData, setFormData] = useState({
    mitarbeiter_nr: initialUser?.mitarbeiter_nr || '',
    vorname: initialUser?.vorname || '',
    nachname: initialUser?.nachname || '',
    email: initialUser?.email || '',
    handy_nummer: initialUser?.handy_nummer || '',
    status: initialUser?.status || 'Aktiv',
    rolle: initialUser?.rolle || 'ROLE_THERAPIST',
    allow_fvo_ordering: initialUser?.allow_fvo_ordering || false,
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mitarbeiter_nr.trim()) {
      newErrors.mitarbeiter_nr = 'Mitarbeiter-Nr ist erforderlich';
    } else if (
      mode === 'create' &&
      existingMitarbeiterNrs.includes(formData.mitarbeiter_nr.trim())
    ) {
      newErrors.mitarbeiter_nr = 'Diese Mitarbeiter-Nr existiert bereits';
    }

    if (!formData.vorname.trim()) {
      newErrors.vorname = 'Vorname ist erforderlich';
    }

    if (!formData.nachname.trim()) {
      newErrors.nachname = 'Nachname ist erforderlich';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      mitarbeiter_nr: formData.mitarbeiter_nr.trim(),
      vorname: formData.vorname.trim(),
      nachname: formData.nachname.trim(),
      email: formData.email.trim(),
      handy_nummer: formData.handy_nummer.trim() || null,
      status: formData.status as 'Aktiv' | 'Inaktiv',
      rolle: formData.rolle as User['rolle'],
      allow_fvo_ordering: formData.allow_fvo_ordering,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nutzer Rolle
        </label>
        <select
          value={formData.rolle}
          onChange={(e) => setFormData({ ...formData, rolle: e.target.value as User['rolle'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ROLE_THERAPIST">Therapist</option>
          <option value="ROLE_ADMIN">Admin</option>
          <option value="ROLE_SUPER_ADMIN">Super Admin</option>
          <option value="ROLE_USER">User</option>
        </select>
      </div>

      {/* Mitarbeiter-Nr */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mitarbeiter-Nr
        </label>
        <input
          type="text"
          value={formData.mitarbeiter_nr}
          onChange={(e) => setFormData({ ...formData, mitarbeiter_nr: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.mitarbeiter_nr ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.mitarbeiter_nr && (
          <p className="mt-1 text-sm text-red-600">{errors.mitarbeiter_nr}</p>
        )}
      </div>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={formData.vorname}
            onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.vorname ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.vorname && (
            <p className="mt-1 text-sm text-red-600">{errors.vorname}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={formData.nachname}
            onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nachname ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nachname && (
            <p className="mt-1 text-sm text-red-600">{errors.nachname}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Handy Nummer <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="tel"
          value={formData.handy_nummer}
          onChange={(e) => setFormData({ ...formData, handy_nummer: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.status === 'Aktiv'}
            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Aktiv' : 'Inaktiv' })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Aktiv</span>
        </label>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Neues Passwort <span className="text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Leer lassen, um nicht zu ändern"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
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
