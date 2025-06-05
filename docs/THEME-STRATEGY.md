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
<div className="ff-page-container">
  {/* Clean Header Section */}
  <div className="ff-page-header">
    <h1 className="ff-page-title">Page Title</h1>
    <p className="ff-page-subtitle">Clear description of page purpose</p>
  </div>

  {/* Selection/Filter Section (when needed) */}
  <section className="ff-section">
    <div className="relative">
      <label className="ff-label mb-4 block">Selection Label</label>
      <div className="relative max-w-full">
        <button className="w-full ff-card text-left flex items-center justify-between p-8 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="w-4 h-4 rounded-full bg-status-color"></div>
            <div className="flex-1">
              <div className="text-2xl font-light text-foreground mb-2">Selection Title</div>
              <div className="text-muted-foreground flex items-center gap-4 text-lg">
                {/* Status info */}
              </div>
            </div>
          </div>
          <ChevronIcon />
        </button>
      </div>
    </div>
  </section>

  {/* Content Sections */}
  <section className="ff-section">
    <h2 className="ff-section-title">Content Section</h2>
    {/* Content */}
  </section>
</div>
```

### **Selection Section Pattern:**
The selection section should always:
1. **Be a separate section** below the header with `ff-section` spacing
2. **Span full width** for visual balance
3. **Use large, light typography** (`text-2xl font-light`)
4. **Include status indicators** with proper color coding
5. **Have generous padding** (`p-8`) for Apple-inspired feel
6. **Show smooth transitions** for interactions

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

## 📊 AG Grid Theme Integration

### **AG Grid v33 Theming:**
AG Grid themes are **separate from FibreFlow themes** but work together:

- **FibreFlow themes**: Control overall app appearance (backgrounds, typography, buttons)
- **AG Grid themes**: Control data grid appearance (cells, headers, borders)

### **Configuration:**
```tsx
// Correct (v33+ Theming API):
<AgGridReact theme="quartz" />

// Incorrect (causes conflict):
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
```

### **Available AG Grid Themes:**
- **quartz**: (Recommended) Clean, modern look that complements our light theme
- **balham**: Traditional spreadsheet style
- **alpine**: Compact theme with good data density
- **material**: Google Material Design style

### **Integration Guidelines:**
1. **Always use the theme prop**, never import CSS files
2. **"quartz" theme** works best with our Apple-inspired design
3. **No className needed** on wrapper div (no `ag-theme-quartz` class)
4. **Theme is self-contained** - doesn't conflict with FibreFlow themes

## 🎯 **Selection Section Implementation Guide**

### **How to Request This Pattern:**
When asking Claude Code to implement selection sections, use this prompt structure:

```
Please implement the FibreFlow selection section pattern on [page_name]:

1. Move the [selector_type] below the header as a separate ff-section
2. Use the full-width card layout with p-8 padding
3. Include status indicators with proper color coding
4. Apply text-2xl font-light typography for the main title
5. Add hover effects and smooth transitions
6. Follow the established spacing and theme guidelines

The selection should show: [specific_content_requirements]
```

### **Example Implementation Request:**
```
Please implement the FibreFlow selection section pattern on the my-tasks page:

1. Move the user selector below the header as a separate ff-section  
2. Use the full-width card layout with p-8 padding
3. Include user avatar/status with proper color coding
4. Apply text-2xl font-light typography for "Hein van Vuuren (You)"
5. Add hover effects and smooth transitions
6. Follow the established spacing and theme guidelines

The selection should show: User name, role, task count, and filter options
```

## 🚫 Theme Anti-Patterns

### **Don't:**
- Use hardcoded colors (`bg-blue-500` instead of theme variables)
- Mix different design systems in one theme
- Create themes without testing on theme-test page
- Use inconsistent spacing between themes
- Ignore accessibility contrast requirements
- Import AG Grid CSS files when using v33+
- **Put selectors in the header section**
- **Use small padding (less than p-6) on selection cards**
- **Mix different typography weights in selection sections**

### **Do:**
- Use CSS custom properties consistently
- Test all components when adding new themes
- Follow the established spacing system
- Maintain consistent typography scales
- Ensure good contrast ratios
- Use AG Grid's theme prop for data grids
- **Separate selection sections from headers**
- **Use generous padding (p-8) for premium feel**
- **Apply consistent light typography (font-light)**

## 📱 Responsive Considerations

All themes must work across:
- **Desktop** (1920px+)
- **Tablet** (768px - 1919px)
- **Mobile** (< 768px)

Test responsive behavior on theme-test page by resizing browser window.

---

**Remember: The theme-test page is your source of truth for design consistency!**