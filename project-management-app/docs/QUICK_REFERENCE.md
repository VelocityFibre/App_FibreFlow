# FibreFlow Quick Reference - Feature Flags

## 🚀 Quick Start
```bash
# Your daily commands
git checkout feature/your-branch
npm run dev
```

## 🎛️ Feature Flags (.env.local)
```bash
# Copy these to your .env.local file
NEXT_PUBLIC_USE_REACT_QUERY=false
NEXT_PUBLIC_USE_OPTIMIZED_QUERIES=false
NEXT_PUBLIC_USE_NEW_FUNCTIONS=false
NEXT_PUBLIC_USE_ERROR_BOUNDARIES=false
NEXT_PUBLIC_PERFORMANCE_MONITORING=false
```

## 🔧 Safe Code Pattern
```typescript
// ALWAYS use this pattern:
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

function yourFeature() {
  if (isFeatureEnabled(FeatureFlag.USE_NEW_FUNCTIONS)) {
    return yourNewVersion();  // Your improved code
  }
  return originalVersion();   // Keep original working
}
```

## 📋 Testing Checklist
- [ ] Flag OFF - app works? ✓
- [ ] Flag ON - feature works? ✓
- [ ] No console errors? ✓
- [ ] Committed with flag OFF? ✓

## 🆘 Emergency Commands
```bash
# App broken? Do this:
git stash                    # Save your work
git checkout master          # Go to stable
npm install && npm run dev   # Fresh start
```

## 📁 Safe Development Zones
```
✅ Work Here:              ❌ Coordinate First:
src/lib/your-features/     src/app/dashboard/
src/hooks/use-your-thing/  src/app/projects/
src/components/new-stuff/  src/lib/supabase*
```

## 🔄 Git Workflow
```bash
# Morning
git pull origin master

# After coding
git add .
git commit -m "feat: your feature"
git push origin feature/your-branch

# Ready to merge (flags OFF!)
# Create PR on GitHub
```

## 💬 Team Communication
"Working on [feature] with [FLAGS]. Touching [files]."

## 🔍 Debug Tips
1. Flag not working? → Restart dev server
2. Can't see changes? → Check you're on right branch
3. Still broken? → Set all flags to `false`

---
**Remember**: Flags OFF = Safe | Flags ON = Testing