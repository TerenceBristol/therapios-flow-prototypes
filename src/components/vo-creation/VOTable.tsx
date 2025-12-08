'use client';

import React from 'react';
import { VO } from './VOForm';
import { Therapist } from './TherapistModal';
import { Patient } from './PatientModal';
import { Arzt } from './ArztModal';

interface Einrichtung {
  id: string;
  name: string;
  short_name?: string;
  type?: string;
}

interface VOTableProps {
  vos: VO[];
  therapists: Therapist[];
  patients: Patient[];
  arzte: Arzt[];
  einrichtungen: Einrichtung[];
  onEdit: (vo: VO) => void;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Aktiv': 'bg-green-100 text-green-800',
  'Abgelaufen': 'bg-yellow-100 text-yellow-800',
  'Archiviert': 'bg-gray-100 text-gray-800',
  'Abgerechnet': 'bg-blue-100 text-blue-800',
  'Abgebrochen': 'bg-red-100 text-red-800',
  'Fertig behandelt': 'bg-purple-100 text-purple-800',
};

const FVO_STATUS_COLORS: Record<string, string> = {
  'Bestellen': 'bg-red-100 text-red-800',
  'Erhalten': 'bg-green-100 text-green-800',
  '-': 'bg-gray-100 text-gray-500',
};

export function VOTable({
  vos,
  therapists,
  patients,
  arzte,
  einrichtungen,
  onEdit,
  selectedIds,
  onSelectChange,
}: VOTableProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE');
  };

  const getTherapist = (id: string) => therapists.find(t => t.id === id);
  const getPatient = (id: string) => patients.find(p => p.id === id);
  const getArzt = (id: string) => arzte.find(a => a.id === id);
  const getEinrichtung = (id?: string) => id ? einrichtungen.find(e => e.id === id) : null;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectChange(vos.map(v => v.id));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter(i => i !== id));
    }
  };

  const allSelected = vos.length > 0 && selectedIds.length === vos.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < vos.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="px-3 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
            </th>
            <th className="px-3 py-3 text-left font-medium">Name</th>
            <th className="px-3 py-3 text-left font-medium">VO Nr.</th>
            <th className="px-3 py-3 text-left font-medium">Geburtsdatum</th>
            <th className="px-3 py-3 text-left font-medium">Heilmittel</th>
            <th className="px-3 py-3 text-left font-medium">ICD</th>
            <th className="px-3 py-3 text-left font-medium">Einrichtung</th>
            <th className="px-3 py-3 text-left font-medium">Therapeut</th>
            <th className="px-3 py-3 text-left font-medium">Ausst. Datum</th>
            <th className="px-3 py-3 text-left font-medium">Beh. Status</th>
            <th className="px-3 py-3 text-left font-medium">Arzt</th>
            <th className="px-3 py-3 text-left font-medium">TB</th>
            <th className="px-3 py-3 text-left font-medium">F.-VO Status</th>
            <th className="px-3 py-3 text-left font-medium">VO Status</th>
            <th className="px-3 py-3 text-left font-medium">Aktion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vos.map((vo) => {
            const patient = getPatient(vo.patient_id);
            const therapist = getTherapist(vo.therapist_id);
            const arzt = getArzt(vo.arzt_id);
            const einrichtung = getEinrichtung(vo.einrichtung_id);
            const firstHeilmittel = vo.treatments[0]?.heilmittel_code || '-';

            return (
              <tr key={vo.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(vo.id)}
                    onChange={(e) => handleSelectRow(vo.id, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-foreground">
                  {patient ? `${patient.pat_nachname}, ${patient.pat_vorname}` : '-'}
                </td>
                <td className="px-3 py-3 text-primary font-medium">
                  [{vo.rez_rezept_nummer}]
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {patient ? formatDate(patient.pat_geburtsdatum) : '-'}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {firstHeilmittel}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {vo.rez_icd_10_code || '-'}
                </td>
                <td className="px-3 py-3 text-muted-foreground truncate max-w-[150px]" title={einrichtung?.name}>
                  {einrichtung?.short_name || einrichtung?.name || '-'}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {therapist ? therapist.nachname : '-'}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatDate(vo.rez_datum)}
                </td>
                <td className="px-3 py-3">
                  <span className="text-muted-foreground">
                    {vo.beh_completed} / {vo.beh_total}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {arzt ? arzt.arzt_nachname : '-'}
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-block w-6 text-center ${vo.rez_therapiebericht === 'Ja' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {vo.rez_therapiebericht === 'Ja' ? 'Ja' : '-'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FVO_STATUS_COLORS[vo.fvo_status || '-'] || FVO_STATUS_COLORS['-']}`}>
                    {vo.fvo_status || '-'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[vo.rez_rezeptstatus] || 'bg-gray-100 text-gray-800'}`}>
                    {vo.rez_rezeptstatus}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => onEdit(vo)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {vos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Keine Verordnungen gefunden.
        </div>
      )}
    </div>
  );
}

export default VOTable;
