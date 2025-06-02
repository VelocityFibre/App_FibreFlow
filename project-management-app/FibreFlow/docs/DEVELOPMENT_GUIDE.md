# FibreFlow Development Guide - Safe Parallel Development

## 📁 **CRITICAL: File Management Rules**

### ⚠️ TEMPORARY FILES POLICY
**NEVER place temporary files in the project root!** Always use the temp folder structure:

```
/temp/
  ├── sql/           # Database scripts, migrations, debugging queries
  ├── tests/         # Test files and debugging scripts  
  ├── backups/       # Temporary backups during development
  ├── docs/          # Draft documentation
  └── cleanup/       # Files to delete after completion
```

**✅ DO:**
- Create `/temp/` folder for ALL temporary files
- Use descriptive names: `temp/sql/hierarchy-setup-2024-06-02.sql`
- Delete temp files when development task is complete
- Document temp file purpose in DEVELOPMENT_GUIDE.md

**❌ DON'T:**
- Create `.sql`, `.test.js`, `.debug.ts` files in project root
- Leave temporary files scattered throughout the project
- Create files without clear cleanup plan

**🧹 CLEANUP ROUTINE:**
```bash
# At end of each development session:
rm -rf temp/sql/          # Remove temp SQL scripts
rm -rf temp/tests/        # Remove test files
rm -rf temp/cleanup/      # Remove debugging files
git status                # Ensure no temp files tracked
```

---

This guide explains how to work on FibreFlow safely when multiple developers are building features simultaneously.

## Table of Contents
1. [Overview](#overview)
2. [Feature Flag System](#feature-flag-system)
3. [Setting Up Your Development Environment](#setting-up-your-development-environment)
4. [Building Features Safely](#building-features-safely)
5. [Daily Workflow](#daily-workflow)
6. [Code Examples](#code-examples)
7. [Troubleshooting](#troubleshooting)

## Overview

We use a feature flag system that allows developers to:
- Build new features without affecting production code
- Test improvements safely
- Work in parallel without conflicts
- Toggle features on/off instantly

Think of feature flags as "light switches" for your code - you can turn new features ON for testing and OFF if something breaks.

## Feature Flag System

### How It Works
```
Old Code (Always Works) ──┐
                         ├──> Feature Flag ──> Which code runs?
New Code (Your Work)   ──┘
```

### Available Feature Flags
- `USE_REACT_QUERY`: Enable React Query for data fetching
- `USE_OPTIMIZED_QUERIES`: Enable optimized database queries
- `USE_NEW_FUNCTIONS`: Enable new utility functions
- `USE_ERROR_BOUNDARIES`: Enable error boundary components
- `PERFORMANCE_MONITORING`: Enable performance tracking

## Setting Up Your Development Environment

### 1. Create Your Branch
```bash
# Get latest code
git checkout master
git pull origin master

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies
```bash
cd project-management-app
npm install
```

### 3. Set Up Environment Variables
Create `.env.local` in the project root:
```bash
# .env.local (not committed to git)
# Feature Flags - all OFF by default for safety
NEXT_PUBLIC_USE_REACT_QUERY=false
NEXT_PUBLIC_USE_OPTIMIZED_QUERIES=false
NEXT_PUBLIC_USE_NEW_FUNCTIONS=false
NEXT_PUBLIC_USE_ERROR_BOUNDARIES=false
NEXT_PUBLIC_PERFORMANCE_MONITORING=false

# Your existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Building Features Safely

### The Golden Rule
**NEVER** replace existing code directly. Instead:
1. Keep the original code working
2. Add your improved version alongside
3. Use a feature flag to switch between them

### Safe Pattern Example
```typescript
// src/lib/project-utils.ts
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

// ORIGINAL CODE (don't modify)
async function createProjectOriginal(data: ProjectData) {
  return supabase.from('projects').insert(data);
}

// YOUR IMPROVED VERSION (add alongside)
async function createProjectEnhanced(data: ProjectData) {
  // Add validation
  const validated = validateProjectData(data);
  
  // Add error handling
  try {
    const result = await supabase.from('projects').insert(validated);
    
    // Add audit logging
    await logProjectCreation(result);
    
    return result;
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
}

// SMART SWITCH (exports the right version)
export async function createProject(data: ProjectData) {
  if (isFeatureEnabled(FeatureFlag.USE_NEW_FUNCTIONS)) {
    return createProjectEnhanced(data);
  }
  return createProjectOriginal(data);
}
```

### Testing Your Features
1. **Enable your flag** in `.env.local`:
   ```bash
   NEXT_PUBLIC_USE_NEW_FUNCTIONS=true
   ```

2. **Restart the dev server**:
   ```bash
   npm run dev
   ```

3. **Test your feature**

4. **If something breaks**, disable immediately:
   ```bash
   NEXT_PUBLIC_USE_NEW_FUNCTIONS=false
   ```

## Daily Workflow

### Morning Routine
```bash
# 1. Switch to your branch
git checkout feature/your-feature-name

# 2. Get latest changes from master
git pull origin master

# 3. Start development server
npm run dev
```

### During Development
- Build new features using the safe pattern
- Test with flags ON
- Keep flags OFF when not testing

### End of Day
```bash
# 1. Commit your changes
git add .
git commit -m "feat: describe what you built"

# 2. Push to GitHub
git push origin feature/your-feature-name
```

### Weekly Integration
```bash
# 1. Ensure all flags are OFF in your code
# 2. Create pull request on GitHub
# 3. After review, merge to master
```

## Code Examples

### Example 1: Enhanced Data Fetching
```typescript
// src/hooks/useProjects.ts
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

export function useProjects() {
  // Check if we should use React Query
  const useOptimized = isFeatureEnabled(FeatureFlag.USE_REACT_QUERY);
  
  if (useOptimized) {
    // Use React Query version
    return useQuery({
      queryKey: ['projects'],
      queryFn: fetchProjectsOptimized,
    });
  } else {
    // Use traditional approach
    const [projects, setProjects] = useState([]);
    // ... existing code
    return { data: projects, isLoading, error };
  }
}
```

### Example 2: Error Boundaries
```typescript
// src/app/layout.tsx
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({ children }) {
  if (isFeatureEnabled(FeatureFlag.USE_ERROR_BOUNDARIES)) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }
  return children;
}
```

### Example 3: Performance Monitoring
```typescript
// src/lib/performance.ts
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

export function trackPerformance(metric: string, value: number) {
  if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
    console.log(`Performance: ${metric} = ${value}ms`);
    // Send to analytics service
  }
}
```

## Safe Development Zones

### Your Safe Areas (less likely to conflict)
```
src/
├── lib/
│   ├── validation/           # New validation functions
│   ├── utilities/            # New utility functions
│   └── enhanced/             # Enhanced versions of existing functions
├── hooks/
│   └── use*/                 # New custom hooks
├── components/
│   └── experimental/         # New UI components
└── app/
    └── tools/                # New pages/features
```

### Coordinate With Team (high traffic areas)
```
src/
├── app/dashboard/            # Dashboard team
├── app/projects/             # Core functionality
├── components/               # Shared components
└── lib/supabase*            # Database queries
```

## Troubleshooting

### Common Issues

**"My feature isn't working!"**
- Check `.env.local` - is your flag set to `true`?
- Restart the dev server after changing `.env.local`
- Check browser console for errors

**"I broke the app!"**
1. Set all flags to `false` in `.env.local`
2. Restart dev server
3. App should work with original code

**"Can't see my changes"**
- Make sure you're on your feature branch
- Check that your flag is enabled
- Clear browser cache

**"Merge conflicts"**
- Always pull latest master before starting work
- Keep changes focused and small
- Communicate with team about shared files

### Emergency Recovery
```bash
# If everything is broken:
git stash              # Save your changes
git checkout master    # Go to stable version
npm install           # Reinstall dependencies
npm run dev           # Should work now
```

## Best Practices

1. **Small, Focused Changes**: One feature = one flag
2. **Test Thoroughly**: With flag ON and OFF
3. **Document Your Flags**: Update this guide with new flags
4. **Clean Up**: Remove old flags after features are stable
5. **Communicate**: Tell team when adding new flags

## Team Communication

### Daily Standup Template
```
"Working on: [Feature name]
Using flags: [Which flags]
Potential conflicts: [Shared files you're modifying]"
```

### Before Merging
```
"Ready to merge: [Feature name]
Flags used: [List them]
All flags OFF: ✓
Tested with flags OFF: ✓"
```

## Getting Help

1. **Check this guide first**
2. **Ask in team chat**
3. **Review existing code examples**
4. **Create an issue on GitHub**

Remember: Feature flags let you experiment safely. When in doubt, keep flags OFF!

---

## Claude-Optimized Development Patterns

### Working with Claude Code on FibreFlow

To get the best results when using Claude Code for FibreFlow development, follow these patterns:

#### 1. **Start Every Session with Context**
```markdown
I'm working on FibreFlow with these constraints:
- Stack: Next.js + Supabase + Tailwind + React Query
- Performance: < 50ms response times required
- All new features need feature flags
- Current performance: 92-93% optimized
```

#### 2. **Use Binary Rules**
```markdown
ALWAYS:
- Use React Query for server state
- Include loading and error states
- Add TypeScript types first
- Test with feature flags OFF

NEVER:
- Use useState for server data
- Skip error boundaries
- Expose internal IDs
- Delete records (use soft delete)
```

#### 3. **Provide Clear Success Criteria**
```markdown
Success criteria for this feature:
✅ Response time < 50ms
✅ Works with feature flag OFF
✅ Includes error handling
✅ TypeScript types complete
✅ Follows existing patterns
```

#### 4. **Use IF/THEN Rules for Edge Cases**
```markdown
IF user deletes project with active tasks
THEN show error "Cannot delete project with active tasks"

IF API call takes > 50ms
THEN implement caching or optimize query

IF component renders > 100 items
THEN implement virtualization
```

#### 5. **Template for Feature Requests**
```markdown
Feature: [Name]
Context: [Current state]
Requirements:
1. [Specific requirement]
2. [Another requirement]

Constraints:
- Must work with existing [component/pattern]
- Performance budget: [X]ms
- Feature flag name: [FLAG_NAME]

Please implement:
1. TypeScript interfaces
2. Database schema updates
3. API endpoints with validation
4. React components
5. Tests
```

### Common Claude Code Prompts for FibreFlow

#### For New Features:
```
"Add [feature] to FibreFlow following our React Query patterns and < 50ms performance requirement. Use feature flag USE_[FEATURE_NAME]."
```

#### For Bug Fixes:
```
"Fix [issue] in FibreFlow. Maintain < 50ms response time and backward compatibility. Add tests for the fix."
```

#### For Optimizations:
```
"Optimize [component] to achieve < 50ms response time. Current: [X]ms. Use feature flag for risky changes."
```

#### For Code Review:
```
"Review this FibreFlow code for: performance (< 50ms), React Query usage, error handling, and TypeScript types."
```

See [`CLAUDE-ENGINEERING-GUIDE.md`](./CLAUDE-ENGINEERING-GUIDE.md) for comprehensive prompt engineering principles.