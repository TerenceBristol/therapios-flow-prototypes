# Notification Center Design

**Date:** November 4, 2025
**Status:** Approved
**Target:** Therapist Dashboard - Tablet Portrait Optimization

## Overview

The Notification Center is a tabbed dropdown panel that provides therapists with timely reminders and status updates about VOs (Verordnungen/prescriptions) to reduce administrative overhead and prevent missed deadlines. The feature is optimized for tablet devices in portrait orientation.

## User Requirements

- **Frequency:** Low frequency (few notifications per week)
- **Urgency:** Mixed urgency levels requiring visual priority system
- **Device:** Tablet in portrait orientation (primary use case)
- **Goal:** Reduce administrative questions and overhead by proactive reminders

## Architecture

### Access Point
- **Location:** Bell icon in top-right header (next to "Frauke Wolff / Therapist" user info)
- **Badge:** Shows unread notification count (ignores archived notifications)
- **Interaction:** Click/tap opens dropdown panel

### Dropdown Panel Structure
- **Size:** ~50% screen height, ~90% screen width with padding
- **Position:** Below header, right-aligned
- **Overlay:** Semi-transparent backdrop, drop shadow for depth
- **Close:** X button in top-right corner of panel

## Tab Organization

Three tabs provide organization:

1. **Unread (X)** - Shows only unread notifications with count badge
2. **All** - Shows all notifications (read and unread) chronologically
3. **Archive** - Shows archived notifications

### Tab Behavior
- Active tab: Underlined/highlighted with primary blue color
- Touch targets: Minimum 44px height for tablet interaction
- Empty states:
  - Unread: "No unread notifications"
  - All: "No notifications"
  - Archive: "No archived notifications"

## Notification Item Structure

### Collapsed State (Default)

**Visual Components:**
- **Color indicator dot** (left side, 10px diameter):
  - Red (#EF4444): High urgency (VO expired)
  - Yellow/Amber (#F59E0B): Medium urgency (VO expiring soon)
  - Blue (#3B82F6): Informational (status changes, assignments)

- **Header row:** "[Patient Name] • VO [VO Number] • [Date, Time]"
  - Patient name: Bold
  - VO number: Regular weight
  - Timestamp: Light gray, 12-hour format (e.g., "Nov 4, 2:30 PM")

- **Text row:** Single line, ~60 character truncation with ellipsis
  - Example: "VO 4529-4 is expiring in 7 days due to 0 documented treat..."

**Read State Styling:**
- Unread: Bolder header text, subtle light blue/gray background tint (#F0F9FF)
- Read: Normal weight, white/transparent background, slightly muted text

**Layout:**
- Padding: 16px vertical, 12px horizontal
- Border: Subtle bottom border between items
- Entire item is tappable

### Expanded State

**Interaction:**
- Tap anywhere on notification → expands with smooth animation
- Shows full notification message (multi-line if needed)
- "Mark as Read" button appears below full text
  - Button style: Secondary/outline, min 44px height
  - Text changes to "Mark as Unread" for read notifications
  - Clicking toggles read state and collapses notification

**Collapse:**
- Tap expanded notification again (outside button) → collapses
- Marking as read/unread → auto-collapses

## Archive Functionality

### Manual Archive
- **Interaction:** Swipe left on notification reveals "Archive" button
- **Styling:** Gray/neutral color, optional archive icon
- **Availability:** Works in Unread and All tabs on any notification
- **Effect:** Immediately moves notification to Archive tab

### Auto-Archive
- **Rule:** Read notifications automatically archive after 7 days
- **Exception:** Unread notifications never auto-archive
- **Purpose:** Keep main list clean while preserving important unread items

### Archive Tab
- Shows all archived notifications (newest first)
- Maintains read/unread state and color indicators
- No "Mark all as read" button
- Can expand/collapse and toggle read state
- No unarchive option (keeps interaction simple)

## Additional Features

### Mark All as Read
- **Location:** Bottom of panel in Unread and All tabs
- **Visibility:** Only shows when unread notifications exist
- **Label:** "Mark all as read"
- **Action:** Marks all visible unread notifications as read

### Badge Counter
- Shows only unread count (excludes archived)
- Disappears when count reaches 0

## Notification Types

### 1. VO Expiring Soon (Medium Urgency - Yellow)
- **Trigger:** 7 days before VO expiration when no treatments documented
- **Header:** "[Patient Name] • VO [VO Number] • [Date, Time]"
- **Message:** "VO [VO Number] is expiring in [X] days due to 0 documented treatments, please document your first treatment to avoid expiry"

### 2. VO Expired (High Urgency - Red)
- **Trigger:** When VO expires
- **Header:** "[Patient Name] • VO [VO Number] • [Date, Time]"
- **Message:** "VO [VO Number] has expired and VO status was set to Abgelaufen"

### 3. VO Status Change - Completed (Informational - Blue)
- **Trigger:** When all treatments are documented/completed
- **Header:** "[Patient Name] • VO [VO Number] • [Date, Time]"
- **Message:** "VO [VO Number] had all treatments completed and VO status was changed to Fertig Behandelt"

### 4. New VO Assignment (Informational - Blue)
- **Trigger:** When new VO is assigned to therapist
- **Header:** "[Patient Name] • VO [VO Number] • [Date, Time]"
- **Message:** "You have a new VO [VO Number] assigned to you for patient [Patient Name]"

## Data Structure

```typescript
interface Notification {
  id: string;
  type: 'vo-expiring' | 'vo-expired' | 'vo-completed' | 'vo-assigned';
  urgency: 'high' | 'medium' | 'info';
  patientName: string;
  voNumber: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
}
```

## Design Principles

1. **YAGNI (You Aren't Gonna Need It):** Only implement the four specified notification types
2. **Touch-First:** All interactions optimized for tablet touch (44px minimum targets)
3. **Scannable:** Color coding and truncation enable quick scanning
4. **Self-Cleaning:** Auto-archive keeps list manageable
5. **Non-Intrusive:** Dropdown doesn't block workflow, therapist controls when to check
6. **Clear Hierarchy:** Visual urgency system helps prioritization

## Implementation Notes

- Sample data should include mix of all 4 notification types
- Include various timestamps (today, yesterday, week ago)
- Mix of read/unread states
- Different patients and VO numbers for realism
- All text in English for prototype
- Animations should be subtle and smooth (200-300ms)
- Consider reduced motion preferences for accessibility
