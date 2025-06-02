# FibreFlow File Reorganization Plan

## 🎯 Goal
Reorganize project files following Next.js and React best practices without breaking any functionality.

## 📋 Current Issues
1. Documentation files cluttering root directory
2. Components inside route folders
3. Test files in root directory
4. Duplicate theme files
5. Missing standard directories (.github, tests)

## 🏗️ New Structure

```
project-management-app/
├── .github/                        # GitHub specific files
│   └── pull_request_template.md   # (moved from root)
│
├── docs/                          # All documentation
│   ├── PROJECT-HIERARCHY-SPEC.md  # (moved from root)
│   ├── IMPLEMENTATION-PLAN.md     # (moved from root)
│   ├── QUICK-START-HIERARCHY.md   # (moved from root)
│   ├── AI-READY-GUIDE.md          # (moved from root)
│   ├── CLAUDE-ENGINEERING-GUIDE.md # (moved from root)
│   ├── DEVELOPMENT_GUIDE.md       # (moved from root)
│   ├── COLLABORATION.md           # (moved from root)
│   ├── QUICK_REFERENCE.md         # (moved from root)
│   └── SCHEMA.md                  # (existing)
│
├── public/                        # Static assets only
│   ├── images/                    # (new folder for images)
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   └── favicon.ico               # (moved from src/app)
│
├── src/
│   ├── app/                      # App router (pages only)
│   │   ├── (auth)/              # Auth group
│   │   │   └── auth/
│   │   ├── (dashboard)/         # Dashboard group
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   └── ...
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   │
│   ├── components/              # All React components
│   │   ├── analytics/
│   │   ├── grid/               # (new - moved from app/grid)
│   │   │   ├── GridDataTable.tsx
│   │   │   └── TableSelector.tsx
│   │   ├── hierarchy/          # (new - for project hierarchy)
│   │   │   ├── ProjectTree.tsx
│   │   │   ├── DragDropProvider.tsx
│   │   │   └── ...
│   │   ├── ui/                 # (new - base UI components)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   └── [existing components]
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and helpers
│   ├── styles/                 # (new - all CSS/styling)
│   │   ├── globals.css        # (moved from app/)
│   │   └── themes.css         # (consolidated themes)
│   │
│   └── types/                  # (new - TypeScript types)
│       ├── database.ts
│       ├── api.ts
│       └── ui.ts
│
├── supabase/
│   └── migrations/
│       └── consolidate-projects-tables.sql  # (moved from root)
│
├── tests/                      # (new - all test files)
│   ├── performance/
│   │   ├── performance-test.js  # (moved from root)
│   │   └── test-performance.js  # (moved from root)
│   └── unit/
│
├── .env.local
├── .gitignore
├── README.md                   # Keep in root (standard)
├── package.json
├── tsconfig.json
└── [other config files]
```

## 🔄 Migration Steps

### Step 1: Create New Directories
```bash
mkdir -p .github
mkdir -p docs
mkdir -p public/images
mkdir -p src/components/grid
mkdir -p src/components/hierarchy
mkdir -p src/components/ui
mkdir -p src/styles
mkdir -p src/types
mkdir -p tests/performance
mkdir -p tests/unit
```

### Step 2: Move Documentation Files
```bash
# Move all documentation to docs/
mv PROJECT-HIERARCHY-SPEC.md docs/
mv IMPLEMENTATION-PLAN.md docs/
mv QUICK-START-HIERARCHY.md docs/
mv AI-READY-GUIDE.md docs/
mv CLAUDE-ENGINEERING-GUIDE.md docs/
mv DEVELOPMENT_GUIDE.md docs/
mv COLLABORATION.md docs/
mv QUICK_REFERENCE.md docs/

# Move PR template
mv pull_request_template.md .github/
```

### Step 3: Reorganize Components
```bash
# Move grid components out of route folder
mv src/app/grid/GridDataTable.tsx src/components/grid/
mv src/app/grid/TableSelector.tsx src/components/grid/

# Update grid/page.tsx imports
```

### Step 4: Move Static Assets
```bash
# Move images to public/images
mv public/*.svg public/images/

# Move favicon
mv src/app/favicon.ico public/

# Move and consolidate CSS
mv src/app/globals.css src/styles/
```

### Step 5: Move Test Files
```bash
mv performance-test.js tests/performance/
mv test-performance.js tests/performance/
```

### Step 6: Move Database Files
```bash
mv consolidate-projects-tables.sql supabase/migrations/
```

## 📝 Import Updates Required

### 1. Update globals.css import in layout.tsx
```typescript
// Before:
import "./globals.css";

// After:
import "@/styles/globals.css";
```

### 2. Update grid component imports
```typescript
// Before:
import GridDataTable from './GridDataTable';
import TableSelector from './TableSelector';

// After:
import GridDataTable from '@/components/grid/GridDataTable';
import TableSelector from '@/components/grid/TableSelector';
```

### 3. Update favicon reference in layout.tsx
```typescript
// In metadata or head section, update favicon path to /favicon.ico
```

### 4. Update SVG imports
```typescript
// Before:
import Logo from '/next.svg';

// After:
import Logo from '/images/next.svg';
```

## ✅ Benefits

1. **Cleaner root directory** - Only config files remain
2. **Better component organization** - All components in one place
3. **Centralized documentation** - Easy to find and maintain
4. **Standard test structure** - Clear test organization
5. **GitHub integration** - Proper .github folder
6. **Type safety** - Dedicated types directory
7. **Style management** - Centralized styling

## 🚨 Important Notes

1. **Test after each step** - Ensure nothing breaks
2. **Update imports immediately** - Don't let broken imports accumulate
3. **Commit after each major step** - Easy rollback if needed
4. **Update any CI/CD paths** - If you have build scripts
5. **Update documentation** - References to file locations

## 🎯 Quick Checklist

- [ ] Create all new directories
- [ ] Move documentation files
- [ ] Move components out of routes
- [ ] Update all component imports
- [ ] Move static assets
- [ ] Update asset references
- [ ] Move test files
- [ ] Move database files
- [ ] Test the application
- [ ] Update any documentation with new paths

This reorganization follows Next.js best practices and makes the codebase more maintainable!