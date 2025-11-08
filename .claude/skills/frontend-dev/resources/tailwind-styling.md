# Tailwind CSS Styling - Super Feynman Frontend

Complete guide to styling Super Feynman with Tailwind CSS utility classes.

---

## Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blue
          dark: '#2563EB',
          light: '#60A5FA',
        },
        success: {
          DEFAULT: '#10B981', // Green
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B', // Yellow
        },
        background: {
          DEFAULT: '#F9FAFB',
        }
      },
    },
  },
  plugins: [],
}
```

---

## Common Patterns

### Container Layout

```javascript
<div className="container mx-auto px-4 py-8 max-w-6xl">
    {/* Content */}
</div>
```

### Card Component

```javascript
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <h2 className="text-xl font-semibold mb-2">Card Title</h2>
    <p className="text-gray-600">Card content</p>
</div>
```

---

## Button Styles

### Primary Button

```javascript
<button className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-colors">
    Click Me
</button>
```

### Secondary Button

```javascript
<button className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
    Cancel
</button>
```

### Danger Button

```javascript
<button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
    Delete
</button>
```

---

## Modal Overlay

```javascript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Modal content */}
    </div>
</div>
```

---

## Grid Layout

```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => (
        <div key={item.id} className="...">
            {item.name}
        </div>
    ))}
</div>
```

---

## Status Badges

```javascript
const statusColors = {
    'Not Started': 'bg-gray-200 text-gray-700',
    'Reviewing': 'bg-yellow-200 text-yellow-800',
    'Understood': 'bg-green-200 text-green-800',
    'Mastered': 'bg-green-500 text-white'
};

<span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
    {status}
</span>
```

---

## Responsive Design

### Mobile to Desktop Layout

```javascript
// Mobile: stack vertically, Desktop: side-by-side
<div className="flex flex-col md:flex-row gap-4">
    <div className="flex-1">Left</div>
    <div className="flex-1">Right</div>
</div>
```

### Responsive Visibility

```javascript
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile only</div>
```

### Responsive Grid

```javascript
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Items */}
</div>
```

---

## Form Styling

### Input Fields

```javascript
<input
    type="text"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    placeholder="Enter text"
/>
```

### Text Area

```javascript
<textarea
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
    rows="4"
    placeholder="Enter notes"
/>
```

### Select Dropdown

```javascript
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
</select>
```

---

## Interactive States

### Hover Effects

```javascript
// Card hover
<div className="hover:shadow-lg transition-shadow">

// Button hover
<button className="hover:bg-primary-dark transition-colors">

// Scale on hover
<div className="hover:scale-105 transition-transform">
```

### Active/Focus States

```javascript
// Button active state
<button className="active:scale-95 transition-transform">

// Input focus state
<input className="focus:ring-2 focus:ring-primary focus:border-transparent">
```

### Disabled State

```javascript
<button
    disabled
    className="disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white"
>
    Disabled Button
</button>
```

---

## Loading States

### Spinner Animation

```javascript
<div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
```

### Pulse Animation

```javascript
<button className="animate-pulse bg-primary text-white">
    Loading...
</button>
```

---

## Spacing & Layout

### Padding

```javascript
// Small: p-2 (0.5rem / 8px)
// Medium: p-4 (1rem / 16px)
// Large: p-6 (1.5rem / 24px)
// Extra Large: p-8 (2rem / 32px)

<div className="p-4">  // All sides
<div className="px-4"> // Horizontal only
<div className="py-4"> // Vertical only
<div className="pt-4"> // Top only
```

### Margin

```javascript
<div className="m-4">   // All sides
<div className="mx-auto"> // Center horizontally
<div className="mt-4">  // Top only
<div className="mb-4">  // Bottom only
```

### Gap (for Flex/Grid)

```javascript
<div className="flex gap-4"> // 1rem gap
<div className="grid gap-6"> // 1.5rem gap
```

---

## Typography

### Headings

```javascript
<h1 className="text-3xl font-bold">Main Heading</h1>
<h2 className="text-2xl font-semibold">Section Heading</h2>
<h3 className="text-xl font-medium">Subsection</h3>
```

### Text Styles

```javascript
<p className="text-gray-600">Normal text</p>
<p className="text-sm text-gray-500">Small text</p>
<p className="font-medium">Medium weight</p>
<p className="font-semibold">Semi-bold</p>
<p className="font-bold">Bold text</p>
```

### Text Alignment

```javascript
<p className="text-left">Left aligned</p>
<p className="text-center">Center aligned</p>
<p className="text-right">Right aligned</p>
```

---

## Colors

### Text Colors

```javascript
<p className="text-gray-900">Primary text</p>
<p className="text-gray-600">Secondary text</p>
<p className="text-gray-400">Muted text</p>
<p className="text-primary">Primary color</p>
<p className="text-red-500">Error text</p>
<p className="text-green-500">Success text</p>
```

### Background Colors

```javascript
<div className="bg-white">White background</div>
<div className="bg-gray-100">Light gray</div>
<div className="bg-primary">Primary color</div>
<div className="bg-red-50">Light red</div>
```

---

## Borders

```javascript
// Border on all sides
<div className="border border-gray-300">

// Border on specific sides
<div className="border-b border-gray-200"> // Bottom only
<div className="border-t-2 border-primary"> // Top with custom width

// Border radius
<div className="rounded">       // Small radius
<div className="rounded-lg">    // Large radius
<div className="rounded-full">  // Fully rounded
```

---

## Shadows

```javascript
<div className="shadow">       // Small shadow
<div className="shadow-md">    // Medium shadow
<div className="shadow-lg">    // Large shadow
<div className="shadow-xl">    // Extra large shadow
```

---

## Best Practices

✅ **DO:**
- Use Tailwind utility classes consistently
- Leverage the custom colors defined in config
- Use responsive breakpoints (sm, md, lg, xl)
- Combine hover/focus states for better UX
- Extract repeated class patterns into components

❌ **DON'T:**
- Mix Tailwind with inline styles or CSS modules
- Create overly long className strings (extract to component)
- Use arbitrary values excessively (use theme values)
- Forget to add transition classes for animations
