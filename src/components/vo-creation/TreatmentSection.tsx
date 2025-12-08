'use client';

import React from 'react';
import { TreatmentRow, Treatment, Heilmittel } from './TreatmentRow';

interface TreatmentSectionProps {
  treatments: Treatment[];
  onChange: (treatments: Treatment[]) => void;
  heilmittelCatalog: Heilmittel[];
  maxTreatments?: number;
}

export function TreatmentSection({
  treatments,
  onChange,
  heilmittelCatalog,
  maxTreatments = 8,
}: TreatmentSectionProps) {
  const generateId = () => `tr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleTreatmentChange = (index: number, treatment: Treatment) => {
    const updated = [...treatments];
    updated[index] = treatment;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    if (treatments.length <= 1) return;
    const updated = treatments.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAdd = () => {
    if (treatments.length >= maxTreatments) return;
    const newTreatment: Treatment = {
      id: generateId(),
      heilmittel_code: '',
      anzahl: 0,
      frequenz: '',
    };
    onChange([...treatments, newTreatment]);
  };

  const canAddMore = treatments.length < maxTreatments;
  const canRemove = treatments.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Behandlungen
        </h3>
        <span className="text-xs text-muted-foreground">
          {treatments.length} / {maxTreatments} Behandlungen
        </span>
      </div>

      <div className="space-y-3">
        {treatments.map((treatment, index) => (
          <TreatmentRow
            key={treatment.id}
            treatment={treatment}
            index={index}
            heilmittelCatalog={heilmittelCatalog}
            onChange={handleTreatmentChange}
            onRemove={handleRemove}
            canRemove={canRemove}
          />
        ))}
      </div>

      {canAddMore && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Behandlung hinzufügen
        </button>
      )}

      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          Maximale Anzahl an Behandlungen erreicht ({maxTreatments})
        </p>
      )}
    </div>
  );
}

export default TreatmentSection;
