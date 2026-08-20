# Motion reference

Use this reference in addition to the component's base styling reference. Tailwind, StyleX, or another styling system owns static visuals. Motion owns animated values, animation states, gestures, orchestration, and timing.

## Keep simple animation local

Leave a short, one-element animation inline when each prop is easy to scan:

```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
```

Extract variants when animation states are reused, coordinated across descendants, conditional, or long enough to mix concerns:

```tsx
import { motion, type Variants } from 'motion/react'

const panelVariants: Variants = {
  hidden: {
    // Transform
    y: 8,
    // Appearance
    opacity: 0,
  },
  visible: {
    // Transform
    y: 0,
    // Appearance
    opacity: 1,
    // Timing
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
}

<motion.section
  animate="visible"
  exit="hidden"
  initial="hidden"
  variants={panelVariants}
/>
```

Use semantic state names such as `hidden`, `visible`, `expanded`, and `pressed`. Inside a long target, group `Transform`, `Appearance`, and `Timing` properties. Keep gesture props such as `whileHover` and `whileTap` at the component when they are local and short.

## Put timing at the right scope

- Put `transition` inside a target or variant when timing belongs to that state.
- Put `transition` on the Motion component when its animated targets share the same timing.
- Use `MotionConfig` for intentional subtree defaults.
- Keep orchestration such as `when`, `delayChildren`, and stagger settings with the parent variant that controls the sequence.

Preserve Motion's transition precedence. A more specific transition replaces broader defaults unless the needed values are carried forward explicitly.

Use Motion's `style` prop for Motion values and independent transform values when needed. Do not move static CSS into Motion merely to keep every visual decision in one object.

When the same element uses StyleX, remember that StyleX prohibits a normal `style` prop beside `stylex.props()`. Use animation props that do not require `style`, animate a wrapper, or follow the project's established integration.

## Official references

- [Motion for React](https://motion.dev/docs/react)
- [Motion components](https://motion.dev/docs/react-motion-component)
- [Animation and variants](https://motion.dev/docs/react-animation)
- [Transitions](https://motion.dev/docs/react-transitions)
- [MotionConfig](https://motion.dev/docs/react-motion-config)
