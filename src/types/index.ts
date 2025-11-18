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

// VO Status for FVO CRM (different from main VO system)
export type FVOCRMVOStatus = 'Bestellen' | 'Bestellt' | 'Nachverfolgen' | 'Nachverfolgt' | 'Telefonieren' | 'Telefoniert' | 'In Transit' | 'Received' | 'Keine-Folge VO';

// Order Form Type for PDF generation
export type OrderFormType = 'initial' | 'followup';

// Preferred contact method for practice
export type PreferredContactMethod = 'email' | 'fax' | 'phone';

// Delivery method for batches
export type DeliveryMethod = 'email' | 'fax';

// Opening hours period (for breaks like 9-12, 3-5)
export interface OpeningHoursPeriod {
  open: string; // Time in HH:MM format (24-hour)
  close: string; // Time in HH:MM format (24-hour)
}

// Opening hours for a single day (supports multiple periods for breaks)
export interface OpeningHoursDay {
  periods: OpeningHoursPeriod[]; // Multiple time ranges per day (e.g., 9-12, 3-5)
  isClosed: boolean;
  notes?: string; // Free text comments about hours
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

// Practice address
export interface PracticeAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// Contact person at practice
export interface PracticeContact {
  id: string;
  name: string; // e.g., "Maria", "Front Desk"
  phone: string;
  role?: string; // e.g., "Receptionist", "Manager"
  note?: string; // e.g., "Best for scheduling"
  isPrimary: boolean;
}

// Vacation period for practice or doctor
export interface VacationPeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string; // e.g., "Family holiday", "Conference"
  appliesToDoctorId?: string; // If specified, vacation is for specific doctor only
}

// Facility entity (ER/therapy location)
export interface Facility {
  id: string;
  name: string;
  type: 'ER' | 'Care Home' | 'Clinic';
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

// Therapist entity (individual practitioner)
export interface Therapist {
  id: string;
  name: string;
  facilityId: string; // Reference to Facility
  specialty?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Practice entity (main CRM entity)
export interface Practice {
  id: string;
  practiceId?: number; // Manual numeric ID
  name: string;
  address: string; // Combined address field
  contacts: PracticeContact[]; // Multiple contact numbers with names/notes (replaces phone)
  phone?: string; // DEPRECATED - use contacts array instead (kept for migration)
  fax?: string;
  email?: string;
  openingHours: OpeningHours;
  vacationPeriods?: VacationPeriod[]; // Practice vacation/closure periods
  preferredContactMethod?: PreferredContactMethod;
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

// Note history entry for VO
export interface VONoteEntry {
  text: string;
  userId: string;
  timestamp: string; // ISO timestamp
}

// VO (Verification Order) entity - READ ONLY
export interface PracticeVO {
  id: string;
  voNumber?: string; // VO number (e.g., '3139-1', '2155-6') - can be multiple VOs per patient
  patientName: string;
  therapyType: string; // Heilmittel code (e.g., 'KG-H', 'BO-E-H', 'MLD45H')
  anzahl: number; // Number of treatments (e.g., 6, 10, 12, 18)
  voStatus?: VOStatus; // Actual VO status (Aktiv, Abgebrochen, Fertig Behandelt, etc.)
  status: FVOCRMVOStatus;
  statusTimestamp: string;
  statusDate: string; // Formatted status date (DD.MM.YYYY)
  gebDatum: string; // Patient birth date (DD.MM.YYYY)
  practiceId: string;
  doctorId: string; // Which doctor this VO is for (required)
  therapistId: string; // Which therapist this VO is assigned to (required)
  facilityName: string; // Which facility/ER this VO is going to (derived from therapist.facilityId)
  note?: string; // Latest note (e.g., "card not yet scanned, will be scanned at next visit")
  noteHistory?: VONoteEntry[]; // Full history of notes with audit trail
  createdAt: string;
}

// Activity entity for tracking practice interactions (past events only)
export interface PracticeActivity {
  id: string;
  practiceId: string;
  date: string; // ISO timestamp (auto-set to "now" when created)
  notes: string; // Free-form notes (no type dropdown)
  userId: string;
  createdAt: string;
  // Issue fields (optional - when isIssue is true, activity represents an issue)
  isIssue: boolean;
  issueStatus?: 'active' | 'resolved';
  resolvedAt?: string; // ISO timestamp when issue was resolved
  resolvedBy?: string; // User ID who resolved the issue
}

// Follow-up entity for tracking future scheduled follow-ups
export interface PracticeFollowUp {
  id: string;
  practiceId: string;
  dueDate: string; // YYYY-MM-DD format
  dueTime?: string; // 12-hour format like "2:30 PM"
  notes: string;
  completed: boolean;
  completedAt?: string; // ISO timestamp when completed
  completionNotes?: string; // Notes added when marking complete
  userId: string;
  createdAt: string;
}

// Priority level for practices (used by legacy Priority Queue Panel)
export type PriorityLevel = 'overdue' | 'dueToday' | 'thisWeek' | 'other';

// Computed fields for practice (derived at runtime)
export interface PracticeComputedFields {
  pendingVOCount: number;
  lastActivity?: PracticeActivity;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  priorityLevel?: PriorityLevel; // Optional - only used in legacy Priority Queue Panel
  activeIssueCount: number; // Count of activities with isIssue=true and issueStatus='active'
  latestIssue?: PracticeActivity; // Most recent active issue (activity with isIssue=true) for table display
}

// Extended practice with computed fields for display
export interface PracticeWithComputed extends Practice, PracticeComputedFields {
  doctors: PracticeDoctor[];
}

// Therapist statistics (aggregated VO data by therapist)
export interface TherapistStats {
  therapist: Therapist; // The therapist entity
  facility: Facility; // The facility where therapist works
  totalVOs: number; // Total VOs for this therapist
  pendingVOs: number; // VOs not in "Received" or "In Transit" status
  practices: string[]; // Practice IDs that send VOs to this therapist
  lastVODate?: string; // Date of most recent VO (YYYY-MM-DD)
  timeWindow: string; // "30 days", "60 days", "all time"
}

// Complete FVO CRM data structure
export interface FVOCRMData {
  practices: Practice[];
  doctors: PracticeDoctor[];
  vos: PracticeVO[];
  activities: PracticeActivity[]; // Now includes issues (activities with isIssue=true)
  followUps: PracticeFollowUp[];
  therapists: Therapist[];
  facilities: Facility[];
}
