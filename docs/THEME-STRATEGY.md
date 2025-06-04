# FibreFlow Theme Strategy & Design System

## 🎨 Design Philosophy

**Apple-Inspired Minimalism:**
- Clean, white backgrounds
- Generous white space
- Subtle, sophisticated interactions
- Professional, modern typography

## 🎯 Current Theme System

### **Active Themes:**
1. **Light** (Default) - Clean white Apple-style
2. **Dark** - Standard dark theme
3. **VF** - VelocityFibre blue theme
4. **FibreFlow** - Custom brand theme

### **Default Theme:**
- **Light theme** is the default
- Configured in `src/app/providers.tsx`

## 🎨 Design Standards

### **Color Palette:**
```css
Primary Background: #FFFFFF (Pure white)
Primary Text: #1F2937 (Dark gray)
Accent Color: #374151 (Sophisticated charcoal)
Subtle Background: #F3F4F6 (Light gray)
Border Color: #E5E7EB (Very light gray)
```

### **Typography:**
```css
Display Large: 48px, font-weight: 300 (Light)
Heading Large: 32px, font-weight: 300 (Light)
Heading Medium: 20px, font-weight: 500 (Medium)
Body Text: 16px, font-weight: 400 (Regular)
Secondary Text: 14px, font-weight: 400 (Regular)
```

### **Spacing System:**
```css
Section Spacing: 80px (mb-20)
Element Spacing: 48px (mb-12) or 32px (mb-8)
Card Padding: 32px (p-8)
Component Spacing: 16px (mb-4)
```

## 📋 Theme Testing Workflow

### **1. Theme Test Page Location:**
- **URL**: `http://localhost:7000/theme-test`
- **File**: `src/app/theme-test/page.tsx`

### **2. Adding New Themes:**

#### **Step 1: Define Theme in CSS**
Edit `src/styles/globals.css`:
```css
[data-theme="new-theme-name"] {
  --background: 255 255 255;
  --foreground: 29 29 31;
  /* Add all required CSS variables */
}
```

#### **Step 2: Add to Provider**
Edit `src/app/providers.tsx`:
```tsx
themes={['light', 'dark', 'vf', 'fibreflow', 'new-theme-name']}
```

#### **Step 3: Add to Theme Switcher**
Edit `src/components/ThemeSwitcher.tsx`:
```tsx
<button onClick={() => setTheme('new-theme-name')}>
  <IconName className="w-5 h-5" />
</button>
```

#### **Step 4: Test on Theme Test Page**
1. Go to `http://localhost:7000/theme-test`
2. Switch to new theme using theme switcher
3. Verify all components render correctly
4. Check typography, spacing, colors
5. Test form elements, cards, tables

### **3. Theme Testing Checklist:**
- [ ] **Typography scales** render correctly
- [ ] **Card components** have proper backgrounds/borders
- [ ] **Form elements** have correct focus states
- [ ] **Data tables** are readable and styled
- [ ] **Buttons** have proper hover/active states
- [ ] **Color palette** displays correctly
- [ ] **Spacing** feels consistent
- [ ] **Accessibility** contrast is sufficient

## 🛠️ Implementation Rules

### **CSS Structure:**
```css
/* Theme definition in globals.css */
[data-theme="theme-name"] {
  --background: r g b;      /* No hash, space-separated RGB */
  --foreground: r g b;
  --card: r g b;
  --primary: r g b;
  /* etc... */
}

/* Usage in components */
.bg-background { background-color: rgb(var(--background)); }
.text-foreground { color: rgb(var(--foreground)); }
```

### **Component Styling:**
- **Use CSS variables**: `bg-background`, `text-foreground`
- **Avoid hardcoded colors**: No `bg-white`, use `bg-background`
- **Consistent classes**: Follow the utility class system
- **Hover states**: Always include subtle hover effects

### **Testing Requirements:**
1. **All themes must work** on the theme-test page
2. **No broken styling** when switching themes
3. **Consistent spacing** across all themes
4. **Readable text** in all color combinations

## 🎯 Design Decisions

### **Why Light as Default:**
- Professional appearance for business software
- Better readability for data-heavy interfaces
- Aligns with modern design trends
- Apple-inspired clean aesthetic

### **Why Charcoal Accent (#374151):**
- Sophisticated alternative to bright colors
- Works well with white backgrounds
- Professional and modern
- Good contrast for accessibility

### **Why Apple-Style Spacing:**
- Generous white space improves readability
- Creates premium, professional feel
- Reduces visual clutter
- Enhances user focus

## 📐 Layout Standards

### **Page Structure:**
```tsx
<div className="space-y-12">        {/* Page container */}
  <div className="border-b border-gray-100 pb-8 mb-12">  {/* Page header */}
    <h1 className="text-5xl font-light text-gray-900 mb-4">Title</h1>
    <p className="text-xl text-gray-600 font-light">Subtitle</p>
  </div>
  <section className="mb-20">       {/* Content sections */}
    <h2 className="text-3xl font-light text-gray-900 mb-12">Section</h2>
    {/* Content */}
  </section>
</div>
```

### **Card Structure:**
```tsx
<div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
  <h3 className="text-xl font-medium text-gray-900 mb-4">Title</h3>
  <p className="text-gray-600 mb-6">Description</p>
  <button className="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
    Action
  </button>
</div>
```

## 🚫 Theme Anti-Patterns

### **Don't:**
- Use hardcoded colors (`bg-blue-500` instead of theme variables)
- Mix different design systems in one theme
- Create themes without testing on theme-test page
- Use inconsistent spacing between themes
- Ignore accessibility contrast requirements

### **Do:**
- Use CSS custom properties consistently
- Test all components when adding new themes
- Follow the established spacing system
- Maintain consistent typography scales
- Ensure good contrast ratios

## 📱 Responsive Considerations

All themes must work across:
- **Desktop** (1920px+)
- **Tablet** (768px - 1919px)
- **Mobile** (< 768px)

Test responsive behavior on theme-test page by resizing browser window.

---

**Remember: The theme-test page is your source of truth for design consistency!**