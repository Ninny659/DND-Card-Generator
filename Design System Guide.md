# Design System Guide

## 📐 Core Principles

### 1. Accessibility First
- All interactive elements must have visible focus states
- Maintain WCAG 2.1 AA colour contrast ratios (4.5:1 for normal text)
- Touch targets should be minimum 44x44px for mobile
- Use semantic HTML and ARIA labels where appropriate

### 2. Consistency
- Use the defined spacing scale, colours, and typography throughout
- Maintain consistent interaction patterns across components
- Keep animation timing and easing uniform

### 3. Progressive Enhancement
- Design works without JavaScript
- Graceful degradation for older browsers
- Mobile-first responsive approach

---

## 🎨 Colour Palette

### Neutral Greys (Primary)
```css
--grey-100: #f3f4f6   /* Page background */
--grey-200: #e5e7eb   /* Borders (light) */
--grey-300: #d1d5db   /* Borders (default) */
--grey-400: #9ca3af   /* Disabled text */
--Custom Grey: #2f2f2f   /* Secondary text */
--grey-600: #4b5563   /* Body text (light) */
--grey-700: #374151   /* Body text */
--grey-800: #1f2937   /* Headings */
--grey-900: #111827   /* Emphasis text */
```

### Hover
```css
--blue-400 50% Opacity:  #60a5fa83   /* Hover backgrounds */
--Custom Grey: #2F2F2F /* Text colour*/
```

### Tool Colours
```css
/* Primary (Blue) - for focus, links, active states */
--blue-400: #60a5fa
--blue-500: #3b82f6   /* Primary tool colour */
--blue-700: #1d4ed8
--blue-800: #1e40af   /* Selected text */

/* Success (Green) - for primary actions */
--green-500: #10b981
--green-600: #059669
--green-700: #047857
```

---

## 📏 Spacing Scale

Use multiples of 4px for consistency:

```css
--spacing-1:  4px
--spacing-2:  8px
--spacing-3:  12px
--spacing-4:  16px
--spacing-5:  20px
--spacing-6:  24px
--spacing-8:  32px
--spacing-10: 40px
--spacing-12: 48px
```

### Common Patterns
- **Margins between sections:** 20-24px
- **Padding inside containers:** 24px
- **Gap in flex/grid layouts:** 8-10px
- **Button padding:** 10px 20px
- **Input padding:** 12px

---

## 🔤 Typography

### Font Families
```css
/* Primary (UI) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

/* Monospace (Code) */
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### Font Sizes
```css
--text-xs:   12px
--text-sm:   14px
--text-base: 15px
--text-lg:   16px
--text-xl:   18px
--text-2xl:  24px  /* H2 */
```

### Font Weights
```css
--font-normal:  400
--font-medium:  500   /* Labels, UI text */
--font-semibold: 600  /* Emphasis, selected states */
```

---

## 🔘 Interactive Elements

### Buttons

#### Standard Button
```css
padding: 10px 20px;
background: #ffffff;
border: 2px solid #d1d5db;
border-radius: 6px;
font-weight: 500;
colour: #374151;
transition: all 0.2s ease;
```

**States:**
- **Hover:** `background: #f9fafb; border-colour: #6b7280; transform: translateY(-1px);`
- **Focus:** `outline: 2px solid #3b82f6; outline-offset: 2px;`
- **Active:** `transform: translateY(0);`

#### Primary Button (Call-to-Action)
```css
padding: 12px 24px;
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
colour: white;
border: none;
border-radius: 6px;
font-weight: 600;
box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
```

**States:**
- **Hover:** Darker gradient + `transform: translateY(-2px);` + stronger shadow
- **Active:** `transform: translateY(0);` + reduced shadow

### Checkboxes
```css
width: 18px;
height: 18px;
accent-colour: #3b82f6;
cursor: pointer;
```

### Labels with Checkboxes
```css
display: inline-flex;
align-items: center;
padding: 8px 16px;
border: 2px solid #d1d5db;
border-radius: 6px; /* or 24px for pill shape */
transition: all 0.2s ease;
```

**States:**
- **Hover:** Border darkens, lift effect, subtle shadow
- **Focus-within:** Blue outline
- **Checked:** Bold text with blue colour

### Text Inputs & Textareas
```css
border: 2px solid #d1d5db;
border-radius: 6px;
padding: 12px;
transition: border-colour 0.2s ease;
```

**Focus state:**
```css
border-colour: #3b82f6;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
outline: none;
```

---

## 🎭 Animations & Transitions

### Standard Timing
```css
transition: all 0.2s ease;
```

### Micro-interactions
- **Hover lift:** `transform: translateY(-1px);` (0.2s)
- **Button press:** `transform: translateY(0);` (immediate)
- **Fade in:** 0.3s ease

### Fade In Animation
```css
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

## 📦 Shadows

### Elevation System
```css
/* Level 1 - Subtle (cards, inputs on hover) */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

/* Level 2 - Medium (cards, containers) */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);

/* Level 3 - High (sheets, modals) */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

/* Primary button shadow */
box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
```

---

## 📐 Border Radius

```css
--radius-sm: 4px   /* Sheets */
--radius-md: 6px   /* Buttons, inputs */
--radius-lg: 8px   /* Cards, containers */
--radius-xl: 24px  /* Pills, tags */
```

---

## 🎯 Component Patterns

### Tab Navigation
- Underline active tab with tool colour
- Keep inactive tabs muted (grey-500)
- Use transparent background for modern look
- 12px vertical padding, 24px horizontal

### Selection Pills (Class/Type selectors)
- Pill shape: 24px border-radius
- Consistent 8px 16px padding
- Hover: lift + subtle shadow
- Checked: bold text + blue accent

### Cards & Containers
- White background on coloured page background
- 8px border-radius
- Layered shadows for depth
- 24px padding

---

## ♿ Accessibility Checklist

### Focus Indicators
- [ ] 2px solid blue outline
- [ ] 2px offset from element
- [ ] Visible on all interactive elements

### Touch Targets
- [ ] Minimum 44x44px (mobile)
- [ ] Adequate spacing between clickable elements

### Colour Contrast
- [ ] Body text: 4.5:1 minimum
- [ ] UI text: 4.5:1 minimum
- [ ] Icons/graphics: 3:1 minimum

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Clear focus indicators

### Screen Readers
- [ ] Semantic HTML (`<button>`, `<label>`, etc.)
- [ ] ARIA labels where needed
- [ ] Alt text for images

---

## 🛠️ Implementation Tips

### 1. Start with Mobile
Design for mobile screens first, then enhance for larger screens.

### 2. Use CSS Custom Properties
Define your design tokens as CSS variables at `:root` for easy theming.

### 3. Consistent Naming
Use BEM or similar methodology:
- `.component-name` (block)
- `.component-name__element` (element)
- `.component-name--modifier` (modifier)

### 4. Test Accessibility
- Use browser DevTools accessibility inspector
- Test with keyboard only
- Test with screen reader
- Check colour contrast ratios

### 5. Progressive Enhancement
```css
/* Base styles (all browsers) */
.button { ... }

/* Enhanced styles (modern browsers) */
@supports (backdrop-filter: blur(10px)) {
    .button { ... }
}
```

---

## 📱 Responsive Guidelines

### Breakpoints
```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Grid Patterns
```css
/* Responsive auto-fit grid */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

---

## 🎨 Quick Reference

### Common Hover State
```css
element:hover {
    border-colour: #6b7280;
    background: #f9fafb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
```

### Common Focus State
```css
element:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}
```

### Form Control Base
```css
.form-control {
    padding: 10px 16px;
    border: 2px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-colour 0.2s ease;
}

.form-control:focus {
    outline: none;
    border-colour: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

## 📚 Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Colour Palette Generator:** https://coolors.co/
- **CSS Tricks:** https://css-tricks.com/

---

*Last updated: December 2025*