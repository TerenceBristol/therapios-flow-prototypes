// VO (Verordnung/Prescription) Status Types
export type VOStatus = 'Aktiv' | 'Abgebrochen' | 'Fertig Behandelt' | 'Abgerechnet' | 'Abgelaufen';
export type BillingStatusInsurance = '' | 'Ready to Send' | 'For Fixing' | 'Sent' | 'Paid';
export type BillingStatusCopayment = '' | 'Paid' | 'For Refund';
export type FVOStatus = '' | 'Bestellen' | 'Bestelt' | '>7 days Bestelt' | '1st Follow up' | '> 7 days after 1st follow up' | 'Anrufen' | 'Erhalten' | 'Keine Folge-VO';
export type OrderingStatus = 'By Admin' | 'By Therapist';

// VO Record Interface
export interface VORecord {
  id: string;
  patientName: string;
  treatmentType: string; // "Heilmittel" 
  heilmittelCode: string; // Specific Heilmittel code like "BO-E-H", "KG-H", etc.
  facility: string; // "Einrichtung"
  therapist: string; // "Therapeut"
  voNumber: string; // "VO Nr."
  uploadId: string; // "Upload ID" - format: xx-x or xxx-x (e.g., "03-1", "145-2")
  issueDate: string; // "Ausst. Datum" - format: DD.MM.YYYY
  treatmentStatus: string; // "Beh. Status" like "6/12", "10/20"
  type: string; // "Art"
  tb: boolean; // TB column 
  voStatus: VOStatus;
  fvoStatus: FVOStatus;
  orderingStatus: OrderingStatus; // Who is responsible for ordering
  fvoNumber?: string; // "F-VO"
  doubletreatment: boolean; // "Doppel-Beh."
  secondaryTreatmentStatus?: string; // Second "Beh. Status" column
  daysSinceLastBeh?: number; // Days since last treatment
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
export type CRMColumn = 'Bestellen' | 'Bestelt' | '>7 days Bestelt' | '1st Follow up' | '> 7 days after 1st follow up' | 'Anrufen' | 'Erhalten' | 'Keine Folge-VO';

export interface CRMVORecord extends VORecord {
  doctorInfo: DoctorInfo;
  patientInfo: PatientInfo;
  besteltDate?: string; // Date when F.VO was marked as ordered (DD.MM.YYYY format) - used as "Bestelt Date"
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

// Validation Record Types (for Billing Dashboard)
export interface ValidationRecord {
  id: string;
  name: string;
  voNr: string;
  heilmittel: string;
  einrichtung: string;
  therapeut: string;
  ausstDatum: string;
  transferStatus: string;
  behStatus: string;
  arzt: string;
  tb: string;
  fvoStatus: string;
  bestelltDatum: string;
  fvo: string;
  voStatus: VOStatus;
  billingStatusInsurance: BillingStatusInsurance;
  billingStatusCopayment: BillingStatusCopayment;
  icdCode?: string;
  zzBefreiung?: string;
  ikNumber?: string;
  amountPerTreatment?: string;
  treatmentHistory?: Array<{
    date: string;
    session: number;
    notes: string;
    therapeut: string;
  }>;
  voSlip?: {
    fileName: string;
    uploadDate: string;
    fileType: string;
    fileSize: number;
  };
  copaymentInfo?: {
    invoiceNumber: string;
    generatedDate: string;
    copaymentAmount: string;
    documentGenerated: boolean;
    refundGenerated: boolean;
    refundAmount: string | null;
    refundDate: string | null;
    refundInvoiceNumber: string | null;
  };
  patientAddress?: {
    nachname: string;
    vorname: string;
    strasse: string;
    plz: string;
    ort: string;
    land: string;
  };
}

// Calendar Activity Types
export type ActivityType = 'Pause' | 'Doku' | 'Other' | 'Treatment (No VO)';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string; // ISO date string YYYY-MM-DD
  duration?: number; // in minutes (optional)
  position: number;
  therapist: string;
  uploadId?: string; // Required for 'Treatment (No VO)' type - format: xx-x or xxx-x
  notes?: string; // Optional
}

// Calendar Treatment Types
export type BehandlungsArt = 'Durchgeführt' | 'Geplant';

export interface CalendarTreatment {
  id: string;
  type: 'treatment';
  patientName: string;
  voNumber: string;
  voId: string; // reference to VO in therapistVOData
  date: string; // ISO date string YYYY-MM-DD
  duration: number; // in minutes
  notes: string;
  behandlungsart: BehandlungsArt;
  patientRejected: boolean;
  position: number;
  therapist: string;
  behStatus: string; // e.g., "4/20" from the VO
}

// ============================================================================
// FVO CRM Types (Practice Follow-up CRM)
// ============================================================================

// Priority level for practice follow-up
export type PriorityLevel = 'overdue' | 'dueToday' | 'thisWeek' | 'other';

// VO Status for FVO CRM (different from main VO system)
export type FVOCRMVOStatus = 'Pending' | 'To Order' | 'Ordered' | 'To Follow Up' | 'Followed Up' | 'To Call' | 'Called' | 'Received';

// Activity type for practice interactions
export type PracticeActivityType = 'Call' | 'Email' | 'Fax' | 'Note';

// Preferred contact method for practice
export type PreferredContactMethod = 'email' | 'fax' | 'phone';

// Delivery method for batches
export type DeliveryMethod = 'email' | 'fax';

// Opening hours for a single day
export interface OpeningHoursDay {
  open: string; // Time in HH:MM format (24-hour)
  close: string; // Time in HH:MM format (24-hour)
  isClosed: boolean;
}

// Opening hours for all days of the week
export interface OpeningHours {
  monday: OpeningHoursDay;
  tuesday: OpeningHoursDay;
  wednesday: OpeningHoursDay;
  thursday: OpeningHoursDay;
  friday: OpeningHoursDay;
  saturday: OpeningHoursDay;
  sunday: OpeningHoursDay;
}

// Key contact at practice
export interface PracticeKeyContact {
  name: string;
  role?: string;
  phone?: string;
  extension?: string;
  email?: string;
}

// Practice address
export interface PracticeAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// Practice entity (main CRM entity)
export interface Practice {
  id: string;
  practiceId?: number; // Manual numeric ID
  name: string;
  address: string; // Combined address field
  phone: string;
  fax?: string;
  email?: string;
  openingHours: OpeningHours;
  preferredContactMethod?: PreferredContactMethod;
  keyContacts: PracticeKeyContact[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Arzt entity (formerly Doctor)
export interface Arzt {
  id: string;
  arztId?: number; // Manual numeric ID
  name: string;
  practiceId?: string;
  facilities: string[]; // List of ER names only
  specialty?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility (will be removed after refactoring)
export type PracticeDoctor = Arzt;

// VO (Verification Order) entity - READ ONLY
export interface PracticeVO {
  id: string;
  patientName: string;
  therapyType: string; // e.g., 'Physical Therapy', 'Speech Therapy'
  status: FVOCRMVOStatus;
  statusTimestamp: string;
  batchId?: string;
  practiceId: string;
  doctorId?: string; // Which doctor this VO is for
  facilityName?: string; // Which facility/ER this VO is going to
  createdAt: string;
}

// Batch entity - READ ONLY
export interface PracticeBatch {
  id: string;
  practiceId: string;
  sentDate: string;
  deliveryMethod: DeliveryMethod;
  voIds: string[];
}

// Activity entity for tracking practice interactions
export interface PracticeActivity {
  id: string;
  practiceId: string;
  date: string; // ISO timestamp
  type: PracticeActivityType;
  notes: string;
  userId: string;
  nextFollowUpDate?: string; // YYYY-MM-DD format
  nextFollowUpTime?: string; // 12-hour format like "2:30 PM"
  createdAt: string;
}

// Computed fields for practice (derived at runtime)
export interface PracticeComputedFields {
  pendingVOCount: number;
  activeBatchCount: number;
  lastActivity?: PracticeActivity;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  priorityLevel: PriorityLevel;
}

// Extended practice with computed fields for display
export interface PracticeWithComputed extends Practice, PracticeComputedFields {
  doctors: PracticeDoctor[];
}

// Complete FVO CRM data structure
export interface FVOCRMData {
  practices: Practice[];
  doctors: PracticeDoctor[];
  vos: PracticeVO[];
  batches: PracticeBatch[];
  activities: PracticeActivity[];
}
