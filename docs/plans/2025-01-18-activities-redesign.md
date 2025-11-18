# FVO CRM Activities Redesign

**Date:** 2025-01-18
**Status:** Approved
**Estimated Effort:** 3-4 hours

## Overview

Simplify the activities system in the FVO CRM from 3 separate entities (Activity, Follow-Up, Issue) to 2 unified types (Activity, Follow-Up) with improved UI/UX for better usability and clarity.

## Problem Statement

The current system has three separate entities for tracking practice interactions:
1. `PracticeActivity` - Past events with type dropdown (Call, Email, Fax, Note)
2. `PracticeFollowUp` - Future scheduled tasks
3. `PracticeIssue` - Practice blockers/delays

This creates unnecessary complexity in the UI and data model. Users need a simpler, more intuitive way to track activities and flag issues.

## Goals

1. **Simplify data model** - Reduce from 3 entities to 2
2. **Streamline forms** - Remove unnecessary type dropdowns
3. **Improve visual organization** - Clear visual hierarchy for active issues, upcoming follow-ups, and history
4. **Maintain functionality** - Keep issue resolution workflow and follow-up completion

## Design Decisions

### 1. Data Model Changes

**Approach:** Unified Entity Model (merge `PracticeIssue` into `PracticeActivity`)

**Rationale:** For a prototype, simplicity is key. A single entity model is:
- Fastest to implement
- Clearest to demonstrate
- Easiest to understand
- Requires no complex migration

**Updated Interfaces:**

```typescript
// REMOVED: PracticeActivityType enum
// REMOVED: PracticeIssue interface

// UPDATED: PracticeActivity
interface PracticeActivity {
  id: string;
  practiceId: string;
  date: string;        // ISO timestamp (auto-set to "now")
  notes: string;       // Free-form notes (no type dropdown)
  userId: string;
  createdAt: string;

  // Issue fields (optional)
  isIssue: boolean;
  issueStatus?: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

// UNCHANGED: PracticeFollowUp
interface PracticeFollowUp {
  id: string;
  practiceId: string;
  dueDate: string;     // YYYY-MM-DD
  dueTime?: string;    // 12-hour format
  notes: string;
  completed: boolean;
  completedAt?: string;
  userId: string;
  createdAt: string;
}
```

### 2. UI/UX Design

**Activities Tab Layout** - Three distinct visual sections:

#### Section 1: Active Issues (Top Priority)
- **Visual treatment:** Red/orange accent border (#ef4444 or #f97316), warning triangle icon
- **Display:** Cards showing issue activities with "Resolve" button
- **Filtering:** Only shows `isIssue: true` AND `issueStatus: 'active'`
- **Empty state:** "No active issues ✓" with success styling
- **Sort order:** Newest first (most recent at top)

#### Section 2: Upcoming Follow-Ups (Middle)
- **Visual treatment:** Blue accent border (#3b82f6), calendar icon
- **Display:** List sorted by due date (soonest first)
- **Color coding:**
  - **Overdue:** Red background (#fecaca)
  - **Due today:** Amber background (#fed7aa)
  - **Due this week:** Yellow background (#fef3c7)
  - **Future:** White/default
- **Actions:** "Complete" button → converts to activity
- **Empty state:** "No upcoming follow-ups"

#### Section 3: Activity History (Bottom)
- **Visual treatment:** Gray header (#f3f4f6), subtle background
- **Display:** Reverse chronological (newest first)
- **Includes:**
  - Regular activities
  - Resolved issues (with gray checkmark badge)
  - Completed follow-ups (with blue "F" badge)
- **Visual indicators:**
  - Regular activity: No badge
  - Resolved issue: `✓ Resolved` badge (gray)
  - From completed follow-up: `F` badge (blue)
- **Pagination:** Shows last 50, "Load more" button
- **Empty state:** "No activity history"

**Section Spacing:** 24px vertical gaps between sections for clear visual separation

### 3. Form Design

**Unified "Add Entry" Modal** - Single modal with toggle:

**Header:**
- Toggle buttons: `[ Activity ] [ Follow-Up ]` (selected state with primary color)
- Dynamic title based on selection

**Activity Form:**
```
┌─────────────────────────────────────┐
│ Add Activity                    [X] │
├─────────────────────────────────────┤
│ [ Activity ] [ Follow-Up ]          │
│                                     │
│ Notes                               │
│ ┌─────────────────────────────────┐ │
│ │ (Describe what happened...)     │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☐ Mark as issue                     │
│                                     │
│         [ Cancel ]  [ Save ]        │
└─────────────────────────────────────┘
```
*Date/time automatically set to "now" when saved*

**Follow-Up Form:**
```
┌─────────────────────────────────────┐
│ Add Follow-Up                   [X] │
├─────────────────────────────────────┤
│ [ Activity ] [ Follow-Up ]          │
│                                     │
│ Due Date                            │
│ ┌─────────────────────────────────┐ │
│ │ [2024-01-20]      📅           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Due Time (optional)                 │
│ ┌─────────────────────────────────┐ │
│ │ [10:00 AM]        🕐           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Notes                               │
│ ┌─────────────────────────────────┐ │
│ │ (What needs to be done...)      │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [ Cancel ]  [ Save ]        │
└─────────────────────────────────────┘
```

**Key Improvements:**
- Removed type dropdown (Call/Email/Fax/Note)
- Single checkbox for issue flag (simple and clear)
- Larger text areas (6 rows for activity, 4 rows for follow-up)
- Better date/time pickers with icons
- Cleaner, more focused layout
- Activities don't need date input (auto-set to now)

## Component Architecture

### Files to Modify

1. **`src/types/index.ts`**
   - Remove `PracticeActivityType` enum
   - Remove `PracticeIssue` interface
   - Update `PracticeActivity` interface with issue fields
   - Keep `PracticeFollowUp` unchanged

2. **`src/data/fvoCRMData.json`**
   - Migrate existing `issues` array to `activities` array
   - Remove `issues` array entirely

3. **`src/components/fvo-crm/ActivitiesSection.tsx`**
   - Major redesign - orchestrates 3 sub-components
   - Handles filtering and data passing

4. **`src/components/fvo-crm/AddActivityModal.tsx`** → **`AddEntryModal.tsx`**
   - Rename and redesign
   - Add Activity/Follow-Up toggle
   - Conditional form fields
   - Remove type dropdown
   - Add issue checkbox

5. **`src/hooks/useFVOCRM.ts`** (or context file)
   - Remove: `addIssue`, `updateIssue`, `resolveIssue`, `deleteIssue`
   - Add: `resolveActivity(activityId, resolvedBy)`
   - Update: `addActivity` to accept `isIssue` parameter

6. **`src/components/fvo-crm/modals/PracticeCRMModal.tsx`**
   - Update props (remove issue handlers)
   - Update component imports

### New Components to Create

1. **`src/components/fvo-crm/ActiveIssuesSection.tsx`**
   - Displays activities where `isIssue: true` and `issueStatus: 'active'`
   - Red/orange accent styling
   - "Resolve" button for each issue

2. **`src/components/fvo-crm/UpcomingFollowUpsSection.tsx`**
   - Displays incomplete follow-ups
   - Color-coded by urgency (overdue, today, week, future)
   - "Complete" button

3. **`src/components/fvo-crm/ActivityHistorySection.tsx`**
   - Displays all activities + resolved issues + completed follow-ups
   - Reverse chronological order
   - Visual badges for different types

4. **`src/components/fvo-crm/modals/ResolveIssueModal.tsx`**
   - Quick modal to mark issue as resolved
   - Optional resolution notes field
   - Captures resolvedBy and resolvedAt

5. **`src/components/fvo-crm/ActiveIssueCard.tsx`**
   - Card component for individual active issues
   - Shows date, notes, "Resolve" button
   - Warning styling

6. **`src/components/fvo-crm/ActivityHistoryItem.tsx`**
   - List item for activity history
   - Conditional badges (resolved issue, from follow-up)
   - Date and notes display

## Data Migration

Since this is a prototype with JSON data:

```javascript
// BEFORE (in fvoCRMData.json):
{
  "activities": [ /* existing activities */ ],
  "issues": [
    {
      "id": "issue-1",
      "practiceId": "prac-1",
      "notes": "Practice is on vacation until Feb 1st",
      "status": "active",
      "createdAt": "2024-01-10T14:30:00Z",
      "createdBy": "user-1"
    }
  ]
}

// AFTER:
{
  "activities": [
    /* ...existing activities... */
    {
      "id": "issue-1",
      "practiceId": "prac-1",
      "date": "2024-01-10T14:30:00Z",  // Use issue.createdAt
      "notes": "Practice is on vacation until Feb 1st",
      "userId": "user-1",              // Use issue.createdBy
      "createdAt": "2024-01-10T14:30:00Z",
      "isIssue": true,
      "issueStatus": "active",         // Map from issue.status
      "resolvedAt": null,
      "resolvedBy": null
    }
  ]
  // "issues" array removed
}
```

## Implementation Sequence

1. ✅ **Create design documentation** (this file)
2. **Update type definitions** (`types/index.ts`)
3. **Migrate JSON data** (`fvoCRMData.json`)
4. **Create new components:**
   - ActiveIssuesSection
   - UpcomingFollowUpsSection
   - ActivityHistorySection
   - ActiveIssueCard
   - ActivityHistoryItem
   - ResolveIssueModal
5. **Update existing components:**
   - ActivitiesSection (redesign)
   - AddActivityModal → AddEntryModal (rename and redesign)
6. **Update data hooks/context:**
   - Add `resolveActivity()` function
   - Update `addActivity()` signature
   - Remove issue-specific functions
7. **Update parent component:**
   - PracticeCRMModal (props and handlers)
8. **Add visual styling:**
   - Section borders and spacing
   - Color-coded urgency indicators
   - Badges for history items
9. **Manual testing:**
   - Add activity (regular and issue)
   - Add follow-up
   - Complete follow-up → creates activity
   - Resolve issue
   - Verify visual organization
   - Test filtering

## Testing Checklist

- [ ] Can add regular activity
- [ ] Can add activity with issue flag
- [ ] Can add follow-up
- [ ] Can complete follow-up (converts to activity)
- [ ] Can resolve active issue
- [ ] Active issues show in top section
- [ ] Resolved issues show in history with badge
- [ ] Completed follow-ups show in history with badge
- [ ] Follow-ups color-coded by urgency
- [ ] Visual sections clearly separated
- [ ] Empty states display correctly
- [ ] All form validations work

## Success Criteria

1. ✅ Two entity types (Activity, Follow-Up) instead of three
2. ✅ Simple forms with no type dropdown
3. ✅ Clear visual organization with 3 distinct sections
4. ✅ Issue resolution workflow preserved
5. ✅ Follow-up completion workflow preserved
6. ✅ All existing functionality maintained
7. ✅ Improved user experience and clarity

## Future Considerations

For production implementation:
- Add real authentication context for userId
- Implement actual data persistence (not just JSON)
- Add undo/redo for resolutions
- Consider activity search/filtering
- Add activity export functionality
- Implement real-time updates for multi-user scenarios

---

*Design approved: 2025-01-18*
