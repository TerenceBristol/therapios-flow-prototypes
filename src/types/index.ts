// VO (Verordnung/Prescription) Status Types
export type VOStatus = 'Bereit' | 'Aktiv' | 'Abgebrochen' | 'Fertig Behandelt' | 'Abgerechnet' | 'Abgelaufen';
export type FVOStatus = 'Bestellen' | 'Bestelt' | '>7 days Bestelt' | '1st Follow up' | '> 7 days after 1st follow up' | '2nd Follow up' | '>7 days 2nd follow up' | 'Erhalten' | 'Keine Folge-VO';

// VO Record Interface
export interface VORecord {
  id: string;
  patientName: string;
  treatmentType: string; // "Heilmittel" 
  heilmittelCode: string; // Specific Heilmittel code like "BO-E-H", "KG-H", etc.
  facility: string; // "Einrichtung"
  therapist: string; // "Therapeut"
  voNumber: string; // "VO Nr."
  issueDate: string; // "Ausst. Datum" - format: DD.MM.YYYY
  treatmentStatus: string; // "Beh. Status" like "6/12", "10/20"
  type: string; // "Art"
  tb: boolean; // TB column 
  voStatus: VOStatus;
  fvoStatus: FVOStatus;
  fvoNumber?: string; // "F-VO"
  doubletreatment: boolean; // "Doppel-Beh."
  secondaryTreatmentStatus?: string; // Second "Beh. Status" column
}

// Prototype Metadata Interface
export interface PrototypeMetadata {
  id: string;
  title: string;
  description: string;
  category: 'final' | 'draft';
  slug: string;
  createdAt: string;
  lastModified: string;
  tags?: string[];
}

// CRM-specific Types - removed CRMColumn as we now use FVOStatus for table view

export interface DoctorInfo {
  name: string;
  phone: string;
  email: string;
  specialty: string;
  practice: string;
}

export interface PatientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  dateOfBirth: string;
}

// CRM Column type for Kanban board
export type CRMColumn = 'Bestellen' | 'Bestelt' | '>7 days Bestelt' | '1st Follow up' | '> 7 days after 1st follow up' | '2nd Follow up' | '>7 days 2nd follow up' | 'Erhalten' | 'Keine Folge-VO';

export interface CRMVORecord extends VORecord {
  doctorInfo: DoctorInfo;
  patientInfo: PatientInfo;
  besteltDate: string; // Date when F.VO was marked as ordered (DD.MM.YYYY format) - used as "Bestelt Date"
  bestellenDate?: string; // Date when F.VO was marked as "Bestellen" (DD.MM.YYYY format)
  firstFollowUpDate?: string; // Date when F.VO was marked as "1st Follow Up" (DD.MM.YYYY format)
  secondFollowUpDate?: string; // Date when F.VO was marked as "2nd Follow Up" (DD.MM.YYYY format)
  notes: string[];
  timeline: {
    action: string;
    timestamp: string;
    fvoStatus?: FVOStatus;
    column?: CRMColumn;
  }[];
  lastActionDate: string;
  currentColumn: CRMColumn;
}

// Component Props Interfaces
export interface PrototypeCardProps {
  prototype: PrototypeMetadata;
  onClick?: () => void;
}

export interface SectionProps {
  title: string;
  prototypes: PrototypeMetadata[];
  onPrototypeClick?: (prototype: PrototypeMetadata) => void;
}

// Therapist Breakdown Types
export interface TherapistBreakdown {
  id: string;
  name: string;
  er: string[];
  fertigVOCount: number;
}
