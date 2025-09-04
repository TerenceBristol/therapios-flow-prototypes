# Adding New Prototypes - Process Guide

## For the User (Non-Technical)

### Simple Process
Just tell Claude:
> "Create a [prototype name] and add it to [Final/Draft] wireframes"

**Example:**
> "Create a Patient Registration prototype and add it to Final wireframes"

### What You Can Request
- **Prototype Name:** Any descriptive name for your wireframe
- **Category:** Either "Final" (production-ready) or "Draft" (work-in-progress)
- **Features:** Describe what the prototype should include
- **VO Integration:** Ask to include prescription data if needed

## For Claude (Technical Implementation)

### Step-by-Step Process

1. **Create Prototype Metadata**
   ```typescript
   const newPrototype: PrototypeMetadata = {
     id: generateId(),
     title: "User Provided Title",
     description: "Brief description of functionality",
     category: 'final' | 'draft',
     slug: createSlug(title),
     createdAt: new Date().toISOString(),
     lastModified: new Date().toISOString(),
     tags: ['healthcare', 'flow', 'other-relevant-tags']
   };
   ```

2. **Update prototypes.json**
   - Add new metadata to appropriate array (final/draft)
   - Path: `src/data/prototypes.json`

3. **Create Prototype Page**
   - Build specific prototype at `src/app/prototypes/[slug]/page.tsx`
   - Include navigation back to homepage
   - Use VO data if healthcare-related
   - Follow design system and theme

4. **Verify Integration**
   - Ensure prototype appears on homepage
   - Test navigation to/from prototype
   - Check responsive design
   - Validate TypeScript compilation

### Code Templates

#### Basic Prototype Page Structure
```tsx
import React from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
// Import VO data if needed: import voData from '@/data/mockVOData.json';

export default function PrototypeName() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="...">← Back to Wireframes</Link>
        
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Prototype Title
        </h1>
        
        {/* Prototype content here */}
      </main>
    </div>
  );
}
```

#### Healthcare Table Component Example
```tsx
import { VORecord } from '@/types';

interface VOTableProps {
  data: VORecord[];
}

const VOTable: React.FC<VOTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-card border border-border rounded-lg">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-foreground">Patient</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">VO Nr.</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record.id} className="border-b border-border hover:bg-muted/50">
              <td className="px-4 py-3">{record.patientName}</td>
              <td className="px-4 py-3">{record.voNumber}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.voStatus)}`}>
                  {record.voStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Quality Checklist
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Proper TypeScript types
- [ ] Theme consistency (colors, fonts, spacing)
- [ ] Navigation integration
- [ ] Healthcare data integration (if applicable)
- [ ] Accessibility considerations
- [ ] German language support for VO data
- [ ] Professional healthcare UI aesthetic

### Common Prototype Types
- **Data Management:** Patient lists, prescription tables, status dashboards
- **Forms:** Registration, prescription creation, status updates
- **Dashboards:** KPI displays, analytics, reporting
- **Workflows:** Multi-step processes, approval flows
- **Templates:** Reusable form templates, document generators

---

**Remember:** The user is non-technical. Handle all implementation details and provide clear feedback on what was created.
