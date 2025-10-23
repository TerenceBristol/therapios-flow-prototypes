# Flow Wireframes - Claude Context File

## Project Overview
This is a Next.js-based prototyping system for Flow, a healthcare application focused on prescription (VO) management and wireframe development.

## Key Information for Future Development

### Project Structure
- **Technology Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Design System:** OKLCH color space, Montserrat typography
- **Location:** `/Users/terence/Documents/Therapios Wireframes Updated/flow-prototypes/`

### Branding & Design
- **Brand Name:** "Flow" (not Therapios)
- **Logo:** Text-based "Flow" logo using Montserrat Bold
- **Typography:**
  - Headings: Montserrat Bold (700)
  - Body text: Montserrat Regular (400)
  - Monospace: JetBrains Mono
- **Color System:** Comprehensive OKLCH-based theme with light/dark mode support
- **Theme File:** `src/Theme.css` - Contains all design tokens and variables

### Architecture & Components

#### Core Components
- `Logo.tsx` - Flow text logo with size variants
- `Navigation.tsx` - Sticky header navigation
- `PrototypeCard.tsx` - Card component for prototype display
- `Section.tsx` - Organizes Final/Draft wireframe sections

#### Routing System
- Homepage: `src/app/page.tsx`
- Dynamic prototype routes: `src/app/prototypes/[slug]/page.tsx`
- Automatic navigation between prototypes and homepage

#### Data Management
- **VO Database:** `src/data/mockVOData.json` (18 realistic German healthcare records)
- **Prototype Metadata:** `src/data/prototypes.json` (currently empty arrays)
- **Types:** `src/types/index.ts` (TypeScript interfaces for VO data and prototypes)

### VO (Prescription) Data Structure

#### VO Status Options
- Bereit, Aktiv, Abgebrochen, Fertig Behandelt, Abgerechnet, Abgelaufen

#### F-VO Status Options  
- Bestellen, Bestelt, Erhalten, Keine Folge-VO

#### Key Data Fields
- Patient name, treatment type (Heilmittel), facility (Einrichtung)
- Therapist, VO number, issue date, treatment status (e.g., "6/12")
- Various status tracking and follow-up prescription management

### Prototype Management System

#### Homepage Layout
```
Flow Wireframes
├── Final Wireframes (production-ready prototypes)
├── Templates (reusable components) 
└── Draft Wireframes (work-in-progress prototypes)
```

#### Adding New Prototypes
When user requests a new prototype:

1. **Create the prototype page** in `/prototypes/[slug]`
2. **Add metadata** to `src/data/prototypes.json`
3. **Update the appropriate section** (final/draft)
4. **Ensure navigation** works correctly

#### Prototype Metadata Format
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'final' | 'draft';
  slug: string;
  createdAt: string;
  lastModified: string;
  tags?: string[];
}
```

### Development Workflow

#### Running the Project
```bash
cd "/Users/terence/Documents/Therapios Wireframes Updated/flow-prototypes"
npm install  # Only needed once
npm run dev  # Start development server
```

#### CRITICAL WORKFLOW NOTE
**ALWAYS use `is_background: true` when running `npm run dev`**
- Running `npm run dev` without background mode blocks the terminal session
- This makes the chat "stuck" and prevents the user from sending new messages
- User specifically requested this be remembered to avoid chat interruptions
- Use: `npm run dev` with `is_background: true` for all development server starts

#### User Profile
- **Non-technical user** - Handle ALL code changes
- **Expects:** Simple instructions, automated setup
- **Provides:** Wireframe descriptions, prototype requirements
- **Never:** Write code directly

#### Workflow Preferences

**Sequential Thinking (Auto-Approved)**
- The `mcp__sequential-thinking__sequentialthinking` tool is pre-approved in `.claude/settings.local.json`
- Use sequential thinking proactively when helpful for complex tasks
- No approval dialogs required - improves workflow efficiency

**Custom Slash Commands**
- `/goseq` - Use sequential thinking, create task list, proceed with code changes
- `/askseq` - Use sequential thinking, ask clarifying questions, wait for approval before changes

**Task Management**
- Always use TodoWrite tool to track multi-step tasks
- Keep user informed of progress
- Mark tasks completed immediately upon finishing
- Break down complex requests into clear, trackable steps

### Common Tasks for Future Sessions

#### Creating New Prototypes
1. Ask user for prototype name and category (Final/Draft)
2. Create slug from prototype name
3. Build prototype page with healthcare-specific components
4. Add metadata to prototypes.json
5. Test navigation and responsive design

#### Using VO Data
- Import from `@/data/mockVOData.json`
- Use TypeScript interfaces from `@/types`
- Display in tables, cards, or other healthcare UI patterns
- Filter by status, date ranges, or other criteria

#### Design Consistency
- Always use theme variables from Theme.css
- Maintain Montserrat typography hierarchy
- Follow OKLCH color system
- Ensure responsive design (mobile-first)
- Use existing component patterns

### Technical Notes

#### Font Setup
- Google Fonts: Montserrat (400, 700) + JetBrains Mono
- CSS variables: `--font-main`, `--font-sub`, `--font-mono`
- Configured in `src/app/layout.tsx`

#### Tailwind Configuration
- Integrated with Theme.css variables
- Custom color classes available
- Responsive breakpoints configured

#### File Paths (Important!)
- Use absolute path: `/Users/terence/Documents/Therapios Wireframes Updated/flow-prototypes/`
- Import aliases: `@/` maps to `src/`
- Always verify file paths before operations

### Deployment & Production

#### Public URL Requirement
**CRITICAL:** Always ensure deployments use the public accessible URL:
- **Public URL:** `https://flow-prototypes.vercel.app/`
- **Not account-specific URLs:** `https://flow-prototypes-xyz-account.vercel.app/`

#### Why This Matters
- Stakeholders need access without Vercel account login
- Clean, shareable URL for presentations and reviews
- Consistent URL for bookmarking and sharing

#### Vercel Deployment Process
1. **Commit changes:** Always commit before deploying
2. **Build locally:** Run `npm run build` to test for errors
3. **Deploy to production:** `vercel --prod`
4. **Verify public URL:** Confirm `https://flow-prototypes.vercel.app/` reflects latest changes
5. **Share public URL:** Always use the clean public URL with stakeholders

#### Domain Configuration
- Project has alias configured: deployment URLs → `flow-prototypes.vercel.app`
- Deployment command creates account-specific URLs but they auto-alias to public URL
- Always reference and share the public URL for stakeholder access

### Quality Standards
- **Mobile-responsive** design required
- **Accessibility** considerations (proper contrast, semantic HTML)
- **TypeScript** strict mode compliance
- **Professional healthcare UI** aesthetic
- **German language** support for VO data display

### Troubleshooting
- If fonts don't load: Check Google Fonts import in layout.tsx
- If colors are wrong: Verify Theme.css import in globals.css
- If routing fails: Check dynamic route structure in prototypes/[slug]
- If build fails: Run `npm run lint` and fix TypeScript errors

---

**Last Updated:** January 2025  
**Status:** Production ready for prototype development  
**Next Steps:** Ready for user prototype requests
