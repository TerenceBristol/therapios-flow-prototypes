'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface Treatment {
  id: string;
  heilmittel_code: string;
  anzahl: number;
  frequenz: string;
  icd_code?: string;
}

export interface Heilmittel {
  code: string;
  name: string;
  duration: number | null;
  bereich: string;
  kind: string;
  bv: boolean;
  text_bestellung?: string;
}

interface TreatmentRowProps {
  treatment: Treatment;
  index: number;
  heilmittelCatalog: Heilmittel[];
  onChange: (index: number, treatment: Treatment) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const FREQUENZ_OPTIONS = ['1-2', '1-3', '1-4', '1-5'];

export function TreatmentRow({
  treatment,
  index,
  heilmittelCatalog,
  onChange,
  onRemove,
  canRemove,
}: TreatmentRowProps) {
  const [isHeilmittelOpen, setIsHeilmittelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFrequenzOpen, setIsFrequenzOpen] = useState(false);
  const heilmittelRef = useRef<HTMLDivElement>(null);
  const frequenzRef = useRef<HTMLDivElement>(null);

  // Get selected Heilmittel
  const selectedHeilmittel = heilmittelCatalog.find(
    (h) => h.code === treatment.heilmittel_code
  );

  // Filter Heilmittel based on search
  const filteredHeilmittel = heilmittelCatalog.filter((h) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      h.code.toLowerCase().includes(lowerSearch) ||
      h.name.toLowerCase().includes(lowerSearch)
    );
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (heilmittelRef.current && !heilmittelRef.current.contains(event.target as Node)) {
        setIsHeilmittelOpen(false);
        setSearchTerm('');
      }
      if (frequenzRef.current && !frequenzRef.current.contains(event.target as Node)) {
        setIsFrequenzOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeilmittelSelect = (code: string) => {
    onChange(index, { ...treatment, heilmittel_code: code });
    setIsHeilmittelOpen(false);
    setSearchTerm('');
  };

  const handleAnzahlChange = (value: string) => {
    const anzahl = parseInt(value) || 0;
    onChange(index, { ...treatment, anzahl });
  };

  const handleFrequenzSelect = (frequenz: string) => {
    onChange(index, { ...treatment, frequenz });
    setIsFrequenzOpen(false);
  };

  const handleIcdChange = (value: string) => {
    onChange(index, { ...treatment, icd_code: value });
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md border border-border">
      {/* Heilmittel Dropdown */}
      <div className="flex-1 min-w-0" ref={heilmittelRef}>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Heilmittel *
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Heilmittel suchen..."
            value={isHeilmittelOpen ? searchTerm : (selectedHeilmittel?.code || '')}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isHeilmittelOpen) setIsHeilmittelOpen(true);
            }}
            onFocus={() => setIsHeilmittelOpen(true)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {isHeilmittelOpen && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredHeilmittel.length > 0 ? (
                filteredHeilmittel.slice(0, 20).map((h) => (
                  <button
                    key={h.code}
                    type="button"
                    onClick={() => handleHeilmittelSelect(h.code)}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors ${
                      h.code === treatment.heilmittel_code ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <div className="font-medium">{h.code}</div>
                    <div className="text-muted-foreground truncate">
                      {h.name} {h.duration && `(${h.duration} min)`}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Keine Ergebnisse
                </div>
              )}
              {filteredHeilmittel.length > 20 && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                  +{filteredHeilmittel.length - 20} weitere...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ICD Input */}
      <div className="w-24">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          ICD
        </label>
        <input
          type="text"
          value={treatment.icd_code || ''}
          onChange={(e) => handleIcdChange(e.target.value)}
          placeholder="z.B. G82.12"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Anzahl Input */}
      <div className="w-20">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Anzahl *
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={treatment.anzahl || ''}
          onChange={(e) => handleAnzahlChange(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Frequenz Dropdown */}
      <div className="w-32" ref={frequenzRef}>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Frequenz *
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFrequenzOpen(!isFrequenzOpen)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between"
          >
            <span className={treatment.frequenz ? '' : 'text-muted-foreground'}>
              {treatment.frequenz || 'Wählen...'}
            </span>
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform ${isFrequenzOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isFrequenzOpen && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {FREQUENZ_OPTIONS.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => handleFrequenzSelect(freq)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                    freq === treatment.frequenz ? 'bg-muted font-medium' : ''
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <div className="pt-6">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className={`p-2 rounded-md transition-colors ${
            canRemove
              ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
              : 'text-muted-foreground/30 cursor-not-allowed'
          }`}
          title={canRemove ? 'Entfernen' : 'Mindestens eine Behandlung erforderlich'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TreatmentRow;
