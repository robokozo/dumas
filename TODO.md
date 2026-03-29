# Dumas — TODO

## Collision events

A `useCollision` composable that fires callbacks when two rigid bodies make or break contact. Accepts ECS component filters for both sides of the collision — same pattern as `useSystem` — so it only fires when both entities carry the required components. The callback receives pre-sliced reactive component data for each side, contact normal, and impulse magnitude. If `other` doesn't match the declared components the callback is never invoked, so game code needs no runtime guards. Rapier surfaces raw events through its event queue; the composable wraps the per-frame drain and the ECS archetype check so user code never touches either.

**Scenario:** a sword swing hits an enemy — deal damage scaled by impact force and spawn a hit spark. The callback only fires when the other entity actually has a health component; no manual lookup or null check needed.

```ts
// On the sword entity:
useCollision({
  self: { damage: createDamage },
  other: { health: createHealth },
  onContact({ self, other, impulse, normal }) {
    if (impulse < MIN_IMPACT_FORCE) return;
    other.health.current.value -= self.damage.amount.value * impulse;
    spawnSpark({ position: other.health.position, normal });
  },
});
```

Symmetric filtering works too — useful when both sides must carry the same component:

```ts
// Two electrified bodies touching each other:
useCollision({
  self: { charge: createCharge },
  other: { charge: createCharge },
  onContact({ self, other }) {
    triggerArc({ from: self.charge, to: other.charge });
  },
});
```

---

## Sensors / triggers

Colliders flagged as sensors detect overlaps without generating contact forces. A `useSensor` composable that fires `onEnter` / `onExit` callbacks when another body enters or leaves the volume. Accepts an `other` ECS component filter — same pattern as `useCollision` — so the callbacks only fire when the overlapping entity carries the required components and the pre-sliced reactive data is passed directly to the callback. Core primitive for pickups, damage zones, door triggers, and area-of-effect abilities.

**Scenario:** a checkpoint volume — when the player enters, save progress and show a banner; when they exit, dismiss it. The callback only fires when the entering entity has a `player` component; no manual entity ID comparison needed.

```ts
// On the checkpoint zone entity:
useSensor({
  other: { player: createPlayer },
  onEnter({ other }) {
    saveCheckpoint({ position: other.player.spawnPoint.value });
    showBanner("Checkpoint reached");
  },
  onExit({ other }) {
    hideBanner();
  },
});
```

---

## Raycasting

A `useRaycast` composable that casts a ray against the physics world and returns the first (or all) hit results — entity ID, hit point, normal, distance, and pre-sliced reactive component data for both sides. Accepts a `source` ECS component filter for the casting entity and a `target` filter for what it can hit — same pattern as `useCollision`. Hits on entities that don't match `target` are skipped entirely. `cast()` returns the first matching hit or `null`; `castAll()` returns every matching hit along the ray in order. Essential for ground detection, line-of-sight checks, hit-scan weapons, and mouse-picking in 3D.

**Scenario:** a tank firing at enemies — cast a ray from the tank's barrel toward another entity. `eid` identifies the casting entity; `source` declares which components to pre-slice from it. Throws at setup time if `eid` doesn't carry every declared `source` component — a programming error, not a runtime condition. The `target` filter ensures only entities with `health` are hittable, so friendly units pass through without a manual check.

```ts
const { cast } = useRaycast({
  eid: tankEid,
  source: { weapon: createWeapon, transform: createTransform },
  target: { health: createHealth },
});

function fire() {
  const hit = cast({ direction: aimDir, maxDistance: 500 });
  if (hit === null) return;

  hit.target.health.current.value -= hit.source.weapon.damage.value;
  spawnDecal({ position: hit.point, normal: hit.normal });
}
```

---

## Character controller

Wrap Rapier's built-in kinematic character controller (`KinematicCharacterController`) in a `useCharacterController` composable. Handles step climbing, slope limits, snap-to-ground, and slide-along-walls automatically — eliminates the manual overlap-correction loop most physics-driven characters need.

**Scenario:** a third-person player that runs, jumps, and lands cleanly without clipping through ramps or getting stuck on stairs.

```ts
const controller = useCharacterController({
  offset: 0.01, // skin width — prevents tunnelling
  maxSlopeAngle: 45, // degrees — steeper slopes block movement
  stepHeight: 0.3, // auto-climb steps up to 30 cm
  snapToGround: 0.2, // snap down to ground within 20 cm
});

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held }) => {
    const wishDir = getWishDirection(held);

    if (controller.isGrounded && pressed.jump) {
      velocity.y = JUMP_FORCE;
    }

    velocity.y += GRAVITY * delta;

    controller.move({
      velocity: { x: wishDir.x * SPEED, y: velocity.y, z: wishDir.z * SPEED },
      delta,
    });
  },
});
```

---

## Joints / constraints

A `useJoint` composable covering Rapier's joint types: fixed, revolute (hinge), prismatic (slide), and spring. Connects two rigid-body entities with typed options for limits and motor drives. Needed for doors, vehicles, pendulums, ragdolls, and any interactive mechanism that links bodies together.

**Scenario:** a heavy dungeon door that swings open when the player pulls a lever, then slowly swings shut under gravity.

```ts
// Hinge the door to the frame along the Y axis:
const hinge = useJoint({
  type: "revolute",
  bodyA: doorFrameEid,
  bodyB: doorEid,
  axis: { x: 0, y: 1, z: 0 },
  limits: { min: 0, max: Math.PI * 0.75 }, // 0–135°
});

// When the lever fires:
function onLeverPulled() {
  hinge.setMotor({ targetVelocity: 1.5, maxForce: 200 }); // swing open
}

// After a delay, let gravity close it:
function onLeverReleased() {
  hinge.setMotor({ targetVelocity: 0, maxForce: 0 }); // free-swing shut
}
```

---

## Collision layers / groups

Collision filtering so objects only interact with the bodies they should. Map to Rapier's membership/filter bitmask API with named group constants so game code stays readable.

**Scenario:** the player fires projectiles that should hit enemies and world geometry, but must never collide with the player themselves or other projectiles.

```ts
const CollisionGroup = defineCollisionGroups({
  world: 0b0001,
  player: 0b0010,
  enemy: 0b0100,
  projectile: 0b1000,
});

// Player rigid body — is in "player", collides with world + enemies:
useRigidBody({
  membership: CollisionGroup.player,
  filter: CollisionGroup.world | CollisionGroup.enemy,
});

// Projectile — is in "projectile", hits world + enemies, ignores player + other projectiles:
useRigidBody({
  membership: CollisionGroup.projectile,
  filter: CollisionGroup.world | CollisionGroup.enemy,
});
```

---

## useObserver

Wrap bitECS `observe(world, onAdd(Component), callback)` and `observe(world, onRemove(Component), callback)` in a `useObserver` composable. Fires once when an entity enters or leaves an archetype — useful for one-shot reactions like registering a spawned enemy in a spatial grid or triggering a cleanup effect on component removal.

---

## Relationships

Expose bitECS's built-in relationship system (`Hierarchy`, `Cascade`) through engine-level abstractions. Enables typed parent-child links between entities — useful for scene graphs, equipment slots, projectile ownership, and anything that needs structured entity-to-entity references beyond shared components.

---

## Prefabs

A `definePrefab` factory that captures a set of components and default values as a reusable template. Calling `spawnPrefab(world, EnemyPrefab)` creates a new entity with all components pre-attached and initialized — eliminates repetitive `addEntity` + `useEcsComponent` wiring at every spawn site.
