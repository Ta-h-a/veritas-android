# CSS Modularization Guide

This document describes the modular CSS architecture implemented for the Samsung ZXing Image Scanner application using CSS Modules.

## CSS Structure

```
src/
├── components/
│   ├── Header.jsx                 # Component file
│   ├── Header.module.css         # Component-specific styles
│   ├── StatsBar.jsx
│   ├── StatsBar.module.css
│   ├── ImageUploader.jsx
│   ├── ImageUploader.module.css
│   ├── ResultsList.jsx
│   ├── ResultsList.module.css
│   ├── ResultItem.jsx
│   └── ResultItem.module.css
├── styles/
│   ├── global.css                # Global styles and resets
│   └── utilities.css             # Utility classes and CSS variables
└── App.jsx                       # Main app with global styles import
```

## CSS Modules Benefits

### 1. **Scoped Styling**
- CSS classes are automatically scoped to their component
- No naming conflicts between components
- Styles are isolated and maintainable

### 2. **Component Co-location**
- Styles are located next to their components
- Easy to find and modify component-specific styles
- Better developer experience

### 3. **Type Safety** (Future Enhancement)
- CSS Modules can be extended with TypeScript for autocomplete
- Compile-time checking for CSS class names

## Implementation Details

### Component Style Files

Each component has its own `.module.css` file with scoped styles:

```css
/* Header.module.css */
.header {
  background: white;
  border-radius: 16px;
  /* ... */
}

.title {
  font-size: 28px;
  /* ... */
}
```

### Importing and Using Styles

```jsx
// Header.jsx
import React from "react";
import styles from "./Header.module.css";

function Header() {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Title</h1>
    </div>
  );
}
```

### Dynamic Class Names

For conditional styling:

```jsx
// ImageUploader.jsx
const getStatusClassName = () => {
  const baseClass = styles.status;
  if (status.includes("success")) {
    return `${baseClass} ${styles.success}`;
  }
  return baseClass;
};

return <div className={getStatusClassName()}>{status}</div>;
```

## Global Styles

### `global.css`
Contains application-wide styles:
- CSS reset
- Body and container styles
- Global layout rules

### `utilities.css`
Contains:
- CSS custom properties (variables)
- Utility classes
- Reusable style patterns

## CSS Module Naming Conventions

### Class Names
- Use camelCase for CSS module classes
- Example: `.uploadArea`, `.statCard`, `.barcodeCode`

### File Names
- Component styles: `ComponentName.module.css`
- Global styles: `global.css`
- Utilities: `utilities.css`

## Migration from Global CSS

### Before (Global CSS)
```css
/* App.css */
.upload-area {
  border: 3px dashed #e5e7eb;
}

.upload-area.dragover {
  border-color: #10b981;
}
```

```jsx
// Component
<div className={`upload-area${dragOver ? " dragover" : ""}`}>
```

### After (CSS Modules)
```css
/* ImageUploader.module.css */
.uploadArea {
  border: 3px dashed #e5e7eb;
}

.uploadArea.dragover {
  border-color: #10b981;
}
```

```jsx
// Component
import styles from "./ImageUploader.module.css";

<div className={`${styles.uploadArea}${dragOver ? ` ${styles.dragover}` : ""}`}>
```

## Component-Specific Styles

### Header.module.css
- Header container and layout
- Title styling with gradient text
- Tech badge styling
- Supported formats display

### StatsBar.module.css
- Stats grid layout
- Individual stat card styling
- Responsive design

### ImageUploader.module.css
- Upload area with drag-and-drop styles
- Button variants (primary, secondary, warning)
- Image preview and processing indicator
- Status message styling

### ResultsList.module.css
- Results container styling
- Empty state display
- Title and layout

### ResultItem.module.css
- Individual result styling
- Tier-based styling variants
- Badge system for validation
- Metadata grid layout

## Responsive Design

Each module includes its own responsive breakpoints:

```css
/* Component.module.css */
@media (max-width: 640px) {
  .barcodeMeta {
    grid-template-columns: 1fr;
  }
}
```

## Best Practices

### 1. **One Module Per Component**
- Each component should have its own module file
- Keep styles close to their components

### 2. **Use Semantic Class Names**
- Choose names that describe purpose, not appearance
- Example: `.primaryButton` not `.blueButton`

### 3. **Leverage CSS Custom Properties**
- Use CSS variables for consistent theming
- Define in `utilities.css` for global access

### 4. **Compose Classes Programmatically**
- Use JavaScript to combine classes conditionally
- Keep logic readable and maintainable

### 5. **Global vs Module Decision**
- Global: Resets, typography, layout containers
- Module: Component-specific styling, states, variants

## Future Enhancements

### 1. **TypeScript Integration**
```typescript
// CSS Modules with TypeScript
import styles from "./Header.module.css";
// Provides autocomplete and type checking
```

### 2. **Theme System**
```css
/* themes/dark.css */
:root {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
}
```

### 3. **Build Optimization**
- CSS Modules automatically handle class name optimization
- Dead code elimination
- Automatic vendor prefixing

### 4. **Style Linting**
```json
// stylelint.config.js
{
  "extends": ["stylelint-config-css-modules"]
}
```

## Troubleshooting

### Common Issues

1. **Class Not Applied**
   - Check import statement
   - Verify class name exists in module
   - Ensure correct camelCase conversion

2. **Styles Not Scoped**
   - Confirm `.module.css` extension
   - Check CSS Modules is enabled in build tool

3. **Global Styles Needed**
   - Move to `global.css` or `utilities.css`
   - Import in App.jsx or main entry point

This modular approach provides better maintainability, prevents style conflicts, and improves the overall development experience while keeping the same visual design.