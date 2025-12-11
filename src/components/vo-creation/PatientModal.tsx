'use client';

import React, { useState, useEffect } from 'react';

export interface Patient {
  id: string;
  pat_anrede?: 'Herr' | 'Frau';
  pat_vorname: string;
  pat_nachname: string;
  pat_geburtsdatum: string;
  pat_strasse?: string;
  pat_plz?: string;
  pat_ort?: string;
  pat_land?: string;
  pat_versichertennummer?: string;
  pat_kostentraeger?: string;
  pat_zuzahlung_befreit: 'Ja' | 'Nein';
  pat_zuzahlung_befreit_von?: string;
  pat_zuzahlung_befreit_bis?: string;
  einrichtung_id?: string;
}

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, 'id'>) => void;
}

export function PatientModal({
  isOpen,
  onClose,
  onSave,
}: PatientModalProps) {
  const [anrede, setAnrede] = useState<'Herr' | 'Frau' | ''>('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState('');
  const [strasse, setStrasse] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [land, setLand] = useState('Deutschland');
  const [versichertennummer, setVersichertennummer] = useState('');
  const [kostentraeger, setKostentraeger] = useState('');
  const [zuzahlungBefreit, setZuzahlungBefreit] = useState<'Ja' | 'Nein'>('Nein');
  const [befreitVon, setBefreitVon] = useState('');
  const [befreitBis, setBefreitBis] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnrede('');
      setVorname('');
      setNachname('');
      setGeburtsdatum('');
      setStrasse('');
      setPlz('');
      setOrt('');
      setLand('Deutschland');
      setVersichertennummer('');
      setKostentraeger('');
      setZuzahlungBefreit('Nein');
      setBefreitVon('');
      setBefreitBis('');
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

    if (!geburtsdatum) {
      newErrors.geburtsdatum = 'Geburtsdatum ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      pat_anrede: anrede || undefined,
      pat_vorname: vorname.trim(),
      pat_nachname: nachname.trim(),
      pat_geburtsdatum: geburtsdatum,
      pat_strasse: strasse.trim() || undefined,
      pat_plz: plz.trim() || undefined,
      pat_ort: ort.trim() || undefined,
      pat_land: land.trim() || undefined,
      pat_versichertennummer: versichertennummer.trim() || undefined,
      pat_kostentraeger: kostentraeger.trim() || undefined,
      pat_zuzahlung_befreit: zuzahlungBefreit,
      pat_zuzahlung_befreit_von: zuzahlungBefreit === 'Ja' ? befreitVon || undefined : undefined,
      pat_zuzahlung_befreit_bis: zuzahlungBefreit === 'Ja' ? befreitBis || undefined : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-[90%] max-w-2xl max-h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Neuen Patient anlegen</h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Persönliche Daten
            </h3>
            <div className="space-y-4">
              {/* Anrede */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Anrede
                </label>
                <select
                  value={anrede}
                  onChange={(e) => setAnrede(e.target.value as 'Herr' | 'Frau' | '')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                </select>
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

              {/* Geburtsdatum */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Geburtsdatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={geburtsdatum}
                  onChange={(e) => setGeburtsdatum(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.geburtsdatum ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.geburtsdatum && (
                  <p className="text-sm text-red-500 mt-1">{errors.geburtsdatum}</p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Adresse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Strasse
                </label>
                <input
                  type="text"
                  value={strasse}
                  onChange={(e) => setStrasse(e.target.value)}
                  placeholder="Straße und Hausnummer"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value)}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={ort}
                    onChange={(e) => setOrt(e.target.value)}
                    placeholder="Berlin"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Land
                  </label>
                  <input
                    type="text"
                    value={land}
                    onChange={(e) => setLand(e.target.value)}
                    placeholder="Deutschland"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Insurance */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Versicherung
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Versichertennummer
                  </label>
                  <input
                    type="text"
                    value={versichertennummer}
                    onChange={(e) => setVersichertennummer(e.target.value)}
                    placeholder="A123456789"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Kostenträger
                  </label>
                  <input
                    type="text"
                    value={kostentraeger}
                    onChange={(e) => setKostentraeger(e.target.value)}
                    placeholder="AOK Berlin"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Zuzahlung befreit
                </label>
                <select
                  value={zuzahlungBefreit}
                  onChange={(e) => setZuzahlungBefreit(e.target.value as 'Ja' | 'Nein')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Nein">Nein</option>
                  <option value="Ja">Ja</option>
                </select>
              </div>

              {zuzahlungBefreit === 'Ja' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Befreit von
                    </label>
                    <input
                      type="date"
                      value={befreitVon}
                      onChange={(e) => setBefreitVon(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Befreit bis
                    </label>
                    <input
                      type="date"
                      value={befreitBis}
                      onChange={(e) => setBefreitBis(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
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

export default PatientModal;
