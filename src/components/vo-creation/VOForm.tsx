'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySearchDropdown } from './EntitySearchDropdown';
import { TreatmentSection } from './TreatmentSection';
import { Therapist } from './TherapistModal';
import { Patient } from './PatientModal';
import { Arzt } from './ArztModal';
import { Treatment, Heilmittel } from './TreatmentRow';
import { Practice } from '@/types';
import praxenData from '@/data/praxenData.json';
import praxisToPracticeMapping from '@/data/praxisToPracticeMapping.json';
import practicesData from '@/data/practicesData.json';

export interface VO {
  id: string;
  rez_rezept_nummer: string;
  rez_datum: string;
  rez_betriebsstaetten_nr?: string; // Derived from Practice.practiceId
  rez_stationsnummer: string;
  rez_rezeptstatus: string;
  rez_therapiebericht: 'Ja' | 'Nein';
  rez_doppel_beh?: 'Ja' | 'Nein';
  rez_diagnose?: string;
  rez_icd_10_code?: string;
  practice_id?: string; // Reference to Practice
  therapist_id: string;
  patient_id: string;
  arzt_id: string;
  einrichtung_id?: string;
  parent_vo_id?: string;
  treatments: Treatment[];
  beh_completed: number;
  beh_total: number;
  fvo_status?: string;
  fvo_nummer?: string;
  letzte_notiz?: string;
  ordering_status?: string;
  created_at: string;
  created_by: string;
}

interface Einrichtung {
  id: string;
  name: string;
  status?: 'Aktiv' | 'Inaktiv';
}

interface VOFormProps {
  mode: 'create' | 'edit';
  initialVO?: VO;
  therapists: Therapist[];
  patients: Patient[];
  arzte: Arzt[];
  practices: Practice[];
  einrichtungen: Einrichtung[];
  vos: VO[];
  heilmittelCatalog: Heilmittel[];
  onSave: (vo: Omit<VO, 'id' | 'created_at' | 'created_by'>) => void;
  onCancel: () => void;
  existingVONumbers: string[];
  // Pre-population props (from VO Upload / OCR integration)
  initialVoNumber?: string;
  initialTherapistId?: string;
  initialPatientId?: string;
  initialArztId?: string;
  initialPracticeId?: string;
  initialEinrichtungId?: string;
  initialTreatments?: Treatment[];
}

const STATUS_OPTIONS = ['Aktiv', 'Fertig behandelt', 'Abgerechnet', 'Abgebrochen', 'Archiviert'];

// Pill Toggle Component - supports tri-state (null = neither selected)
function PillToggle({
  value,
  onChange,
  labelOn = 'Ja',
  labelOff = 'Nein',
  disabled = false,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`inline-flex rounded-lg border border-border overflow-hidden ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        onClick={() => !disabled && onChange(false)}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          value === false
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:bg-muted'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        {labelOff}
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange(true)}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          value === true
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground hover:bg-muted'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        {labelOn}
      </button>
    </div>
  );
}

export function VOForm({
  mode,
  initialVO,
  therapists,
  patients,
  arzte,
  practices,
  einrichtungen,
  vos,
  heilmittelCatalog,
  onSave,
  onCancel,
  existingVONumbers,
  initialVoNumber,
  initialTherapistId,
  initialPatientId,
  initialArztId,
  initialPracticeId,
  initialEinrichtungId,
  initialTreatments,
}: VOFormProps) {
  const router = useRouter();

  // Form state - use pre-population props if provided (from VO Upload / OCR), otherwise use initialVO
  const [therapistId, setTherapistId] = useState(initialVO?.therapist_id || initialTherapistId || '');
  const [patientId, setPatientId] = useState(initialVO?.patient_id || initialPatientId || '');
  const [arztId, setArztId] = useState(initialVO?.arzt_id || initialArztId || '');
  const [practiceId, setPracticeId] = useState(initialVO?.practice_id || initialPracticeId || '');
  const [einrichtungId, setEinrichtungId] = useState(initialVO?.einrichtung_id || initialEinrichtungId || '');
  const [parentVOId, setParentVOId] = useState(initialVO?.parent_vo_id || '');

  const [rezeptNummer, setRezeptNummer] = useState(initialVO?.rez_rezept_nummer || initialVoNumber || '');
  const [rezDatum, setRezDatum] = useState(initialVO?.rez_datum || new Date().toISOString().split('T')[0]);
  const [rezeptstatus, setRezeptstatus] = useState(initialVO?.rez_rezeptstatus || 'Aktiv');
  const [therapiebericht, setTherapiebericht] = useState<'Ja' | 'Nein' | null>(initialVO?.rez_therapiebericht || null);
  const [doppelBeh, setDoppelBeh] = useState<'Ja' | 'Nein' | null>(initialVO?.rez_doppel_beh || null);
  const [diagnose, setDiagnose] = useState(initialVO?.rez_diagnose || '');

  const [treatments, setTreatments] = useState<Treatment[]>(
    initialVO?.treatments || initialTreatments || [
      { id: `tr-${Date.now()}-1`, heilmittel_code: '', anzahl: 0, frequenz: '' },
      { id: `tr-${Date.now()}-2`, heilmittel_code: '', anzahl: 0, frequenz: '' },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVoNumberAutoGenerated, setIsVoNumberAutoGenerated] = useState(mode === 'create' && !initialVoNumber);

  // Auto-fill practice when Arzt is selected (always updates to match Arzt's practice)
  useEffect(() => {
    if (arztId) {
      const selectedArzt = arzte.find(a => a.id === arztId);
      if (selectedArzt?.praxis_id) {
        const mappedPracticeId = (praxisToPracticeMapping as Record<string, string>)[selectedArzt.praxis_id];
        if (mappedPracticeId) {
          setPracticeId(mappedPracticeId);
        }
      }
    }
  }, [arztId, arzte]);

  // Helper to get VO statistics for a patient
  const getPatientVoStats = (pId: string) => {
    const patientVos = vos.filter(v => v.patient_id === pId);
    if (patientVos.length === 0) {
      return { count: 0, latestVo: null, latestStatus: null, latestHeilmittel: null, latestIcd: null };
    }
    // Find the latest VO by sequence number
    let latestVo = patientVos[0];
    let maxSeq = 0;
    patientVos.forEach(v => {
      const match = v.rez_rezept_nummer.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) {
          maxSeq = seq;
          latestVo = v;
        }
      }
    });
    // Get Heilmittel codes and ICD codes from treatments
    const heilmittelCodes = latestVo.treatments?.map(t => t.heilmittel_code).filter(Boolean).join(', ') || null;
    const icdCodes = latestVo.treatments?.map(t => t.icd_code).filter(Boolean).join(', ') || null;
    return {
      count: patientVos.length,
      latestVo: latestVo.rez_rezept_nummer,
      latestStatus: latestVo.rez_rezeptstatus,
      latestHeilmittel: heilmittelCodes,
      latestIcd: icdCodes
    };
  };

  // Auto-generate VO number when patient changes (only in create mode)
  const generateVoNumber = (selectedPatientId: string) => {
    if (mode !== 'create' || !selectedPatientId) return '';

    // Find all VOs for this patient
    const patientVos = vos.filter(v => v.patient_id === selectedPatientId);

    if (patientVos.length === 0) {
      // First VO for this patient - use patient number + "-1"
      const patient = patients.find(p => p.id === selectedPatientId);
      if (patient?.pat_versichertennummer) {
        // Use last 4 digits of insurance number as base
        const baseNum = patient.pat_versichertennummer.slice(-4);
        return `${baseNum}-1`;
      }
      // Fallback: generate random base
      const randomBase = Math.floor(1000 + Math.random() * 9000);
      return `${randomBase}-1`;
    }

    // Find the highest sequence number for this patient
    let maxSequence = 0;
    patientVos.forEach(v => {
      const match = v.rez_rezept_nummer.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSequence) maxSequence = seq;
      }
    });

    // Extract base from existing VO number
    const existingVo = patientVos[0];
    const baseMatch = existingVo.rez_rezept_nummer.match(/^(.+)-\d+$/);
    const base = baseMatch ? baseMatch[1] : existingVo.rez_rezept_nummer.split('-')[0];

    return `${base}-${maxSequence + 1}`;
  };

  // Handle patient selection change
  const handlePatientChange = (newPatientId: string) => {
    setPatientId(newPatientId);
    // Reset Folge-VO when patient changes
    setParentVOId('');

    // Always regenerate VO number when patient changes in create mode
    if (mode === 'create') {
      const newVoNumber = generateVoNumber(newPatientId);
      setRezeptNummer(newVoNumber);
      setIsVoNumberAutoGenerated(true); // Reset flag so it shows as auto-generated
    }

    // Auto-fill Einrichtung from patient's latest VO (by issue date)
    if (mode === 'create') {
      const patientVOs = vos.filter(v => v.patient_id === newPatientId);
      if (patientVOs.length > 0) {
        // Sort by issue date descending, take the latest
        const latestVO = patientVOs.sort((a, b) =>
          new Date(b.rez_datum).getTime() - new Date(a.rez_datum).getTime()
        )[0];
        if (latestVO.einrichtung_id) {
          setEinrichtungId(latestVO.einrichtung_id);
        }
      }
    }
  };

  // Get selected entities
  const selectedTherapist = therapists.find(t => t.id === therapistId);
  const selectedPatient = patients.find(p => p.id === patientId);
  const selectedArzt = arzte.find(a => a.id === arztId);
  const selectedPractice = practices.find(p => p.id === practiceId);
  const selectedEinrichtung = einrichtungen.find(e => e.id === einrichtungId);
  const selectedParentVO = vos.find(v => v.id === parentVOId);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!therapistId) newErrors.therapist = 'Therapeut ist erforderlich';
    if (!patientId) newErrors.patient = 'Patient ist erforderlich';
    if (!arztId) newErrors.arzt = 'Arzt ist erforderlich';
    if (!practiceId) newErrors.practice = 'Praxis ist erforderlich';

    if (!rezeptNummer.trim()) {
      newErrors.rezeptNummer = 'VO Nummer ist erforderlich';
    } else if (mode === 'create' && existingVONumbers.includes(rezeptNummer.trim())) {
      newErrors.rezeptNummer = 'Diese VO Nummer existiert bereits';
    }

    if (!rezDatum) newErrors.rezDatum = 'Rez Datum ist erforderlich';

    // Validate required toggle fields
    if (therapiebericht === null) newErrors.therapiebericht = 'Bitte wählen Sie Ja oder Nein';
    if (doppelBeh === null) newErrors.doppelBeh = 'Bitte wählen Sie Ja oder Nein';

    // Validate at least one treatment with ICD code
    const validTreatments = treatments.filter(t => t.heilmittel_code && t.anzahl > 0 && t.frequenz);
    if (validTreatments.length === 0) {
      newErrors.treatments = 'Mindestens eine vollständige Behandlung ist erforderlich';
    }

    // Debug: log validation errors
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const validTreatments = treatments.filter(t => t.heilmittel_code && t.anzahl > 0 && t.frequenz);
    const totalTreatments = validTreatments.reduce((sum, t) => sum + t.anzahl, 0);

    onSave({
      rez_rezept_nummer: rezeptNummer.trim(),
      rez_datum: rezDatum,
      rez_betriebsstaetten_nr: selectedPractice?.practiceId?.toString(), // Derived from Practice
      rez_stationsnummer: '', // Not user-editable, derived from Einrichtung
      rez_rezeptstatus: rezeptstatus,
      rez_therapiebericht: therapiebericht as 'Ja' | 'Nein',
      rez_doppel_beh: doppelBeh as 'Ja' | 'Nein' | undefined,
      rez_diagnose: diagnose.trim() || undefined,
      practice_id: practiceId,
      therapist_id: therapistId,
      patient_id: patientId,
      arzt_id: arztId,
      einrichtung_id: einrichtungId || undefined,
      parent_vo_id: parentVOId || undefined,
      treatments: validTreatments,
      beh_completed: initialVO?.beh_completed || 0,
      beh_total: totalTreatments,
      fvo_status: initialVO?.fvo_status || '-',
      fvo_nummer: initialVO?.fvo_nummer,
      letzte_notiz: initialVO?.letzte_notiz,
      ordering_status: initialVO?.ordering_status || '-',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Section 1: Patient (with VO Number, Einrichtung, Folge-VO) */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Patient
          </h3>
          <EntitySearchDropdown
            label="Patient auswählen"
            placeholder="Patient suchen..."
            entities={patients}
            selectedId={patientId}
            onSelect={handlePatientChange}
            onCreateNew={() => router.push('/prototypes/vo-creation/patients/create')}
            onEdit={patientId ? () => router.push(`/prototypes/vo-creation/patients/edit/${patientId}`) : undefined}
            displayField={(p) => `${p.pat_vorname} ${p.pat_nachname}`}
            statsField={(p) => {
              const stats = getPatientVoStats(p.id);
              if (stats.count === 0) return <span>Keine VOs</span>;
              return (
                <>
                  <div>VOs: {stats.count}</div>
                  <div>Latest: {stats.latestVo} ({stats.latestStatus})</div>
                </>
              );
            }}
            searchFields={['pat_vorname', 'pat_nachname', 'pat_versichertennummer']}
            getId={(p) => p.id}
            required
            createNewLabel="Neu"
          />
          {errors.patient && <p className="text-sm text-red-500 mt-1">{errors.patient}</p>}

          {/* Patient Details - VO Stats Summary */}
          {selectedPatient && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
              {(() => {
                const stats = getPatientVoStats(selectedPatient.id);
                if (stats.count === 0) return 'Keine VOs';
                return `${stats.count} VOs · Letzte: ${stats.latestVo} (${stats.latestStatus}) · ${stats.latestHeilmittel || '-'} · ${stats.latestIcd || '-'}`;
              })()}
            </div>
          )}

          {/* VO Number - Always visible, disabled when no patient */}
          <div className={`mt-4 ${!patientId ? 'opacity-50' : ''}`}>
            <label className="block text-sm font-medium text-foreground mb-1">
              VO Nummer <span className="text-red-500">*</span>
              {isVoNumberAutoGenerated && patientId && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">(automatisch generiert)</span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rezeptNummer}
                onChange={(e) => {
                  setRezeptNummer(e.target.value);
                  setIsVoNumberAutoGenerated(false);
                }}
                placeholder="z.B. 2155-1"
                disabled={!patientId}
                className={`flex-1 px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.rezeptNummer ? 'border-red-500' : 'border-border'
                } ${!patientId ? 'cursor-not-allowed bg-muted' : ''}`}
              />
              {!isVoNumberAutoGenerated && mode === 'create' && patientId && (
                <button
                  type="button"
                  onClick={() => {
                    const newVoNumber = generateVoNumber(patientId);
                    setRezeptNummer(newVoNumber);
                    setIsVoNumberAutoGenerated(true);
                  }}
                  className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Automatisch generieren"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
            {errors.rezeptNummer && <p className="text-sm text-red-500 mt-1">{errors.rezeptNummer}</p>}
          </div>

          {/* Einrichtung - Always visible, disabled when no patient */}
          <div className={`mt-4 ${!patientId ? 'opacity-50' : ''}`}>
            <EntitySearchDropdown
              label="Einrichtung"
              placeholder="Einrichtung suchen..."
              entities={einrichtungen}
              selectedId={einrichtungId}
              onSelect={setEinrichtungId}
              onCreateNew={() => router.push('/prototypes/vo-creation/einrichtungen/create')}
              onEdit={einrichtungId ? () => router.push(`/prototypes/vo-creation/einrichtungen/edit/${einrichtungId}`) : undefined}
              displayField={(e) => e.name}
              searchFields={['name']}
              getId={(e) => e.id}
              createNewLabel="Neu"
              disabled={!patientId}
            />
          </div>

          {/* Folge-VO - Always visible, disabled when no patient */}
          <div className={`mt-4 ${!patientId ? 'opacity-50' : ''}`}>
            <label className="block text-sm font-medium text-foreground mb-1">
              Folge-VO Verknüpfung <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <EntitySearchDropdown
              label=""
              placeholder="Ursprungs-VO suchen..."
              entities={patientId ? vos.filter(v => v.id !== initialVO?.id && v.patient_id === patientId) : []}
              selectedId={parentVOId}
              onSelect={setParentVOId}
              displayField={(v) => {
                const heilmittel = v.treatments?.map(t => t.heilmittel_code).filter(Boolean).join(', ') || '-';
                return `${v.rez_rezept_nummer} (${heilmittel})`;
              }}
              searchFields={['rez_rezept_nummer']}
              getId={(v) => v.id}
              disabled={!patientId}
            />
          </div>
        </div>

        {/* Section 2: Behandlungsteam (Therapeut + Arzt) */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Behandlungsteam
          </h3>

          {/* Therapeut */}
          <div className="mb-4">
            <EntitySearchDropdown
              label="Therapeut auswählen"
              placeholder="Therapeut suchen..."
              entities={therapists}
              selectedId={therapistId}
              onSelect={setTherapistId}
              onCreateNew={() => router.push('/prototypes/vo-creation/team/create')}
              onEdit={therapistId ? () => router.push(`/prototypes/vo-creation/team/edit/${therapistId}`) : undefined}
              displayField={(t) => `${t.vorname} ${t.nachname}`}
              searchFields={['vorname', 'nachname', 'mitarbeiter_nr', 'email']}
              getId={(t) => t.id}
              required
              createNewLabel="Neu"
            />
            {errors.therapist && <p className="text-sm text-red-500 mt-1">{errors.therapist}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-4"></div>

          {/* Arzt */}
          <div>
            <EntitySearchDropdown
              label="Arzt auswählen"
              placeholder="Arzt suchen..."
              entities={arzte}
              selectedId={arztId}
              onSelect={setArztId}
              onCreateNew={() => router.push('/prototypes/vo-creation/doctors/create')}
              onEdit={arztId ? () => router.push(`/prototypes/vo-creation/doctors/edit/${arztId}`) : undefined}
              displayField={(a) => `${a.arzt_vorname} ${a.arzt_nachname}`}
              statsField={(a) => {
                const praxis = praxenData.find(p => p.id === a.praxis_id);
                if (!praxis) return null;
                const mappedPracticeId = (praxisToPracticeMapping as Record<string, string>)[praxis.id];
                const practice = mappedPracticeId ? practicesData.find(p => p.id === mappedPracticeId) : null;
                return (
                  <div className="text-right">
                    <div>{praxis.name}</div>
                    <div className="text-xs opacity-70">ID: {practice?.practiceId || mappedPracticeId || praxis.id}</div>
                  </div>
                );
              }}
              searchFields={['arzt_vorname', 'arzt_nachname', 'arzt_arztnummer']}
              getId={(a) => a.id}
              required
              createNewLabel="Neu"
            />
            {errors.arzt && <p className="text-sm text-red-500 mt-1">{errors.arzt}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-4"></div>

          {/* Praxis */}
          <div>
            <EntitySearchDropdown
              label="Praxis auswählen"
              placeholder="Praxis suchen..."
              entities={practices}
              selectedId={practiceId}
              onSelect={setPracticeId}
              onCreateNew={() => router.push('/prototypes/vo-creation/admin/practices/new')}
              onEdit={practiceId ? () => router.push(`/prototypes/vo-creation/admin/practices/${practiceId}`) : undefined}
              displayField={(p) => p.name}
              statsField={(p) => p.practiceId ? `ID: ${p.practiceId}` : ''}
              searchFields={['name', 'practiceId']}
              getId={(p) => p.id}
              required
              createNewLabel="Neu"
            />
            {errors.practice && <p className="text-sm text-red-500 mt-1">{errors.practice}</p>}

            {selectedPractice && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                Betriebsstätten-Nr: {selectedPractice.practiceId || '-'}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: VO Details (with pill toggles) */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            VO Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Rez Datum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={rezDatum}
                onChange={(e) => setRezDatum(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.rezDatum ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.rezDatum && <p className="text-sm text-red-500 mt-1">{errors.rezDatum}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={rezeptstatus}
                onChange={(e) => setRezeptstatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Diagnose
              </label>
              <input
                type="text"
                value={diagnose}
                onChange={(e) => setDiagnose(e.target.value)}
                placeholder="z.B. Zustand nach Schlaganfall"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Pill Toggles Row */}
            <div className="col-span-2 flex flex-wrap gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Therapiebericht <span className="text-red-500">*</span>
                </label>
                <PillToggle
                  value={therapiebericht === null ? null : therapiebericht === 'Ja'}
                  onChange={(val) => setTherapiebericht(val ? 'Ja' : 'Nein')}
                />
                {errors.therapiebericht && <p className="text-sm text-red-500 mt-1">{errors.therapiebericht}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Doppel Behandlung <span className="text-red-500">*</span>
                </label>
                <PillToggle
                  value={doppelBeh === null ? null : doppelBeh === 'Ja'}
                  onChange={(val) => setDoppelBeh(val ? 'Ja' : 'Nein')}
                />
                {errors.doppelBeh && <p className="text-sm text-red-500 mt-1">{errors.doppelBeh}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Treatments */}
        <div className="bg-background border border-border rounded-lg p-6">
          <TreatmentSection
            treatments={treatments}
            onChange={setTreatments}
            heilmittelCatalog={heilmittelCatalog}
          />
          {errors.treatments && <p className="text-sm text-red-500 mt-2">{errors.treatments}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            {mode === 'create' ? 'VO erstellen' : 'VO speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VOForm;
