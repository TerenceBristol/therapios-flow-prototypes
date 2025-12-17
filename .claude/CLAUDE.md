# Flow Prototypes - Project Instructions

## Overview
This project contains interactive prototypes for Flow (Therapios healthcare management system).
Each prototype is a standalone Next.js page demonstrating specific features.

---

## Prototype Implementation Pattern

### When to Create an Implementation Document

Create a detailed implementation document for any prototype that:
- Has more than 3 components
- Requires mock data with relationships (linked entities)
- Spans multiple pages/routes
- Will take more than one session to complete

### Implementation Document Location

```
docs/implementations/{prototype-name}.md
```

### Document Template

Every implementation document MUST include:

1. **Project Overview** - What, why, user flows
2. **Key Decisions** - Design choices made during planning
3. **File Structure** - Complete file tree
4. **Data Specifications** - TypeScript interfaces with examples
5. **Component Specifications** - Props, behaviors, UI mockups
6. **Page Specifications** - Routes and responsibilities
7. **Implementation Checklist** - Checkboxes for all tasks
8. **Reference Materials** - Related files, screenshots, patterns

### Example Header for Implementation Docs

```markdown
# {Feature Name} - Complete Implementation Guide

> **PURPOSE**: This document is the source of truth for the {feature} prototype.
> Refer to this document after context compaction to maintain continuity.

## Quick Reference
- **URL**: http://localhost:3000/prototypes/{name}
- **Components**: src/components/{name}/
- **Data**: src/data/{name}*.json
- **Storage Key**: {name}-prototype-data
```

---

## Context Recovery After Compaction

When context is compacted during a long implementation:

1. **First**: Read the implementation document at `docs/implementations/{prototype-name}.md`
2. **Check**: Review the implementation checklist to see progress
3. **Continue**: Pick up from the next unchecked item

### Active Implementations

| Prototype | Implementation Doc | Status |
|-----------|-------------------|--------|
| VO Creation | `docs/implementations/vo-creation.md` | In Progress |

---

## Project Conventions

### File Organization

```
src/
├── app/prototypes/{name}/     # Pages
├── components/{name}/          # Components
└── data/{name}*.json           # Mock data
```

### Data Persistence

- Use `sessionStorage` for prototype state
- Key format: `{prototype-name}-prototype-data`
- Initialize from JSON files, sync on changes

### Styling

- Tailwind CSS (already configured)
- Match existing component patterns
- Reference similar components for consistency

### Mock Data

- Use realistic German names and data for Therapios
- Include edge cases (empty states, long names, missing fields)
- Provide enough records for pagination testing

---

## Existing Prototypes (Reference)

For styling and pattern reference, see:

| Prototype | Location | Good For |
|-----------|----------|----------|
| VO Upload | `src/app/prototypes/vo-upload/` | Modals, tables, filters |
| FVO CRM | `src/app/prototypes/fvo-crm/` | Forms, search, CRUD |
| Patient View | `src/app/prototypes/patient-view/` | Tables, row actions |

---

## Running the Project

```bash
cd flow-prototypes
npm run dev
# Open http://localhost:3000
```

Prototypes are listed on the home page at `/`.
