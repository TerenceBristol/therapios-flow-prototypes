# Flow Wireframes

Interactive feature wireframes for Flow healthcare system.

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your computer
- Terminal/Command Line access

### Setup Instructions

1. **Navigate to the project folder:**
   ```bash
   cd "/Users/terence/Documents/Therapios Wireframes Updated/flow-prototypes"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

The application will automatically refresh when you make changes to the code.

## 📁 Project Structure

```
flow-prototypes/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # App layout with fonts
│   │   ├── globals.css        # Global styles
│   │   └── prototypes/        # Individual prototype pages
│   │       └── [slug]/page.tsx
│   ├── components/            # Reusable UI components
│   │   ├── Logo.tsx          # Flow logo component
│   │   ├── Navigation.tsx    # Top navigation
│   │   ├── PrototypeCard.tsx # Card component for prototypes
│   │   └── Section.tsx       # Section component for organizing
│   ├── data/                 # Mock data
│   │   ├── mockVOData.json   # Healthcare prescription data
│   │   └── prototypes.json   # Prototype metadata
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── Theme.css            # Design system variables
└── package.json             # Project dependencies
```

## 🎨 Design System

The project uses a comprehensive design system with:
- **Colors:** OKLCH color space with light/dark theme support
- **Typography:** Montserrat (Bold for headings, Regular for body text)
- **Components:** Tailwind CSS with custom theme integration
- **Responsive:** Mobile-first design approach

## 📊 VO Database

The project includes a comprehensive mock database of German healthcare prescriptions (VO data) with:
- 18 realistic sample records
- Patient information, treatment types, facilities, therapists
- VO status tracking (Bereit, Aktiv, Abgebrochen, etc.)
- F-VO status management (Bestellen, Bestelt, Erhalten, Keine Folge-VO)

## 🔧 Adding New Prototypes

To add a new prototype:

1. **Ask Claude to create a prototype:**
   > "Create a [prototype name] and add it to [Final/Draft] wireframes"

2. **Claude will:**
   - Build the prototype page
   - Add it to the appropriate section on the homepage
   - Handle all routing and navigation automatically

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🌟 Features

- **Homepage Sections:**
  - Final Wireframes (production-ready prototypes)
  - Templates (reusable components)
  - Draft Wireframes (work-in-progress prototypes)

- **Navigation:**
  - Clean, professional navigation bar
  - Flow logo with consistent branding
  - Responsive design for all devices

- **Prototype Management:**
  - Dynamic routing for individual prototypes
  - Easy categorization system
  - Visual prototype cards with descriptions

## 🎯 Next Steps

1. Start the development server
2. View the homepage at localhost:3000
3. Ask Claude to create specific prototypes as needed
4. Each prototype will automatically appear in the appropriate section

## 💡 Tips for Non-Technical Users

- Always run `npm run dev` to start the local server
- Keep the terminal window open while working
- The browser will automatically refresh when changes are made
- Ask Claude to handle all code changes and additions
- Use Claude to create new prototype pages by describing what you need

---

**Built with:** Next.js 15, React 19, TypeScript, Tailwind CSS  
**Design System:** Flow Healthcare Theme with Montserrat Typography