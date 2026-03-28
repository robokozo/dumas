# Dumas — TODO

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
