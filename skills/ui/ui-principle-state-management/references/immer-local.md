# Plain Immer state

Use a named Immer producer when a component owns one local state tree but has no meaningful event graph, timing problem, or external owner. This is the remainder after owner libraries, RxJS, and reducers are ruled out.

Keep the producer outside the component. If the code gains coordinated transitions, promote it to an Immer reducer.

## Export the producer

This annotation editor owns a local working copy. Moving one point is a direct data update, not a transition system.

```ts
import { type Immutable, produce } from 'immer'

type Point = Immutable<{
  id: string
  x: number
  y: number
}>

type AnnotationDraft = Immutable<{
  points: readonly Point[]
}>

export const movePoint = produce<AnnotationDraft, [id: string, x: number, y: number]>(
  (draft, id, x, y) => {
    const point = draft.points.find((candidate) => candidate.id === id)
    if (!point) return

    point.x = x
    point.y = y
  },
)
```

Use the producer in the state setter. Do not rebuild the nested object with spreads inside JSX.

```tsx
function AnnotationEditor({ initialDraft }: { initialDraft: AnnotationDraft }) {
  const [draft, setDraft] = React.useState(initialDraft)

  const handlePointMove = React.useCallback((id: string, x: number, y: number) => {
    setDraft((current) => movePoint(current, id, x, y))
  }, [])

  return <Canvas draft={draft} onPointMove={handlePointMove} />
}
```

## Test the producer directly

```ts
import { describe, expect, it } from 'vitest'

describe('movePoint', () => {
  it('moves the selected point without changing the base state', () => {
    const base: AnnotationDraft = {
      points: [{ id: 'a', x: 1, y: 2 }],
    }

    expect(movePoint(base, 'a', 10, 20)).toEqual({
      points: [{ id: 'a', x: 10, y: 20 }],
    })
    expect(base.points[0]).toEqual({ id: 'a', x: 1, y: 2 })
  })

  it('preserves identity when the point does not exist', () => {
    const base: AnnotationDraft = {
      points: [{ id: 'a', x: 1, y: 2 }],
    }

    expect(movePoint(base, 'missing', 10, 20)).toBe(base)
  })
})
```

Promote plain Immer to a reducer when updates need named events, allowed and rejected transitions, coordinated fields, or an audit trail. Promote it to RxJS when time, cancellation, or multiple event producers become part of correctness.

## Official references

- [Immer produce](https://immerjs.github.io/immer/produce/)
- [Immer curried producers](https://immerjs.github.io/immer/curried-produce/)
- [Immer TypeScript guidance](https://immerjs.github.io/immer/typescript/)
