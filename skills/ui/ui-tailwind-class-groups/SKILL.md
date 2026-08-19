---
name: ui-tailwind-class-groups
description: Format long Tailwind className values as labeled concern groups inside cn arrays. Use when creating, editing, or reviewing React components with Tailwind utilities, especially generated shadcn components.
user-invocable: false
---

# Group Tailwind class lists

Write Tailwind classes for the person reviewing the component. Let the formatter handle the order inside each group.

## Keep short lists inline

Keep a short class list as one string when it covers one concern:

```tsx
className={cn('flex flex-col gap-1 text-start', className)}
```

Do not split a small list merely to satisfy a template.

## Group long lists by concern

Pass an array of labeled strings to `cn` when the classes cover several concerns. Put one concern on each line. `prettier-plugin-tailwindcss` sorts within each string without destroying the groups.

Use this order and omit groups that do not apply:

1. `// Layout` for display, position, size, flex, grid, gap, padding, border shape, and radius
2. `// Typography` for font, text size, weight, line height, and whitespace
3. `// Color` for backgrounds, text colors, border colors, and ring colors
4. `// State` for transitions, outlines, placeholders, files, hover, active, focus, disabled, and ARIA variants
5. `// Responsive` for viewport and container variants
6. `// Dark` for dark mode variants
7. `// Animation` for open and closed data states, animation, and duration

```tsx
className={cn(
  [
    // Layout
    'h-8 w-full min-w-0 rounded-none border px-2.5 py-1',
    // Typography
    'text-xs',
    // Color
    'border-input bg-transparent',
    // State
    'transition-colors outline-none',
    'placeholder:text-muted-foreground',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-1',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-1',
    // Responsive
    'md:text-xs',
    // Dark
    'dark:bg-input/30',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  ],
  className,
)}
```

Avoid one long string that mixes layout, typography, color, and interaction states:

```tsx
className={cn(
  'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 disabled:opacity-50 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40',
  className,
)}
```

## Check the result

- Keep each class in the group that owns its concern.
- Keep related variants together when splitting a group across lines.
- Remove empty labels and one-item ceremony that does not improve scanning.
- Run the repository formatter so Tailwind classes are sorted within each string.
