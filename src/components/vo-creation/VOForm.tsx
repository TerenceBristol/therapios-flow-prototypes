'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntitySearchDropdown } from './EntitySearchDropdown';
import { TreatmentSection } from './TreatmentSection';
import { Therapist } from './TherapistModal';
import { Patient } from './PatientModal';
import { Arzt } from './ArztModal';
import { Treatment, Heilmittel } from './TreatmentRow';

export interface VO {
  id: string;
  rez_rezept_nummer: string;
  rez_datum: string;
  rez_betriebsstaetten_nr: string;
  rez_stationsnummer: string;
  rez_rezeptstatus: string;
  rez_therapiebericht: 'Ja' | 'Nein';
  rez_doppel_beh?: 'Ja' | 'Nein';
  rez_diagnose?: string;
  rez_icd_10_code?: string;
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
  initialIcd10Code?: string;
  initialEinrichtungId?: string;
  initialTreatments?: Treatment[];
}

const STATUS_OPTIONS = ['Aktiv', 'Fertig behandelt', 'Abgerechnet', 'Abgebrochen', 'Archiviert'];

export function VOForm({
  mode,
  initialVO,
  therapists,
  patients,
  arzte,
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
  initialIcd10Code,
  initialEinrichtungId,
  initialTreatments,
}: VOFormProps) {
  const router = useRouter();

  // Form state - use pre-population props if provided (from VO Upload / OCR), otherwise use initialVO
  const [therapistId, setTherapistId] = useState(initialVO?.therapist_id || initialTherapistId || '');
  const [patientId, setPatientId] = useState(initialVO?.patient_id || initialPatientId || '');
  const [arztId, setArztId] = useState(initialVO?.arzt_id || initialArztId || '');
  const [einrichtungId, setEinrichtungId] = useState(initialVO?.einrichtung_id || initialEinrichtungId || '');
  const [parentVOId, setParentVOId] = useState(initialVO?.parent_vo_id || '');

  const [rezeptNummer, setRezeptNummer] = useState(initialVO?.rez_rezept_nummer || initialVoNumber || '');
  const [rezDatum, setRezDatum] = useState(initialVO?.rez_datum || new Date().toISOString().split('T')[0]);
  const [betriebsstaettenNr, setBetriebsstaettenNr] = useState(initialVO?.rez_betriebsstaetten_nr || '');
  const [rezeptstatus, setRezeptstatus] = useState(initialVO?.rez_rezeptstatus || 'Aktiv');
  const [therapiebericht, setTherapiebericht] = useState<'Ja' | 'Nein'>(initialVO?.rez_therapiebericht || 'Nein');
  const [doppelBeh, setDoppelBeh] = useState<'Ja' | 'Nein'>(initialVO?.rez_doppel_beh || 'Nein');
  const [diagnose, setDiagnose] = useState(initialVO?.rez_diagnose || '');
  const [icd10Code, setIcd10Code] = useState(initialVO?.rez_icd_10_code || initialIcd10Code || '');

  const [treatments, setTreatments] = useState<Treatment[]>(
    initialVO?.treatments || initialTreatments || [
      { id: `tr-${Date.now()}-1`, heilmittel_code: '', anzahl: 0, frequenz: '' },
      { id: `tr-${Date.now()}-2`, heilmittel_code: '', anzahl: 0, frequenz: '' },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected entities
  const selectedTherapist = therapists.find(t => t.id === therapistId);
  const selectedPatient = patients.find(p => p.id === patientId);
  const selectedArzt = arzte.find(a => a.id === arztId);
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

    if (!rezeptNummer.trim()) {
      newErrors.rezeptNummer = 'VO Nummer ist erforderlich';
    } else if (mode === 'create' && existingVONumbers.includes(rezeptNummer.trim())) {
      newErrors.rezeptNummer = 'Diese VO Nummer existiert bereits';
    }

    if (!rezDatum) newErrors.rezDatum = 'Rez Datum ist erforderlich';
    if (!betriebsstaettenNr.trim()) newErrors.betriebsstaettenNr = 'Betriebsstätten-Nr. ist erforderlich';
    if (!icd10Code.trim()) newErrors.icd10Code = 'ICD-10 Code ist erforderlich';

    // Validate at least one treatment
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
      rez_betriebsstaetten_nr: betriebsstaettenNr.trim(),
      rez_stationsnummer: '', // Not user-editable, derived from Einrichtung
      rez_rezeptstatus: rezeptstatus,
      rez_therapiebericht: therapiebericht,
      rez_doppel_beh: doppelBeh,
      rez_diagnose: diagnose.trim() || undefined,
      rez_icd_10_code: icd10Code.trim(),
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
        {/* Section 1: Therapist */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Therapeut
          </h3>
          <EntitySearchDropdown
            label="Therapeut auswählen"
            placeholder="Therapeut suchen..."
            entities={therapists}
            selectedId={therapistId}
            onSelect={setTherapistId}
            onCreateNew={() => router.push('/prototypes/vo-creation/team/create')}
            displayField={(t) => `${t.vorname} ${t.nachname} (${t.mitarbeiter_nr})`}
            searchFields={['vorname', 'nachname', 'mitarbeiter_nr', 'email']}
            getId={(t) => t.id}
            required
            createNewLabel="Neu"
          />
          {errors.therapist && <p className="text-sm text-red-500 mt-1">{errors.therapist}</p>}

          {selectedTherapist && (
            <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-md text-sm">
              <div>
                <span className="text-muted-foreground">Mitarbeiter-Nr.:</span>
                <span className="ml-2 text-foreground">{selectedTherapist.mitarbeiter_nr}</span>
              </div>
              <div>
                <span className="text-muted-foreground">E-Mail:</span>
                <span className="ml-2 text-foreground">{selectedTherapist.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 ${selectedTherapist.status === 'Aktiv' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedTherapist.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Patient */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Patient
          </h3>
          <EntitySearchDropdown
            label="Patient auswählen"
            placeholder="Patient suchen..."
            entities={patients}
            selectedId={patientId}
            onSelect={setPatientId}
            onCreateNew={() => router.push('/prototypes/vo-creation/patients/create')}
            displayField={(p) => `${p.pat_vorname} ${p.pat_nachname}`}
            searchFields={['pat_vorname', 'pat_nachname', 'pat_versichertennummer']}
            getId={(p) => p.id}
            required
            createNewLabel="Neu"
          />
          {errors.patient && <p className="text-sm text-red-500 mt-1">{errors.patient}</p>}

          {selectedPatient && (
            <div className="mt-4 grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md text-sm">
              <div>
                <span className="text-muted-foreground">Geburtsdatum:</span>
                <span className="ml-2 text-foreground">{formatDate(selectedPatient.pat_geburtsdatum)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Adresse:</span>
                <span className="ml-2 text-foreground">
                  {[selectedPatient.pat_strasse, selectedPatient.pat_plz, selectedPatient.pat_ort].filter(Boolean).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Kostenträger:</span>
                <span className="ml-2 text-foreground">{selectedPatient.pat_kostentraeger || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Zuzahlung befreit:</span>
                <span className="ml-2 text-foreground">{selectedPatient.pat_zuzahlung_befreit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Arzt */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Arzt
          </h3>
          <EntitySearchDropdown
            label="Arzt auswählen"
            placeholder="Arzt suchen..."
            entities={arzte}
            selectedId={arztId}
            onSelect={setArztId}
            onCreateNew={() => router.push('/prototypes/vo-creation/doctors/create')}
            displayField={(a) => `${a.arzt_vorname} ${a.arzt_nachname}`}
            searchFields={['arzt_vorname', 'arzt_nachname', 'arzt_arztnummer']}
            getId={(a) => a.id}
            required
            createNewLabel="Neu"
          />
          {errors.arzt && <p className="text-sm text-red-500 mt-1">{errors.arzt}</p>}

          {selectedArzt && (
            <div className="mt-4 grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md text-sm">
              <div>
                <span className="text-muted-foreground">Arztnummer:</span>
                <span className="ml-2 text-foreground">{selectedArzt.arzt_arztnummer || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Adresse:</span>
                <span className="ml-2 text-foreground">
                  {[selectedArzt.arzt_strasse, selectedArzt.arzt_plz, selectedArzt.arzt_ort].filter(Boolean).join(', ')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Telefax:</span>
                <span className="ml-2 text-foreground">{selectedArzt.arzt_telefax}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: VO Details */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            VO Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                VO Nummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rezeptNummer}
                onChange={(e) => setRezeptNummer(e.target.value)}
                placeholder="z.B. 2155-1"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.rezeptNummer ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.rezeptNummer && <p className="text-sm text-red-500 mt-1">{errors.rezeptNummer}</p>}
            </div>

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
                Betriebsstätten-Nr. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={betriebsstaettenNr}
                onChange={(e) => setBetriebsstaettenNr(e.target.value)}
                placeholder="z.B. 123456789"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.betriebsstaettenNr ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.betriebsstaettenNr && <p className="text-sm text-red-500 mt-1">{errors.betriebsstaettenNr}</p>}
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Therapiebericht <span className="text-red-500">*</span>
              </label>
              <select
                value={therapiebericht}
                onChange={(e) => setTherapiebericht(e.target.value as 'Ja' | 'Nein')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Nein">Nein</option>
                <option value="Ja">Ja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Doppel Beh. <span className="text-red-500">*</span>
              </label>
              <select
                value={doppelBeh}
                onChange={(e) => setDoppelBeh(e.target.value as 'Ja' | 'Nein')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Nein">Nein</option>
                <option value="Ja">Ja</option>
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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                ICD-10 Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={icd10Code}
                onChange={(e) => setIcd10Code(e.target.value)}
                placeholder="z.B. G82.12"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.icd10Code ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.icd10Code && <p className="text-sm text-red-500 mt-1">{errors.icd10Code}</p>}
            </div>
          </div>
        </div>

        {/* Section 5: Einrichtung (optional) */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Einrichtung <span className="text-muted-foreground font-normal">(optional)</span>
          </h3>
          <EntitySearchDropdown
            label="Einrichtung auswählen"
            placeholder="Einrichtung suchen..."
            entities={einrichtungen}
            selectedId={einrichtungId}
            onSelect={setEinrichtungId}
            onCreateNew={() => router.push('/prototypes/vo-creation/einrichtungen/create')}
            displayField={(e) => e.name}
            searchFields={['name']}
            getId={(e) => e.id}
            createNewLabel="Neu"
          />

          {selectedEinrichtung && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 text-foreground">{selectedEinrichtung.id}</span>
            </div>
          )}
        </div>

        {/* Section 6: Parent VO (optional) */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Folge-VO Verknüpfung <span className="text-muted-foreground font-normal">(optional)</span>
          </h3>

          {!patientId ? (
            <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
              Bitte zuerst Patient auswählen
            </div>
          ) : (
            <>
              <EntitySearchDropdown
                label="Ursprungs-VO auswählen"
                placeholder="VO suchen..."
                entities={vos.filter(v => v.id !== initialVO?.id && v.patient_id === patientId)}
                selectedId={parentVOId}
                onSelect={setParentVOId}
                displayField={(v) => {
                  const patient = patients.find(p => p.id === v.patient_id);
                  return `${v.rez_rezept_nummer} - ${patient?.pat_nachname || 'Unbekannt'}`;
                }}
                searchFields={['rez_rezept_nummer']}
                getId={(v) => v.id}
              />

              {selectedParentVO && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  <p className="text-blue-800">
                    Diese VO wird als Folge-VO von <strong>{selectedParentVO.rez_rezept_nummer}</strong> verknüpft.
                    Der F.VO Status der Ursprungs-VO wird auf &quot;Erhalten&quot; gesetzt.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 7: Treatments */}
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
