'use client';

import React, { useState, useEffect } from 'react';

export interface Therapist {
  id: string;
  mitarbeiter_nr: string;
  vorname: string;
  nachname: string;
  email: string;
  handy_nummer?: string;
  status: 'Aktiv' | 'Inaktiv';
  rolle: string;
  allow_fvo_ordering?: boolean;
}

interface TherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (therapist: Omit<Therapist, 'id' | 'rolle' | 'allow_fvo_ordering'>) => void;
  existingMitarbeiterNrs: string[];
}

export function TherapistModal({
  isOpen,
  onClose,
  onSave,
  existingMitarbeiterNrs,
}: TherapistModalProps) {
  const [mitarbeiterNr, setMitarbeiterNr] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [handyNummer, setHandyNummer] = useState('');
  const [status, setStatus] = useState<'Aktiv' | 'Inaktiv'>('Aktiv');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMitarbeiterNr('');
      setVorname('');
      setNachname('');
      setEmail('');
      setHandyNummer('');
      setStatus('Aktiv');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!mitarbeiterNr.trim()) {
      newErrors.mitarbeiterNr = 'Mitarbeiter-Nr. ist erforderlich';
    } else if (existingMitarbeiterNrs.includes(mitarbeiterNr.trim())) {
      newErrors.mitarbeiterNr = 'Diese Mitarbeiter-Nr. existiert bereits';
    }

    if (!vorname.trim()) {
      newErrors.vorname = 'Vorname ist erforderlich';
    }

    if (!nachname.trim()) {
      newErrors.nachname = 'Nachname ist erforderlich';
    }

    if (!email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ungültiges E-Mail-Format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      mitarbeiter_nr: mitarbeiterNr.trim(),
      vorname: vorname.trim(),
      nachname: nachname.trim(),
      email: email.trim(),
      handy_nummer: handyNummer.trim() || undefined,
      status,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-[90%] max-w-lg max-h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Neuen Therapeut anlegen</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Schließen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Mitarbeiter-Nr */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Mitarbeiter-Nr. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mitarbeiterNr}
              onChange={(e) => setMitarbeiterNr(e.target.value)}
              placeholder="z.B. 67"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.mitarbeiterNr ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.mitarbeiterNr && (
              <p className="text-sm text-red-500 mt-1">{errors.mitarbeiterNr}</p>
            )}
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Vorname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                placeholder="Vorname"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.vorname ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.vorname && (
                <p className="text-sm text-red-500 mt-1">{errors.vorname}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nachname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
                placeholder="Nachname"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.nachname ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.nachname && (
                <p className="text-sm text-red-500 mt-1">{errors.nachname}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              E-Mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Handy Nummer */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Handy Nummer <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="tel"
              value={handyNummer}
              onChange={(e) => setHandyNummer(e.target.value)}
              placeholder="+49 178 1234567"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="therapist-status"
              checked={status === 'Aktiv'}
              onChange={(e) => setStatus(e.target.checked ? 'Aktiv' : 'Inaktiv')}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="therapist-status" className="text-sm text-foreground">
              Aktiv
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Erstellen
          </button>
        </div>
      </div>
    </div>
  );
}

export default TherapistModal;
