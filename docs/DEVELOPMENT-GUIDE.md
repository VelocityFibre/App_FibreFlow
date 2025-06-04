# FibreFlow Development Guide

## 🚀 Quick Start

### Development Server
```bash
npm run dev  # Automatically runs on http://localhost:7000
```

**Standard URLs:**
- Main App: `http://localhost:7000/`
- Dashboard: `http://localhost:7000/dashboard`
- Theme Test: `http://localhost:7000/theme-test`

## 📁 Project Structure (STRICT - DO NOT DEVIATE)

```
FibreFlow/                          # Root directory
├── src/                           # Main application source
│   ├── app/                       # Next.js App Router pages
│   │   ├── admin/                 # Admin panel pages
│   │   ├── analytics/             # Analytics pages
│   │   ├── api/                   # API routes
│   │   ├── auth/                  # Authentication
│   │   ├── customers/             # Customer management
│   │   ├── dashboard/             # Main dashboard
│   │   ├── projects/              # Project management
│   │   ├── theme-test/            # Theme testing page
│   │   └── ...                    # Other feature pages
│   ├── components/                # Reusable UI components
│   │   ├── analytics/             # Analytics components
│   │   ├── grid/                  # Data grid components
│   │   ├── hierarchy/             # Project hierarchy
│   │   └── ...                    # Other components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility libraries
│   ├── styles/                    # Global CSS and styling
│   └── types/                     # TypeScript type definitions
├── database-tools/                # Database utilities (separate)
├── docs/                          # Project documentation
├── public/                        # Static assets
├── supabase/                      # Database migrations
└── package.json                   # Main app configuration
```

## 🚫 FILE CREATION RULES

### **✅ DO:**
- Create new pages in `src/app/[feature]/page.tsx`
- Create components in `src/components/[category]/`
- Create hooks in `src/hooks/`
- Create utilities in `src/lib/`
- Add types in `src/types/`

### **❌ DON'T:**
- Create files outside the `src/` directory
- Create new top-level folders
- Duplicate existing components
- Create pages outside `src/app/`
- Mix database tools with app code

### **🔍 Before Creating Files:**
1. **Check if similar exists**: Search `src/components/` first
2. **Follow naming**: Use PascalCase for components, camelCase for utilities
3. **Use correct directory**: Match the feature/category structure
4. **Import properly**: Use `@/` alias for absolute imports

## 🎯 Claude Code & Windsurf Rules

### **For AI Assistants:**
1. **Always check existing structure** before creating new files
2. **Use the established folders** - don't create new top-level directories
3. **Search for existing components** before building new ones
4. **Follow the src/ structure** religiously
5. **Use port 7000** in all examples and testing

### **File Organization:**
- **Components**: Group by feature/type in `src/components/`
- **Pages**: Use Next.js App Router structure in `src/app/`
- **Utilities**: Organize by purpose in `src/lib/`
- **Types**: Shared types in `src/types/`

### **Naming Conventions:**
- **Components**: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Hooks**: `use[Name].ts` (e.g., `useProject.ts`)
- **Utilities**: `camelCase.ts` (e.g., `apiHelpers.ts`)

## 🛠️ Development Workflow

### **Starting Development:**
```bash
# 1. Navigate to project
cd /path/to/FibreFlow

# 2. Start development server
npm run dev

# 3. Open browser to: http://localhost:7000
```

### **Adding New Features:**
1. **Plan the structure** first
2. **Check existing components** for reuse
3. **Create in appropriate directory**
4. **Test on theme-test page** if UI component
5. **Follow established patterns**

### **Port Management:**
- **Primary port**: 7000 (configured in package.json)
- **No other ports**: Kill any servers on 3000, 3001, etc.
- **Consistent URLs**: Always use `localhost:7000`

## ⚠️ Common Mistakes to Avoid

1. **Creating duplicate components** - search first!
2. **Wrong file locations** - follow the structure
3. **Multiple servers** - use only port 7000
4. **Breaking imports** - use `@/` alias properly
5. **Ignoring existing patterns** - study current code first

## 📋 Quick Reference

### **Key Commands:**
```bash
npm run dev     # Start development (port 7000)
npm run build   # Build for production
npm run lint    # Run ESLint
```

### **Key URLs:**
- Development: `http://localhost:7000`
- Theme Testing: `http://localhost:7000/theme-test`

### **Key Directories:**
- Pages: `src/app/`
- Components: `src/components/`
- Utilities: `src/lib/`
- Database: `database-tools/` (separate)

---

**Remember: Consistency and organization prevent confusion and bugs!**