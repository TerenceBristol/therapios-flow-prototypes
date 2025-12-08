# VO Creation & Editing Prototype - Complete Implementation Guide

> **PURPOSE**: This document is the source of truth for the VO Creation/Editing prototype implementation.
> Refer to this document after context compaction to maintain continuity.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Decisions](#2-key-decisions)
3. [File Structure](#3-file-structure)
4. [Data Specifications](#4-data-specifications)
5. [Component Specifications](#5-component-specifications)
6. [Page Specifications](#6-page-specifications)
7. [Implementation Checklist](#7-implementation-checklist)
8. [Reference Materials](#8-reference-materials)

---

## 1. Project Overview

### What We're Building
A fully isolated prototype for VO (Verordnung/prescription) creation and editing functionality.

### Entry Point
- **URL**: `http://localhost:3000/prototypes/vo-creation`
- **Location**: `src/app/prototypes/vo-creation/`

### User Flow
```
Admin Dashboard (landing)
    ├── Click "Create VO" button → VO Creation Page
    │       ├── Fill form (Therapist, Patient, Arzt, VO Details, Treatments)
    │       ├── Save → Success State
    │       │       ├── "Create Another" → Clear form
    │       │       └── "Return to Dashboard" → Dashboard
    │       └── Cancel → Dashboard
    │
    └── Click "Edit" icon on row → VO Edit Page (pre-populated)
            ├── Modify fields
            ├── Save → Success State → Dashboard
            └── Cancel → Dashboard
```

### Related PRD
- Location: `/Users/terence/Documents/Therapios Wireframes Updated/2025-12-08-vo-creation-editing.md`

---

## 2. Key Decisions

| Question | Decision | Notes |
|----------|----------|-------|
| Isolation level | **Fully isolated** | Separate prototype, no changes to VO Upload |
| Therapist creation | **Create modal** | Based on production screenshots |
| Heilmittel catalog | **Comprehensive + searchable** | 95 items from CSV, type-ahead search |
| Dashboard | **Full production mockup** | Matching production screenshot |
| Data density | **Production-level** | 50+ VOs with pagination |

---

## 3. File Structure

```
src/
├── app/prototypes/vo-creation/
│   ├── page.tsx                      # Dashboard (landing page)
│   ├── create/
│   │   └── page.tsx                  # Create new VO
│   └── edit/
│       └── [id]/
│           └── page.tsx              # Edit existing VO
│
├── components/vo-creation/
│   ├── VODashboard.tsx               # Main dashboard component
│   ├── VOTable.tsx                   # VO list table
│   ├── VOTableFilters.tsx            # Filter dropdowns
│   ├── VOForm.tsx                    # Create/Edit form
│   ├── EntitySearchDropdown.tsx      # Reusable entity search
│   ├── TreatmentRow.tsx              # Single treatment row
│   ├── TreatmentSection.tsx          # Treatment rows container
│   ├── TherapistSection.tsx          # Therapist selection section
│   ├── PatientSection.tsx            # Patient selection section
│   ├── ArztSection.tsx               # Arzt selection section
│   ├── VODetailsSection.tsx          # VO details fields section
│   ├── ParentVOSection.tsx           # Parent VO linking section
│   ├── TherapistModal.tsx            # Create therapist modal
│   ├── PatientModal.tsx              # Create patient modal
│   ├── ArztModal.tsx                 # Create arzt modal
│   └── SuccessState.tsx              # Post-save success view
│
└── data/
    ├── voCreationData.json           # Mock VOs (50+ records)
    ├── therapistsData.json           # Mock therapists (10+)
    ├── patientsData.json             # Mock patients (30+)
    ├── arzteData.json                # Mock doctors (15+)
    └── heilmittelCatalog.json        # Heilmittel catalog (95 items)
```

---

## 4. Data Specifications

### 4.1 VO Object Schema

```typescript
interface VO {
  // Identifiers
  id: string;                         // UUID
  rez_rezept_nummer: string;          // "2155-1", "5548-1"

  // Core VO Fields
  rez_datum: string;                  // ISO date "2025-01-20"
  rez_betriebsstaetten_nr: string;    // e.g., "123456789"
  rez_stationsnummer: string;         // e.g., "01"
  rez_rezeptstatus: VOStatus;         // See status options below
  rez_therapiebericht: "Ja" | "Nein";
  rez_diagnose?: string;              // Free text
  rez_icd_10_code?: string;           // e.g., "G82.12", "F03.G", "R26.0"

  // Linked Entities (by ID)
  therapist_id: string;
  patient_id: string;
  arzt_id: string;
  einrichtung_id?: string;            // Optional facility
  parent_vo_id?: string;              // For Folge-VO linking

  // Treatments
  treatments: Treatment[];

  // Progress Tracking
  beh_completed: number;              // Completed treatments (e.g., 6)
  beh_total: number;                  // Total treatments (e.g., 12)

  // F.VO (Folge-VO) Fields
  fvo_status?: FVOStatus;             // See status options below
  fvo_nummer?: string;                // Linked F.VO number

  // Metadata
  letzte_notiz?: string;              // Last note preview
  ordering_status?: string;           // Ordering workflow status
  created_at: string;                 // ISO datetime
  created_by: string;                 // "By Admin"
}

type VOStatus = "Aktiv" | "Abgelaufen" | "Archiviert" | "Abgerechnet" | "Abgebrochen";
type FVOStatus = "Bestellen" | "Erhalten" | "-";

interface Treatment {
  id: string;
  heilmittel_code: string;            // "KG-H", "MLD60"
  anzahl: number;                     // 18, 10, 6
  frequenz: string;                   // "1-2x/Woche", "2x/Woche"
}
```

### 4.2 Therapist Object Schema

```typescript
interface Therapist {
  id: string;
  mitarbeiter_nr: string;             // "67", "39", "95"
  vorname: string;
  nachname: string;
  email: string;                      // "andreas.rosky.67@therapios.com"
  handy_nummer?: string;              // "+491789795773"
  status: "Aktiv" | "Inaktiv";
  rolle: "ROLE_THERAPIST";
  allow_fvo_ordering?: boolean;
}
```

### 4.3 Patient Object Schema

```typescript
interface Patient {
  id: string;
  pat_anrede?: "Herr" | "Frau";
  pat_vorname: string;
  pat_nachname: string;
  pat_geburtsdatum: string;           // "1952-01-20" (ISO)
  pat_strasse?: string;
  pat_plz?: string;
  pat_ort?: string;
  pat_land?: string;                  // Default: "Deutschland"
  pat_versichertennummer?: string;
  pat_kostentraeger?: string;         // Insurance provider
  pat_zuzahlung_befreit: "Ja" | "Nein";
  pat_zuzahlung_befreit_von?: string; // Date
  pat_zuzahlung_befreit_bis?: string; // Date
}
```

### 4.4 Arzt (Doctor) Object Schema

```typescript
interface Arzt {
  id: string;
  arzt_vorname: string;
  arzt_nachname: string;
  arzt_arztnummer?: string;           // e.g., "123456789"
  arzt_strasse: string;
  arzt_plz: string;
  arzt_ort: string;
  arzt_telefax: string;               // Required for F.VO ordering
}
```

### 4.5 Einrichtung (Facility) Object Schema

```typescript
interface Einrichtung {
  id: string;
  name: string;                       // "Caritas Hospitz Katarinahaus berlin Reinickendorf"
  short_name?: string;                // "HB - No name"
  type?: string;                      // "Pflegeheim", "FSE Pflegeeinrichtung"
}
```

### 4.6 Heilmittel Catalog Item Schema

```typescript
interface Heilmittel {
  code: string;                       // "KG-H" (Kurzzeichen)
  name: string;                       // "KG, auch auf neurophysiolog. Gr. Heim" (Bezeichnung)
  duration: number | null;            // 20 (minutes), null if not applicable
  bereich: "PT" | "ERGO" | "SSSST";   // Category
  kind: "treatment" | "fee" | "passiv";
  bv: boolean;                        // Blanko-Verordnung flag
  text_bestellung?: string;           // Order text for F.VO
}
```

---

## 5. Component Specifications

### 5.1 EntitySearchDropdown

**Purpose**: Reusable type-ahead search dropdown with "Create New" option.

**Props**:
```typescript
interface EntitySearchDropdownProps {
  label: string;                      // "Therapist", "Patient", "Arzt"
  placeholder: string;                // "Search therapist..."
  entities: Entity[];                 // List of searchable entities
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;            // Opens creation modal
  displayField: (entity: Entity) => string;  // How to display in dropdown
  searchFields: string[];             // Fields to search in
  disabled?: boolean;
}
```

**Behavior**:
- Type-ahead filtering on multiple fields
- Shows "No results found. Create new?" when empty
- Click "Create New" opens modal
- On select, auto-fills related read-only fields below

**UI**:
```
┌─────────────────────────────────┐ ┌─────────────┐
│ Search therapist...         ▼   │ │ Create New  │
└─────────────────────────────────┘ └─────────────┘
  ┌─────────────────────────────────┐
  │ Andreas Rosky (67)              │  ← Dropdown items
  │ Sandra Zeibig (66)              │
  │ Marion Frieß-Weisbacher (39)    │
  └─────────────────────────────────┘
```

### 5.2 TreatmentRow

**Purpose**: Single row for Heilmittel/Anzahl/Frequenz input.

**Props**:
```typescript
interface TreatmentRowProps {
  treatment: Treatment;
  index: number;
  heilmittelCatalog: Heilmittel[];
  onChange: (index: number, treatment: Treatment) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;                 // false if only 1 row remains
}
```

**UI**:
```
Heilmittel*       Anzahl*     Frequenz*
┌───────────┐     ┌───────┐   ┌───────────┐  [x]
│ KG-H    ▼ │     │ 18    │   │ 1-2x/Woche│
└───────────┘     └───────┘   └───────────┘
```

**Heilmittel Dropdown**: Searchable with 95 items, shows `code - name (duration min)`.

### 5.3 TreatmentSection

**Purpose**: Container managing 1-8 treatment rows.

**Props**:
```typescript
interface TreatmentSectionProps {
  treatments: Treatment[];
  onChange: (treatments: Treatment[]) => void;
  heilmittelCatalog: Heilmittel[];
}
```

**Behavior**:
- Starts with 2 empty rows on create
- Shows existing treatments on edit
- "+ Add Treatment" adds row (max 8)
- [x] removes row (min 1 required)

### 5.4 TherapistModal

**Purpose**: Create new therapist inline.

**Fields** (based on production screenshot):
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Mitarbeiter-Nr. | Text | Yes | Unique |
| First Name | Text | Yes | - |
| Last Name | Text | Yes | - |
| Email | Email | Yes | Valid email format |
| Handy Nummer | Text | No | - |
| Status | Checkbox | Yes | Default: Aktiv |

**UI**:
```
┌─────────────────────────────────────────┐
│ Create New Therapist                  ✕  │
├─────────────────────────────────────────┤
│ Mitarbeiter-Nr.*                        │
│ ┌───────────────────────────────────┐   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ First Name*           Last Name*        │
│ ┌───────────────┐     ┌───────────────┐ │
│ │               │     │               │ │
│ └───────────────┘     └───────────────┘ │
│                                         │
│ Email*                                  │
│ ┌───────────────────────────────────┐   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Handy Nummer (optional)                 │
│ ┌───────────────────────────────────┐   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ☑ Aktiv                                 │
│                                         │
│              [Cancel]  [Create]         │
└─────────────────────────────────────────┘
```

### 5.5 PatientModal

**Purpose**: Create new patient inline.

**Fields** (from PRD):
| Field | Type | Required |
|-------|------|----------|
| Anrede | Dropdown (Herr/Frau) | No |
| Vorname | Text | Yes |
| Nachname | Text | Yes |
| Geburtsdatum | Date (DD.MM.YYYY) | Yes |
| Strasse | Text | No |
| PLZ | Text | No |
| Ort | Text | No |
| Land | Dropdown | No (default: Deutschland) |
| Versichertennummer | Text | No |
| Kostentraeger | Text | No |
| Zuzahlung befreit | Dropdown (Ja/Nein) | No |
| Von | Date | No (shown if Zuzahlung=Ja) |
| Bis | Date | No (shown if Zuzahlung=Ja) |

### 5.6 ArztModal

**Purpose**: Create new doctor inline.

**Fields** (from PRD):
| Field | Type | Required |
|-------|------|----------|
| Vorname | Text | Yes |
| Nachname | Text | Yes |
| Arztnummer | Text | No |
| Strasse | Text | Yes |
| PLZ | Text | Yes |
| Ort | Text | Yes |
| Telefax | Text | Yes |

### 5.7 VOForm

**Purpose**: Main VO creation/editing form.

**Sections**:
1. **Therapist Section**
   - EntitySearchDropdown for therapist
   - Auto-filled read-only: Mitarbeiter-Nr, Email, Phone

2. **Patient Section**
   - EntitySearchDropdown for patient
   - Auto-filled read-only: Geburtsdatum, Address, Insurance info

3. **Arzt Section**
   - EntitySearchDropdown for arzt
   - Auto-filled read-only: Arztnummer, Address, Telefax

4. **VO Details Section**
   - VO Nummer* (text, unique validation)
   - Rez Datum* (date picker, default: today)
   - Betriebsstaetten_Nr* (text)
   - Stationsnummer* (text)
   - Status* (dropdown: Aktiv, Fertig behandelt, Abgerechnet, Abgebrochen, Archiviert)
   - Therapiebericht* (dropdown: Ja/Nein)
   - Diagnose (text, optional)
   - ICD-10 Code (text, optional)

5. **Parent VO Section** (optional)
   - EntitySearchDropdown for existing VOs
   - Info text: "Links this VO as a Folge-VO of the selected parent. Parent's F.VO Status → Erhalten"

6. **Treatments Section**
   - TreatmentSection component

**Footer**:
- Cancel button (left)
- Save VO button (right, primary)

### 5.8 VODashboard

**Purpose**: Main dashboard landing page.

**Header**:
```
Hallo Super Admin, ich hoffe, Du hast einen wundervollen Tag.

Dashboard - Verwaltung                                      [+ Create VO]
```

**Tabs** (with counts):
| Tab | Description | Count Source |
|-----|-------------|--------------|
| F.-VO erhalten | VOs with fvo_status = "Erhalten" | Dynamic |
| Keine Folge-VO | VOs needing F.VO but not ordered | Dynamic |
| Fertig behandelt | beh_completed = beh_total | Dynamic |
| Arztbericht zu versenden | Need to send therapy report | Dynamic |
| Patient Transfers | Has pending transfers | Dynamic |
| Alle VOs | All VOs | Total count |

**Filters**:
- VO Status dropdown (multi-select)
- ER dropdown
- Therapeut dropdown (searchable)
- Arzt dropdown (searchable)
- "Spalten anzeigen" dropdown (column visibility)
- Search input

**Table**: See VOTable specification below.

**Pagination**: 10 per page, navigation controls.

### 5.9 VOTable

**Purpose**: VO list table with all columns from production.

**Columns**:
| Column | Field | Sortable | Notes |
|--------|-------|----------|-------|
| ☐ | checkbox | No | Row selection |
| Name | patient.nachname, vorname | Yes | Patient name |
| VO Nr. | rez_rezept_nummer | Yes | e.g., "[2155-1]" |
| Geburtsdatum | patient.geburtsdatum | Yes | DD.MM.YYYY |
| Heilmittel | treatments[0].code | Yes | First treatment code |
| ICD | rez_icd_10_code | Yes | - |
| Einrichtung | einrichtung.name | Yes | Facility |
| Therapeut | therapist.nachname | Yes | Therapist name |
| Ausst. Datum | rez_datum | Yes | Issue date |
| Beh. Status | beh_completed / beh_total | No | e.g., "6 / 12", "0 / 20" |
| Arzt | arzt.nachname | Yes | Doctor name |
| TB | rez_therapiebericht | No | "Ja" / "Nein" |
| F.-VO Status | fvo_status | No | Badge: Bestellen (red), Erhalten (green) |
| F.-VO | fvo_nummer | No | Input field or display |
| VO Status | rez_rezeptstatus | No | Badge with color |
| Letzte Notiz | letzte_notiz | No | Truncated text |
| Protokolle | - | No | Icon button |
| Ordering Status | ordering_status | No | Status text |
| Doku | - | No | Icon button |
| Aktion | - | No | Edit (pencil) icon |

**Status Badge Colors**:
| Status | Background | Text |
|--------|------------|------|
| Aktiv | Green-100 | Green-800 |
| Abgelaufen | Yellow-100 | Yellow-800 |
| Archiviert | Gray-100 | Gray-800 |
| Abgerechnet | Blue-100 | Blue-800 |
| Bestellen | Red-100 | Red-800 |
| Erhalten | Green-100 | Green-800 |

### 5.10 SuccessState

**Purpose**: Display after successful VO save.

**UI**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  ✓ VO 12345-1 created successfully              │   │
│   │                                                 │   │
│   │  [Create Another VO]    [Return to Dashboard]   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Behaviors**:
- "Create Another VO" → Clears form, stays on page
- "Return to Dashboard" → Navigates to dashboard

---

## 6. Page Specifications

### 6.1 Dashboard Page (`/prototypes/vo-creation/page.tsx`)

```typescript
// Route: /prototypes/vo-creation
// Component: VODashboard

export default function VOCreationDashboardPage() {
  // State: VOs, filters, pagination, search
  // Load from sessionStorage or mock data
  // Render VODashboard component
}
```

### 6.2 Create Page (`/prototypes/vo-creation/create/page.tsx`)

```typescript
// Route: /prototypes/vo-creation/create

export default function CreateVOPage() {
  // State: form data, validation errors
  // Render VOForm with mode="create"
  // On save: add to sessionStorage, show SuccessState
}
```

### 6.3 Edit Page (`/prototypes/vo-creation/edit/[id]/page.tsx`)

```typescript
// Route: /prototypes/vo-creation/edit/[id]

export default function EditVOPage({ params }: { params: { id: string } }) {
  // Load VO by id from sessionStorage
  // Pre-populate VOForm with mode="edit"
  // On save: update in sessionStorage, show SuccessState
}
```

---

## 7. Implementation Checklist

### Phase 0: Setup
- [x] Create project CLAUDE.md at `.claude/CLAUDE.md`
- [x] Create `docs/implementations/` folder structure
- [x] Move implementation doc to `docs/implementations/vo-creation.md`

### Phase 1: Data Layer
- [x] Create `src/data/heilmittelCatalog.json` (94 items from CSV)
- [x] Create `src/data/therapistsData.json` (10 therapists)
- [x] Create `src/data/patientsData.json` (30 patients)
- [x] Create `src/data/arzteData.json` (15 doctors)
- [x] Create `src/data/einrichtungenData.json` (12 facilities)
- [x] Create `src/data/voCreationData.json` (55 VOs)

### Phase 2: Shared Components
- [x] Create `EntitySearchDropdown.tsx`
- [x] Create `TreatmentRow.tsx`
- [x] Create `TreatmentSection.tsx`

### Phase 3: Entity Creation Modals
- [x] Create `TherapistModal.tsx`
- [x] Create `PatientModal.tsx`
- [x] Create `ArztModal.tsx`

### Phase 4: Form Sections
- [x] Create `TherapistSection.tsx` (integrated into VOForm)
- [x] Create `PatientSection.tsx` (integrated into VOForm)
- [x] Create `ArztSection.tsx` (integrated into VOForm)
- [x] Create `VODetailsSection.tsx` (integrated into VOForm)
- [x] Create `ParentVOSection.tsx` (integrated into VOForm)

### Phase 5: Main Form
- [x] Create `VOForm.tsx`
- [x] Create `SuccessState.tsx`

### Phase 6: Dashboard
- [x] Create `VOTableFilters.tsx` (integrated into VODashboard)
- [x] Create `VOTable.tsx`
- [x] Create `VODashboard.tsx`

### Phase 7: Pages
- [x] Create `/prototypes/vo-creation/page.tsx` (dashboard)
- [x] Create `/prototypes/vo-creation/create/page.tsx`
- [x] Create `/prototypes/vo-creation/edit/[id]/page.tsx`
- [x] Add prototype card to main index page

### Phase 8: State & Interactions
- [x] Implement sessionStorage persistence
- [x] Implement VO number uniqueness validation
- [x] Implement Parent VO linking (updates F.VO Status)
- [x] Wire up all CRUD operations
- [ ] Add unsaved changes confirmation on cancel (optional enhancement)

---

## 8. Reference Materials

### 8.1 Heilmittel CSV Structure
Source: `/Users/terence/Documents/Therapios Wireframes Updated/Heilmittel.xlsx - Table001 (Page 1-3) (1).csv`

Columns:
- Kurzzeichen → code
- Bezeichnung → name
- Duration → duration
- Kind → kind (treatment/fee/passiv)
- BV → bv (boolean)
- Bereich → bereich (PT/ERGO/SSSST)
- Text_Bestellung → text_bestellung

### 8.2 Production Dashboard Screenshot Reference
The dashboard should match the production screenshot provided with:
- Dark header row with columns
- White row backgrounds
- Status badges with colors
- Edit icons in action column
- Pagination at bottom

### 8.3 Production Therapist Form Screenshot Reference
Therapist modal should match production with:
- Nutzer Rolle dropdown (pre-set to Therapist)
- Mitarbeiter-Nr field
- First Name / Last Name side by side
- Email field
- Handy Nummer field
- Status checkbox
- Cancel / Aktualisieren buttons

### 8.4 Existing Codebase Patterns
Reference these existing files for styling patterns:
- `src/components/vo-upload/VOUploadDetailModal.tsx` - Modal patterns
- `src/app/prototypes/vo-upload/admin/page.tsx` - Page layout patterns
- `src/components/fvo-crm/modals/DoctorFormModal.tsx` - Form modal patterns
- `src/components/crm/FilterBar.tsx` - Filter patterns

### 8.5 sessionStorage Key
```
const STORAGE_KEY = 'vo-creation-prototype-data';

// Structure:
{
  vos: VO[],
  therapists: Therapist[],
  patients: Patient[],
  arzte: Arzt[],
  einrichtungen: Einrichtung[]
}
```

---

## Quick Reference Card

**URL**: `http://localhost:3000/prototypes/vo-creation`

**Key Files**:
- Dashboard: `src/app/prototypes/vo-creation/page.tsx`
- Create: `src/app/prototypes/vo-creation/create/page.tsx`
- Edit: `src/app/prototypes/vo-creation/edit/[id]/page.tsx`
- Components: `src/components/vo-creation/`
- Data: `src/data/voCreation*.json`

**Storage Key**: `vo-creation-prototype-data`

**PRD**: `/Users/terence/Documents/Therapios Wireframes Updated/2025-12-08-vo-creation-editing.md`

---

*Document created: 2025-12-08*
*Last updated: 2025-12-08*
