# Theme System Guide

## Overview

MasterChef uses a flexible theme system that's fully compatible with shadcn/ui themes. The system supports both light and dark modes with automatic switching.

## Dark Mode

### Enabling Dark Mode

Dark mode is controlled by adding the `dark` class to the root HTML element:

```tsx
// Add dark class to enable dark mode
document.documentElement.classList.add('dark');

// Remove to switch back to light mode
document.documentElement.classList.remove('dark');
```

### Theme Toggle Component

Use the included `ThemeToggle` component:

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

function Navbar() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

The toggle component:
- Saves preference to localStorage
- Respects system preference on first load
- Smoothly transitions between themes

## Using shadcn/ui Themes

This color system is **100% compatible** with shadcn/ui themes. To use any shadcn theme:

### 1. Visit shadcn/ui Themes
Go to [ui.shadcn.com/themes](https://ui.shadcn.com/themes) and pick a theme.

### 2. Copy the CSS Variables
Copy the theme's CSS variables from the theme customizer.

### 3. Paste into index.css
Replace the values in `:root` (light mode) and `.dark` (dark mode) sections:

```css
@layer base {
  :root {
    /* Paste light mode variables here */
    --background-hex: #ffffff;
    --foreground-hex: #0a0a0a;
    /* ... etc */
  }

  .dark {
    /* Paste dark mode variables here */
    --background-hex: #0a0a0a;
    --foreground-hex: #fafafa;
    /* ... etc */
  }
}
```

### 4. Update OKLCH Values (Optional)
If you want to maintain OKLCH support for advanced color manipulation, convert the hex values to OKLCH using [oklch.com](https://oklch.com/).

## Color Formats

### Hex (Primary)
```tsx
// Tailwind classes
<div className="bg-brand-primary">Orange</div>

// Direct CSS
<div style={{ backgroundColor: 'var(--brand-primary-hex)' }}>
  Custom element
</div>
```

### OKLCH (Advanced)
For color manipulation, gradients, and advanced theming:

```css
/* Lighten a color */
background-color: oklch(calc(var(--brand-primary-oklch) + 10%) 0.19 35);

/* Adjust saturation */
background-color: oklch(65% calc(0.19 * 1.5) 35);
```

## Testing Dark Mode

### Quick Test in Browser Console

```javascript
// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');
```

### Example Components

```tsx
// Automatically adapts to theme
function Card() {
  return (
    <div className="bg-card border-border rounded-lg p-6">
      <h2 className="text-card-foreground font-bold">Recipe Card</h2>
      <p className="text-muted-foreground">Delicious recipe description</p>
      <button className="bg-brand-primary text-white px-4 py-2 rounded">
        Cook Now
      </button>
    </div>
  );
}

// Status indicators
function StatusBadge({ type }: { type: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-error text-error-foreground',
  };

  return <span className={`px-3 py-1 rounded ${colors[type]}`}>Status</span>;
}
```

## Brand Colors in Dark Mode

Brand colors automatically adjust for better visibility in dark mode:

**Light Mode:**
- Primary: `#ff6b35` (bright orange)
- Secondary: `#22c55e` (vibrant green)
- Accent: `#a855f7` (bright purple)

**Dark Mode:**
- Primary: `#ff7f50` (slightly lighter orange)
- Secondary: `#10b981` (adjusted green)
- Accent: `#9333ea` (adjusted purple)

## System Preference Detection

The theme system can detect user's system preference:

```tsx
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark && !localStorage.getItem('theme')) {
  document.documentElement.classList.add('dark');
}
```

## Best Practices

1. **Always use semantic colors** (`bg-background`, `text-foreground`) instead of fixed colors
2. **Test in both modes** - Components should work in light and dark themes
3. **Use brand colors sparingly** - Reserve for CTAs and key elements
4. **Maintain contrast** - Ensure text is readable in both themes
5. **Avoid hardcoded colors** - Use CSS variables and Tailwind classes

## Customizing Colors

### For a Specific Brand Color

Update both light and dark mode values:

```css
:root {
  --brand-primary-hex: #your-color;
  --brand-primary-oklch: L% C H; /* convert using oklch.com */
}

.dark {
  --brand-primary-hex: #adjusted-for-dark;
  --brand-primary-oklch: L% C H;
}
```

### Creating New Color Variables

Follow the naming convention:

```css
:root {
  --custom-color-hex: #123456;
  --custom-color-oklch: 50% 0.15 250;
}

@theme {
  --color-custom: var(--custom-color-hex);
}
```

Then use: `className="bg-custom"`
