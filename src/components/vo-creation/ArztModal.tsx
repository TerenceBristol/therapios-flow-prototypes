'use client';

import React, { useState, useEffect } from 'react';

export interface Arzt {
  id: string;
  arzt_vorname: string;
  arzt_nachname: string;
  arzt_arztnummer?: string;
  arzt_strasse: string;
  arzt_plz: string;
  arzt_ort: string;
  arzt_telefax: string;
}

interface ArztModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (arzt: Omit<Arzt, 'id'>) => void;
}

export function ArztModal({
  isOpen,
  onClose,
  onSave,
}: ArztModalProps) {
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [arztnummer, setArztnummer] = useState('');
  const [strasse, setStrasse] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [telefax, setTelefax] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setVorname('');
      setNachname('');
      setArztnummer('');
      setStrasse('');
      setPlz('');
      setOrt('');
      setTelefax('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!vorname.trim()) {
      newErrors.vorname = 'Vorname ist erforderlich';
    }

    if (!nachname.trim()) {
      newErrors.nachname = 'Nachname ist erforderlich';
    }

    if (!strasse.trim()) {
      newErrors.strasse = 'Strasse ist erforderlich';
    }

    if (!plz.trim()) {
      newErrors.plz = 'PLZ ist erforderlich';
    }

    if (!ort.trim()) {
      newErrors.ort = 'Ort ist erforderlich';
    }

    if (!telefax.trim()) {
      newErrors.telefax = 'Telefax ist erforderlich für F.VO Bestellung';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      arzt_vorname: vorname.trim(),
      arzt_nachname: nachname.trim(),
      arzt_arztnummer: arztnummer.trim() || undefined,
      arzt_strasse: strasse.trim(),
      arzt_plz: plz.trim(),
      arzt_ort: ort.trim(),
      arzt_telefax: telefax.trim(),
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
          <h2 className="text-xl font-bold text-foreground">Neuen Arzt anlegen</h2>
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

          {/* Arztnummer */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Arztnummer <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={arztnummer}
              onChange={(e) => setArztnummer(e.target.value)}
              placeholder="z.B. 123456789"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Strasse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={strasse}
              onChange={(e) => setStrasse(e.target.value)}
              placeholder="Straße und Hausnummer"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.strasse ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.strasse && (
              <p className="text-sm text-red-500 mt-1">{errors.strasse}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                PLZ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="12345"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.plz ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.plz && (
                <p className="text-sm text-red-500 mt-1">{errors.plz}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Ort <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Berlin"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.ort ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.ort && (
                <p className="text-sm text-red-500 mt-1">{errors.ort}</p>
              )}
            </div>
          </div>

          {/* Telefax */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Telefax <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={telefax}
              onChange={(e) => setTelefax(e.target.value)}
              placeholder="+49 30 123456"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.telefax ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.telefax && (
              <p className="text-sm text-red-500 mt-1">{errors.telefax}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Erforderlich für die automatische F.VO Bestellung per Fax
            </p>
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

export default ArztModal;
