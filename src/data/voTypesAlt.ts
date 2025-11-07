// VO and Patient Type Definitions (Alt version with ICD codes)

export type VOStatus = 'Aktiv' | 'Fertig Behandelt' | 'Abgelaufen' | 'Abgerechnet' | 'Abgebrochen' | 'Bereit';
export type OrderingStatus = 'by_therapist' | 'by_admin';

export interface VO {
  id?: string;
  name: string;
  voNr: string;
  voStatus: VOStatus;
  behStatus: string; // e.g., "3/10"
  tageSeit: number; // Days since last treatment
  tb: string; // "Ja" | "Nein"
  primaererTherapeut: string;
  geteilterTherapeut: string;
  behWbh: number; // Behandlung Wiederholung
  einrichtung: string;
  organizer: string;
  heilmittel: string; // Treatment type
  icdCode: string; // NEW: ICD diagnosis code (e.g., "M54.5", "G43.1")
  abgelehnteBeh: number; // Rejected treatments
  doppelB: string; // "Ja" | "Nein"
  ausstDatum?: string; // Issue date
  fVoStatus?: string;
  frequenz?: string; // Frequency
  arzt?: string; // Doctor name
}

export interface PatientData {
  id: string;
  name: string;
  lastName: string;
  aktivCount: number;
  otherCount: number;
  facility: string;
  primaryTherapist: string;
  sharedTherapists: string[];
  orderingStatus: OrderingStatus;
  vos: VO[];
  lastActivity: Date;
  daysSinceLastTreatment: number;
}

export interface GroupedPatient {
  id: string;
  name: string;
  facility: string;
  primaryTherapist: string;
  sharedTherapists: string[];
  orderingStatus: OrderingStatus;
  activeVOCount: number;
  totalVOCount: number;
  daysSinceLastTreatment: number;
  vos: VO[];
}
