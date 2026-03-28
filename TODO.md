# Dumas — TODO

## ~~useQuery~~

~~Wrap bitECS `query(world, components)` in a `useQuery({ components })` composable. Systems need a way to iterate matching entities — without this the ECS half of the engine is decorative.~~

## ~~World setup guide split~~

~~The World Setup guide currently covered both `<World>` scene bootstrapping and `useSystem` in one page. Split into two guides: one for world/scene setup and one dedicated to `useSystem` — including the `components` shorthand that pipes query results into `entities` in the callback.~~

## ~~useEcsComponent guide~~

~~There is no dedicated guide for `useEcsComponent`. Add one showing how to attach components to an entity and co-locate per-entity frame logic via the `fn` callback — contrasting it with `useSystem` which operates across all matching entities.~~

---

## Scene switching

Make `loadScene({ name })` actually work: conditionally render only the active `<Scene>`, tear down non-persistent entities on exit, fire `onSceneEnter` / `onSceneExit` hooks, and relocate persistent entities to the target spawn point.

## Object pooling

Pre-allocate a fixed set of entities and recycle them instead of creating/destroying on every spawn. Critical for projectiles, particles, and anything that spawns frequently.

## useObserver

Wrap bitECS `observe(world, onAdd(Component), callback)` and `observe(world, onRemove(Component), callback)` in a `useObserver` composable. Fires once when an entity enters or leaves an archetype — useful for one-shot reactions like registering a spawned enemy in a spatial grid or triggering a cleanup effect on component removal.

## Relationships

Expose bitECS's built-in relationship system (`Hierarchy`, `Cascade`) through engine-level abstractions. Enables typed parent-child links between entities — useful for scene graphs, equipment slots, projectile ownership, and anything that needs structured entity-to-entity references beyond shared components.

## Prefabs

A `definePrefab` factory that captures a set of components and default values as a reusable template. Calling `spawnPrefab(world, EnemyPrefab)` creates a new entity with all components pre-attached and initialized — eliminates repetitive `addEntity` + `useEcsComponent` wiring at every spawn site.

## User input

A composable (`useInput`?) that snapshots keyboard/gamepad state each frame into the bitECS world context so systems can read it without touching Vue reactivity.
