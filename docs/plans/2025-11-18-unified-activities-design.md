# Unified Activities Feature - Design Document

**Date:** November 18, 2025
**Project:** FVO CRM Prototype
**Author:** Design Brainstorming Session

## Overview

This document describes the design for unifying the FVO CRM's separate Activities, Follow-ups, and Issues features into a single "Activities" system.

## Problem Statement

The current system has three separate features:
- **Activities** (past events: calls, emails, faxes, notes)
- **Follow-ups** (future scheduled actions)
- **Issues** (active problems/blockers)

This separation creates:
- Decision fatigue (which feature to use?)
- Disconnected workflows (issues often need follow-ups)
- Multiple places to check for practice status

## Goals

1. **Simplify UX** - One place to manage all practice interactions
2. **Maintain isolation** - Don't break other prototypes
3. **Demonstrate workflow** - Prototype for stakeholder review
4. **Quick implementation** - Minimal refactoring

## Solution: Unified Activities

### Feature Name
**"Activities"** - Broad enough to cover logs, scheduled actions, and issues

### Activity Types

Three simplified types:

1. **Log** - Past communication/interaction
   - Replaces: Call, Email, Fax, Note (user describes in notes)
   - Auto-dated to creation time
   - Goes directly to History

2. **Follow-up** - Scheduled future action
   - Requires due date (user input)
   - Optional due time
   - Lives in Upcoming until completed → moves to History

3. **Issue** - Active problem/blocker
   - Auto-dated to creation time
   - Lives in Open Items until resolved → moves to History

### Data Model

**Approach:** Adapter Pattern (minimal changes)

**Existing structures (unchanged):**
```typescript
type PracticeActivity = {
  id: string
  practiceId: string
  date: Date
  type: 'Call' | 'Email' | 'Fax' | 'Note'
  notes: string
  userId: string
}

type PracticeFollowUp = {
  id: string
  practiceId: string
  dueDate: Date
  dueTime?: string
  notes: string
  completed: boolean
  completedAt?: Date
  completionNotes?: string  // NEW
}

type PracticeIssue = {
  id: string
  practiceId: string
  title: string
  description: string
  status: 'active' | 'resolved'
  createdAt: Date
  resolvedAt?: Date
  resolutionNotes?: string  // NEW
}
```

**New fields:**
- `PracticeFollowUp.completionNotes` - Optional notes when marking complete
- `PracticeIssue.resolutionNotes` - Optional notes when resolving

**Date handling:**
- All items track `createdAt` (auto-set when created)
- Logs use existing `date` field
- Follow-ups have both `createdAt` (when scheduled) and `dueDate` (when due)
- Issues use `createdAt` for when the issue was logged

### Display Logic

Three sections organized by status and time:

**1. Upcoming**
- Contains: Follow-ups not completed
- Sort: By due date (earliest first)
- Color coding:
  - 🔴 Red: Overdue (dueDate < today)
  - 🟠 Orange: Due today
  - 🟢 Green: Future (dueDate > today)

**2. Open Items**
- Contains: Issues with status = 'active'
- Sort: By created date (newest first)
- Display: Show creation date for context

**3. History**
- Contains:
  - All logs (PracticeActivity)
  - Completed follow-ups (completed = true)
  - Resolved issues (status = 'resolved')
- Sort: By date (most recent first)
- Limit: Show recent 10-15, "Show more" to expand

**Implementation (inline filtering):**
```typescript
const upcoming = followUps
  .filter(f => !f.completed && f.dueDate >= today)
  .sort((a, b) => a.dueDate - b.dueDate)

const openItems = issues
  .filter(i => i.status === 'active')
  .sort((a, b) => b.createdAt - a.createdAt)

const history = [
  ...activities,
  ...followUps.filter(f => f.completed),
  ...issues.filter(i => i.status === 'resolved')
].sort((a, b) => getDate(b) - getDate(a))
```

## User Interface

### Layout

```
┌─ ACTIVITIES TAB ────────────────────────────────────┐
│ ┌─ Add Activity ────────────────────────────────┐  │
│ │ Type: [Log ▼]  (or Follow-up / Issue)         │  │
│ │ Notes: [_______________________________]       │  │
│ │                                    [Add]       │  │
│ │                                                │  │
│ │ (If Follow-up selected:)                      │  │
│ │ Due Date: [Dec 22, 2024]  Time: [2:00 PM]     │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ▼ UPCOMING (3)                                      │
│   🔴 Call back about forms                          │
│      Created: Dec 18 | Due: Dec 20 (overdue)        │
│      [Complete]                                      │
│                                                      │
│   🟢 Follow-up on VO status                         │
│      Created: Dec 18 | Due: Dec 22, 2pm             │
│      [Complete]                                      │
│                                                      │
│ ▼ OPEN ITEMS (2)                                    │
│   ⚠️ Phone not working                              │
│      Created: Dec 18, 10am                          │
│      [Resolve]                                       │
│                                                      │
│   ⚠️ Fax confirmation pending                       │
│      Created: Dec 15                                │
│      [Resolve]                                       │
│                                                      │
│ ▼ HISTORY (12)                                      │
│   📞 Called practice, spoke with receptionist       │
│      Dec 18, 10:23am                                │
│                                                      │
│   ✓ Follow-up: Spoke with practice                  │
│      Created: Dec 15 | Due: Dec 17                  │
│      Completed: Dec 17, 10am                        │
│      Notes: They'll send forms today                │
│                                                      │
│   ✓ Issue resolved: Wrong phone number             │
│      Created: Dec 14 | Resolved: Dec 16             │
│      Notes: Updated to correct number               │
│                                                      │
│   ... (show more)                                   │
└─────────────────────────────────────────────────────┘
```

### Creation Flow (Inline Form)

**Log:**
1. Select "Log" from type dropdown
2. Enter notes (e.g., "Called practice, spoke with Maria about VO status")
3. Click "Add"
4. Item appears in History with current timestamp

**Follow-up:**
1. Select "Follow-up" from type dropdown
2. Form expands to show Due Date (required) and Time (optional) fields
3. Enter due date/time and notes (e.g., "Call back about VO status")
4. Click "Add"
5. Item appears in Upcoming section, color-coded by due date

**Issue:**
1. Select "Issue" from type dropdown
2. Enter notes describing the problem (e.g., "Practice phone line not working")
3. Click "Add"
4. Item appears in Open Items section

### Completion/Resolution Flow

**Complete Follow-up:**
1. User clicks "Complete" button next to follow-up
2. Inline field appears: "Add completion notes?" (optional)
3. User enters what happened (e.g., "Spoke with practice, they'll send forms today")
4. Click "Save" or press Enter
5. Follow-up marked complete, moves to History with completion timestamp

**Resolve Issue:**
1. User clicks "Resolve" button next to issue
2. Inline field appears: "How was this resolved?" (optional)
3. User enters resolution (e.g., "Phone line fixed, confirmed working")
4. Click "Save" or press Enter
5. Issue marked resolved, moves to History with resolution timestamp

## Technical Implementation

### Component Structure

**New/Modified Files:**

1. **ActivitiesSection.tsx** (NEW)
   - Inline creation form with type selector
   - Three collapsible sections (Upcoming, Open Items, History)
   - Inline filtering and sorting logic
   - Complete/Resolve action handlers

2. **PracticeCRMModal.tsx** (MODIFY)
   - Change tab from "Activity & Follow-ups" to "Activities"
   - Remove "Issues" tab (now part of Activities)
   - Render `<ActivitiesSection />` instead of old components

3. **FVOCRMContext.tsx** (MODIFY)
   - Add `completeFollowUp(id: string, completionNotes?: string)` method
   - Add `resolveIssue(id: string, resolutionNotes?: string)` method
   - Keep existing `addActivity`, `addFollowUp`, `addIssue` methods

**No Changes:**
- `fvoCRMData.json` - Data structure stays the same
- Other components - Practice Info, VOs, etc. unaffected
- Other prototypes - Isolated changes to FVO CRM only

### Implementation Strategy

**Phase 1: Context Updates**
- Add completion/resolution methods to FVOCRMContext
- Test with console logs

**Phase 2: New Component**
- Create ActivitiesSection with all three sections
- Implement inline form with conditional fields
- Add filtering/sorting logic
- Wire up to context methods

**Phase 3: Modal Integration**
- Update PracticeCRMModal tabs
- Replace old tab content with new ActivitiesSection
- Test navigation

**Phase 4: Polish**
- Add color coding for due dates
- Add icons (📞, ⚠️, ✓)
- Test workflows thoroughly

## Table Changes

**Decision:** No changes needed to main practices table

Current columns already support the unified model:
- "Issue" column → Shows count of active issues (Open Items)
- "Last Activity" column → Shows most recent log
- "Next Follow-up" column → Shows nearest upcoming follow-up

These columns already aggregate the data correctly, so no table modifications required.

## Success Criteria

✅ Single "Activities" tab replaces old "Activity & Follow-ups" and "Issues" tabs
✅ Inline form creates all three activity types
✅ Items appear in correct sections based on type and status
✅ Completion workflow adds notes and moves items to History
✅ Resolution workflow adds notes and moves items to History
✅ Color coding works for due dates (red/orange/green)
✅ Other prototypes remain unaffected
✅ Workflow is intuitive for stakeholder demo

## Future Considerations

**Not in this prototype:**
- Edit existing activities
- Delete activities
- Filter/search within sections
- Export activity history
- Activity templates
- Bulk operations

**If moving to production:**
- Consider full data model unification (discriminated union)
- Add edit/delete capabilities
- Implement proper data migration
- Add comprehensive error handling
- Add loading states
- Add optimistic UI updates

## Appendix: Design Decisions

### Why "Activities" instead of "Timeline" or "Log"?
- Industry standard (most CRMs use "Activities")
- Broad enough to cover logs, tasks, and issues
- Familiar to users of other CRM systems

### Why three types instead of more granular?
- Reduces decision fatigue
- Notes describe the specifics (user writes "Called..." or "Emailed...")
- Easier to implement for prototype
- Can always add more types later

### Why inline form instead of modal?
- Reduces clicks (no "Add" button → modal → form → save)
- Matches current UX pattern in the app
- Faster for logging multiple items
- Always visible = encourages use

### Why adapter pattern instead of full refactor?
- This is a prototype for UX demonstration
- Don't want to break other prototypes
- Faster implementation
- Technical debt is acceptable for prototypes
- Can refactor later if moving to production

### Why completion/resolution notes?
- Tracks outcomes (important for CRM context)
- Helps with future decision-making
- Optional (doesn't slow down workflow)
- Common CRM pattern

---

**Document Version:** 1.0
**Last Updated:** November 18, 2025
