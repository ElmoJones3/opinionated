# Tailwind reference

Use this reference when a component expresses visuals through Tailwind utility strings.

When props or derived state select classes, apply `ui-component-variants` and use CVA. This reference still governs the classes inside the recipe.

## Group long class lists

Keep a short, single-concern list inline:

```tsx
className={cn('flex flex-col gap-1 text-start', className)}
```

For multiple concerns, pass labeled strings through the repository's class composition helper:

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
    // Animation
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
  ],
  className,
)}
```

Use this order and omit groups that do not apply:

1. `Layout`: display, position, sizing, flex, grid, gap, spacing, border shape, and radius
2. `Typography`: font, text size, weight, line height, and whitespace
3. `Color`: background, text, border, and ring colors
4. `State`: transitions, outlines, placeholders, files, hover, active, focus, disabled, and ARIA variants
5. `Responsive`: viewport and container variants
6. `Dark`: dark mode variants
7. `Animation`: animation lifecycle, keyframes, and duration

Keep related variants together when a concern needs more than one line. A variant belongs to the concern that explains its purpose. For example, `hover:bg-accent` belongs under `State`, while `dark:bg-input/30` belongs under `Dark`.

## Preserve composition behavior

Inspect the class helper before changing argument order. If it uses `tailwind-merge`, later conflicting utilities win. Keep caller `className` last only when the component contract allows callers to override its styles.

Run the configured formatter. The official Tailwind Prettier plugin sorts recognized class strings in Tailwind's recommended order. Custom helpers are only recognized when the project configures them, such as through `tailwindFunctions`; do not assume every string passed to a custom function is sorted.

## Official references

- [Tailwind state, responsive, dark, and container variants](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [Tailwind utility-class authoring](https://tailwindcss.com/docs/styling-with-utility-classes)
- [Tailwind Labs Prettier plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
