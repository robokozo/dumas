# Dumas

A declarative game engine for Vue, built on top of the [TresJS](https://tresjs.org) ecosystem — named after Alexandre Dumas, author of _The Three Musketeers_. The name nods to the three TresJS libraries at its core: [Tres](https://tresjs.org), [Cientos](https://cientos.tresjs.org), and [TresLeches](https://leches.tresjs.org).

> **Deployment is currently broken.** The engine depends on `@tresjs/rapier`, which has not yet had a stable release. The demo site will be restored once that package ships.

## What it is

Dumas wraps TresJS, Rapier physics, and bitECS into a component and composable API that feels at home in a Vue SFC. The goal is to let you write game logic the same way you write any other Vue application — declarative templates for scene structure, composables for behaviour, and reactive state as the bridge between the two.

Current feature set:

- **`<Game>` / `<Scene>`** — root components that mount a TresJS canvas and manage named scenes with transition state
- **Scene switching** — `loadScene()` transitions between named scenes, automatically routing persistent entities to registered spawn points
- **ECS** — `useEcsComponent` attaches bitECS components to Vue entities; `useSystem` and `useQuery` drive per-frame logic over sets of entities
- **Object pooling** — `usePool` + `<ObjectPool>` pre-allocate a fixed set of entities and recycle them with zero mount/unmount overhead
- **Input** — `useInput` maps keyboard keys and gamepad buttons to named actions, with `held`, `pressed`, and `released` edge states per action
- **Physics** — rigid bodies and colliders via `@tresjs/rapier` (Rapier under the hood); dynamic objects, fixed ground planes, and automatic collider generation

## Packages

- **`@dumas/core`** — the engine: ECS, input, pooling, scene management, and physics bindings, all exposed as Vue composables and components

## Apps

- **`website`** — interactive guide and demo site covering each feature with live examples and annotated source

## Development

```bash
# Check formatting, lint, and types
vp check

# Run tests
vp test

# Start the dev server
vp run dev

# Build everything
vp run build -r
```
